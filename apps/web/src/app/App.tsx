import { ApolloProvider } from "@repo/graphql";
import { DummyPage } from "../pages/dummy/ui/DummyPage";
import { GRAPHQL_URL } from "../shared/config/env";
import "./styles.css";

// TODO(#24): Supabase Auth のセッションからトークンを返すように差し替える。
// この層（#23）では配管だけを通し、トークンの供給は #24 の責務にしている。
const getToken = async (): Promise<string | null> => null;

export const App = () => (
  <ApolloProvider uri={GRAPHQL_URL} getToken={getToken}>
    <DummyPage />
  </ApolloProvider>
);
