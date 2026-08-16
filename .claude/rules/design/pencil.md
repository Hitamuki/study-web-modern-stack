---
path: design
description: Pencil（.pen）で UI デザインを作る
model: claude-opus-5
thinking: high
autoLoad: true
---

# デザインルール（Pencil / .pen）

## 概要

Pencil で UI デザインを作るときの規約

## 前提

| 項目 | 決定 |
| :- | :- |
| ツール | Pencil（`mcp__pencil__*` ツール経由のみ） |
| ファイル | **`design/app.pen` の 1 枚に集約**（画面でもプラットフォームでも分けない） |
| 先行対象 | `apps/web` の PC 版・スマホ版 |
| 画面 ID | `SCR-xxx`（3 桁連番） |

## ファイル

- **`.pen` は `design/app.pen` の 1 枚だけ。** 画面ごとにもプラットフォームごとにも分けない。デザイントークンと共通コンポーネントを 1 ファイル内で共有し、画面間・プラットフォーム間の一貫性を検証できる状態を保つため。
- 画面は 1 ファイル内の**トップレベルフレーム**として並べる。`apps/web` / `apps/mobile` / `apps/desktop` の画面もすべてこのファイルに入れ、ID の接頭辞（`SCR-` / `MOB-` / `DSK-`）で区別する。
- 置き場所は **`design/app.pen`**。`.pen` を他のディレクトリに置かない。ファイルを増やさない。
- テキストの設計ドキュメント（`docs/screen-list.md` など）は `docs/` に置く。`.pen` と Markdown を混在させない。
- **`.pen` を `Read` / `Grep` / `cat` しない。** 参照・編集は必ず MCP ツール経由。手で書き換えるとエディタが保持している状態と食い違って壊れる。
- `.pen` がエディタで開かれていないと MCP ツールは全て失敗する。エラー時はまず開いているかを確認する。

### 将来の分割

分割は既定の方針ではない。次のいずれかに当てはまったときに、**Discussion を立ててから**判断する。

- プラットフォーム間で共通コンポーネントとトークンの共有が実質なくなった
- 1 ファイルが重くなり `execute` / `TakeScreenshot` の操作性が落ちた
- プラットフォーム別に同時並行で編集したくなった（`.pen` はマージ不可のため）

分割する場合も `design/<プラットフォーム>.pen`（`web.pen` / `mobile.pen` / `desktop.pen`）までとし、**画面ごとには分けない**。ID 空間は分割後も全体で一意に保つ。

## 画面 ID

- 形式は `SCR-` + 3 桁ゼロ埋めの連番（例: `SCR-001`）。
- **採番の正本は `docs/screen-list.md`。** `.pen` 側で勝手に増やさない。
- 廃止した ID は再利用しない。欠番のまま残す。
- PC 版と SP 版は同一画面なので **ID を共有**する。区別はフレーム名のサフィックスで行う。

## フレーム名

```text
SCR-<番号>-<PC|SP> <画面名>
```

例: `SCR-001-PC メモ一覧` / `SCR-001-SP メモ一覧`

- 機械可読な契約は `^SCR-\d{3}-(PC|SP) ` の前方一致部分**のみ**。日本語の画面名は表示用で、リネームしても追跡が壊れないようにする。
- `Export`（`html-tailwind` / `html-css`）は `data-layer-name` にこの名前を出力するため、デザイン → HTML → 実装まで ID が貫通する。
- **ノード ID（Pencil の自動採番）を設計書に書かない。** ノードを作り直すと変わるため、対応表の主キーには使えない。

## ビューポート

| 版 | 幅 | 対応 |
| :- | :- | :- |
| PC | 1440px | デスクトップ（想定下限 1280px） |
| SP | 390px | モバイル |

- この 2 版だけを作る。タブレットの中間幅は当面作らない（必要になったら ID 体系を変えずに `-TB` を追加する）。
- `apps/mobile` / `apps/desktop` の画面は Web が固まってから着手する。**同じ `app.pen` に追加**し、ID は `MOB-` / `DSK-` の接頭辞で分ける。

## キャンバス配置

1 ファイルに全画面が入るため、配置の規律で読みやすさを保つ。

