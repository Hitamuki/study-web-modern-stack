import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./RequireAuth";
import { DummyPage } from "../pages/dummy/ui/DummyPage";
import { LoginPage } from "../pages/login/ui/LoginPage";
import { NotFoundPage } from "../pages/not-found/ui/NotFoundPage";
import { PasswordResetPage } from "../pages/password-reset/ui/PasswordResetPage";
import { PasswordUpdatePage } from "../pages/password-update/ui/PasswordUpdatePage";
import { SignupPage } from "../pages/signup/ui/SignupPage";

/**
 * ルート定義。画面 ID との対応は docs/screen-list.md が正本。
 *
 * framework モード（Remix 統合）は使わない。`apps/web` はサーバーを持たない
 * Vite の SPA のため（Discussion #75 の規範 4）。
 */
export const router = createBrowserRouter([
  // SCR-005 ダミー画面。未ログインなら /login へ送る
  {
    path: "/",
    element: (
      <RequireAuth>
        <DummyPage />
      </RequireAuth>
    ),
  },
  { path: "/login", element: <LoginPage /> }, // SCR-001
  { path: "/signup", element: <SignupPage /> }, // SCR-002
  { path: "/password-reset", element: <PasswordResetPage /> }, // SCR-003
  // SCR-004。パスワード再設定メールのリンクからここへ戻る（resetPasswordForEmail の redirectTo）
  { path: "/password-update", element: <PasswordUpdatePage /> },
  { path: "*", element: <NotFoundPage /> },
]);
