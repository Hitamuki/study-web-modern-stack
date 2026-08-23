/**
 * design/app.pen のデザイントークンと 1:1 で対応する定数。
 * Web は CSS カスタムプロパティ、Mobile は StyleSheet から参照するためこちらを使う。
 */
export const tokens = {
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  border: "#E3E6EB",
  textPrimary: "#171A1F",
  textSecondary: "#6C7480",
  accent: "#2F6FED",
  accentText: "#FFFFFF",
  danger: "#D64545",
  /* エラー帯の背景。design/app.pen の danger-bg */
  dangerBg: "#FCEAEA",
  radiusMd: 8,
  radiusLg: 12,
  gapSm: 8,
  gapMd: 16,
  gapLg: 24,
} as const;
