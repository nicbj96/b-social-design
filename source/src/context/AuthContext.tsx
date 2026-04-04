// AuthContext — real Supabase auth with role-based access control
// In-memory storage used because localStorage is blocked in sandboxed iframes

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export type UserRole = "user" | "firma" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  profile: ProfileData | null;
  role: UserRole;
  companyId: string | null;
  isFirma: () => boolean;
  isAdmin: () => boolean;
  isLoggedIn: boolean;
}

export interface ProfileData {
  id: string;
  name: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  radius_km: number;
  interests: string[];
  vibe_tags: string[];
  onboarding_complete: boolean;
  points: number;
  connections: number;
  discovery_mode: string;
  experience_mode: string;
  energy_level: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  profile: null,
  role: "user",
  companyId: null,
  isFirma: () => false,
  isAdmin: () => false,
  isLoggedIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      const userRole: UserRole = data.role ?? "user";
      setProfile({
        id: data.id,
        name: data.name,
        display_name: data.display_name ?? null,
        email: data.email,
        avatar_url: data.avatar_url,
        bio: data.bio,
        city: data.city,
        radius_km: data.radius_km ?? 10,
        interests: data.interests ?? [],
        vibe_tags: data.vibe_tags ?? [],
        onboarding_complete: data.onboarding_complete ?? false,
        points: data.points ?? 0,
        connections: data.connections ?? 0,
        discovery_mode: data.discovery_mode ?? "both",
        experience_mode: data.experience_mode ?? "solo",
        energy_level: data.energy_level ?? "medium",
        role: userRole,
      });
      setRole(userRole);

      // Fetch company membership if user is firma or admin
      if (userRole === "firma" || userRole === "admin") {
        const { data: membership } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", userId)
          .single();

        setCompanyId(membership?.company_id ?? null);
      } else {
        setCompanyId(null);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const isLoggedIn = !!user && !!session;
  const isFirma = useCallback(() => role === "firma" || role === "admin", [role]);
  const isAdmin = useCallback(() => role === "admin", [role]);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      logger.log("[AuthContext] getSession result:", s ? "HAS SESSION for " + s.user?.email : "NO SESSION");
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("[AuthContext] getSession error:", err);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setRole("user");
          setCompanyId(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error("Udfyld begge felter") };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!email || !password) {
      return { error: new Error("Udfyld begge felter") };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { error: new Error(error.message) };
    }

    // Create a profile row if user was created
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        onboarding_complete: false,
        interests: [],
        vibe_tags: [],
        radius_km: 10,
        city: null,
        role: "user",
      }, { onConflict: "id" });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Auto sign in after sign up (if email confirmation is not required)
      if (data.session) {
        return { error: null };
      }
      // If no session, email confirmation might be required
      return { error: null, needsConfirmation: !data.session };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole("user");
    setCompanyId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, loading, signIn, signUp, signOut,
        refreshProfile, profile, role, companyId,
        isFirma, isAdmin, isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
