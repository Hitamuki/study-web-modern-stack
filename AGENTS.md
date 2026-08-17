# AGENTS.md

このリポジトリで作業するエージェント（および開発者）向けの共通ルールです。
`.claude/CLAUDE.md` からも読み込まれます。

## プロジェクト概要

pnpm Catalogs + Turborepo のモノレポで、インフラからフロント（Web / モバイル / デスクトップ）・バックエンドまでを一気通貫で構築する

主なディレクトリ:

| パス | 内容 |
| :- | :- |
| `apps/api/` | NestJS（DDD / Clean Architecture） |
| `apps/web/` | React + Vite（FSD） |
| `apps/mobile/` | React Native (Expo) |
| `apps/desktop/` | Electron |
| `packages/` | 共有パッケージ（GraphQL スキーマなど） |
| `hasura/` | Hasura のメタデータ・マイグレーション |
| `infra/` | Terraform |
| `docs/` | 設計ドキュメント |
| `design/` | UI デザイン（Pencil の `.pen`） |

### コマンドの実行

タスクは **`Makefile` に集約**しています。`pnpm` や `gh` を直接叩く前に `make` でタスク一覧を確認してください。

| ファイル | 役割 |
| :- | :- |
| `Makefile` | タスクの実行（`make install` / `make dev` / `make check` / `make wiki-sync` など） |
| `mise.toml` | ツール（Node / pnpm / terraform など）のバージョン管理。タスクは定義しない |

新しい定型作業を足すときは `Makefile` に `##` 付きのターゲットとして追加します（`make` のヘルプに自動で載ります）。

## タスク管理（GitHub Projects）

作業は**すべて GitHub Issue 起点**で進めます。Issue のない変更をコミットしません。

### 原則

- 1 Issue = 1 つの完結したタスク（レビュー可能な単位）。大きなテーマは子 Issue に分割する。
- 新規 Issue は必ず GitHub Projects の Board に登録し、`Status` を **`Backlog`** にする。
- Issue 本文は下記テンプレート（背景・目的 / DoR / AC / DoD / まとめ / 参考）に従う。
- **実施すると決めた Issue は `Todo` へ移し、同時に実施期間を設定する**。Roadmap ビューで予定を見るため、期間のない `Todo` を作らない。
- 着手時に `In Progress` へ移す。DoR を満たしていない Issue は着手しない。
- **完了時は AC / DoD のチェックボックスを実際に確認して埋め、「まとめ」を記入してから** `Done` へ移す。未チェックのまま、またはまとめが空のまま閉じない。
- Issue タイトルは日本語で、体言止め（例: `.vscode 初期セットアップ`）。末尾に句点を付けない。

### Status と実施期間

| Status | 意味 | 移すタイミング | 実施期間 |
| :- | :- | :- | :- |
| `Backlog` | 起票しただけ。やるかどうかは未定 | Issue 作成時 | 未設定 |
| `Todo` | 実施が決まった。着手待ち | 実施を決めた時点 | **必須**（`開始日` / `終了日`） |
| `In Progress` | 着手中 | 作業を始めるとき | 予定とずれたら更新する |
| `Review` | PR レビュー中 | `gh stack submit` で PR を出したとき | 予定とずれたら更新する |
| `Done` | 完了 | 「まとめ」を記入した後 | 実績に合わせて確定する |

実施期間は Board の日付フィールド `開始日` / `終了日` で、Roadmap ビューはこの 2 つで描画されます。

### Issue の作成手順

テンプレートをもとに本文を用意し、Issue を作成して Board に追加する

### Issue 本文のテンプレート

Issue 本文のテンプレートは `.github/ISSUE_TEMPLATE/` 配下が正本

| テンプレート | 用途 | ラベル |
| :- | :- | :- |
| [task.md](./.github/ISSUE_TEMPLATE/task.md) | 開発タスク全般 | 起票時に選ぶ |
| [bug_report.md](./.github/ISSUE_TEMPLATE/bug_report.md) | 不具合の報告 | `bug`（自動付与） |

