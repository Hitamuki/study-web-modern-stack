import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ApolloProvider as Provider } from "@apollo/client/react";
import type React from "react";
import { useMemo } from "react";

export interface ApolloProviderProps {
  children: React.ReactNode;
  /**
   * GraphQL エンドポイントの URL。
   *
   * 既定値を持たせない。3 アプリで環境変数の読み方が違う（Vite の `import.meta.env` /
   * Expo の `EXPO_PUBLIC_` / electron-vite）ため、読み取りは各アプリの責務にする。
   */
  uri: string;
  /**
   * アクセストークンを返す関数。未認証なら `null` を返す。
   *
   * トークンそのものではなく関数を受け取るのは、取得方法がアプリごとに異なるうえ、
   * リクエストのたびに最新の値（リフレッシュ後のトークン）を取りたいため。
   */
  getToken: () => Promise<string | null>;
}

/**
 * 3 アプリ共通の Apollo クライアント。
 *
 * Hasura は JWT モードで動くため、`Authorization: Bearer <token>` を付けて送る。
 * admin secret はもう使わない（クライアントに全権のキーを置かないため）。
 */
export const ApolloProvider = ({ children, uri, getToken }: ApolloProviderProps) => {
  const client = useMemo(() => {
    // v4 の SetContextLink は (prevContext, operation) の順。v3 の setContext とは引数が逆。
    const authLink = new SetContextLink(async (prevContext) => {
      const token = await getToken();
      return {
        headers: {
          ...prevContext.headers,
          // トークンが無いときはヘッダ自体を付けない。
          // Hasura は Authorization が無いリクエストを invalid-headers で拒否するため、
          // 「未認証である」ことがサーバー側で明確に扱われる。
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    });

    return new ApolloClient({
      link: ApolloLink.from([authLink, new HttpLink({ uri })]),
      cache: new InMemoryCache(),
    });
  }, [uri, getToken]);

  return <Provider client={client}>{children}</Provider>;
};
