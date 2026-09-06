---
type: Plan
title: 段階 3 — 実際に載せる
description: Discussion #29 の決着後に着手する層の輪郭と依存関係。詳細は決着後に書く。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, infra, terraform, 段階3]
status: draft
stale_after: 2026-10-05
generated: { by: claude-code/claude-opus-5, at: 2026-09-05T00:00:00Z }
---

> [!NOTE]
> **Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) は
> 2026-09-06 に決着した。** この段階の DoR は満たされている。
> **段階 1・2 も同日に完了した**ので、層 6 から順に着手できる。

> [!IMPORTANT]
> **ここから先は外部サービスの操作が挟まる。** アカウントの作成、トークンの発行、
> ダッシュボードでの設定はエージェントが代行できない。何が必要かは
> [index.md](/project/plan/deploy/index.md) の「着手前に人間がやること」にまとめてある。

# 確定した載せ先

| レイヤー | 採用 |
| :- | :- |
| 静的フロント | **Cloudflare Workers + Static Assets** |
| DNS | **Cloudflare DNS**（`sk8trickhub.com`） |
| GraphQL エンジン | **Hasura Cloud（v2 / Cloud Free）** |
| DB・認証 | **Supabase**（PostgreSQL + Auth） |
| API | **NestJS on Render Free**（Docker） |
| メール | **Resend**（Supabase の custom SMTP） |
| 監視 / Keep Warm | **UptimeRobot** |
| CI/CD | **GitHub Actions** |
| IaC | **Terraform**（Cloudflare / Render / GitHub のみ） |

