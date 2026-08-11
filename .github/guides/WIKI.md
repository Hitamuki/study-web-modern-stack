# Wiki 運用ガイド

GitHub Wiki には 2 種類のページを置きます。**性質が違うので書式も分けます。**

| 種類 | 答える問い | 例 |
| :- | :- | :- |
| **スタックページ** | 今このプロジェクトは何を使っているか | `Web` `Backend` `Data` `Infra` `Tooling` |
| **ナレッジページ** | その方法論は何で、このプロジェクトではどう適用しているか | `Business` `Git-Strategy` `Domain-Driven-Design` `Feature-Sliced-Design` `AI-Development` |

| 問い | 置き場所 |
| :- | :- |
| 今、何を使っているか | **Wiki**（スタックページ） |
| なぜそれを選んだか（**要点**） | **Wiki**（一覧表の「なぜ」列に 1 行） |
| なぜそれを選んだか（**比較の経緯・却下した候補**） | Discussions（[TECH_DECISIONS.md](./TECH_DECISIONS.md)） |
| 方法論の知識と、このプロジェクトでの適用 | **Wiki**（ナレッジページ） |
| どういう設計になっているか | `docs/`（Mermaid 図） |
| どう動かすか | `README.md` / [CONTRIBUTING.md](../CONTRIBUTING.md) |
| **守るべきルール（正本）** | `AGENTS.md` / `.github/` / `.claude/` |

最後の行が重要です。**ルールの正本はリポジトリ側**で、Wiki はそれを解説する側です。
手順やルールを Wiki にコピーせず、要点＋リンクにします（二重管理すると必ず食い違います）。

## ページ構成

ページ名がそのままファイル名（`Web.md` など）になります。

### スタックページ

| ページ | 範囲 |
| :- | :- |
| `Home` | 索引。全体の一覧と、フロントエンド共通の土台 |
| `Web` | `apps/web` |
| `Mobile` | `apps/mobile` |
| `Desktop` | `apps/desktop` |
| `Backend` | `apps/api` / `packages/graphql` |
| `Data` | Hasura / PostgreSQL / スキーマ管理 |
| `Infra` | Terraform / クラウド / CI |
| `Tooling` | mise / pnpm / Turborepo / Biome / gh stack |

### ナレッジページ

ビジネス:

| ページ | 範囲 |
| :- | :- |
| `Business` | 事業として出すなら決めること（索引） |
| `Monetization` | 課金・広告・募金・クラウドファンディング・売却・価格設計 |
| `Marketing` | SEO 施策、ASO、集客チャネル |
| `Business-Glossary` | KPI などビジネス用語の用語集 |

開発プロセス・設計:

| ページ | 範囲 |
| :- | :- |
| `Git-Strategy` | モノレポ戦略、トランクベース開発、Stacked PR、レビュープレフィックス、Conventional Commits |
| `Domain-Driven-Design` | DDD の戦略・戦術設計と `apps/api` への適用 |
| `Feature-Sliced-Design` | FSD の層・スライス・依存規則と `apps/web` への適用 |

AI:

| ページ | 範囲 |
| :- | :- |
| `AI-Development` | Claude Code（rules / Skills / agents / plugins / hooks / MCP、コードレビューの自動化） |
| `AI-Glossary` | LLM の用語、プロンプト / コンテキスト / ハーネス / ループエンジニアリング |

IT 基礎:

| ページ | 範囲 |
| :- | :- |
| `Authentication-Authorization` | 認証と認可、JWT、Hasura のパーミッション |
| `GraphQL` | 操作・スキーマ・運用上の注意、Hasura 特有の考え方 |
| `Encryption` | 暗号化の使い分け、秘密情報の管理 |
| `Observability` | ログ・メトリクス・トレース、SLO、アラート設計 |

### その他

| ページ | 範囲 |
| :- | :- |
| `Tech-Decisions` | 選定 Discussion の索引、理由未記録・未選定の一覧 |
| `_Sidebar` | 全ページ共通のナビゲーション。ページを増やしたらここにも追加する |

ページを足したら `Home` と `_Sidebar` の索引を更新します。

`Web` / `Mobile` / `Desktop` に共通する土台（TypeScript / React / Apollo Client / `@repo/graphql`）は
`Home` の「フロントエンド共通」に 1 箇所だけ書き、各ページには**そのプラットフォーム固有のもの**を書きます。

