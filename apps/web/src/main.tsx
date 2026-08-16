import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("マウント先の #root が index.html に見つかりません");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
