import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export interface DeleteDummyDialogProps {
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * design/app.pen の CMP/削除確認ダイアログ。
 * 画面 ID は振らず、SCR-001 に属するダイアログとして扱う。
 *
 * フォーカストラップ・Esc・スクロールロック・aria 属性は shadcn/ui（Radix）が持つ。
 * 呼び出し側が条件付きでマウントするため open は常に true で、閉じる操作は
 * onOpenChange 経由で onCancel に流す。
 */
export const DeleteDummyDialog = ({ pending, onConfirm, onCancel }: DeleteDummyDialogProps) => (
  <Dialog
    open
    onOpenChange={(open) => {
      if (!open) onCancel();
    }}
  >
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>このメモを削除しますか？</DialogTitle>
        <DialogDescription>削除したメモは元に戻せません。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={pending}>
          キャンセル
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
          {pending ? "削除中..." : "削除する"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
