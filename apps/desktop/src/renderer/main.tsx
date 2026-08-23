import { ApolloProvider } from "@repo/graphql";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GRAPHQL_URL } from "./shared/env";
import { getAccessToken } from "./shared/supabase";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root が見つかりません");

createRoot(container).render(
  <React.StrictMode>
    <ApolloProvider uri={GRAPHQL_URL} getToken={getAccessToken}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
);
