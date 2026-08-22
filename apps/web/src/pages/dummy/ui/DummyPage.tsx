import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_DUMMY,
  DELETE_DUMMY,
  DUMMY_LIST,
  type DummyItem,
  UPDATE_DUMMY,
} from "@repo/graphql";
import { useState } from "react";
import { DummyRow } from "@/entities/dummy/ui/DummyRow";
import { DeleteDummyDialog } from "@/features/dummy-delete/ui/DeleteDummyDialog";
import { DummyForm } from "@/features/dummy-form/ui/DummyForm";
import { supabase } from "@/shared/api/supabase";
import { Button } from "@/shared/ui/button";

/**
 * SCR-005 ダミー画面。
 * PC は 2 ペイン（左が一覧・右がフォーム）、SP は 1 カラム（上がフォーム・下が一覧）。
 * 切り替えは Tailwind の max-md: バリアントが担当する。
 */
export const DummyPage = () => {
  const apollo = useApolloClient();
  const { data, loading, error, refetch } = useQuery(DUMMY_LIST);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DummyItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleMutationError = (mutationError: Error) => setFormError(mutationError.message);

  /**
   * サインアウト。**Apollo のキャッシュも消す。**
   * 消さないと、次にログインした利用者の画面に前の利用者のメモが一瞬表示される。
   */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await apollo.clearStore();
  };
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

  if (loading) return <p className="p-12 text-center text-muted-foreground">読み込み中...</p>;
  if (error) {
    return (
      <p className="p-12 text-center text-destructive">エラーが発生しました: {error.message}</p>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-border bg-card px-6 py-4 max-md:px-4 max-md:py-3">
        <h1 className="text-lg font-semibold max-md:text-[17px]">メモ</h1>
        <Button onClick={resetForm} className="max-md:h-8 max-md:px-3">
          新規作成
        </Button>
        <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
          ログアウト
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 gap-6 p-6 max-md:flex-col max-md:gap-md max-md:p-md">
        {/* SP では一覧をカードにせず、行を背景の上に直接並べる（SCR-005-SP の「一覧」に合わせる） */}
        <section className="flex min-w-0 flex-1 flex-col gap-md rounded-lg border border-border bg-card p-5 max-md:gap-sm max-md:rounded-none max-md:border-none max-md:bg-transparent max-md:p-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold max-md:text-[15px]">メモ一覧</h2>
            <span className="text-[13px] text-muted-foreground max-md:text-xs">
              {items.length} 件
            </span>
          </div>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              メモがまだありません。右のフォームから作成してください。
            </p>
          ) : (
            <ul className="flex min-h-0 flex-col gap-sm overflow-y-auto max-md:overflow-y-visible">
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
