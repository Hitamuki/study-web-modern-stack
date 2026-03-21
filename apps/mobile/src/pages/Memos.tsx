import { useQuery } from '@apollo/client/react';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { gql } from '@repo/graphql';

const GET_MEMOS = gql(`
  query GetMemos {
    memos(order_by: { created_at: desc }) {
      id
      content
      created_at
      updated_at
    }
  }
`);

export const MemosPage = () => {
  const { loading, error, data } = useQuery(GET_MEMOS);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, styles.error]}>
          エラーが発生しました: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Memo List</Text>
      </View>
      <FlatList
        data={data?.memos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString('ja-JP')}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  content: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
  },
  message: {
    color: '#f8fafc',
    fontSize: 18,
  },
  error: {
    color: '#ef4444',
  },
});
