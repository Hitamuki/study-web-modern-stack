import { ApolloProvider } from "@repo/graphql";

// electron-vite の renderer も Vite なので VITE_ 接頭辞で読む。
const GRAPHQL_URL: string = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";

// #25（モバイル・デスクトップへの認証フロー導入）が保留のため、常に未認証。
// ビルドは通るが Hasura からデータは取得できない。公開する前に #25 を消化すること。
const getToken = async (): Promise<string | null> => null;
import React from "react";
import ReactDOM from "react-dom/client";
import { DummyPage } from "./pages/Dummy";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("マウント先の #root が index.html に見つかりません");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ApolloProvider uri={GRAPHQL_URL} getToken={getToken}>
      <DummyPage />
    </ApolloProvider>
  </React.StrictMode>,
);
