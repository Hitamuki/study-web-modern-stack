import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { supabase } from "../shared/supabase";
import { tokens } from "../shared/tokens";
import { AuthCard } from "../shared/ui/AuthCard";
import { Button } from "../shared/ui/Button";
import { Field } from "../shared/ui/Field";

/** SCR-001 ログイン（SP 版の意匠を流用） */
export const LoginPage = ({ onSignupPress }: { onSignupPress: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    // 存在しないユーザーとパスワード誤りを区別しない（利用者の存在を推測させないため）
    if (signInError) setError("メールアドレスまたはパスワードが正しくありません");
    // 成功時は onAuthStateChange が拾って画面が切り替わる
  };

  return (
    <AuthCard
      title="ログイン"
      description="メールアドレスとパスワードでサインインします。"
      error={error}
      footer={
        <Pressable accessibilityRole="link" onPress={onSignupPress}>
          <Text style={styles.link}>アカウントを作成</Text>
        </Pressable>
      }
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
        autoComplete="password"
      />
      <Button
        label={pending ? "サインイン中..." : "ログイン"}
        disabled={pending}
        onPress={() => void handleSubmit()}
      />
    </AuthCard>
  );
};

const styles = StyleSheet.create({
  link: { fontSize: 13, color: tokens.accent },
});
