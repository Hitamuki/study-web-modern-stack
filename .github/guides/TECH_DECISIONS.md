# 技術選定ガイド（GitHub Discussions）

複数の候補から技術を選ぶときの進め方です。結論だけをコミットに残さず、
**「なぜ他を選ばなかったか」を後から人間が読める形で残す**ことを目的にしています。

証跡は GitHub Discussions のカテゴリ `Tech Decisions` に置きます。

## 対象にするもの

乗り換えコストが高いものだけを対象にします。すべての依存追加で Discussion を立てません。

| 立てる | 立てない |
| :- | :- |
| フレームワーク・ランタイム（React / NestJS など） | 単発の devDependency |
| データアクセス・スキーマ基盤（Hasura / ORM など） | 明確な代替がないユーティリティ |
| 状態管理・データ取得・UI 基盤 | 破壊的変更を伴わないバージョン更新 |
| 認証・課金などの外部サービス依存 | 既存の選定の枠内での追加 |
| CI / IaC / モノレポ基盤 | |

判断に迷う場合は立てます。立てない場合は、採用理由を Issue 本文か PR に 1 行残します。

## 原則

- **1 選定 = 1 Discussion**。タイトルは `<領域>: <決めること>`（例: `apps/web: 状態管理ライブラリの選定`）。
- 本文には**必ず比較表**を入れる。**評価軸を先に決めてから**候補を並べる。候補を後から足しても表が崩れないようにする。
- 却下した候補も消さずに残す。「検討したが採らなかった」ことが記録の価値になる。
- 結論は**コメントとして投稿し、Answer にマークする**。本文を書き換えて結論だけ残さない（経緯が消える）。
- 決定後に方針を変える場合は、元の Discussion にコメントで追記したうえで**新しい Discussion を立て、相互にリンクする**。決定を上書きしない。
- 選定を伴う Issue は、**DoR に「Discussion #\<番号\> が決着している」を入れる**。着手前に決着させる。
- 議論が Issue のコメントで始まってしまったら、Discussion に移して Issue からリンクする。

## 流れ

```text
選定が必要になった
  → Discussion を起票（背景 / 評価軸 / 候補の比較表）
  → 比較・検証（必要なら PoC のブランチや計測結果をコメントで貼る）
  → 結論をコメントで投稿し、Answer にマークする
  → 導入 Issue を起票（DoR に「Discussion #n が決着」、参考にリンク）
  → 実装 → PR マージ
  → Wiki を更新（WIKI.md を参照）
  → Issue の「まとめ」に Discussion と Wiki のリンクを書く
```

## コマンド

`gh discussion` は preview 機能のため、将来オプションが変わる可能性があります。

```bash
# 起票（本文はファイルから渡す。下記テンプレートを使う）
gh discussion create \
  --category "Tech Decisions" \
  --title "apps/web: 状態管理ライブラリの選定" \
  --body-file /tmp/decision.md

# 一覧・参照
gh discussion list --category "Tech Decisions" --state all
gh discussion list --category "Tech Decisions" --answered   # 決着済みのみ
gh discussion view <番号> --comments --order oldest

# 結論コメントを投稿
gh discussion comment <番号> --body-file /tmp/conclusion.md

# 投稿したコメントを Answer にマークする（node ID が必要）
gh discussion view <番号> --json comments --jq '.comments[] | "\(.id)\t\(.body[0:40])"'
gh api graphql -f query='
  mutation($id: ID!) {
    markDiscussionCommentAsAnswer(input: { id: $id }) {
      discussion { url }
    }
  }' -F id='<コメントの node ID>'
```

Web UI から起票した場合は [DISCUSSION_TEMPLATE/tech-decisions.yml](../DISCUSSION_TEMPLATE/tech-decisions.yml) のフォームが自動で適用されます。
CLI から起票する場合はフォームが適用されないため、下記のテンプレートを使ってください。

## 本文テンプレート（CLI 用）

````markdown
## 背景・目的

<!-- なぜ今これを決める必要があるのか。決めないと何が進まないのか -->

## 決めること

<!-- 一文で。例: apps/web のクライアント状態管理に使うライブラリ -->

## 評価軸

<!-- 候補を並べる前に決める。このプロジェクトで重視する順に 3〜5 個 -->

| 軸 | なぜ重視するか |
| :- | :- |
|  |  |

## 候補の比較

| 候補 | <軸1> | <軸2> | <軸3> | 総評 |
| :- | :- | :- | :- | :- |
|  |  |  |  |  |

## 検証したこと

<!-- PoC のブランチ、計測結果、試して分かったこと。していなければ「なし」 -->

## 影響範囲

<!-- 影響するパッケージ・レイヤー。後戻りのコスト（乗り換えるとしたら何が必要か） -->

## 参考

<!-- 公式ドキュメント、比較記事、関連 Issue / PR -->
````

## 結論コメントのテンプレート

````markdown
## 結論

<!-- 採用する候補を一文で -->

## 理由

<!-- 評価軸のどれを優先したのか。3 点以内 -->

## 採らなかった候補と理由

| 候補 | 採らなかった理由 |
| :- | :- |
|  |  |

## 前提と見直し条件

<!-- どの前提が崩れたら再検討するか（例: チーム規模が増えたら / SSR を導入するなら） -->

## 次のアクション

<!-- 導入 Issue の番号。まだなければ「Issue を起票する」 -->
````
