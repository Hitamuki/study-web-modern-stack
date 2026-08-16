import { ApolloProvider } from "@repo/graphql";
import { DummyPage } from "../pages/dummy/ui/DummyPage";
import "./styles.css";

export const App = () => (
  <ApolloProvider>
    <DummyPage />
  </ApolloProvider>
);
