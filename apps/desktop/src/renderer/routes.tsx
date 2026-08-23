import { createBrowserRouter } from "react-router";
import { DummyPage } from "./pages/Dummy";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { NotFoundPage } from "./pages/NotFound";
import { RequireAuth } from "./RequireAuth";

/**
 * ルート定義。
 *
 * **createBrowserRouter（パスベース）が使える**のは、renderer を `app://` の
 * カスタムプロトコルで読み込んでいるため（#25）。`file://` のままだと HashRouter が要る。
 *
 * パスワード再設定（SCR-003 / SCR-004）はここに置かない。メールのリンクは既定の
 * ブラウザで開かれるため、デスクトップアプリでは受け取れない。Web へ誘導する。
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <DummyPage />
      </RequireAuth>
    ),
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
