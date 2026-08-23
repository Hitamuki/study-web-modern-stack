import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "../tokens";

/**
 * 認証画面の共通カード。design/app.pen の SCR-001 / SCR-002 の **SP 版**を流用している。
 * 構造は アプリ名 → 見出し → 説明 → エラー帯 → 入力欄 → 主ボタン → 補助リンク。
 */
export const AuthCard = ({
  title,
  description,
  error,
  children,
  footer,
}: {
  title: string;
  description: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
    <View style={styles.card}>
      <Text style={styles.brand}>メモ</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  // SP 版は左右 24px の余白でカードが広がる
  screen: {
    flexGrow: 1,
    justifyContent: "center",
    padding: tokens.gapLg,
    backgroundColor: tokens.bg,
  },
  card: {
    padding: tokens.gapLg,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusLg,
  },
  brand: { fontSize: 14, fontWeight: "700", color: tokens.textPrimary },
  title: { marginTop: tokens.gapLg, fontSize: 24, fontWeight: "700", color: tokens.textPrimary },
  description: { marginTop: 6, fontSize: 13, color: tokens.textSecondary },
  // エラー帯は見出しと入力欄の間に置く（docs/screen-list.md「エラー表示」）
  error: {
    marginTop: tokens.gapMd,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: tokens.danger,
    backgroundColor: tokens.dangerBg,
    borderRadius: tokens.radiusMd,
    overflow: "hidden",
  },
  body: { marginTop: tokens.gapMd, gap: tokens.gapMd },
  footer: { marginTop: tokens.gapMd, gap: tokens.gapSm, alignItems: "center" },
});
