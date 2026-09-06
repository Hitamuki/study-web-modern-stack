import { ApolloProvider } from "@repo/graphql";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthGate } from "./src/AuthGate";
import { getAccessToken } from "./src/shared/supabase";

/**
 * Expo は `EXPO_PUBLIC_` 接頭辞の環境変数だけをクライアントへ埋め込む。
 *
 * 実機や Expo Go から繋ぐ場合、`localhost` は端末自身を指すため到達できない。
 * **PC の LAN 内 IP を指定する**（例: `http://192.168.1.10:8080/v1/graphql`）。
 * 設定は `.env.example` の `EXPO_PUBLIC_GRAPHQL_URL` を参照。
 *
 * **localhost のフォールバックを置かない。** バンドル時に埋め込まれるため、
 * 未設定のまま作った成果物は実行するまで気づけない（#89）。
 */
const GRAPHQL_URL: string = requireEnv(
  process.env.EXPO_PUBLIC_GRAPHQL_URL,
  "EXPO_PUBLIC_GRAPHQL_URL",
);

function requireEnv(value: string | undefined, name: string): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} が未設定です。.env を確認してください（.env.example を参照）。`);
  }
  return value;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider uri={GRAPHQL_URL} getToken={getAccessToken}>
        <AuthGate />
        <StatusBar style="dark" />
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
