import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ApolloProvider } from './src/shared/graphql';
import { MemosPage } from './src/pages/Memos';

export default function App() {
  return (
    <ApolloProvider>
      <MemosPage />
      <StatusBar style="light" />
    </ApolloProvider>
  );
}
