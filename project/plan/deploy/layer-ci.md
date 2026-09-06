---
type: Task
title: 層 4 — CI の土台
description: .github/workflows がまだ無い。まず make check を CI で回す。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/88
tags: [deploy, ci, github-actions, 層4]
status: deprecated
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

> [!NOTE]
> **この層は完了しました**（#88 / 2026-09-06）。**計画としての役目は終わっています。**
> 実際に何を決め、何を反映したかは #88 の「まとめ」が正本です。
> 以下は着手前に書いた計画で、実装と食い違う箇所がありえます。消さずに残しています。

# 位置づけ

**デプロイ自動化の土台。** デプロイは「ビルドして送る」処理なので、CI が無ければ自動化も無い。

Issue: **未起票**（`ci`）
ブランチ: `ci/NN-check-workflow`（層 3 の上）
前提: なし。**Discussion #29 の決着を待たない**

# 現状

```console
$ ls .github/workflows
No such file or directory
```

**ディレクトリごと無い。** `make check`（format-check / lint / test）はローカルでしか回っていない。
Wiki [Infra](https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra) の一覧でも CI は「（未導入）」。

# やること

**この層ではデプロイしない。** 品質ゲートだけを入れる。
デプロイの workflow は段階 3（[phase-3.md](/project/plan/deploy/phase-3.md)）で足す。

| 対象 | 内容 |
| :- | :- |
| `.github/workflows/check.yml` | PR と `main` への push で `make check` |
| ツールの導入 | `mise` で揃える（`mise.toml` が正本。Node / pnpm のバージョンを CI で二重管理しない） |
| キャッシュ | pnpm store と Turborepo のキャッシュ |
| Terraform | **この層では足さない。** 層 2 で `infra/` を削除するため、検証する対象が無い |

**Terraform の検証はこの層に入れない。** 層 2（[layer-remove-terraform.md](/project/plan/deploy/layer-remove-terraform.md)）で
`infra/` を削除するため、この層が動く時点で `terraform` コマンドを向ける先が無いためである。

README の【目的】「Terraform のローカル品質管理（fmt, lint, plan, test）」は、
段階 3 で `infra/` を作り直すときに CI へ足す（→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md)）。

# 確認すること

- PR を出すと workflow が走り、`make check` の失敗が PR 上で赤くなる
- ローカルの `make check` と CI で結果が一致する

# 注意: `make check` はテストを 1 件も実行していない

**`main` で `make check` は通る**（確認日 2026-08-24）。ただし内訳を見ると、
**`turbo run test` が 0 タスクである。**

```console
$ make check
...
pnpm exec turbo run test
No tasks were executed as part of this run.
 Tasks:    0 successful, 0 total
```

`turbo.json` に `test` タスクは定義されているが、
**`test` スクリプトを持つパッケージが 1 つも無い**（ルートの `turbo test` を除く 5 パッケージすべて）。

| パッケージ | `test` スクリプト |
| :- | :- |
| `@memo-app/api` / `@memo-app/web` / `@memo-app/mobile` / `desktop` / `@repo/graphql` | **無し** |

つまり **`make check` が担保しているのは整形と lint だけ**である。
DoD で `make check` を通しても、**振る舞いの回帰は 1 つも検出されない。**

これはこの層の対象外だが、**デプロイの自動化を入れる前に認識しておく必要がある。**
「CI が緑だから安全」と読めてしまうためである。
README の「Vitest による単体テストコードの実装」は未着手のまま
（【最終統合】および【おまけ】の「Vitest で TDD」）。

→ **テストの導入は別 Issue にする。** この計画のスコープには入れない。
