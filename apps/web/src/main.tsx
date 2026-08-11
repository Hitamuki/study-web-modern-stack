import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@repo/graphql";
import { MemosPage } from "./pages/Memos";

// Basic global resets
const globalStyle = document.createElement("style");
globalStyle.innerHTML = `
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  * {
    box-sizing: border-box;
  }
`;
document.head.appendChild(globalStyle);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("マウント先の #root が index.html に見つかりません");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ApolloProvider>
      <MemosPage />
    </ApolloProvider>
  </React.StrictMode>,
);
