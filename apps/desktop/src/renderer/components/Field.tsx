import type { InputHTMLAttributes } from "react";

/** design/app.pen の CMP/入力フィールドに対応。ラベル + 1 行入力欄 */
export const Field = ({
  id,
  label,
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <div className="field">
    <label className="field__label" htmlFor={id}>
      {label}
    </label>
    <input id={id} className="field__input" {...rest} />
  </div>
);
