import type { ReactNode } from "react";

/**
 * 認証画面の共通カード。design/app.pen の SCR-001〜004（**PC 版**）を流用している。
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
  <main className="auth">
    <div className="auth__card">
      <p className="auth__brand">メモ</p>
      <h1 className="auth__title">{title}</h1>
      <p className="auth__description">{description}</p>
      {error ? <p className="auth__error">{error}</p> : null}
      <div className="auth__body">{children}</div>
      {footer ? <div className="auth__footer">{footer}</div> : null}
    </div>
  </main>
);