## スタックページの書式

「一覧表」＋「補足」＋「選定の記録」の 3 部構成にします。

````markdown
# Web

## 一覧

| 用途 | 技術 | バージョン | なぜこれか |
| :- | :- | :- | :- |
| ビルド | Vite | 5 | 学習対象。React の標準的な構成として選択 |
| 状態管理 | （未導入） | - | Apollo のキャッシュで足りている |

## 補足

### Vite

- 何に使っているか（2〜3 行）
- 入口: `apps/web/src/main.tsx`
- 設計: [docs/context-map.md](リンク)

## 選定の記録

| 決定 | Discussion |
| :- | :- |
| （なし） | |
````

- **バージョン**は `pnpm-workspace.yaml` の catalog に合わせる。パッチまでは書かない（メジャー、必要ならマイナーまで）。
- **「なぜ」は 1 行**に収める。書ききれないと感じたら Discussion を立てる合図。
- **推測を書かない。** 理由が記録されていないものは `理由未記録` と書き、`Tech-Decisions` の「理由が未記録の採用技術」に積む。後追いで Discussion を立てて埋める。
- 「選定の記録」には該当領域の Discussion へのリンクを並べる。まだ無ければ `（なし）`。

`Tech-Decisions` ページは決定の索引です。

````markdown
# Tech Decisions

| 決定 | 領域 | 決定日 | Discussion |
| :- | :- | :- | :- |
| 状態管理に Zustand を採用 | apps/web | 2026-08-11 | [#12](リンク) |
````

## ナレッジページの書式

「要点」＋「このプロジェクトでの適用」＋「落とし穴」＋「参考」の 4 部構成にします。

````markdown
# Feature-Sliced Design

<!-- 1〜2 行で「何を解決する方法論か」 -->

## 要点

<!-- 一般論。表や箇条書きで簡潔に。教科書の写しではなく「使うために要る分だけ」 -->

## このプロジェクトでの適用

<!-- 実際のディレクトリ・ファイルとの対応表。未適用なら「未適用」と書く -->

## 落とし穴

<!-- やりがちな失敗と、その回避方法 -->

## 参考

<!-- 一次情報（公式ドキュメント・原典）へのリンク -->
````

- **一般論と本プロジェクトの適用を必ず節で分ける。** 混ぜると「うちはどうなっているのか」が読み取れなくなる。
- **未適用・未達を隠さない。** 「計画はあるが未実装」はそう書く。
- **ルールの正本を写さない。** `AGENTS.md` / `CONTRIBUTING.md` / `.github/guides/STACKED_PRS.md` に書いてあることは、要点だけ書いてリンクする。
- 一次情報のリンクを必ず置く。一般論の出典を辿れるようにする。

## 更新のタイミング

Wiki はコードと別リポジトリで **PR レビューを通りません**。放置すると必ず古くなるため、
技術の追加・削除・入れ替えを伴う PR をマージしたら、**同じ Issue の中で Wiki を更新します**（DoD の一項目）。

更新が必要になるのは次の場合です。

- 依存を追加・削除した（一覧表の行が増減する）
- メジャーバージョンを上げた（バージョン列が変わる）
- 選定 Discussion が決着した（`Tech-Decisions` に 1 行追加する）
- ナレッジページが指す**リポジトリ側のルールが変わった**（`AGENTS.md` / `CONTRIBUTING.md` など）
- 方法論の適用が進んだ（例: FSD の層を実際に作った）

## 操作

Wiki は `<リポジトリ>.wiki.git` という別リポジトリです。
`make wiki-sync` で `.wiki/`（Git 管理外）に clone / pull し、通常の Markdown として編集します。

```bash
make wiki-sync                                     # clone または pull
# .wiki/ 配下を編集
make wiki-push m="docs(wiki): 状態管理に Zustand を追加 #14"
```

コミットメッセージは本リポジトリの規約に従い、scope は `wiki` にします。

> [!NOTE]
> Wiki は最初の 1 ページを Web UI で作成するまで `.wiki.git` が存在せず、clone できません。
> 未初期化の状態で `make wiki-sync` を実行すると、その旨を表示して終了します。
