import type { ReactNode } from "react";

/**
 * 認証 4 画面（SCR-001〜004）で共通のカード。
 *
 * 構造は design/app.pen に合わせて
 * アプリ名 → 見出し → 説明 → （エラー帯）→ 入力欄 → 主ボタン → 補助リンク の順。
 * PC は幅 440px を中央、SP は左右 24px の余白でカードが広がる。
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
  <main className="flex min-h-full items-center justify-center bg-background p-lg">
    <div className="w-full max-w-[440px] rounded-lg border border-border bg-card p-lg">
      <p className="text-sm font-bold text-foreground">メモ</p>
      <h1 className="mt-lg text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{description}</p>
      {/* エラー帯は見出しと入力欄の間に差し込む（docs/screen-list.md「エラー表示」） */}
      {error ? (
        <p className="mt-md rounded-md bg-destructive-bg px-3 py-2.5 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-md flex flex-col gap-md">{children}</div>
      {footer ? <div className="mt-md flex flex-col gap-2 text-center">{footer}</div> : null}
    </div>
  </main>
);
