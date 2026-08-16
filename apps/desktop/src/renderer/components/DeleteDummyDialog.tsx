import { useEffect, useRef } from "react";
import { Button } from "./Button";

export interface DeleteDummyDialogProps {
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** design/app.pen の CMP/削除確認ダイアログ */
export const DeleteDummyDialog = ({ pending, onConfirm, onCancel }: DeleteDummyDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal でのみ ::backdrop と Esc が有効になるため、open 属性ではなく命令的に開く
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="delete-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="dialog__inner">
        <h2 id="delete-dialog-title" className="dialog__title">
          このメモを削除しますか？
        </h2>
        <p className="dialog__description">削除したメモは元に戻せません。</p>
        <div className="actions">
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? "削除中..." : "削除する"}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
