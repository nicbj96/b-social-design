import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// Uses localStorage as fallback when not logged in, Supabase when logged in
// Table: saved_places (id, user_id, place_id, event_id, created_at)

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Load from Supabase
      supabase.from("saved_places")
        .select("place_id, event_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          const ids = new Set((data || []).map(r => r.place_id || r.event_id).filter(Boolean));
          setFavorites(ids);
          setLoading(false);
        });
    } else {
      // Load from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("b-social-favorites") || "[]");
        setFavorites(new Set(saved));
      } catch { /* ignore */ }
      setLoading(false);
    }
  }, [user]);

  const toggle = useCallback(async (id: string, type: "place" | "event" = "place") => {
    const isFav = favorites.has(id);

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(id) : next.add(id);
      return next;
    });

    if (user) {
      if (isFav) {
        await supabase.from("saved_places").delete()
          .eq("user_id", user.id)
          .eq(type === "place" ? "place_id" : "event_id", id);
      } else {
        await supabase.from("saved_places").insert({
          user_id: user.id,
          [type === "place" ? "place_id" : "event_id"]: id,
        });
      }
    } else {
      // Save to localStorage
      const next = new Set(favorites);
      isFav ? next.delete(id) : next.add(id);
      localStorage.setItem("b-social-favorites", JSON.stringify([...next]));
    }
  }, [favorites, user]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, toggle, isFavorite, loading };
}
