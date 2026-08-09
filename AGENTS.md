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
2. **DoD のチェックボックスを埋める。** コマンド（`mise run lint` など）は実行して結果を確認する。
3. **満たせなかった項目はチェックしない。** `- [ ]` のまま残し、行末に理由を書く（例: `（@memo-app/api の既存エラーで失敗。本 Issue の対象外）`）。満たせない項目があるまま閉じてよいが、無言で閉じない。
4. **「まとめ」を記入する。**

「まとめ」はここが後から読み返す唯一の記録になります。
書くのは「やったこと」の羅列ではなく、**決定した内容とその理由、実際に反映した成果物**です。

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

`api` / `web` / `mobile` / `desktop` / `graphql` / `hasura` / `infra` / `docs` / `vscode` / `mise` / `deps` / `claude`

複数箇所にまたがり適切な scope が選べない場合は省略できます（例: `chore: pnpm を 10 系へ更新 #9`）。

### Issue のクローズ

Issue を自動でクローズしたい場合は、PR 本文の「関連」セクションに `Closes #2` と書きます。

## ブランチと PR（Stacked PRs）

本リポジトリは GitHub の **Stacked PRs**（`gh stack`）で開発します。
`git checkout -b` / `git push` / `gh pr create` を直接使わず、**ブランチ操作はすべて `gh stack` 経由**で行ってください。
コマンドの詳細は [.github/STACKED_PRS.md](./.github/STACKED_PRS.md) を参照してください。

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

### PR の作成と同期

- PR タイトルはコミットメッセージと同じ規約（`<type>(<scope>): <説明> #<Issue番号>`）に揃える。
- PR 本文は [.github/pull_request_template.md](./.github/pull_request_template.md) に従い、「関連」に `Closes #<番号>` を書く。
- スタックの構造は GitHub が自動表示するため、PR 本文に書かない。

### マージ

**2 層以上**のスタックは `gh stack merge` でまとめてマージします。

```bash
gh stack merge          # 下から順に all-or-nothing でマージ
gh stack sync --prune   # マージ後の後片付け
```

**1 層だけ**のスタックは GitHub 上に stack が作られず `gh stack merge` が使えないため、`gh pr merge` を使います。

```bash
gh pr merge <PR番号> --rebase --delete-branch
git remote prune origin
```

- 履歴を直線に保つため、マージ方式は `--rebase` に揃える。
- 2 層以上のスタックで `gh pr merge` や GitHub の Merge ボタンを使わない。整合性が崩れる。
- マージ後は対応する Issue の **AC / DoD をチェックし、「まとめ」を記入してから** `Status` を `Done` にする（「完了時の手順」を参照）。実施期間が予定とずれていたら実績に合わせて直す。

## コーディング規約

- コメント・ドキュメント・Issue・PR は日本語で書く。識別子は英語。
- 既存ファイルを編集するときは、周囲のコードのスタイル・命名・コメント量に合わせる。
