import { ApolloProvider } from "@repo/graphql";
import { RouterProvider } from "react-router";
import { GRAPHQL_URL } from "../shared/config/env";
import { router } from "./routes";
import "./styles.css";

// TODO(#24): Supabase Auth のセッションからトークンを返すように差し替える。
// この層（#23 / #76）では配管だけを通し、トークンの供給は #24 の責務にしている。
const getToken = (): Promise<string | null> => Promise.resolve(null);

export const App = () => (
  <ApolloProvider uri={GRAPHQL_URL} getToken={getToken}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
