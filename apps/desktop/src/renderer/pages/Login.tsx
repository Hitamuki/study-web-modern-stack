import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { supabase } from "../shared/supabase";

/** SCR-001 ログイン（PC 版の意匠を流用） */
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
      // 存在しないユーザーとパスワード誤りを区別しない（利用者の存在を推測させないため）
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
        <Link className="auth__link" to="/signup">
          アカウントを作成
        </Link>
      }
    >
      <form className="auth__form" onSubmit={(e) => void handleSubmit(e)}>
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
        <Button type="submit" disabled={pending}>
          {pending ? "サインイン中..." : "ログイン"}
        </Button>
      </form>
    </AuthCard>
  );
};
