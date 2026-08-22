import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../../shared/api/supabase";
import { AuthCard } from "../../../shared/ui/auth-card";
import { Button } from "../../../shared/ui/button";
import { Field } from "../../../shared/ui/field";

/** SCR-002 アカウント作成 */
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
          <Link to="/login" className="text-[13px] text-primary">
            ログインに戻る
          </Link>
        }
      >
        <p className="text-[13px] text-muted-foreground">
          メールが届かない場合は、迷惑メールフォルダを確認してください。
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="アカウントを作成"
      description="メールアドレスとパスワードで登録します。"
      error={error}
      footer={
        <Link to="/login" className="text-[13px] text-primary">
          ログイン
        </Link>
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
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "作成中..." : "アカウントを作成"}
        </Button>
      </form>
    </AuthCard>
  );
};
