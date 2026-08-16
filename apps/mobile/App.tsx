import { ApolloProvider } from "@repo/graphql";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DummyPage } from "./src/pages/Dummy";

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider>
        <DummyPage />
        <StatusBar style="dark" />
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