**「まとめ」は作成時は空**にしておき、完了時に記入する

各項目の書き分け:

| 項目 | 書くこと |
| :- | :- |
| 背景・目的 | なぜやるのか。課題と目指す状態（バグ報告では 概要 / 再現手順 / 期待・実際の挙動 / 発生環境） |
| DoR | 着手前に揃っている必要がある前提（依存 Issue の完了、設計方針の決定、環境準備、バグなら再現確認） |
| AC | この Issue 固有の受け入れ条件。**検証手順が想像できる粒度**で書く |
| DoD | テンプレート共通の完了チェック。内容をそのまま使う |
| まとめ | 完了後に記入する実績（下記参照） |

### 完了時の手順

`Done` に移す前に、次の順で Issue 本文を仕上げます。

1. **AC のチェックボックスを埋める。** 1 項目ずつ実際に確認してから `- [x]` にする。眺めただけでチェックしない。
2. **DoD のチェックボックスを埋める。** コマンド（`make check` など）は実行して結果を確認する。
3. **技術の追加・削除・入れ替えがあれば Wiki を更新する。** 選定 Discussion が決着していれば `Tech-Decisions` ページにも 1 行追加する。
4. **満たせなかった項目はチェックしない。** `- [ ]` のまま残し、行末に理由を書く（例: `（@memo-app/api の既存エラーで失敗。本 Issue の対象外）`）。満たせない項目があるまま閉じてよいが、無言で閉じない。
5. **「まとめ」を記入する。** 関連する Discussion / Wiki ページへのリンクを含める。

「まとめ」は Issue 単位の実績記録です。
書くのは「やったこと」の羅列ではなく、**決定した内容とその理由、実際に反映した成果物**です。
技術選定の経緯は Discussions、採用技術の現状は Wiki に残すため、「まとめ」からはそれらにリンクします。

## ドキュメントの置き場所

情報の性質で置き場所を分けます。同じ内容を二重に書かず、リンクで参照します。

| 置き場所 | 性質 | 役割 | 更新タイミング |
| :- | :- | :- | :- |
| GitHub Issue | 作業単位 | やることと完了の記録（AC / DoD / まとめ） | 起票時と完了時 |
| `project/plan/` | 作業計画（横断） | **複数 Issue にまたがる順序と依存関係**。層の積み順、ブロッカー、判断待ちの項目 | 着手前と、方針が変わったとき |
| GitHub Discussions | フロー（追記のみ） | 技術選定の議論と証跡（比較した候補・却下の理由）。決定後も残す | 選定の開始〜決定 |
| GitHub Wiki | ストック（最新のみ） | 採用技術の一覧・概要・**1 行の採用理由**。経緯は Discussion へリンク | 導入 PR のマージ後 |
| `docs/` | コードと同期 | 設計図（コンテキストマップ / ドメインモデル / ER 図） | 実装 PR と同時 |
| `README.md` / `.github/` | 手順 | セットアップ・開発フロー・レビュー・運用ルール | 手順が変わったとき |

迷ったら「後から読み返すのは**経緯**か**現状**か」で決めます。経緯なら Discussions、現状なら Wiki です。

### `project/plan/` の使い分け

1 つの Issue に収まる作業に計画書は要りません。**Issue をまたぐ順序と依存が生じたときだけ**作ります。

- 書くのは「どの順で何をやるか」「何が何をブロックしているか」だけ。
  **完了条件は Issue、選定理由は Discussions、現状は Wiki、設計は `docs/`** にあるものをリンクし、内容をコピーしない。
- 形式は [OKF（Open Knowledge Format）v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)。
  YAML frontmatter 付き Markdown のディレクトリで、必須は `type` のみ。`index.md` と `log.md` は予約名。
- `status` と `stale_after` を必ず入れます。**期限を過ぎた計画は現状とずれている前提**で読みます。
- 計画が実行され終わったら `status: deprecated` にし、消さずに残します。

### ツールが場所を決めているファイル

次のファイルは置き場所を選べません。ツールが読む場所が決まっているため、動かすと機能しなくなります。

