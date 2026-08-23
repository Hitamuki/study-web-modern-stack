import { ApolloProvider } from "@repo/graphql";
import { RouterProvider } from "react-router";
import { getAccessToken } from "../shared/api/supabase";
import { GRAPHQL_URL } from "../shared/config/env";
import { router } from "./routes";
import "./styles.css";

export const App = () => (
  <ApolloProvider uri={GRAPHQL_URL} getToken={getAccessToken}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
