import type { DummyItem } from "@repo/graphql";
import { formatDateTime } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";

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

/** design/app.pen の「編集フォーム」 */
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
    className="pane pane--form"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <h2 className="pane__heading">{editing ? "メモを編集" : "メモを作成"}</h2>

    <div className="field">
      <label className="field__label" htmlFor="dummy-content">
        本文
      </label>
      <textarea
        id="dummy-content"
        className="field__input"
        value={content}
        placeholder="本文を入力してください"
        onChange={(event) => onContentChange(event.target.value)}
      />
    </div>

    {editing && (
      <div className="meta">
        <span>作成: {formatDateTime(editing.created_at)}</span>
        <span>更新: {formatDateTime(editing.updated_at)}</span>
      </div>
    )}

    {errorMessage && <p className="error">{errorMessage}</p>}

    <div className="spacer" />

    <div className="actions">
      <Button variant="secondary" onClick={onCancel} disabled={pending}>
        キャンセル
      </Button>
      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? "保存中..." : "保存"}
      </Button>
    </div>
  </form>
);
