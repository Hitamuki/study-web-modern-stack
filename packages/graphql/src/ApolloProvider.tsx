import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider as Provider } from "@apollo/client/react";
import type React from "react";
import { useMemo } from "react";

export interface ApolloProviderProps {
  children: React.ReactNode;
  uri?: string;
  adminSecret?: string;
}

export const ApolloProvider = ({
  children,
  // NOTE: Expo Goで動かす場合は、PCのIPアドレスを指定する
  // TODO: 環境変数から取得する
  uri = "http://localhost:8080/v1/graphql",
  adminSecret = "myadminsecretkey",
}: ApolloProviderProps) => {
  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri,
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    });

    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });
  }, [uri, adminSecret]);

  return <Provider client={client}>{children}</Provider>;
};
