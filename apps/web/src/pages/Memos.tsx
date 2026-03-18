import { useQuery } from '@apollo/client/react';
import { gql } from '../shared/graphql';

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

  if (loading) return <p style={styles.stateMessage}>読み込み中...</p>;
  if (error) return <p style={styles.errorMessage}>エラーが発生しました: {error.message}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Memo List</h1>
      <div style={styles.grid}>
        {data?.memos.map((memo: { id: string, content: string, created_at: string }) => (
          <div key={memo.id} style={styles.card}>
            <p style={styles.content}>{memo.content}</p>
            <div style={styles.meta}>
              <span style={styles.date}>
                {new Date(memo.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    color: '#f8fafc',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  content: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap' as const,
  },
  meta: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid #334155',
    paddingTop: '0.75rem',
  },
  date: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  stateMessage: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#f8fafc',
    fontSize: '1.2rem',
    backgroundColor: '#0f172a',
    minHeight: '100vh'
  },
  errorMessage: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#ef4444',
    fontSize: '1.2rem',
    backgroundColor: '#0f172a',
    minHeight: '100vh'
  }
};
