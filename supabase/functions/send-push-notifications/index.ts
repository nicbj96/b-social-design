/**
 * send-push-notifications
 *
 * Supabase Edge Function — sends Web Push notifications to all subscribers.
 *
 * Env vars required (set via: supabase secrets set <KEY>=<VALUE>):
 *   VAPID_PRIVATE_KEY   — raw base64url 32-byte EC private key
 *   SUPABASE_URL        — injected automatically by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — injected automatically by Supabase
 *
 * POST body:
 *   { title, body, url, icon?, badge?, tag? }
 *
 * Returns:
 *   { sent: number, failed: number }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── VAPID JWT signing ────────────────────────────────────────────────────────

const VAPID_PUBLIC =
  "BP8polwytURzbLngVB0ng2gVQviVXr82GUQu6SNH2j6UoacPhNTlqucZsv46GmIISjReiCpGxLJdD7jXwfxuck8";

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromB64url(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}

/** Import the raw VAPID EC private key as a CryptoKey */
async function importVapidPrivateKey(rawB64url: string): Promise<CryptoKey> {
  const rawBytes = fromB64url(rawB64url);
  // Build an EC JWK from the raw private scalar + uncompressed public point
  const pubBytes = fromB64url(VAPID_PUBLIC);
  // pubBytes[0] === 0x04 (uncompressed); x = bytes[1..33], y = bytes[33..65]
  const x = b64url(pubBytes.slice(1, 33));
  const y = b64url(pubBytes.slice(33, 65));
  const d = b64url(rawBytes);
  const jwk: JsonWebKey = { kty: "EC", crv: "P-256", d, x, y };
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, [
    "sign",
  ]);
}

/** Build a VAPID authorization header for the given endpoint origin */
async function vapidHeader(origin: string, privateKey: CryptoKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ aud: origin, exp: now + 12 * 3600, sub: "mailto:hello@b-social.net" }),
    ),
  );
  const toSign = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(toSign),
  );
  return `vapid t=${toSign}.${b64url(sig)},k=${VAPID_PUBLIC}`;
}

// ─── Content encryption (RFC 8291 / ece) ─────────────────────────────────────

/** Encrypt a plaintext payload for a push subscription */
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<{ body: Uint8Array; salt: Uint8Array }> {
  const enc = new TextEncoder();
  const plaintext = enc.encode(payload);
  const authSecret = fromB64url(authB64);
  const receiverPublic = fromB64url(p256dhB64);

  // Generate ephemeral sender key pair
  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"],
  );
  const senderPublicRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", senderKeyPair.publicKey),
  );

  // Import receiver public key
  const receiverKey = await crypto.subtle.importKey(
    "raw",
    receiverPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverKey },
    senderKeyPair.privateKey,
    256,
  );

  // HKDF helpers
  async function hkdf(
    salt: Uint8Array,
    ikm: ArrayBuffer,
    info: Uint8Array,
    len: number,
  ): Promise<Uint8Array> {
    const ikmKey = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
    const prk = await crypto.subtle.importKey(
      "raw",
      await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: new Uint8Array() }, ikmKey, 256),
      "HKDF",
      false,
      ["deriveBits"],
    );
    return new Uint8Array(
      await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info }, prk, len * 8),
    );
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Key material (RFC 8291)
  const ikm = await (async () => {
    const prkInfoBytes = concat(
      enc.encode("WebPush: info\0"),
      receiverPublic,
      senderPublicRaw,
    );
    return hkdf(authSecret, sharedBits, prkInfoBytes, 32);
  })();

  const cekInfo = enc.encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = enc.encode("Content-Encoding: nonce\0");
  const cek = await hkdf(salt, ikm, cekInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Import CEK
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);

  // Pad and encrypt (record size = 4096, single record)
  const rs = 4096;
  const overhead = 17; // 16 auth tag + 1 pad delimiter
  const padLen = rs - overhead - plaintext.length;
  const padded = concat(plaintext, new Uint8Array(padLen + 1)); // +1 for delimiter 0x02
  padded[plaintext.length] = 0x02;

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded),
  );

  // Build header: salt(16) + rs(4) + keylen(1) + key(65)
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = 65;
  header.set(senderPublicRaw, 21);

  return { body: concat(header, encrypted), salt };
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

// ─── Send a single push message ───────────────────────────────────────────────

interface Subscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function sendPush(
  sub: Subscription,
  payload: string,
  privateKey: CryptoKey,
): Promise<{ ok: boolean; gone: boolean }> {
  try {
    const origin = new URL(sub.endpoint).origin;
    const authz = await vapidHeader(origin, privateKey);
    const { body } = await encryptPayload(payload, sub.p256dh, sub.auth);

    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        Authorization: authz,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
      },
      body,
    });

    if (res.status === 410 || res.status === 404) return { ok: false, gone: true };
    return { ok: res.ok, gone: false };
  } catch {
    return { ok: false, gone: false };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { title, body, url, icon, badge, tag } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load all subscriptions
    const { data: subs, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (subsError) throw subsError;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0 }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const privateKey = await importVapidPrivateKey(Deno.env.get("VAPID_PRIVATE_KEY")!);
    const payload = JSON.stringify({
      title,
      body,
      url: url || "/feed",
      icon: icon || "/icon-192.png",
      badge: badge || "/badge-72.png",
      tag: tag || "b-social",
    });

    // Send in parallel (max 50 at once)
    const goneIds: string[] = [];
    let sent = 0;
    let failed = 0;

    const chunks = [];
    for (let i = 0; i < subs.length; i += 50) {
      chunks.push(subs.slice(i, i + 50));
    }

    for (const chunk of chunks) {
      const results = await Promise.all(
        chunk.map(async (sub) => {
          const result = await sendPush(sub as Subscription, payload, privateKey);
          if (result.gone) goneIds.push(sub.id);
          if (result.ok) sent++;
          else failed++;
          return result;
        }),
      );
      void results;
    }

    // Clean up expired subscriptions
    if (goneIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", goneIds);
    }

    return new Response(JSON.stringify({ sent, failed, removed: goneIds.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
