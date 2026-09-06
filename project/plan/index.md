# 作業計画

複数の Issue にまたがる実装計画の置き場です。
形式は [OKF（Open Knowledge Format）v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) に従います。

## ここに書くもの・書かないもの

計画は「順序と依存関係」だけを持ちます。**内容は他の置き場所からコピーせず、リンクで参照します。**

| 知りたいこと | 見る場所 |
| :- | :- |
| **どの順で何をやるか。何が何をブロックしているか** | **ここ（`project/plan/`）** |
| その作業の完了条件は何か | GitHub Issue |
| なぜその技術を選んだか | GitHub Discussions |
| 今このプロジェクトは何を使っているか | GitHub Wiki |
| どういう設計になっているか | `docs/` |
| どうやって動かすか | `README.md` / `.github/` |

書き分けの正本は [AGENTS.md](../../AGENTS.md) の「ドキュメントの置き場所」です。

## 読み方

各ファイルの YAML frontmatter に `status` と `stale_after` があります。
`stale_after` を過ぎた計画は**現状とずれている可能性がある**ものとして扱ってください。

`verified` が無いものは**まだ誰も確認していない**（unverified）という意味です。

## 一覧

| ディレクトリ | 内容 | 状態 |
| :- | :- | :- |
| [auth/](/project/plan/auth/index.md) | 認証・認可の導入（Issue #20）。Supabase Auth 採用後の 5 層の積み方 | 進行中 |
| [deploy/](/project/plan/deploy/index.md) | 無料枠への常設デプロイ（Discussion #29）と Terraform での管理。**削除 → 準備 → デプロイの 3 段階**。選定が未決着のため、決着を待たずに進める 5 層を切り出している | 進行中 |

更新履歴は [log.md](/project/plan/log.md) を参照してください。
