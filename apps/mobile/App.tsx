import { ApolloProvider } from "@repo/graphql";

// Expo は EXPO_PUBLIC_ 接頭辞の環境変数をクライアントへ埋め込む。
// 実機・Expo Go から繋ぐ場合は localhost ではなく PC の IP を指定する。
const GRAPHQL_URL: string =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";

// #25（モバイル・デスクトップへの認証フロー導入）が保留のため、常に未認証。
// ビルドは通るが Hasura からデータは取得できない。公開する前に #25 を消化すること。
const getToken = (): Promise<string | null> => Promise.resolve(null);
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DummyPage } from "./src/pages/Dummy";

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider uri={GRAPHQL_URL} getToken={getToken}>
        <DummyPage />
        <StatusBar style="dark" />
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
