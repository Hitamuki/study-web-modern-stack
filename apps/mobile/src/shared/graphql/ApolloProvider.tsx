import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider as Provider } from '@apollo/client/react';
import React from 'react';

// NOTE: Android エミュレータの場合は 'http://10.0.2.2:8080/v1/graphql' に変更が必要な場合があります。
const httpLink = new HttpLink({
  uri: 'http://localhost:8080/v1/graphql',
  headers: {
    'x-hasura-admin-secret': 'myadminsecretkey',
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider client={client}>{children}</Provider>;
};
