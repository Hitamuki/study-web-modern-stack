import { ApolloProvider } from "@repo/graphql";
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
    <ApolloProvider>
      <DummyPage />
    </ApolloProvider>
  </React.StrictMode>,
);
