import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { supabase } from "../shared/supabase";

/** SCR-002 アカウント作成（PC 版の意匠を流用） */
export const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("パスワードが一致しません");
      return;
    }
    setPending(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setPending(false);
    if (signUpError) {
      setError("アカウントを作成できませんでした");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        title="確認メールを送信しました"
        description={`${email} 宛のメールにあるリンクを開くと、登録が完了します。`}
        footer={
          <Link className="auth__link" to="/login">
            ログインに戻る
          </Link>
        }
      >
        <p className="auth__note">メールが届かない場合は、迷惑メールフォルダを確認してください。</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="アカウントを作成"
      description="メールアドレスとパスワードで登録します。"
      error={error}
      footer={
        <Link className="auth__link" to="/login">
          ログイン
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="password-confirmation"
          label="パスワード（確認）"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "作成中..." : "アカウントを作成"}
        </Button>
      </form>
    </AuthCard>
  );
};
