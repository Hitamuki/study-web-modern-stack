import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { supabase } from "../shared/supabase";
import { tokens } from "../shared/tokens";
import { AuthCard } from "../shared/ui/AuthCard";
import { Button } from "../shared/ui/Button";
import { Field } from "../shared/ui/Field";

/** SCR-002 アカウント作成（SP 版の意匠を流用） */
export const SignupPage = ({ onLoginPress }: { onLoginPress: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
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

  const loginLink = (
    <Pressable accessibilityRole="link" onPress={onLoginPress}>
      <Text style={styles.link}>ログイン</Text>
    </Pressable>
  );

  if (sent) {
    return (
      <AuthCard
        title="確認メールを送信しました"
        description={`${email} 宛のメールにあるリンクを開くと、登録が完了します。`}
        footer={loginLink}
      >
        <Text style={styles.note}>
          メールが届かない場合は、迷惑メールフォルダを確認してください。
        </Text>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="アカウントを作成"
      description="メールアドレスとパスワードで登録します。"
      error={error}
      footer={loginLink}
    >
      <Field
        label="メールアドレス"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        keyboardType="email-address"
      />
      <Field
        label="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label="パスワード（確認）"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button
        label={pending ? "作成中..." : "アカウントを作成"}
        disabled={pending}
        onPress={() => void handleSubmit()}
      />
    </AuthCard>
  );
};

const styles = StyleSheet.create({
  link: { fontSize: 13, color: tokens.accent },
  note: { fontSize: 13, color: tokens.textSecondary },
});
