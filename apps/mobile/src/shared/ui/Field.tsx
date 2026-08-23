import { StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../tokens";

/** design/app.pen の CMP/入力フィールドに対応。ラベル + 1 行入力欄 */
export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoComplete?: "email" | "password" | "new-password";
  keyboardType?: "default" | "email-address";
}

export const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoComplete,
  keyboardType = "default",
}: FieldProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={tokens.textSecondary}
      secureTextEntry={secureTextEntry}
      autoComplete={autoComplete}
      autoCapitalize="none"
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500", color: tokens.textSecondary },
  input: {
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: tokens.textPrimary,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusMd,
  },
});
