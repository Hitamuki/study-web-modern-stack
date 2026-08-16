import type { DummyItem } from "@repo/graphql";
import { formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

export interface DummyFormProps {
  /** 編集対象。null なら新規作成 */
  editing: DummyItem | null;
  content: string;
  pending: boolean;
  errorMessage: string | null;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * design/app.pen の「編集フォーム」。
 * PC は右ペインで幅 420px 固定、SP は一覧の上（order-first）へ回り込む。
 */
export const DummyForm = ({
  editing,
  content,
  pending,
  errorMessage,
  onContentChange,
  onSubmit,
  onCancel,
}: DummyFormProps) => (
  <form
    className="flex w-[420px] flex-none flex-col gap-md rounded-lg border border-border bg-card p-5 max-md:order-first max-md:w-auto max-md:gap-3 max-md:p-md"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <h2 className="text-base font-semibold max-md:text-[15px]">
      {editing ? "メモを編集" : "メモを作成"}
    </h2>

    <div className="flex flex-col gap-sm">
      <label className="text-[13px] font-medium text-muted-foreground" htmlFor="dummy-content">
        本文
      </label>
      <textarea
        id="dummy-content"
        className="h-60 resize-none rounded-md border border-border bg-card p-3 text-sm/relaxed text-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring max-md:h-30"
        value={content}
        placeholder="本文を入力してください"
        onChange={(event) => onContentChange(event.target.value)}
      />
    </div>

    {editing && (
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>作成: {formatDateTime(editing.created_at)}</span>
        <span>更新: {formatDateTime(editing.updated_at)}</span>
      </div>
    )}

    {errorMessage && <p className="text-[13px] text-destructive">{errorMessage}</p>}

    {/* PC では操作ボタンをペイン下端へ寄せる（デザインの「スペーサー」に相当）。SP は伸ばさない */}
    <div className="flex-1 max-md:hidden" />

    <div className="flex justify-end gap-sm">
      <Button variant="outline" onClick={onCancel} disabled={pending}>
        キャンセル
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : "保存"}
      </Button>
    </div>
  </form>
);
