import { useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_DUMMY,
  DELETE_DUMMY,
  DUMMY_LIST,
  type DummyItem,
  UPDATE_DUMMY,
} from "@repo/graphql";
import { useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateTime } from "../shared/format";
import { tokens } from "../shared/tokens";
import { Button } from "../shared/ui/Button";

/**
 * SCR-001 ダミー画面（モバイル）。
 * design/app.pen の SCR-001-SP に合わせ、上にフォーム・下に一覧の 1 カラム構成。
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
  const saving = createState.loading || updateState.loading;

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

  if (loading || error) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.state}>
          <Text style={error ? styles.stateTextError : styles.stateText}>
            {error ? `エラーが発生しました: ${error.message}` : "読み込み中..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>メモ</Text>
        <Button label="新規作成" compact onPress={resetForm} />
      </View>

      {/* 一覧が少数のうちは ScrollView で十分。FlatList を入れ子にすると警告になるため使わない */}
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardHeading}>{editing ? "メモを編集" : "メモを作成"}</Text>
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="本文を入力してください"
            placeholderTextColor={tokens.textSecondary}
            multiline
            textAlignVertical="top"
          />
          {editing && (
            <View style={styles.meta}>
              <Text style={styles.metaText}>作成: {formatDateTime(editing.created_at)}</Text>
              <Text style={styles.metaText}>更新: {formatDateTime(editing.updated_at)}</Text>
            </View>
          )}
          {formError && <Text style={styles.error}>{formError}</Text>}
          <View style={styles.actions}>
            <Button label="キャンセル" variant="secondary" disabled={saving} onPress={resetForm} />
            <Button
              label={saving ? "保存中..." : "保存"}
              disabled={saving}
              onPress={() => void handleSubmit()}
            />
          </View>
        </View>

        <View style={styles.list}>
          <View style={styles.listHeader}>
            <Text style={styles.cardHeading}>メモ一覧</Text>
            <Text style={styles.count}>{items.length} 件</Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.empty}>
              メモがまだありません。上のフォームから作成してください。
            </Text>
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                style={[styles.row, item.id === selectedId && styles.rowSelected]}
              >
                <View style={styles.rowBody}>
                  <Text style={styles.rowExcerpt} numberOfLines={2}>
                    {item.content}
                  </Text>
                  <Text style={styles.rowTimestamp}>{formatDateTime(item.updated_at)} 更新</Text>
                </View>
                <View style={styles.rowActions}>
                  <Button label="編集" variant="secondary" onPress={() => handleEdit(item)} />
                  <Button label="削除" variant="danger" onPress={() => setDeleteTarget(item)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>このメモを削除しますか？</Text>
            <Text style={styles.dialogDescription}>削除したメモは元に戻せません。</Text>
            <View style={styles.actions}>
              <Button
                label="キャンセル"
                variant="secondary"
                disabled={deleteState.loading}
                onPress={() => setDeleteTarget(null)}
              />
              <Button
                label={deleteState.loading ? "削除中..." : "削除する"}
                variant="danger"
                disabled={deleteState.loading}
                onPress={() => void handleConfirmDelete()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: tokens.gapMd,
    backgroundColor: tokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: tokens.textPrimary,
  },
  body: {
    padding: tokens.gapMd,
    gap: tokens.gapMd,
  },
  card: {
    gap: 12,
    padding: tokens.gapMd,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusLg,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: tokens.textPrimary,
  },
  input: {
    height: 120,
    padding: 12,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusMd,
    color: tokens.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  meta: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: tokens.textSecondary,
  },
  error: {
    fontSize: 13,
    color: tokens.danger,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: tokens.gapSm,
  },
  list: {
    gap: tokens.gapSm,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: 12,
    color: tokens.textSecondary,
  },
  empty: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 14,
    color: tokens.textSecondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusMd,
  },
  rowSelected: {
    borderColor: tokens.accent,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowExcerpt: {
    fontSize: 14,
    color: tokens.textPrimary,
  },
  rowTimestamp: {
    fontSize: 12,
    color: tokens.textSecondary,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.gapSm,
  },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.gapMd,
    backgroundColor: "rgba(23, 26, 31, 0.45)",
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    gap: tokens.gapMd,
    padding: 24,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: tokens.radiusLg,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: tokens.textPrimary,
  },
  dialogDescription: {
    fontSize: 14,
    color: tokens.textSecondary,
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  stateText: {
    fontSize: 16,
    color: tokens.textSecondary,
  },
  stateTextError: {
    fontSize: 16,
    color: tokens.danger,
  },
});