| パス | 読むもの | 役割 |
| :- | :- | :- |
| `AGENTS.md` | エージェント全般（Claude Code は `.claude/CLAUDE.md` の `@` import 経由） | このリポジトリの共通ルール |
| `.github/CONTRIBUTING.md` | GitHub | 開発者ガイド。Issue / PR 作成時に導線が表示される |
| `.github/ISSUE_TEMPLATE/` `.github/DISCUSSION_TEMPLATE/` `.github/pull_request_template.md` | GitHub | Issue / Discussion / PR のテンプレート |
| `.claude/settings.json` | Claude Code | 権限・フックなどのツール設定 |

GitHub が特別扱いしないドキュメント（Stacked PRs / 技術選定 / Wiki の運用ガイド）は `.github/guides/` に置き、`.github/` 直下は上表のファイルだけに保ちます。

Claude Code の `REVIEW.md` は採用していません。読むのは GitHub App 版の Code Review だけで、
有効化に Team / Enterprise の Owner 権限が要るため本リポジトリでは機能しないためです。レビューは `/code-review` で行います。

## 技術選定（GitHub Discussions）

複数の候補から技術を選ぶときは、**先に Discussion を立てて比較の過程を残します**。
結論だけをコミットに残さず、「なぜ他を選ばなかったか」を後から人間が読める形にするためです。
カテゴリは `Tech Decisions`。詳しい手順とテンプレートは [.github/guides/TECH_DECISIONS.md](./.github/guides/TECH_DECISIONS.md) を参照してください。

### 対象

乗り換えコストが高いものだけを対象にします。すべての依存追加で Discussion を立てません。

| 立てる | 立てない |
| :- | :- |
| フレームワーク・ランタイム（React / NestJS など） | 単発の devDependency |
| データアクセス・スキーマ基盤（Hasura / ORM など） | 明確な代替がないユーティリティ |
| 状態管理・データ取得・UI 基盤 | 破壊的変更を伴わないバージョン更新 |
| 認証・課金などの外部サービス依存 | 既存の選定の枠内での追加 |
| CI / IaC / モノレポ基盤 | |

判断に迷う場合は立てます。立てない場合は、採用理由を Issue 本文か PR に 1 行残します。

### 原則

- **1 選定 = 1 Discussion**。タイトルは `<領域>: <決めること>`（例: `apps/web: 状態管理ライブラリの選定`）。
- 本文には**必ず比較表**を入れる。**評価軸を先に決めてから**候補を並べる。却下した候補も消さずに残す。
- 結論は**コメントとして投稿し、Answer にマークする**。本文を書き換えて結論だけ残さない（経緯が消える）。
- 決定後に方針を変える場合は、元の Discussion にコメントで追記したうえで**新しい Discussion を立て、相互にリンクする**。決定を上書きしない。
- 選定を伴う Issue は、**DoR に「Discussion #\<番号\> が決着している」を入れる**。着手前に決着させる。
- 議論が Issue のコメントで始まってしまったら、Discussion に移して Issue からリンクする。

## 技術スタックの記録（GitHub Wiki）

Wiki には 2 種類のページを置きます。ページ構成と書式は [.github/guides/WIKI.md](./.github/guides/WIKI.md) を参照してください。

| 種類 | 答える問い | ページ |
| :- | :- | :- |
| スタックページ | 今このプロジェクトは何を使っているか（＋なぜ 1 行） | `Home` / `Web` / `Mobile` / `Desktop` / `Backend` / `Data` / `Infra` / `Tooling` |
| ナレッジページ（ビジネス） | 事業の観点 | `Business` / `Monetization` / `Marketing` / `Business-Glossary` |
| ナレッジページ（プロセス・設計） | 開発の方法論 | `Git-Strategy` / `Domain-Driven-Design` / `Feature-Sliced-Design` |
| ナレッジページ（AI） | エージェント活用 | `AI-Development` / `AI-Glossary` |
| ナレッジページ（IT 基礎） | 技術領域の知識 | `Authentication-Authorization` / `GraphQL` / `Encryption` / `Observability` |