- 共通要素は `CMP/<名前>`（例: `CMP/ボタン（主）`）として**キャンバス上部**にまとめる。画面フレームと混ぜない。
- 画面はその下に置く。1 画面 = 1 行で、左に PC、右に SP を並べる。
- 行の並びは ID の昇順。プラットフォームや機能ドメインごとにセクションを分ける。
- 新しい画面は `FindEmptySpace` で空き領域を取ってから置く。既存フレームに重ねない。
- 画面フレームには `clip: true` を付ける。

## デザイントークン

- 色・フォント・数値は `SetVariables` で変数化し、`$name` で参照する。ノードに色を直接書かない。
- 変数を追加するときは先に `Print(GetVariables())` で既存を確認する。`SetVariables` は既定でマージだが、既存の定義を上書きしないよう名前を確認する。
- 定義済みの変数は `docs/screen-list.md` に一覧を載せる。

### 実装への反映（`apps/web`）

CSS 手法は **Tailwind CSS v4 + shadcn/ui** に決着した（[Discussion #47](https://github.com/Hitamuki/study-web-modern-stack/discussions/47) / Issue #61）。
`.pen` の変数は `apps/web/src/app/styles.css` に `--pen-*` として 1:1 で写し、`@theme inline` で Tailwind のユーティリティ名へ割り当てる。

- **実装側に色・寸法を直接書かない。** 必ず `--pen-*` を経由させる。`@theme inline` を使っているため、生成される CSS は `.bg-card{background-color:var(--pen-surface)}` のように `.pen` のトークンを直接参照する。
- `.pen` のトークンを変えたら `styles.css` の `--pen-*` も同じ PR で直す。
- `Export`（`html-tailwind` / `html-css`）の出力は**実装へ流し込まない**。トークンが 16 進値に解決され、要素も `<div>` のみでセマンティクスを持たないため、寸法と色を読み取る参考資料として扱う。

## 設計書とのマッピング

対応表の正本は `docs/screen-list.md`。

| 画面ID | 画面名 | フレーム | 関連 Issue | 実装 |
| :- | :- | :- | :- | :- |
| SCR-001 | メモ一覧 | `SCR-001-PC` / `SCR-001-SP` | #42 | `apps/web/src/pages/memo-list/` |

- 画面 ID から `Get` の visitor でフレーム名を前方一致検索し、`TakeScreenshot` / `Export` に渡せる。設計書からの画像生成はこの経路で自動化する。
- 逆方向（実装 → 設計書）は `data-layer-name` を辿る。

## 変更フロー

- **1 Issue = 1 デザイン変更。** `.pen` は 1 枚しかなく、テキストマージもできない。**`app.pen` を触る PR を同時に 2 本走らせない。** Stacked PRs では `.pen` を触る層を 1 つに限定する。
- 作業前に最新の `main` を取り込む。コンフリクトすると「片方を捨てる」以外の解決手段がない。
- PR には `Export`（PNG）で書き出した該当フレームの画像を貼る。差分レビューの代替とする。
- 画面の追加・削除・ID 変更を伴う変更は、`docs/screen-list.md` を**同一 PR で**更新する。DoD の一項目として扱う。

## エージェントの作業手順

1. `get_app_state({ include_schema: true, include_canvas_design: true, include_scripts_and_shaders: false })` でスキーマを取得する（未取得なら必須）
2. 必要なガイド / スタイルを `get_guidelines` で読む
3. `execute` で編集する。**`execute` 間で変数は引き継がれない**ので、前の呼び出しの応答に出るノード ID を直接書く
4. `execute` が失敗したら、スニペットを送り直さず `editId` + `edits` で修正する
5. セクション単位で `TakeScreenshot` で検証する（毎回撮らない。トークンを消費する）
6. 書き出しは `Export`（画像 / HTML）

**同一 `execute` の末尾で撮ったスクリーンショットや `ctx.problems` は、レイアウト確定前の値が返ることがある。** 白紙の画像や身に覚えのないクリップ警告が出たら、作り直す前に次の呼び出しで読み直して確認する。

## 未決定（着手前に決着させる）

- **ノードのカスタムメタデータ**: スキーマ上 `metadata?: { type: string; [key: string]: any }` を持てることは確認済み。フレーム名より堅い形で画面 ID を保持できるが、HTML に出るのは `data-layer-name` / `data-layer-id` なので実装への貫通は名前経由が必要。二重管理になるため採用は保留。
