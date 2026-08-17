import { useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_DUMMY,
  DELETE_DUMMY,
  DUMMY_LIST,
  type DummyItem,
  UPDATE_DUMMY,
} from "@repo/graphql";
import { useState } from "react";
import { Button } from "../components/Button";
import { DeleteDummyDialog } from "../components/DeleteDummyDialog";
import { DummyForm } from "../components/DummyForm";
import { DummyRow } from "../components/DummyRow";

/**
 * SCR-005 ダミー画面（デスクトップ）。
 * ウィンドウ幅が広いため PC 版の 2 ペインを既定とし、
 * 幅を絞ったときは styles.css のメディアクエリで 1 カラムに落ちる。
 */
export const DummyPage = () => {
  const { data, loading, error, refetch } = useQuery(DUMMY_LIST);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DummyItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleMutationError = (mutationError: Error) => setFormError(mutationError.message);
  const [createDummy, createState] = useMutation(CREATE_DUMMY, { onError: handleMutationError });
  const [updateDummy, updateState] = useMutation(UPDATE_DUMMY, { onError: handleMutationError });
  const [deleteDummy, deleteState] = useMutation(DELETE_DUMMY, { onError: handleMutationError });

  const items: DummyItem[] = data?.dummy ?? [];
  const editing = items.find((item) => item.id === selectedId) ?? null;

  const resetForm = () => {
    setSelectedId(null);
    setContent("");
    setFormError(null);
  };

  const handleEdit = (dummy: DummyItem) => {
    setSelectedId(dummy.id);
    setContent(dummy.content);
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const trimmed = content.trim();
    if (trimmed === "") {
      setFormError("本文を入力してください");
      return;
    }

    if (selectedId === null) {
      const result = await createDummy({ variables: { content: trimmed } });
      if (!result.data?.createDummy) return;
      setSelectedId(result.data.createDummy.id);
    } else {
      const result = await updateDummy({ variables: { id: selectedId, content: trimmed } });
      if (!result.data?.updateDummy) return;
    }
    await refetch();
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === null) return;
    setFormError(null);
    const result = await deleteDummy({ variables: { id: deleteTarget.id } });
    const deletedId = deleteTarget.id;
    setDeleteTarget(null);
    if (!result.data?.deleteDummy) return;
    if (selectedId === deletedId) {
      resetForm();
    }
    await refetch();
  };

  if (loading) return <p className="state">読み込み中...</p>;
  if (error) return <p className="state state--error">エラーが発生しました: {error.message}</p>;

  return (
    <div className="screen">
      <header className="header">
        <h1 className="header__title">メモ</h1>
        <Button variant="primary" onClick={resetForm}>
          新規作成
        </Button>
      </header>

      <main className="body">
        <section className="pane pane--list">
          <div className="pane__header">
            <h2 className="pane__heading">メモ一覧</h2>
            <span className="pane__count">{items.length} 件</span>
          </div>
          {items.length === 0 ? (
            <p className="list__empty">メモがまだありません。右のフォームから作成してください。</p>
          ) : (
            <ul className="list">
              {items.map((item) => (
                <DummyRow
                  key={item.id}
                  dummy={item}
                  selected={item.id === selectedId}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </ul>
          )}
        </section>

        <DummyForm
          editing={editing}
          content={content}
          pending={createState.loading || updateState.loading}
          errorMessage={formError}
          onContentChange={setContent}
          onSubmit={() => void handleSubmit()}
          onCancel={resetForm}
        />
      </main>

      {deleteTarget && (
        <DeleteDummyDialog
          pending={deleteState.loading}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
