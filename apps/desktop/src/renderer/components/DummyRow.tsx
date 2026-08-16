import type { DummyItem } from "@repo/graphql";
import { formatDateTime } from "../lib/format";
import { Button } from "./Button";

export interface DummyRowProps {
  dummy: DummyItem;
  selected: boolean;
  onEdit: (dummy: DummyItem) => void;
  onDelete: (dummy: DummyItem) => void;
}

/** design/app.pen の CMP/メモ行 */
export const DummyRow = ({ dummy, selected, onEdit, onDelete }: DummyRowProps) => (
  <li className={selected ? "row row--selected" : "row"}>
    <div className="row__body">
      <span className="row__excerpt">{dummy.content}</span>
      <span className="row__timestamp">{formatDateTime(dummy.updated_at)} 更新</span>
    </div>
    <div className="row__actions">
      <Button variant="secondary" onClick={() => onEdit(dummy)}>
        編集
      </Button>
      <Button variant="danger" onClick={() => onDelete(dummy)}>
        削除
      </Button>
    </div>
  </li>
);
