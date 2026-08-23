import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/**
 * ラベル + 1 行入力欄。design/app.pen の `CMP/入力フィールド` に対応する。
 *
 * 既存の DummyForm が素の要素に手書きクラスを当てる方式なので、それに揃えている
 * （shadcn の Input / Label は導入しない）。
 */
export const Field = ({
  id,
  label,
  className,
  ...props
}: { label: string } & ComponentProps<"input">) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[13px] font-medium text-muted-foreground">
      {label}
    </label>
    <input
      id={id}
      className={cn(
        "h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
);
