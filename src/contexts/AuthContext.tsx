import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

type AuthValue = { user: User | null; session: Session | null; loading: boolean; isAdmin: boolean; signOut: () => Promise<void>; refreshRole: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshRole = async () => {
    if (!isSupabaseConfigured || !session?.user) { setIsAdmin(false); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
    setIsAdmin(data?.role === "admin");
  };

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { void refreshRole(); }, [session?.user?.id]);

  const signOut = async () => { if (isSupabaseConfigured) await supabase.auth.signOut(); setSession(null); setIsAdmin(false); };
  return <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, isAdmin, signOut, refreshRole }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}