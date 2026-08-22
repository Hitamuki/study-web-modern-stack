import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../../../shared/api/supabase";
import { AuthCard } from "../../../shared/ui/auth-card";
import { Button } from "../../../shared/ui/button";
import { Field } from "../../../shared/ui/field";

/** SCR-001 ログイン */
export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (signInError) {
      // Supabase は存在しないユーザーとパスワード誤りを区別せず invalid_credentials を返す。
      // 利用者の存在を推測させないためなので、画面でも区別せず 1 つの文言にする。
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    await navigate("/");
  };

  return (
    <AuthCard
      title="ログイン"
      description="メールアドレスとパスワードでサインインします。"
      error={error}
      footer={
        <>
          <Link to="/password-reset" className="text-[13px] text-primary">
            パスワードをお忘れですか？
          </Link>
          <Link to="/signup" className="text-[13px] text-primary">
            アカウントを作成
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-md" onSubmit={(e) => void handleSubmit(e)}>
        <Field
          id="email"
          label="メールアドレス"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="パスワード"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "サインイン中..." : "ログイン"}
        </Button>
      </form>
    </AuthCard>
  );
};
