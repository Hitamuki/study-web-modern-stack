# 開発への参加方法

プロジェクトの開発を始めるための手順ガイドです。

## 開発環境の準備

役割を 2 つに分けています。

| ツール | 役割 |
| :- | :- |
| [mise](https://mise.jdx.dev/) | ランタイム・CLI のバージョン管理（`mise.toml` の `[tools]`） |
| `make` | タスクの実行（`Makefile`） |

### 必要ツール

- [mise](https://mise.jdx.dev/)
- `make`（macOS は Xcode Command Line Tools、Linux は build-essential などに同梱）
- [pnpm](https://pnpm.io/) (miseで管理可能です)

## はじめかた

### 1. リポジトリをクローンする

```bash
git clone <repository-url>
cd study-web-modern-stack
```

### 2. ツールと依存関係のセットアップ

```bash
mise install    # Node / pnpm / hasura-cli などのツールを導入
make install    # 依存関係をインストール
```

mise を使わない場合は、必要なツールを各自で用意したうえで `pnpm install` を実行してください。

### 3. バックエンドの初期化

初回、または DB を作り直したいときに 1 度だけ実行します。
コンテナの起動 → Prisma スキーマの反映 → Hasura メタデータの適用 → 動作確認用データの投入までを行います。

```bash
make backend-init
```

### 4. 開発サーバーの起動

バックエンド（PostgreSQL / Hasura / NestJS）と、触りたいフロントエンドを別々のターミナルで起動します。

```bash
make backend-start    # PostgreSQL + Hasura + NestJS
make web-start        # Web だけ
```

すべてまとめて起動する場合は `make dev` を使います。

## 主要なコマンド

タスクはすべて `Makefile` に定義しています。引数なしの `make` で一覧を表示できます。

| コマンド        | 内容                              |
| :-------------- | :-------------------------------- |
| `make`          | タスク一覧の表示                  |
| `make install`  | 依存関係のインストール            |
| `make dev`      | バックエンドと全フロントエンドの起動 |
| `make build`    | プロジェクトのビルド              |
| `make lint`     | 静的解析 (Biome) の実行           |
| `make format`   | コードの自動整形                  |
| `make format-check` | 整形崩れの確認（書き換えない）  |
| `make test`     | テストの実行                      |
| `make check`    | lint / format-check / test をまとめて実行 |

### 起動系コマンド

フロントエンドは Hasura に接続するため、先に `make backend-start`（または `make dev`）が必要です。

| コマンド             | 起動するもの                                   | ポート |
| :------------------- | :--------------------------------------------- | :----- |
| `make backend-init`  | DB / Hasura の初期化・マイグレーション（起動はしない） | -      |
| `make backend-start` | PostgreSQL + Hasura + NestJS                    | 5433 / 8080 / 3001（inspector 9229） |
| `make backend-stop`  | コンテナの停止                                  | -      |
| `make frontend-start`| Web + Mobile + Desktop                          | 下記すべて |
| `make web-start`     | Web (Vite)                                      | 5173   |
| `make mobile-start`  | Mobile (Expo / Metro)                           | 8081   |
| `make desktop-start` | Desktop (Electron)                              | 5174（inspector 5858 / DevTools 9222） |

NestJS の待ち受けポートは `PORT` で変更できます（例: `PORT=3100 make backend-start`）。
変更した場合は `hasura/metadata/actions.yaml` の handler URL も合わせて直してください。

### コンテナ関連コマンド

`apps/api` は PaaS に載せるため OCI イメージにできます（[#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87)）。
日常の開発では使いません。**イメージのまま動くかを確認したいとき**に使います。

| コマンド              | 内容                                                       |
| :-------------------- | :--------------------------------------------------------- |
| `make api-image`      | `apps/api` のイメージをビルドし、サイズを表示               |
| `make api-image-run`  | ビルドしたイメージをローカルの PostgreSQL に繋いで起動（3011） |

`apps/api/Dockerfile` の**ビルドコンテキストはリポジトリのルート**です。
pnpm Catalogs（`catalog:backend`）はルートの `pnpm-lock.yaml` 経由でしか解決できないため、
`apps/api` 単体ではビルドできません。

`make api-image-run` は `.env` の `HASURA_ACTION_SECRET` を環境変数として要求します。

```bash
export $(grep -E '^HASURA_ACTION_SECRET=' .env | tr -d '"')
make api-image-run
```

#### `GET /health`

イメージには死活監視用の `GET /health` が入っています。**認証はありません。**

| 状態 | 応答 |
| :- | :- |
| DB まで到達できる | `200` / 本文 `ok` |
| DB に到達できない | `503` / 本文 `ng` |

`SELECT 1` を実際に流すのは、Render のスピンダウン回避（HTTP で足りる）だけでなく
Supabase の一時停止回避（判定が `user database activity`）を同時に満たすためです。
本文を `ok` / `ng` だけにしているのは、認証なしで公開するため DB の情報を漏らさないようにするためです。

### Stacked PRs 関連コマンド

`make stack-setup` で `gh stack` 拡張を導入したあとは、`gh` で直接操作します。

| コマンド              | 内容                                        |
| :-------------------- | :------------------------------------------ |
| `make stack-setup`    | `gh stack` 拡張とエージェント用スキルの導入 |
| `gh stack init <名>`  | 新しいスタックを開始                        |
| `gh stack add <名>`   | 最上段に新しい層を積む                      |
| `gh stack view`       | スタックの状態を表示                        |
| `gh stack submit`     | push + PR 作成 + GitHub 上で Stack 化       |
| `gh stack sync`       | `main` の変更を取り込みスタック全体を同期   |
| `gh stack merge --merge` | スタックをまとめてマージ                 |

詳細は [Stacked PRs 運用ガイド](./guides/STACKED_PRS.md) を参照してください。

### ドキュメント関連コマンド

| コマンド                                 | 内容                             |
| :--------------------------------------- | :------------------------------- |
| `make wiki-sync`                         | Wiki を `.wiki/` に clone / pull  |
| `make wiki-push m="<msg>"`               | Wiki の変更をコミットして push   |
| `gh discussion list -c "Tech Decisions"` | 技術選定の一覧                   |

技術を選ぶときは Discussions に証跡を残し、採用した技術は Wiki にまとめます。
詳細は [技術選定ガイド](./guides/TECH_DECISIONS.md) と [Wiki 運用ガイド](./guides/WIKI.md) を参照してください。

## infra/ での Terraform 操作

**現在 `infra/` はありません。** AWS 向けの Terraform は
[#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) で削除しました
（[Discussion #29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) で
AWS を使わないことが決まったため）。`mise.toml` からも `terraform` / `tflint` / `terraform-docs` を外しています。

[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) で
Cloudflare / Render / GitHub 向けに作り直したときに、この節へ手順を書き直します。
管理するもの・しないものの切り分けは
[project/plan/deploy/terraform-scope.md](../project/plan/deploy/terraform-scope.md) が正本です。

## CI

`.github/workflows/check.yml` が PR と `main` への push で `make check`
（format-check / lint / test）を回します（[#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88)）。
ツールのバージョンは `mise.toml` が正本で、CI 側では二重管理しません。

> [!WARNING]
> **CI が緑でも「動作が壊れていない」ことにはなりません。**
> `test` スクリプトを持つパッケージが 1 つも無いため、`make check` の `turbo run test` は
> **0 タスク**です。担保しているのは整形（Biome）と静的解析（ESLint）だけです。
> → [project/plan/deploy/findings.md](../project/plan/deploy/findings.md) の 3

**`main` にブランチ保護は掛けていません。** CI が赤くてもマージは可能です。
マージ前に Actions の結果を自分で確認してください。

デプロイの workflow はまだありません。段階 3
（[project/plan/deploy/phase-3.md](../project/plan/deploy/phase-3.md) の層 11）で足します。

## 開発フロー

本リポジトリでは GitHub の **Stacked PRs**（積み上げ式プルリクエスト）で開発します。
大きな変更を小さな PR に分割し、前の PR を親（ベースブランチ）にして積み上げることで、レビュー単位を小さく保ちます。

### 単独の変更の場合

1. `gh stack init <ブランチ名>` で `main` から機能ブランチを作成します。
2. 変更を加えてコミットします。
3. `make lint` および `make format` を実行してコード品質を確認します。
4. `gh stack submit` でプルリクエストを作成します。

### 変更を積み上げる場合（Stacked PRs）

1. `gh stack init <ブランチ名>` で 1 層目のブランチを作成し、コミットします。
2. `gh stack add <ブランチ名>` で次の層を積み、コミットします（必要な数だけ繰り返す）。
3. `gh stack view` でスタック構造を確認します。
4. `gh stack submit` で全 PR をまとめて作成し、GitHub 上で Stack として紐付けます。
5. `main` が進んだら `gh stack sync` でスタック全体を追従させます。
6. `gh stack merge --merge` でスタックをまとめてマージし、`gh stack sync --prune` で後片付けします。

マージ方式は `--merge`（マージコミット）に統一します。理由は [Discussion #32](https://github.com/Hitamuki/study-web-modern-stack/discussions/32) を参照してください。

2 層以上のスタックでは、GitHub の Merge ボタンや `gh pr merge` による個別マージはスタックの整合性が崩れるため使いません。
1 層だけのスタックは `gh stack merge` が使えないため、`gh pr merge <番号> --merge` でマージします。
分割の粒度やコンフリクト時の対処など、詳しい手順は [Stacked PRs 運用ガイド](./guides/STACKED_PRS.md) を参照してください。

## コードレビュー

レビュー単位は **1 層 = 1 PR** です。その層の差分だけを見て、他の層に属する変更はその層の PR で指摘します。
考え方の背景は Wiki の [Git-Strategy](https://github.com/Hitamuki/study-web-modern-stack/wiki/Git-Strategy) にまとめています。

### コメントのプレフィックス

**すべての指摘の先頭にプレフィックスを付けます。** 付いていないコメントは書きません。

| プレフィックス | 意味 | 実装者の対応 |
| :- | :- | :- |
| `MUST` | 必ず直す。バグ・仕様違反・セキュリティ・規約違反 | 修正必須。未対応のまま Approve しない |
| `IMO` | 自分ならこうする、という提案 | 議論のうえ判断。見送り可（理由を返信する） |
| `NITS` | 些細な指摘。表記ゆれ・タイポ・命名の揺れ | 任意対応 |
| `Q` | 質問・意図の確認 | 返信必須。回答次第で `MUST` に昇格することがある |
| `FYI` | 参考情報の共有。差分外に見つけた既存の問題 | 対応不要。必要なら別 Issue |
| `GOOD` | 良い点の指摘 | 対応不要 |

コメントは日本語で書き、指摘対象を `ファイル:行` で示します。

```text
<PREFIX>: <結論を一文で>

<根拠・理由>
<修正案（コード例があれば）>
```

### レビュー観点

上から順に優先します。

| 観点 | 見るポイント |
| :- | :- |
| 正確性 | 境界値・null / undefined・エラー処理・非同期の競合・戻り値の取りこぼし |
| セキュリティ | 認証認可の抜け、入力検証、秘密情報のコミット、Hasura のパーミッション |
| 設計・レイヤー | `apps/api` の DDD / Clean Architecture、`apps/web` の FSD の依存方向 |
| テスト | AC を検証できているか。振る舞いではなく実装をテストしていないか |
| 可読性 | 命名、責務の分割、周囲のコードとの一貫性 |
| パフォーマンス | N+1、不要な再レンダリング、大きなバンドル |
| 規約 | コミットメッセージ、Issue 番号、層の分け方、ドキュメント更新の要否 |

指摘しないこと:

- Biome が自動整形する範囲の書式
- 生成物（`packages/graphql/src/generated/`、`pnpm-lock.yaml`）
- 好みだけの書き換え（根拠を書けないなら書かない）
- この層のスコープ外の既存コード。改善したいなら `FYI` で別 Issue を提案する

`hasura/metadata/` は生成物ですが、**パーミッションの差分だけは必ず確認します**。

### レビューする側

```bash
gh stack view --short   # スタック内での位置と層の範囲を確認
gh pr view <番号>       # 目的・関連 Issue・AC を確認
gh pr diff <番号>       # その層の差分だけを読む
```

1. 対象 PR の Issue（背景・目的 / AC）を先に読み、AC を満たしているかを軸にレビューする。
2. 差分を読み、上記の観点で指摘を挙げる。断定できないものは `MUST` にせず `Q` で確認する。
3. レビューの最後に、結論と件数を先頭に置いた要約を書く。

```text
## レビュー結果

要修正（MUST 2 / IMO 1 / NITS 3 / Q 1）

- MUST: 楽観ロックの欠落で更新が失われる（memo.service.ts:42）
- MUST: 認可チェックがなく他ユーザーのメモを取得できる（memo.resolver.ts:27）
- IMO: ユースケースの分割（memo.usecase.ts:88）
```

`MUST` が 0 件で AC を満たしていれば Approve します。

`/code-review` で下読みできます。出力された指摘にもプレフィックスを付けたうえで投稿してください。

### 指摘を受ける側

- すべての指摘に返信する。`MUST` は対応するか、合意のうえで見送る理由を書く。
- `IMO` / `NITS` を見送る場合も一言返す。無反応で閉じない。
- 指摘の反映は**その層まで降りて修正**する。上の層で辻褄合わせをしない。
- 議論の結果として決まったことは、Issue の「まとめ」かドキュメントに残す。
