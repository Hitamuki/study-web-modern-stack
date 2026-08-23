import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../../shared/api/supabase";
import { AuthCard } from "../../../shared/ui/auth-card";
import { Button } from "../../../shared/ui/button";
import { Field } from "../../../shared/ui/field";

/** SCR-003 パスワードリセット申請 */
export const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    // 戻り先は SCR-004。ルーターを先に入れた（#76）のはこの URL を実体にするため。
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-update`,
    });
    setPending(false);
    // 送信できたかどうかに関わらず同じ画面を出す。
    // 失敗を出し分けると、そのアドレスが登録済みかを推測されるため。
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        title="再設定リンクを送信しました"
        description={`${email} が登録されていれば、再設定用のリンクが届きます。`}
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
      title="パスワードの再設定"
      description="登録しているメールアドレスに再設定用のリンクを送ります。"
      footer={
        <Link to="/login" className="text-[13px] text-primary">
          ログインに戻る
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
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "送信中..." : "再設定リンクを送る"}
        </Button>
      </form>
    </AuthCard>
  );
};