- **ルールの正本はリポジトリ側**（この AGENTS.md / `CONTRIBUTING.md` / `.github/`）。Wiki はそれを解説する側で、**手順やルールをコピーしない**。要点＋リンクにする。
- スタックページの一覧表には**「なぜ」列を必ず置く**。1 行で書ききれない内容は Discussion に寄せる。
- **理由を推測で埋めない。** 記録が無いものは `理由未記録` と書き、`Tech-Decisions` ページに積んで後追いで Discussion を立てる。
- ナレッジページは**一般論と本プロジェクトでの適用を節で分ける**。未適用・未達は隠さずそう書く。
- Wiki はコードと別リポジトリで **PR レビューを通らない**ため、**更新を DoD の一項目として扱う**。技術の追加・削除・入れ替えを伴う PR をマージしたら、同じ Issue の中で Wiki を更新する。
- **Wiki に長い解説を書かない**。1 技術あたり数行に収め、掘り下げる内容は `docs/` に置いてリンクする。
- 手元では `make wiki-sync` で `.wiki/`（Git 管理外）に clone / pull し、`make wiki-push m="<コミットメッセージ>"` で反映する。
- Wiki のコミットメッセージも下記の規約に従い、scope は `wiki` にする（例: `docs(wiki): 状態管理に Zustand を追加 #14`）。

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従い、**末尾に対応する Issue 番号**を付けます。

```text
<type>(<scope>): <説明> #<Issue番号>
```

### ルール

- 説明は**日本語**。体言止めまたは「〜を追加 / 修正 / 削除」の形にし、末尾に句点を付けない。
- 1 コミット = 1 つの論理的変更。無関係な変更を混ぜない。
- Issue 番号は必須。どの Issue にも紐づかない例外的な変更のみ省略できる。
- 詳しい説明が必要なら本文（1 行空けて記述）に書く。
- 破壊的変更は type の後ろに `!` を付け、本文に `BREAKING CHANGE:` を書く。

### type

| type | 用途 |
| :- | :- |
| `feat` | 機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | 挙動に影響しない整形（Biome の整形など） |
| `refactor` | 挙動を変えないリファクタリング |
| `perf` | パフォーマンス改善 |
| `test` | テストの追加・修正 |
| `build` | ビルド・依存関係の変更（pnpm, Turborepo など） |
| `ci` | CI 設定の変更（GitHub Actions など） |
| `chore` | 上記以外の雑務（設定ファイル、ツール導入など） |
| `revert` | コミットの取り消し |

### scope

変更対象を表す短い識別子。モノレポのパッケージ名かトップレベルディレクトリ名を基本とします。

`api` / `web` / `mobile` / `desktop` / `graphql` / `hasura` / `infra` / `docs` / `wiki` / `vscode` / `make` / `mise` / `deps` / `claude`

`wiki` は Wiki リポジトリ側のコミットで使います（本リポジトリでは使いません）。

複数箇所にまたがり適切な scope が選べない場合は省略できます（例: `chore: pnpm を 10 系へ更新 #9`）。

### Issue のクローズ

Issue を自動でクローズしたい場合は、PR 本文の「関連」セクションに `Closes #2` と書きます。

## ブランチと PR（Stacked PRs）

本リポジトリは GitHub の **Stacked PRs**（`gh stack`）で開発します。
`git checkout -b` / `git push` / `gh pr create` を直接使わず、**ブランチ操作はすべて `gh stack` 経由**で行ってください。
コマンドの詳細は [.github/guides/STACKED_PRS.md](./.github/guides/STACKED_PRS.md) を参照してください。

### 基本原則

- **1 Issue = 1 層 = 1 PR**。層をまたぐ変更を 1 コミットに混ぜない。
- 変更が 2 つ以上のレイヤーに及ぶなら、**最初から層に分ける**。1 本の大きなブランチにしない。
- 1 PR は「レビュアーが 15 分で読み切れる」サイズに収める。
- 層の積み順は依存の下流ほど上（`hasura` → `packages/graphql` → `apps/api` → `apps/web` `apps/mobile` `apps/desktop` → `infra`）。
- スタックは直線のみ。分岐させたい場合は別スタックにする。

