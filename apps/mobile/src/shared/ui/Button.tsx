import { Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "../tokens";

/** design/app.pen の CMP/ボタン（主）・CMP/ボタン（副）に対応。danger は主ボタンの fill 差し替え */
export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** ヘッダー内のボタンはデザイン上パディングが小さい */
  compact?: boolean;
  onPress: () => void;
}

export const Button = ({
  label,
  variant = "primary",
  disabled = false,
  compact = false,
  onPress,
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      compact && styles.compact,
      styles[variant],
      (disabled || pressed) && styles.dimmed,
    ]}
  >
    <Text style={[styles.label, variant === "secondary" ? styles.labelDark : styles.labelLight]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: tokens.gapMd,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    paddingVertical: tokens.gapSm,
    paddingHorizontal: 12,
  },
  primary: {
    backgroundColor: tokens.accent,
  },
  secondary: {
    backgroundColor: tokens.surface,
    borderColor: tokens.border,
  },
  danger: {
    backgroundColor: tokens.danger,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
  },
  labelLight: {
    color: tokens.accentText,
    fontWeight: "600",
  },
  labelDark: {
    color: tokens.textPrimary,
    fontWeight: "500",
  },
});
