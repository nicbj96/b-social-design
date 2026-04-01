import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface UserSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function UserSearch({ open, onClose }: UserSearchProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setLoading(true);

    debounceTimer.current = setTimeout(() => {
      const performSearch = async () => {
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("id, name, avatar_url, city")
            .ilike("name", `%${searchQuery}%`)
            .limit(20);

          if (error) throw error;
          setResults(data || []);
        } catch (err) {
          console.error("Error searching users:", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };

      performSearch();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    navigate(`/profil/${userId}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-[#0a0f1a] text-white rounded-2xl shadow-2xl w-11/12 max-w-md max-h-96 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">Søg efter bruger</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3 text-white/40" />
            <input
              type="text"
              placeholder="Skriv navn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-[#4ECDC4] animate-spin" />
            </div>
          )}

          {!loading && searchQuery.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-8 text-white/50">
              Ingen brugere fundet
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-white/5">
              {results.map((user) => {
                const displayInitial = user.name
                  ? user.name[0]?.toUpperCase()
                  : "?";

                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || "Bruger"}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center flex-shrink-0 text-[#4ECDC4] font-bold">
                        {displayInitial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.name || "Bruger"}
                      </p>
                      {user.city && (
                        <p className="text-xs text-white/50 truncate">
                          {user.city}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && !searchQuery.trim() && (
            <div className="flex items-center justify-center py-8 text-white/40 text-sm">
              Begynd at skrive for at søge...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
