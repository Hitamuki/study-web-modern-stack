# Stacked PRs 運用ガイド

大きな変更を「小さく積み重ねたプルリクエスト（スタック）」に分割して、レビューしやすくするための運用ガイドです。
本リポジトリでは GitHub 公式の CLI 拡張 [`gh stack`](https://github.com/github/gh-stack) を使います。

## Stacked PRs とは

通常のブランチ運用では、すべての変更を 1 本のブランチにまとめて 1 つの巨大な PR を出しがちです。
Stacked PRs では、**前のブランチを親（ベースブランチ）にした子ブランチ**を積み上げ、それぞれを独立した PR にします。

```text
main (trunk)
 └── db-schema    → PR #1 (base: main)        ← bottom（trunk に近い側）
  └── api         → PR #2 (base: db-schema)
   └── web        → PR #3 (base: api)         ← top
```

`gh stack submit` を実行すると、各 PR が作られるだけでなく、GitHub 上でそれらが 1 つの **Stack** として紐付きます。
PR 画面にスタック全体が表示され、レビュアーは階層を行き来しながら「その層の差分だけ」を見られます。

用語として、trunk（`main`）に近い側が **bottom**、遠い側が **top** です。
`gh stack up` は trunk から遠ざかる方向、`down` は近づく方向に移動します。

### メリット

- レビュー単位が小さくなり、レビューが早く・正確になる
- 前段の PR のレビュー待ち中に、次の作業を止めずに進められる
- 「スキーマ」「API」「UI」のようにレイヤーごとの意図が履歴に残る

### 制約

- **スタックは直線のみ**。1 つの親に複数の子をぶら下げる分岐構造は作れません（分けたいときは別スタックにします）
- **2 層以上のスタックで `gh pr merge` は使えません**。まとめて `gh stack merge` でマージします（1 層だけのスタックは GitHub 上に stack が作られないため `gh pr merge` を使います）
- スタックのメタデータは `.git/gh-stack`（JSON）に保存されます。リポジトリにはコミットされないローカル情報です

## セットアップ

### 1. gh 拡張とスキルの導入

```bash
make stack-setup
```

以下の 2 つが入ります。

- `gh stack` 拡張本体（`gh extension install github/gh-stack`）
- エージェント向けスキル `.claude/skills/gh-stack/`（Claude Code などが `gh stack` の使い方を理解するためのもの。リポジトリにはコミットしないローカル環境用なので、クローンごとに実行が必要です）

`gh` 自体が未認証の場合は先に認証します。

```bash
gh auth status || gh auth login
```

### 2. git の事前設定

対話プロンプトを避けるため、以下を設定しておきます。

```bash
# コンフリクト解決を記憶させる（rebase のたびに解き直さなくて済む）
git config rerere.enabled true

# リモートが複数ある場合のみ必要
git config remote.pushDefault origin
```

### 3. コマンドを短くする（任意）

```bash
gh stack alias      # 以降 `gs view` などで呼べるようになる
```

## 基本の流れ

### 1. スタックを開始する

trunk（`main`）を土台に、1 層目のブランチを作成してチェックアウトします。

```bash
gh stack init db-schema
```

最初から全レイヤーのブランチ名が決まっているなら、まとめて作れます。

```bash
gh stack init db-schema api web
```

### 2. コミットする

通常どおり `git add` / `git commit` を使います。
「どの変更をどの層に入れるか」を自分で制御できるので、`-Am` のショートカットよりこちらを推奨します。

```bash
git add hasura/migrations
git commit -m "memos テーブルのマイグレーションを追加"
```

### 3. 次の層を積む

現在のブランチを親にして、新しいブランチを作成・チェックアウトします（**スタックの最上段でのみ実行可**）。

```bash
gh stack add api
git add apps/api/src
git commit -m "メモ登録ユースケースを実装"
```

### 4. スタックの状態を見る

```bash
gh stack view            # 対話 TUI
gh stack view --short    # ブランチ名だけ
gh stack view --json     # スクリプト・エージェント用
```

移動はブランチ名を覚えなくても行えます。

```bash
gh stack up       # 1つ上（trunk から遠ざかる）
gh stack down     # 1つ下（trunk に近づく）
gh stack top      # 最上段へ
gh stack bottom   # 最下段へ
gh stack trunk    # main へ
gh stack switch   # 対話的に選択
```

### 5. PR を作成する

全ブランチを push し、PR を作って GitHub 上で Stack として紐付けます。

```bash
gh stack submit
```

対話エディタが開き、各 PR のタイトル・本文・draft/ready をまとめて編集できます（`Ctrl+S` で送信）。
対話を挟まずに済ませたい場合は次のとおりです（タイトルは自動生成、既定で draft）。

```bash
gh stack submit --auto          # draft で作成
gh stack submit --auto --open   # ready for review で作成
```

### 6. 下の層を直す（レビュー対応）

上の層で作業中に下の層の修正が必要になったら、**その層まで降りて直します**。
上の層で直すと、変更が間違った PR に入ってしまいます。

```bash
gh stack down                      # 直したい層へ移動
git add apps/api/src
git commit -m "バリデーションを修正"
gh stack rebase --upstack          # 上の層すべてに変更を波及させる
gh stack push                      # 更新をリモートへ
gh stack top                       # 元の作業層へ戻る
```

### 7. main の変更を取り込む

fetch → trunk の fast-forward → 全ブランチの rebase → push → PR 状態の同期までを 1 コマンドで行います。

```bash
gh stack sync

gh stack sync --prune   # マージ済み PR のローカルブランチも削除する
```

コンフリクトが起きた場合、`sync` は**全ブランチを元の状態に戻して**終了します（終了コード 3）。
その場合は `rebase` で個別に解決します。

```bash
gh stack rebase
# コンフリクトを解決して git add したあと
gh stack rebase --continue
# やり直したい場合
gh stack rebase --abort
```

### 8. マージする

スタックは下から順に、**all-or-nothing** でまとめてマージされます（1 つでも失敗すれば全部マージされません）。

```bash
gh stack merge --merge         # 対話ウィザードでマージ範囲を選ぶ（方式は --merge で固定）
gh stack merge 42 --merge      # PR #42 までをマージ
gh stack merge --yes --merge   # 確認なしで全部をマージコミットでマージ
```

> 2 層以上のスタックでは、`gh pr merge` や GitHub 画面の Merge ボタンによる個別マージを使わないでください。スタックの整合性が崩れます。

1 層だけのスタックは GitHub 上に stack が作られず、`gh stack merge` が `this stack has not been submitted to GitHub yet` で失敗します。この場合は `gh pr merge` を使います。

```bash
gh pr merge <PR番号> --merge   # 単層のときのみ
git remote prune origin
```

マージ方式は **`--merge`（マージコミット）に統一**します。`--squash` / `--rebase` は使わず、PR のサイズで方式を変えません。
承認の単位を履歴に残すためで、理由は [Discussion #32](https://github.com/Hitamuki/study-web-modern-stack/discussions/32) にあります。

- PR 単位で履歴を読む: `git log --first-parent --oneline`
- コミット単位で読む: `git log --oneline`
- PR 単位で巻き戻す: `git revert -m 1 <マージコミット>`

リモートブランチはリポジトリ設定（`deleteBranchOnMerge`）でマージ時に自動削除されるため、`--delete-branch` は不要です。
マージ後は `gh stack sync --prune` でローカルを掃除します。

## コマンド早見表

| コマンド | 内容 |
| :- | :- |
| `gh stack init <名...>` | スタックを開始（既存ブランチの取り込みも可） |
| `gh stack add <名>` | 最上段に新しい層を積む |
| `gh stack view` | スタックの状態を表示（`--short` / `--json`） |
| `gh stack up` / `down` / `top` / `bottom` / `trunk` | 層の移動 |
| `gh stack switch` | 対話的にブランチを選んで移動 |
| `gh stack push` | 全ブランチを push（PR は作らない） |
| `gh stack submit` | push + PR 作成 + GitHub 上で Stack 化 |
| `gh stack sync` | fetch → rebase → push → PR 同期（`--prune` で掃除） |
| `gh stack rebase` | 明示的な rebase（`--upstack` / `--downstack` / `--continue` / `--abort`） |
| `gh stack merge --merge` | スタックをまとめてマージ（2 層以上） |
| `gh pr merge <番号> --merge` | 1 層だけのスタックのマージ |
| `gh stack checkout <番号\|ブランチ>` | スタック番号・PR 番号・ブランチ名で切り替え |
| `gh stack modify` | 対話的にスタックを再構成 |
| `gh stack unstack` | Stack の紐付けを解除（PR やブランチは消えない） |

`make stack-setup` は環境構築専用です。日々の操作は上記の `gh stack` を直接使ってください。

## よくある操作

### 途中の層を消す・並べ替える・リネームする

`unstack` で一度ばらしてから、`init` で組み直します（PR は削除されません）。

```bash
gh stack unstack
git branch -m 古い名前 新しい名前
gh stack init --base main 層1 層2 層3
```

対話的に済ませたい場合は `gh stack modify` が使えます。

### 他人のスタックをレビュー用に取得する

```bash
gh stack checkout 42     # PR 番号
gh stack checkout 7      # スタック番号（GitHub の Stack UI に出る番号）
gh stack checkout        # 対話ピッカー（ローカル・リモート両方から選べる）
```

### 他ツールで作ったブランチを Stack にする

ローカルのブランチ管理は別ツール（jj、Sapling、git-town など）で行い、GitHub 上の Stack 化だけ任せることもできます。

```bash
gh stack link db-schema api web
```

## 分割の粒度の目安

本リポジトリのようなモノレポでは、次の軸で分割するとスタックが自然に組み立てられます。
依存の下流ほど上の層に置くのが原則です。

1. `hasura/` — テーブル定義・マイグレーション
2. `packages/graphql/` — スキーマ・GraphQL Codegen
3. `apps/api/` — NestJS のドメイン／ユースケース実装
4. `apps/web/` `apps/mobile/` `apps/desktop/` — 各クライアントの画面実装
5. `infra/` — Terraform のリソース追加（[#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) で削除済み。[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) で作り直す）

1 PR が「レビュアーが 15 分以内に読み切れる」サイズに収まるかを目安にしてください。

## トラブルシューティング

`gh stack` は終了コードで状況を返します。よく出るものは以下のとおりです。

| コード | 意味 | 対処 |
| :- | :- | :- |
| 2 | スタックに入っていない | `gh stack init` で作成する |
| 3 | rebase コンフリクト | 解決 → `git add` → `gh stack rebase --continue` |
| 5 | 引数が不正 | 最上段以外で `add` した場合など。`gh stack top` してから再実行 |
| 7 | rebase が進行中 | `gh stack rebase --continue` か `--abort` |
| 9 | Stacked PRs が使えない | リポジトリで Stacked PRs が有効になっていない |

## 参考リンク

- [GitHub Docs — About stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)
- [GitHub Docs — Stacked PRs CLI commands](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands)
- [GitHub Docs — Optimizing CI for stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests)
- [github/gh-stack リポジトリ](https://github.com/github/gh-stack)
