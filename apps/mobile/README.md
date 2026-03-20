# Mobile App (Expo)

このディレクトリは、Expo を使用した React Native モバイルアプリのプロジェクトです。

## 起動方法

### 1. Web ブラウザで確認（推奨）
Android SDK がインストールされていない環境でも、ブラウザ上で UI を確認できます。
```bash
# ルートディレクトリから
pnpm --filter @memo-app/mobile web

# または apps/mobile ディレクトリから
pnpm web
```

### 2. 実機の Expo Go アプリで確認
お手持ちのスマートフォンに [Expo Go](https://expo.dev/go) アプリをインストールし、表示される QR コードをスキャンして起動します。
```bash
# ルートディレクトリから
pnpm --filter @memo-app/mobile dev

# または apps/mobile ディレクトリから
pnpm dev
```
※ PC とスマートフォンが同じ Wi-Fi ネットワークに接続されている必要があります。

### 3. iOS Simulator（Xcode）で確認
Xcode がインストールされていて、iOS Simulator が起動できる状態にします。
```bash
# ルートディレクトリから
pnpm --filter @memo-app/mobile ios

# または apps/mobile ディレクトリから
pnpm ios
```
Expo の開発サーバ起動後、iOS Simulator 側でアプリが表示されます。

※ `src/shared/graphql/ApolloProvider.tsx` の `uri` が `localhost` 前提になっている場合、iOS Simulator でも接続先の調整が必要になることがあります（必要に応じて `注意事項` を参照してください）。

### 4. Android Emulator（Android Studio）で確認
Android Studio で Android Emulator（AVD）が利用でき、`adb` が使える状態にします。
```bash
# ルートディレクトリから
pnpm --filter @memo-app/mobile android

# または apps/mobile ディレクトリから
pnpm android
```
Expo の開発サーバ起動後、Emulator 側でアプリが表示されます（起動済みの AVD がある場合はそれを利用します）。

### 5. Expo Dev Client で確認（開発ビルド）
Expo Go ではなく、ネイティブ機能を含む「開発ビルド」で確認したい場合に使います。
このプロジェクトでは `expo-dev-client` の導入・設定が未確定の可能性があるため、まず Expo 公式ドキュメントの「Development Builds (Expo Dev Client)」手順に従って導入してください。

大まかな流れ:
1. `expo-dev-client` を導入し、ネイティブビルドが生成できる状態にする（例: `npx expo install expo-dev-client`）
2. EAS Build またはローカルビルドで開発ビルド（Android APK / iOS IPA）を生成し、端末にインストールする
3. 開発サーバを起動して（`pnpm dev`）端末の「Expo Dev Client」アプリから QR/URL を開き、表示を確認する

※ API の接続先（`src/shared/graphql/ApolloProvider.tsx` の `uri`）は、物理端末やエミュレータの種類に合わせて調整します。

## デバッグ方法

- VSCodeの拡張機能「Expo Tools」でブレークポイントを使ったデバッグが可能
    1. セキュリティソフトでポート番号（8081）の許可
    2. ApolloProvider.tsxのuriをPCのIPアドレスに変更
    3. Expo Goから起動
    4. コマンドパレッドで「Expo: Debug」→「./apps/mobile」→ 端末選択

## GraphQL Codegen
スキーマの変更を反映させるには、以下のコマンドを実行します。
```bash
pnpm --filter @memo-app/mobile codegen
```

## 注意事項
- **Android SDK エラー**: `Error: spawn adb ENOENT` や Android SDK に関するエラーが発生した場合、エミュレータは起動できません。上記の **Web ブラウザ** または **実機の Expo Go** を使用してください。
- **接続設定**: 実機やエミュレータを使用する場合、`src/shared/graphql/ApolloProvider.tsx` の `uri` を `localhost` から PC の IP アドレスや `10.0.2.2`（Android エミュレータ）に変更する必要がある場合があります（必要に応じて iOS/Android/Dev Client でも調整してください）。
