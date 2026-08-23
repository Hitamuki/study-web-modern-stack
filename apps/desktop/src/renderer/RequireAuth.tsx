import type { Session } from "@supabase/supabase-js";
import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "./shared/supabase";

/**
 * 未ログインならログイン画面へ送るルートガード。
 * 画面を隠すのは UX の話で、実際の防御は Hasura の行レベル権限（#22）が担う。
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!checked) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
