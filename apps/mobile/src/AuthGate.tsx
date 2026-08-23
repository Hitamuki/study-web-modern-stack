import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { DummyPage } from "./pages/Dummy";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { supabase } from "./shared/supabase";

/**
 * 認証状態で表示を切り替える。
 *
 * **ルーターは入れていない。** Web に入れたのは「URL が外部からの入口になる」ためだが
 * （[Discussion #75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75)）、
 * モバイルの入口はディープリンクで別の仕組みであり、画面も 3 つしかないため。
 *
 * 画面を隠すのは UX の話で、実際の防御は Hasura の行レベル権限（#22）が担う。
 */
export const AuthGate = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState<"login" | "signup">("login");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
    // トークンの失効・サインアウトにも追随する
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // 判定前にログイン画面を出すと、起動のたびに一瞬ちらつくため待つ
  if (!checked) return null;
  if (session) return <DummyPage />;
  return view === "login" ? (
    <LoginPage onSignupPress={() => setView("signup")} />
  ) : (
    <SignupPage onLoginPress={() => setView("login")} />
  );
};
