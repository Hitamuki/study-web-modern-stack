import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../../../shared/api/supabase";
import { AuthCard } from "../../../shared/ui/auth-card";
import { Button } from "../../../shared/ui/button";
import { Field } from "../../../shared/ui/field";

/**
 * SCR-004 新しいパスワードの設定。
 *
 * メールのリンクから戻ってくると supabase-js が URL のトークンを回収し、
 * `PASSWORD_RECOVERY` イベントを発火する。これを待ってから更新を許可する。
 */
export const PasswordUpdatePage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // イベントを取り逃した場合に備え、既にセッションがあるかも見る
    void supabase.auth.getSession().then(({ data: session }) => {
      if (session.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("パスワードが一致しません");
      return;
    }
    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      setError("パスワードを更新できませんでした。リンクの有効期限が切れている可能性があります");
      return;
    }
    await navigate("/login");
  };

  if (!ready) {
    return (
      <AuthCard
        title="リンクを確認しています"
        description="メールのリンクから開いてください。"
        footer={
          <Link to="/password-reset" className="text-[13px] text-primary">
            再設定リンクを再送する
          </Link>
        }
      >
        <p className="text-[13px] text-muted-foreground">
          この画面はパスワード再設定メールのリンクからのみ利用できます。
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="新しいパスワードの設定"
      description="新しいパスワードを入力してください。"
      error={error}
    >
      <form className="flex flex-col gap-md" onSubmit={(e) => void handleSubmit(e)}>
        <Field
          id="password"
          label="新しいパスワード"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="password-confirmation"
          label="新しいパスワード（確認）"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "更新中..." : "パスワードを更新"}
        </Button>
      </form>
    </AuthCard>
  );
};
