import type { DummyItem } from "@repo/graphql";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

export interface DummyRowProps {
  dummy: DummyItem;
  selected: boolean;
  onEdit: (dummy: DummyItem) => void;
  onDelete: (dummy: DummyItem) => void;
}

/** design/app.pen の CMP/メモ行 */
export const DummyRow = ({ dummy, selected, onEdit, onDelete }: DummyRowProps) => (
  <li
    className={cn(
      "flex items-center gap-3 rounded-md border border-border bg-card p-3",
      selected && "border-primary",
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* SP は幅が狭いぶん 2 行まで折り返し、それ以降は省略する */}
      <span className="truncate text-sm max-md:line-clamp-2 max-md:whitespace-normal">
        {dummy.content}
      </span>
      <span className="text-xs text-muted-foreground">{formatDateTime(dummy.updated_at)} 更新</span>
    </div>
    <div className="flex flex-none items-center gap-sm">
      <Button variant="outline" onClick={() => onEdit(dummy)}>
        編集
      </Button>
      <Button variant="destructive" onClick={() => onDelete(dummy)}>
        削除
      </Button>
    </div>
  </li>
);
