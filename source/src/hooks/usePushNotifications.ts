/**
 * usePushNotifications — Web Push subscription hook
 *
 * Handles:
 *  1. Checking browser support + current permission state
 *  2. Subscribing with the VAPID public key
 *  3. Saving the subscription to Supabase push_subscriptions via the
 *     `upsert_push_subscription` stored procedure
 *  4. Unsubscribing + removing from Supabase
 *
 * The VAPID public key is stored here (frontend-safe — public key only).
 * The private key lives in CREDENTIALS.md and is used only by the
 * notification-sending Edge Function / Worker (not yet implemented).
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// VAPID public key — frontend-safe
const VAPID_PUBLIC_KEY = "BP8polwytURzbLngVB0ng2gVQviVXr82GUQu6SNH2j6UoacPhNTlqucZsv46GmIISjReiCpGxLJdD7jXwfxuck8";

/** Convert a URL-safe base64 string to a Uint8Array (for pushManager.subscribe) */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushState =
  | "unsupported"   // Browser doesn't support push
  | "denied"        // User blocked notifications
  | "prompt"        // Not yet asked
  | "subscribed"    // Active subscription
  | "loading";      // Checking / in progress

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>("loading");
  const [error, setError] = useState<string | null>(null);

  // ── Check current state on mount ──────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setState("denied"); return; }

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription()
    ).then((sub) => {
      setState(sub ? "subscribed" : "prompt");
    }).catch(() => setState("prompt"));
  }, []);

  // ── Subscribe ─────────────────────────────────────────────────────────
  const subscribe = useCallback(async () => {
    if (!user) { setError("Du skal være logget ind"); return; }
    setState("loading");
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      const endpoint = json.endpoint!;
      const p256dh = json.keys?.p256dh ?? "";
      const auth   = json.keys?.auth ?? "";

      const { error: rpcErr } = await supabase.rpc("upsert_push_subscription", {
        p_user_id:      user.id,
        p_endpoint:     endpoint,
        p_p256dh:       p256dh,
        p_auth:         auth,
        p_user_agent:   navigator.userAgent.slice(0, 200),
        p_device_label: `${navigator.platform || "Web"} — B-Social`,
        p_platform:     "web",
      });

      if (rpcErr) throw new Error(rpcErr.message);
      setState("subscribed");
    } catch (err: any) {
      setError(err?.message ?? "Kunne ikke aktivere notifikationer");
      setState("prompt");
    }
  }, [user]);

  // ── Unsubscribe ───────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", endpoint);
      }
      setState("prompt");
    } catch (err: any) {
      setError(err?.message ?? "Fejl ved afmelding");
      setState("subscribed");
    }
  }, []);

  return { state, error, subscribe, unsubscribe };
}