**認可は Hasura の行レベル権限、スキーマの正本は Prisma。**
構成案にあった Supabase RLS と Supabase CLI マイグレーションは採らない
（理由は [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「採らなかった 2 つ」）。

# 層の輪郭

順序は Discussion #29 本文の「決め方の順序」（**DB → GraphQL エンジン → API → フロント**）に、
土台（Terraform）と仕上げ（CI）を足したものである。

| 層 | 内容 | 何に依存するか |
| :- | :- | :- |
| **6** | **Terraform の再導入**（Cloudflare / Render / GitHub） | 層 2 で消した `infra/` を作り直す |
| **7** | **DB を Supabase へ**（Prisma で本番へ流す） | 層 6 |
| **8** | **Hasura Cloud に載せる** | 層 7（接続先が要る） |
| **9** | **API を Render に載せる** | 層 8（Actions の呼び出し経路が決まる）+ 層 3（Docker） |
| **10** | **Web を Cloudflare Workers に載せる** | 層 8・9（`VITE_GRAPHQL_URL` の値が決まる） |
| **11** | **デプロイの CI と Keep Warm** | 層 4（CI の土台）と 6〜10 すべて |

```text
#29 決着
 └ 層 6  Terraform の再導入（state / プロバイダ / infra を新規に作る）
  └ 層 7  DB（Supabase へスキーマを流す）
   └ 層 8  Hasura        ← ここが決まらないと 9・10 が決まらない
    └ 層 9  API（NestJS）
     └ 層 10 Web（静的）
      └ 層 11 デプロイの CI
```

# 各層で解く必要がある問題

**答えではなく、問いを置いている。**

## 層 6 — Terraform の再導入

**層 2 で `infra/` を削除済み**なので、更地から書く。AWS 向けのコードは 1 資源も再利用しない。

導入するプロバイダは 3 つ（`cloudflare` / `render` / `github`）。切り分けは
[terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「管理するもの・しないもの」が正本。

> [!IMPORTANT]
> **GitHub を入れる目的は「Terraform の出力を CI へ自動で渡すこと」に限る。**
> Worker と Render の URL は `terraform apply` で確定するので、
> それを `github_actions_variable` として書き出せば手でコピーせずに済む。
> **secret は Terraform で作らない**（値が state に平文で入るため。`gh secret set` を使う）。

- **state はローカルに置く（暫定 / 2026-09-06 の判断）。** つまり **CI から `apply` しない。**
  無料枠の条件が未検証のままなので、必要になった時点でリモート state を検討する
  （同ファイルの「state の置き場所」）
- `mise.toml` に `terraform` / `tflint` / `terraform-docs` を戻す
- README の【成功の定義】2（`plan` が通り `test` が成功する）を**ここで回復させる**
- `Makefile` に Terraform のターゲットを足すか
- **Cloudflare の API トークンの権限範囲**（Workers / DNS / ゾーン読み取り）
- **どの値を `github_actions_variable` として書き出すか**（`VITE_GRAPHQL_URL` / `ACTION_BASE_URL` など）

## 層 7 — DB を Supabase へ

[findings.md](/project/plan/deploy/findings.md) の 6 の 4 つがそのまま論点になる。

- Hasura と Prisma に**どの接続文字列**を使うか（direct / transaction pooler / session pooler）
- コネクション数の上限に対して `HASURA_GRAPHQL_PG_CONNECTIONS` をどう設定するか
- 本番へのスキーマ反映を**どこから流すか**（`make backend-init` はローカル固定）
- 認証と同じプロジェクトに同居させるか（無料プロジェクトは 2 つまで）
- **`users` テーブルを置いて外部キーを張るか**（下記）

### DB が 1 つになると、いまの割り切りの前提が消える

現在 `users` テーブルを作らず外部キーも張っていないのは、
**`auth.users` とドメインテーブルが別インスタンスにある**ためである（[docs/er-diagram-notes.md](/docs/er-diagram-notes.md)）。

**この層で DB が Supabase に一本化されると、その理由が消える。** 同じインスタンスに同居するため
参照整合性を DB で担保できるようになる。

**`public.users` を挟む形に決まった**（2026-09-06）。設計は [docs/er-diagram-notes.md](/docs/er-diagram-notes.md) に記載。

| 決めたこと | 内容 |
| :- | :- |
| `auth.users` を直接参照しない | `auth` スキーマは Supabase 管理下。**`public.users` を挟む** |
| `users.role` | **利用者ごとに権限を分けるための列。** Hasura のロールに対応させる |
| `dummy.owner_id` | `users.id` への**外部キー**に変更 |

### ロール固定の制約も同時に消える

**現在の Custom Access Token Hook はロールを `user` 固定でハードコードしている**
（[auth/supabase-setup.md](/project/plan/auth/supabase-setup.md)）。

```sql
'x-hasura-default-role',  'user',
'x-hasura-allowed-roles', jsonb_build_array('user'),
```

理由は「Hook が動く Supabase の DB から**アプリのテーブルが見えない**」ためで、
**FK を張れない理由とまったく同じ**である。DB が一本化すると両方まとめて解消する。

したがってこの層では次が連鎖する。

| # | やること |
| :- | :- |
| 1 | `public.users` を作り、`dummy.owner_id` に FK を張る |
| 2 | **Hook を書き換え**、`users.role` を読んで `x-hasura-*` を返すようにする |
| 3 | **Hook の SQL をリポジトリに入れる。** 現在 Supabase の DB 上にしか存在せず、`config.toml` は URI で参照しているだけ |
| 4 | **Hasura に `user` 以外のロールを定義する**（現在は `user` の 1 つだけ） |

**ドメイン層の `OwnerId` による形式検証は残す。** DB の制約とアプリの不変条件は別物である。

### ローカルも Supabase に寄せる（2026-09-06 決定）

Hook は Supabase の DB 上で動くため、**アプリの DB が Docker のままだと `public.users` が見えず、
ローカルではロールが固定のまま**になる。「開発中は全員 `user`、本番だけ権限が分かれる」状態は
**権限のバグを本番でしか踏めない**ため、**ローカルのアプリ DB も Supabase にする。**

**`docker-compose.yml` から `postgres` サービスを外し、Hasura だけを残す。**

| 影響 | 内容 |
| :- | :- |
| `docker-compose.yml` | `postgres` サービスを削除。`HASURA_GRAPHQL_DATABASE_URL` を Supabase へ |
| `Makefile:81` | `docker compose exec -T postgres pg_isready` の待機処理が使えなくなる |
| `Makefile:164`（`db-seed`） | `docker compose exec -T postgres psql` を使っている。**接続方法の作り直しが要る** |
| `apps/api/.env` | `DATABASE_URL` を Supabase の接続文字列へ |
| `.env.example:30` | `DATABASE_URI`（postgres-mcp 用）も同様 |

**代償を明示しておく。**

| 代償 | 内容 |
| :- | :- |
| **オフラインで開発できなくなる** | ネットワークが無いと `make dev` が動かない |
| **無料プロジェクト 2 つを使い切る** | 開発用 + 本番用。#29 のコメントが「許容するか」と留保していた項目がこれで決着する |
| **開発用プロジェクトも一時停止の対象** | 7 日の低活動で止まる。開発を離れると開発環境ごと止まる |
| 起動が遅くなる | ローカルの Docker より Supabase への往復のほうが遅い |

> [!NOTE]
> **Hasura はローカルの Docker コンテナのまま。** 変えるのは接続先の DB だけである。
> 本番で Hasura Cloud に移すのは層 8（#102）で、ここでは扱わない。

## 層 8 — Hasura Cloud に載せる

**Terraform の管理外。** ダッシュボードでの手作業になるため、**手順書を残す**
（`project/plan/deploy/manual/` を作るか判断する。認証の [auth/manual/](/project/plan/auth/manual/index.md) が前例）。

- **v2 プロジェクトとして作成できるか**を最初に確認する（`hasura.io/pricing` は DDN 専用の表示になっている）
- 既存の `hasura/metadata/`（v2 形式）がそのまま `apply` できるか
- メタデータをいつ適用するか（`hasura metadata apply` を CI のどこで走らせるか）
- `HASURA_GRAPHQL_ENABLE_CONSOLE` を本番で無効にする
- admin secret を**ローカルと別の値**にする（→ [layer-config.md](/project/plan/deploy/layer-config.md)）
- Supabase への接続文字列は **Supavisor（transaction pooler）** を使う（→ [findings.md](/project/plan/deploy/findings.md) の 6）

## 層 9 — API を Render に載せる

**Hasura Cloud と Render は別サービスなので、Actions は公開エンドポイント経由になる。**
共有シークレットによる保護は実装済み（Issue #26）なので、追加の実装は要らない。

- イメージのレジストリをどこにするか（層 3 で保留した論点）。Render は Dockerfile 直読みも可能
- `ACTION_BASE_URL` の値が決まる
- **15 分スリープ**の許容範囲を決める（層 11 の Keep Warm と対で考える）

## 層 10 — Web を Cloudflare Workers に載せる

- ビルド時に `VITE_*` を注入する経路（**ビルド成果物に埋め込まれる**ため CI で渡す）
- SPA のフォールバックは `not_found_handling = "single-page-application"`（**200 で返る**）
- Hasura 側の `HASURA_GRAPHQL_CORS_DOMAIN` をこのオリジンに絞る
- `dist/` のファイル数が **20,000 / 1 ファイル 25 MiB** の上限に収まるか確認する

## 層 11 — デプロイの CI と Keep Warm

- `main` へのマージで何を出すか。**Terraform の `apply` を CI に含めるか**
- 秘匿値の流し方（→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「秘匿値の置き場所」）
- 段階 2 の層 4 で入れた `check.yml` との関係
- **UptimeRobot を 10 分間隔で `/health` に向ける**（下記）と、ToS の判断
- **月次スモークテストを置く**（下記。Hasura のハイバネーション対策を兼ねる）

### Hasura Cloud にコールドスタート対策は要らない（確認日 2026-09-06）

**Hasura Cloud にはスピンダウンもコールドスタートも無い。** Render と違い、
無アクセスでも起動したままである。**Keep Warm の対象は Render だけでよい。**

ただし別の仕組みがある。**ハイバネーション**である。

| 項目 | 内容 |
| :- | :- |
| 対象 | **Cloud Free のみ**（Professional / Enterprise は対象外） |
| 何が活動か | **プロジェクトの API への GraphQL リクエスト** |
| 60 日 | 1 通目のメール（30 日後にハイバネートする旨） |
| 75 日 | リマインド |
| **90 日** | **ハイバネート。** メタデータとプロジェクトは保持されるが、**API が応答しなくなる** |
| 復帰 | ダッシュボードの「Reactivate」ボタン（**手動**） |

> [!WARNING]
> **現在の Keep Warm 設計では Hasura に 1 件もリクエストが飛ばない。**
> `UptimeRobot → NestJS /health → Supabase` は **Hasura を通らない**ため、
> アプリを誰も使わなければ **Render と Supabase は生きたまま Hasura だけがハイバネートする。**

**対策として月次スモークテストを置く**（2026-09-06 決定）。後述の「月次スモークテスト」を参照。

### Keep Warm の方式（2026-09-06 決定）

**UptimeRobot の監視 1 本で、Render のスリープと Supabase の一時停止の両方に対応する。**

```text
UptimeRobot ──10 分ごと──▶ NestJS /health ──SELECT 1──▶ Supabase PostgreSQL
                            └ Render の 15 分スリープを回避   └ Supabase の「毎日数回の DB アクセス」を満たす
```

| 項目 | 値 | 根拠 |
| :- | :- | :- |
| 監視間隔 | **10 分** | Render のスピンダウンは **15 分**。5 分の余裕を持たせる |
| 監視先 | `GET /health`（NestJS） | Render を起こしつつ、DB まで到達させるため |
| DB 到達 | **必須。`SELECT 1` を 1 本実行する** | Supabase の判定は `user database activity`。**HTTP だけでは足りない** |

> [!IMPORTANT]
> **`/health` が DB に触らないと、Render は起き続けるが Supabase は止まる。**
> 「200 を返すだけ」の health check にしないこと。

**Render の稼働時間は月 750 インスタンス時間 / ワークスペース。**
24 時間起こし続けると 31 日月で **744 時間**となり、残り **6 時間**しかない。
**Render に無料サービスを 2 つ置くと即座に枠を超える。**

# この段階の後に残るもの

| 項目 | 状態 |
| :- | :- |
| 独自ドメイン | Discussion [#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)（サービス名）待ち。**サブドメインで公開できるので待たない** |
| 認証メールの第三者への到達 | Issue [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71)。#46 待ち |
| 自動テスト | **1 件も無い**（→ [layer-ci.md](/project/plan/deploy/layer-ci.md)）。別 Issue |
| `apps/mobile` / `apps/desktop` | 開発停止中。デプロイ対象外 |
| 監視・ロギング | 未着手 |

# 残るリスク（Discussion #29 の Answer より）

| # | リスク | 扱い |
| :- | :- | :- |
| 1 | **Supabase の 7 日一時停止**（90 日で永久削除） | 未決。定期 ping は #29 本文が「想定利用から外れた運用」と留保 |
| 2 | **Render の Keep Warm も同じ性質** | **リスク 1 と同じ判断として扱う。** 片方だけ許容する理屈は立たない。`/health` は運用上ふつうの実践だが、**効果として休止を免れている事実は同じ** |
| 2b | **Render の稼働時間が 744/750 時間** | 24 時間起こすと枠をほぼ使い切る。**無料サービスを 2 つ置けない** |
| 3 | **Hasura の DDN 誘導** | v2 Cloud Free は現存（2026-09-06）だが、料金ページは DDN 専用。**v2 → DDN は作り直し** |
| 4 | **Hasura Cloud が IaC の外** | 受け入れ済みの妥協。手順書で補う（層 8） |
| 5 | **Hasura Cloud は 90 日でハイバネート**（確認済み） | コールドスタートは無い。下記のとおり別問題として扱う |
| 6 | **Hasura Cloud Free のデータ転送量は月 100 MB** | リクエスト数（月 300 万）より**こちらが先に効く**。層 8 で実測する |

### 月次スモークテスト（2026-09-06 決定）

**GitHub Actions の月次 cron で、認証付きの GraphQL を 1 回投げる。**

```text
GitHub Actions（月次 cron） ──GraphQL 1 件──▶ Hasura Cloud ──▶ Supabase PostgreSQL
```

**「keep-alive の ping」ではなく「デプロイが生きているかの確認」として設計する。**

| 項目 | 内容 |
| :- | :- |
| 頻度 | **月 1 回**。ハイバネーションの起点は 60 日なので十分 |
| 内容 | **認証付きの GraphQL を 1 件**（`DummyList` 相当） |
| 判定 | 応答が期待した形であること。**失敗したら CI を落とす** |
| 認証 | **admin secret は使わない。** 検証用ユーザーのトークンを CI の secret から取得する |

この設計にする理由は 2 つある。

1. **本来の価値がある。** デプロイ後に壊れていたことに気づける。ハイバネーション対策は副次的な効果にすぎない
2. **性質が違う。** UptimeRobot の 10 分間隔と違い、月 1 回のスモークテストは
   「サービスの想定利用から外れた運用」に当たらない。**ToS 上の説明がしやすい**

> [!NOTE]
> **`/healthz` を叩く案は採らない。** Hasura のハイバネーション判定は
> 「プロジェクトの API への **GraphQL リクエスト**」であり、ヘルスチェック用の
> `/healthz` が活動として数えられる保証がない。**確実な方法を採る。**

> [!IMPORTANT]
> **リスク 1 と 2 は 1 つの判断である。** 定期 ping / Keep Warm を前提にするなら両方、
> しないなら両方を見直す。**別々に決めない。**

> [!NOTE]
> **Issue #27（Terraform の本番前セキュリティ設定）は close 済み。**
> 対象だった AWS RDS を層 2 で削除したため、直す資源が消滅した。
> 段階 3 で作り直す `infra/` に同じ論点（保存時の暗号化・バックアップ）が必要なら、
> **その時点で新しい Issue を立てる。** → [findings.md](/project/plan/deploy/findings.md) の 8