### 作業開始時

1. `gh stack view --short` で既存スタックの有無を確認する。
   - スタック内にいるなら、その続きとして層を積むか判断する。
   - `main` にいて新規テーマなら `gh stack init` から始める。
2. `Todo` かつ実施期間が設定されている Issue から着手するものを決め、Board の `Status` を `In Progress` にする。
   （`Backlog` にある場合は、先に `Todo` へ移して実施期間を設定する）
3. ブランチ名は `<type>/<Issue番号>-<短い英語の説明>`（例: `feat/1-memo-usecase`）。

```bash
gh stack view --short                   # 現在地の確認
gh stack init feat/1-memo-usecase       # 1 層目を main から作成
```

### 層を積む

**最上段でのみ** `add` できます。上段にいるか不明なら先に `gh stack top` します。

### 下の層を修正する（レビュー対応・不具合修正）

**上の層で直さない**こと。必ずその層まで降りて修正し、上へ波及させます。

### レビュー

レビューは `/code-review` で行います。観点・プレフィックス・出さない指摘は
[CONTRIBUTING.md](./.github/CONTRIBUTING.md) の「コードレビュー」が正本です。

- **出力する指摘には必ずプレフィックス**（`MUST` / `IMO` / `NITS` / `Q` / `FYI` / `GOOD`）を付ける。
- 見るのは**その層の差分だけ**。スコープ外の既存コードは `FYI` で別 Issue を提案する。
- 断定できないものは `MUST` にせず `Q` にする。憶測で必須修正を要求しない。
- 振る舞いに関する指摘は `ファイル:行` を根拠として引用する。命名からの推測で指摘しない。

### PR の作成と同期

- PR タイトルはコミットメッセージと同じ規約（`<type>(<scope>): <説明> #<Issue番号>`）に揃える。
- PR 本文は [.github/pull_request_template.md](./.github/pull_request_template.md) に従い、「関連」に `Closes #<番号>` を書く。
- スタックの構造は GitHub が自動表示するため、PR 本文に書かない。

### マージ

マージ方式は **`--merge`（マージコミット）に統一**します。`main` のコミット列は「AI の出力を人間が承認した記録」であり、
承認の単位（＝どこまでが一度に承認された塊か）を履歴に残すためです（[Discussion #32](https://github.com/Hitamuki/study-web-modern-stack/discussions/32)）。

**2 層以上**のスタックは `gh stack merge` でまとめてマージします。

```bash
gh stack merge --merge   # 下から順に all-or-nothing でマージ
gh stack sync --prune    # マージ後の後片付け
```

**1 層だけ**のスタックは GitHub 上に stack が作られず `gh stack merge` が使えないため、`gh pr merge` を使います。

```bash
gh pr merge <PR番号> --merge
git remote prune origin
```

- マージ方式は `--merge` に揃える。`--squash` / `--rebase` は使わない。PR のサイズで方式を変えない。
- 履歴は PR 単位なら `git log --first-parent`、コミット単位なら素の `git log` で読む。
- PR 単位で巻き戻すときは `git revert -m 1 <マージコミット>` を使う。
- 2 層以上のスタックで `gh pr merge` や GitHub の Merge ボタンを使わない。整合性が崩れる。
- マージ後は対応する Issue の **AC / DoD をチェックし、「まとめ」を記入してから** `Status` を `Done` にする（「完了時の手順」を参照）。実施期間が予定とずれていたら実績に合わせて直す。

## コーディング規約

- コメント・ドキュメント・Issue・PR は日本語で書く。識別子は英語。
- 既存ファイルを編集するときは、周囲のコードのスタイル・命名・コメント量に合わせる。

## 領域別の詳細ルール

領域固有の規約は `.claude/rules/` 配下に置き、このファイルから読み込みます。

@.claude/rules/design/pencil.md
