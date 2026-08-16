import type { ButtonHTMLAttributes } from "react";

/** design/app.pen の CMP/ボタン（主）・CMP/ボタン（副）に対応。danger は主ボタンの fill 差し替え */
export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({ variant = "primary", className, ...rest }: ButtonProps) => (
  <button
    type="button"
    className={["button", `button--${variant}`, className].filter(Boolean).join(" ")}
    {...rest}
  />
);
