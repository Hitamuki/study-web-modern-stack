---
type: Task
title: 層 2 — AWS 向け Terraform の削除
description: 行き先を失った infra/ を消し、README と Wiki の AWS 前提を落とす。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/99
tags: [deploy, infra, terraform, 削除, 層2]
status: draft
stale_after: 2026-10-05
generated: { by: claude-code/claude-opus-5, at: 2026-09-05T00:00:00Z }
---

# 位置づけ

**段階 1（現状の構成を削除）の 2 つめ。** 新しいものを足す前に、行き先を失ったものを消す。

Issue: [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99)（`chore` / `infra`）
ブランチ: `chore/99-remove-aws-terraform`（`main` から）
前提: なし。**Discussion #29 の決着を待たない**

# なぜ消すのか

**AWS を使う予定が無くなったため**である（2026-09-05 の判断）。

`infra/main.tf` は VPC / Subnet / IGW / Route Table / SG / **RDS** を定義しているが、
これは Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) が
「RDS を常時起動すると費用が発生するため常設に向かない」として**避けようとしている当のもの**である。

→ 詳細は [findings.md](/project/plan/deploy/findings.md) の 7。

## 残すのではなく消す理由

「学習成果だから残す」という判断もありえたが、採らない。

| 理由 | 内容 |
| :- | :- |
| **誤読を生む** | `infra/` があると「ここを直せばデプロイできる」と読める。実際には 1 資源も使わない |
| **保守コストが付く** | provider のバージョン更新、`tflint` の指摘、CI に足すかの判断が毎回発生する |
| **履歴に残る** | 消しても Git には残る。学習の記録は失われない |
| **戻ってくる** | Terraform 自体は段階 3 で再導入する。**消すのは AWS 向けのコードだけ** |

> [!IMPORTANT]
> **これは「Terraform をやめる」変更ではない。**
> 段階 3 で、#29 で決まった無料枠プラットフォーム向けに `infra/` を作り直す。
> → [terraform-scope.md](/project/plan/deploy/terraform-scope.md)

# やること

| 対象 | 内容 |
| :- | :- |
| `infra/` | **ディレクトリごと削除**（`main.tf` / `main.tftest.hcl` / `README.md` / `.terraform-docs.yml` / `.terraform.lock.hcl`） |
| `mise.toml` | `terraform` / `tflint` / `terraform-docs` を外す。**使わないツールを入れ続けない** |
| `README.md` | 【技術スタック】の「インフラ: AWS / Terraform」と、**【成功の定義】5「AWS でサービスが稼働すること」** |
| `.gitignore` | Terraform 関連の除外（`*.tfstate` など）を残すか判断する。**段階 3 で戻るので残してよい** |
| Wiki [Infra](https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra) | AWS 前提の記述と「本番前に直す設定」の節を落とす |

## README の成功条件 5 をどう書き換えるか

[findings.md](/project/plan/deploy/findings.md) の 7 で整理したとおり、
README で Terraform に関わるのは 2 項目で、**衝突しているのは 5 だけ**である。

| # | 現在 | 変更後 |
| :- | :- | :- |
| 2 | Terraform で `plan` が通り、`test` が成功すること | **段階 3 まで満たせない。** 表現を保留するか、段階 3 の完了条件として残す |
| 5 | **AWS でサービスが稼働すること** | **無料枠のサービスで常設稼働すること** |

【目的】の「Terraform のローカル品質管理（fmt, lint, plan, test）を実践する」は
**段階 3 で復活する**ので消さない。

> [!NOTE]
> **一時的に成功条件 2 が満たせなくなる。** `infra/` が無い間は `plan` する対象が無いためである。
> これは想定どおりの中間状態で、段階 3 で解消する。Issue の「まとめ」に明記する。

# 確認すること

- `make check` が通る
- `make install` / `mise install` がエラーなく完了する（外したツールを参照していない）
- リポジトリ内に `infra/` への**リンク切れが無い**（`docs/context-map.md` / `.github/` / `memo.md` を確認）

## リンクを直す対象

`infra` に言及しているファイルは削除前に洗い出す。

```bash
grep -rn "infra/" --include="*.md" --include="*.yml" --include="Makefile" . | grep -v node_modules | grep -v "^./.wiki/"
```

**`project/plan/deploy/` 配下の言及は消さない。** この計画自体が
「なぜ消したか」「いつ戻すか」の記録であり、`infra/` が無い状態を前提に書かれている。

# 注意

**この層だけ `main` に入っても壊れない。** `infra/` は一度も `apply` されておらず、
アプリの動作にも `make` のどのターゲットにも関与していない。
