# 更新履歴

新しいものが上です。計画の追加・方針の変更・陳腐化をここに記録します。

## 2026-09-06

以下は Issue [#108](https://github.com/Hitamuki/study-web-modern-stack/issues/108)（デプロイ計画の整備）による更新です。

- **Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) が決着した。**
  結論をコメントで投稿し Answer にマークした。本文は書き換えていない（AGENTS.md の方針）。
- **Keep Warm の方式を決めた。UptimeRobot 1 本で Render と Supabase の両方に対応する。**
  `UptimeRobot ──10 分ごと──▶ NestJS /health ──SELECT 1──▶ Supabase PostgreSQL`。
  **要点は `/health` が DB まで到達すること。** Supabase の一時停止の判定は公式ドキュメントで
  `user database activity`（目安は「毎日数回の DB アクセス」）と定義されており、
  **HTTP に応答するだけの health check では Supabase が止まる。**
  間隔を 10 分にしたのは、Render のスピンダウンが **15 分**で 5 分の余裕を取るため。
  `/health` の実装は #87（コンテナ化）、監視の設定と検証は #105 に分けた。
- **Hasura Cloud にコールドスタート対策は不要と確認した。** スピンダウンもコールドスタートも無く、
  無アクセスでも起動したままである。**Keep Warm の対象は Render だけでよい。**
  代わりに **ハイバネーション**があり、**GraphQL リクエストが 90 日ないと API が応答しなくなる**
  （60 日と 75 日に警告メール、復帰は手動ボタン。Cloud Free のみ）。
  **現在の Keep Warm 経路は Hasura を通らない**ため、アプリが使われないと
  Render と Supabase は生きたまま Hasura だけが止まる。
- **GitHub を Terraform 管理に入れる理由の記述が矛盾していたので直した。**
  当初「Actions の secrets / variables（キーのみ）」と書いていたが、
  **`github_actions_secret` は値を渡す必要があり、その値が state に平文で入る。**
  「Terraform に秘匿値を持たせない」という同ファイル内のルールと矛盾していた。
  - **Terraform が持つのは `github_actions_variable` だけ**とした。
    目的は権限管理ではなく **「Terraform の出力を CI へ自動で渡すこと」**。
    Worker と Render の URL は `terraform apply` で確定するので、手でコピーせずに済む。
  - **secret は `gh secret set` で人が登録する。** Terraform は secret を読む側であって作る側ではない。
  - ブランチ保護・リポジトリ設定は対象外とした。

- **コンテキストマップに 2 点反映した。**
  - **Hasura を点線グループで囲んだ。** Cloudflare / Supabase / Render と同じ表現に揃え、
    「TF 管理外」タグも他と同じ位置（グループ右上）にした。
  - **⑫ 月次スモークテストの経路を追加した。** GitHub Actions（月次 cron）→ Hasura。
    ハイバネーション対策が図から読み取れないままだったため。
- **コンテキストマップを作り直した**（レビュー指摘の反映）。
  - **背景を白に戻した。** グループの塗り（半透明の色被せ）をやめ、**白地 + 色付きの点線枠**にした。
    大きな色面が背景色の変化に見えていたため。
  - **経路の凡例の折り返しを直した。** 1 文字単位で折っていたため「経由）」が「経 / 由）」に割れていた。
    **空白を優先して折る**方式に変え、意味の切れ目には明示的な改行位置（`|`）を置けるようにした。
  - **余白を広げた。** 行間を `fontSize+5` から `+9` に、ボックスの高さと間隔も全体的に拡大。
  - **番号を丸数字（①〜⑫）にした。** 白丸を描いてその上に数字を重ねる方式をやめ、Unicode の文字を使う。
  - **ブラウザを点線グループ「クライアント（ブラウザ）」にし、内部に SPA 構成を入れた**
    （React + Vite + TypeScript / React Router v7・Apollo Client・supabase-js）。
  - **Render Free に色を付けた**（teal 系）。それまで無彩色で他と扱いが違っていた。
  - **UptimeRobot を独立した点線グループにした。**
  - **月次スモークテストを GitHub グループの中へ移した。** GitHub Actions のワークフローなので、
    グループの外に置いていたのは誤り（経路の取り回しの都合でそうなっていた）。
- **「md のプレビューで背景が黒く見える」の原因を特定した。ファイル側の問題だった。**
  リポジトリ上の `.drawio.svg` が **drawio から再エクスポートされたもの**に置き換わっており、
  背景が透過、かつ塗りが **`fill: light-dark(rgb(255,255,255), rgb(18,18,18))`** で書き出されていた。
  これは**テーマ追従の CSS 関数**で、ダーク配色のビューアでは黒側が選ばれる。
  **背景を `#ffffff` で明示し、`light-dark()` を使わない形**で再生成した。
  再エクスポートで再発するため、`docs/context-map.md` に注意書きを置いた。
  なお再エクスポート前後で**座標は完全に一致**していた（レイアウトの手編集は無し）ため、上書きしている。

- **図の仕上げを 3 点直した。**
  - **角の丸みを縮小**（`rx` 7〜8 → 3）。
  - **円柱（PostgreSQL）のラベルが上の楕円に食い込んでいた**のを解消し、あわせて箱に高さの余裕を持たせた。
    drawio 側でラベルが再レイアウトされると文字が切れる余地があったため。
  - **経路の凡例を丸数字ごとに 1 行空けた。** 項目の切れ目が分からず読みにくかった。
- **図の正本を drawio 側に移した。** `.drawio.svg` は「表示用 SVG」と「編集用 XML」を
  1 ファイルに持つが、**2 つを別のレンダラーが描く**ため食い違う。
  実際、SVG 側はフォントを 92 箇所で明示し凡例を 14 個の `<text>` で手組みしていたのに対し、
  XML 側は `fontFamily` 指定なしでラベル 1 個を自動折返しさせていた。
  **SVG 側を作り込むほど、drawio で保存し直したときに壊れる**構造だった。
  - **XML 側を HTML ラベルで書き直した。** `html=1` を使い、
    `<b>` と `<font color>` で「1 行目は太字 / 2 行目以降はグレー」を、`<br>` で改行位置を明示。
    これで**手編集して保存し直しても見た目がおおむね保たれる。**
  - `fontFamily` を全 41 セルに設定し、凡例も `<br>` で SVG 側と同じ折返しにした。
  - **最背面に白の背景矩形（`bg`）を敷いた。** 透過エクスポートに対する保険。
  - **drawio の MCP サーバーは接続できない**（`CONNECTION_CLOSED`）ため使っていない。
    **drawio 側の描画結果はこちらでは検証できない**ので、最終確認は人手で行う必要がある。
- **図の読みやすさを 3 点直した。**
  - **`Workers + Static Assets` を 1 行の太字にまとめた。** 製品名が「太字の行」と
    「グレーの行」に分かれており、隣の `DNS`（名称=太字 / 説明=グレー）と形式が揃っていなかった。
  - **⑨ と ⑪ が同じ x=530 の縦ラインを共有していた**のが番号の見づらさの主因。
    レーンを 520 / 536 / 552 に分離し、あわせて **⑨⑪⑫ の番号を始点側へ移した**
    （交差点の上に番号が乗らないようにするため）。番号の白ハローも 22px → 24px に拡大。
  - **⑧ の線が Supabase グループの内側から始まっていた**（オブジェクトに紐づいていなかった）。
    **Supabase Auth の右端から Resend の右端へ**繋ぎ直した。
    グループ内の Hook と PostgreSQL を横切らないよう右側を回している。
- **ローカル開発時の構成も `.drawio.svg` にした**（`docs/context-map-local.drawio.svg`）。
  Mermaid 図を置き換え、本番構成の図と**同じ生成コード**から出すようにしたのでスタイルが揃う。
  あわせて `docs/context-map.md` に**ローカルと本番の違いを 3 行の表**で明示した
  （アプリの DB / Hasura / NestJS の 3 点。Supabase Auth だけはローカルでもクラウドを使う）。
- **ローカル図で「コンテナ」と「ホスト」を分けた。** `Docker Compose` の入れ子グループを作り、
  **PostgreSQL と Hasura の 2 つだけがコンテナ**で、**NestJS はホストで pnpm 直起動**であることを図示した。
  同じ DB でも経路が違う点も明記（Hasura は Docker ネットワーク内 `postgres:5432`、
  NestJS はホストから `localhost:5433`）。

- **「Supabase の PostgreSQL はローカルで使うのか」を明確にした。答えは「アプリからは使わない」。**
  `docker-compose.yml` にも `apps/api/.env` にも Supabase の接続文字列は無く、
  **Supabase Auth の内部ストレージとして `auth.users` を持っているだけ**である。図にもそう明記した。

- **`users` テーブルを作らない判断は「恒久的な設計」ではなく「DB が 2 つに分かれている現状への割り切り」**
  であることを記録した。層 7（#101）で DB を Supabase に一本化すると
  **`auth.users` とドメインテーブルが同居するため、外部キーを張れない理由が消える。**
  Supabase の定石は `auth.users` を直接参照せず `public.users` を挟む形なので、
  **どう設計するかを #101 で決める**こととし、`docs/er-diagram.md` /
  `docs/context-map.md` / `phase-3.md` 層 7 / #101 の 4 箇所に論点を書いた。
  **ドメイン層の `OwnerId` による形式検証は残す**（DB の制約とアプリの不変条件は別物のため）。
- **`public.users` を挟む形に決定した。** 利用者ごとに権限を分けるため、
  `users` テーブルは**参照整合性だけでなくロールの保管場所**も兼ねる。
  `auth` スキーマは Supabase の管理下なので、アプリのテーブルから `auth.users` を直接参照しない。
  ER 図（`docs/er-diagram.md`）に計画として mermaid を追加した。

- **「ロール固定」と「FK を張れない」が同じ原因だったことが分かった。**
  現在の Custom Access Token Hook は `x-hasura-default-role` を **`user` 固定でハードコード**しており、
  その理由は [auth/supabase-setup.md](/project/plan/auth/supabase-setup.md) に
  「Hook が動く Supabase の DB から**アプリのテーブルが見えない**ため、当面はロールを固定」と明記されていた。
  **DB を一本化すると両方まとめて解消する。** 層 7 で次が連鎖する。
  1. `public.users` を作り FK を張る → 2. Hook が `users.role` を読む形に書き換え →
  3. **Hook の SQL をリポジトリに入れる**（現在 Supabase の DB 上にしか無い） →
  4. Hasura に `user` 以外のロールを定義

- **ローカル開発でもアプリの DB を Supabase にすることに決めた。**
  Hook は Supabase の DB 上で動くため、アプリ DB が Docker のままだと `public.users` が見えず、
  **ローカルだけロールが固定**になる。「権限のバグを本番でしか踏めない」状態を避けるための判断。
  **`docker-compose.yml` から `postgres` を外し、Hasura だけを残す。**
  影響箇所は `Makefile:81`（`pg_isready` の待機）、`Makefile:164`（`db-seed` が
  `docker compose exec postgres psql` を使用）、`apps/api/.env`、`.env.example:30`。
  **代償**: オフラインで開発できなくなる / **無料プロジェクト 2 枠を使い切る**（開発用 + 本番用）/
  開発用プロジェクトも 7 日の一時停止の対象。
  なお **Hasura はローカルの Docker コンテナのまま**で、変えるのは接続先の DB だけ。
- **ローカル構成図を #101 適用後の姿に描き直した。** 当初は「現状（Docker の PostgreSQL）」のまま
  残すつもりだったが、**全体図（本番）も未デプロイの目標構成を描いている**ので、
  2 枚の時点を揃えるほうが一貫すると判断した。タイトルに「層 7 / #101 適用後」と明示し、
  `context-map.md` の冒頭に**どちらもまだ動いていない**旨の注記を置いた。
  図の変更点は、Docker Compose のグループが **Hasura だけ**になり、
  アプリの DB が **Supabase の PostgreSQL** に統合され（`auth.users` / `public.users` / `dummy` が同居）、
  **Hook が `public.users` を読む経路（⑫）**が加わったこと。

- **脚注の誤りを 1 つ直した。** 「本番との違いは Hasura の置き場所だけ」と書いていたが、
  **Web（Vite 開発サーバー / Cloudflare Workers）と NestJS（ホスト / Render）も違う。**
  `context-map.md` にも 4 行の比較表を置き直した。




- **Mermaid 図の記述が古くなっていたので直した。**
  `apps/mobile` を「未実装」、`apps/desktop` を「実装中」と書いていたが、
  **#25 は CLOSED で、両方に `supabase.ts` が存在する**（導入済み）。
  `docs/context-map.md` の「未実装・ブロック中」の表からも該当行を外し、
  代わりに**デプロイ未実施**（#99 → #87〜#105）の行を足した。
  **TLS の行のブロッカーが #27 のままだった**のも直した（#27 は close 済みで、
  本番は各 PaaS が自動終端するため自前の対応は不要）。
  なお Resend の「未実施」は正しいままだった（`config.toml` が `enabled = false` / #71 は OPEN）。







- **対策として月次スモークテストを採用した。** GitHub Actions の cron で
  **認証付きの GraphQL を月 1 回**投げる。`/healthz` は採らない
  （判定が「API への GraphQL リクエスト」であり、ヘルスチェックが数えられる保証がないため）。
  **「keep-alive の ping」ではなく「デプロイが生きているかの確認」として設計する。**
  デプロイ後の破損に気づけるという本来の価値があり、月 1 回なら
  「サービスの想定利用から外れた運用」に当たらない。UptimeRobot の 10 分間隔とは性質が違う。

- **Hasura Cloud Free で先に効くのはリクエスト数ではなくデータ転送量だった。**
  月 300 万リクエストに対し、**データ転送量は月 100 MB**（1 日あたり約 3.3 MB）。
  メモアプリの JSON なら足りるが、画像や大きなペイロードを扱うと最初にここで詰まる。#102 に実測を入れた。

- **コンテキストマップのタグ位置のバグを修正した。** Cloudflare 用の「TF 管理下」タグに
  中央列の座標を入れており、**③の矢印の横に浮いていた**。4 つのタグをすべて対象の右端に合わせ、
  凡例の最終行が枠外にはみ出していたのも直した（凡例の高さを算術で検証してから確定）。


- **Render Free の稼働時間を確認した（月 750 インスタンス時間 / ワークスペース）。**
  24 時間起こし続けると 31 日月で **744 時間**となり、残りは 6 時間しかない。
  **Render に無料サービスを 2 つ置くと即座に枠を超える**ため、制約として #103 に記録した。
  コールドスタートは公式表記で「**約 1 分**」。ただし読み取りは Hasura Cloud 経由で Render を通らないため、
  **遅くなるのは久しぶりの書き込みだけ**である。

- **`/health` は認証なしで公開するため、#86 で消した `/dummies` と同じ失敗をしないよう制約を明記した。**
  返すのは `ok` / `ng` だけで、DB のバージョン・テーブル名・件数・スタックトレースを返さない。

- **`docs/context-map.drawio` を `docs/context-map.drawio.svg` に統合した。**
  描画済み SVG と drawio 編集用 XML を**同一のレイアウト定義から生成**しているため、
  画像として表示でき、drawio で開けば編集もできる。
  **重なりの原因だった浮いた注記テキストを角のタグに、経路の説明を番号 + 凡例に移した。**
  `docs/context-map.md` の「全体図」から参照し、既存の Mermaid 図は
  「ローカル開発時の構成」として残した（**上図はデプロイ後、下図はローカル**）。


  | レイヤー | 採用 |
  | :- | :- |
  | 静的フロント | Cloudflare Workers + Static Assets |
  | DNS | Cloudflare DNS（`sk8trickhub.com`） |
  | GraphQL エンジン | Hasura Cloud（v2 / Cloud Free） |
  | DB・認証 | Supabase |
  | API | NestJS on Render Free（Docker） |
  | メール / 監視 | Resend / UptimeRobot |
  | CI/CD / IaC | GitHub Actions / Terraform |

- **評価軸 7「Terraform で管理できるか」を #29 に追加した。** 8/24 に提案していたものを Answer に反映。
  **この軸で Fly.io（プロバイダ最終公開 2023-06）と Koyeb（2024-12）が落選した。**

- **提示された構成案のうち 2 項目を採らなかった。** どちらも既存の正本と衝突するため。
  - **Supabase RLS → 採らない。** RLS は**所有者・スーパーユーザーに適用されず**、Supabase の RLS は
    PostgREST が `request.jwt.claims` を設定する前提の設計で、**Hasura も Prisma もこの経路を使わない**。
    素直に有効化すると「設定したのに素通り」になる。**認可は Hasura permissions に一本化**（#22 で検証済み）。
  - **Supabase CLI マイグレーション → 採らない。** NestJS が Prisma Client を使うため、
    Prisma が `db pull` 専用に降格し**スキーマの正本が 2 つ**になる。Supabase CLI は `config.toml` 専用に留める。

- **Hasura Cloud の v2 無料枠が現存することを確認した**（確認日 2026-09-06）。
  Cloud Free = 月 300 万リクエスト / DB 2 接続。v2 ドキュメントに廃止告知は無い。
  ただし **`hasura.io/pricing` は DDN（v3）専用の表示**になっており、投資先が DDN なのは明らか。
  **v2 → DDN は上位互換ではなく作り直し**（メタデータ形式が別物）なのでリスクとして記録した。

- **フロントは Cloudflare Pages ではなく Workers を採用した。** Cloudflare 自身が
  「**Start new projects with Workers**」と明記しており、ビルド上限も Pages の月 500 回に対し
  Workers Builds は月 3,000 分で緩い。SPA フォールバックが **HTTP 200 で返る**点も Pages と同等以上。
  なお **Pages に廃止予定は無い**（ドキュメントに告知なし）。

- **Vercel と Netlify を落選させた。**
  - Vercel Hobby は**商用利用が禁止**で、定義が「制作に関わった**誰か**の金銭的利益」まで及ぶ
    （寄付・広告も該当）。投稿が AI 学習に使われる規約もある。
  - Netlify Free は 2025-09-04 以降の新規アカウントが**クレジット制**。本番デプロイ 1 回 15 クレジット、
    月 300 クレジットで**実質 月 20 デプロイ**。枯渇するとサイトが停止し、追加購入もできない。
    よく見る「100 GB + ビルド 300 分」は**旧プランの数値**で、今から作ると当たらない。

- **段階 3 の Issue を 6 件起票した**（#100〜#105。いずれも Board は `Backlog`）。
  層 6 Terraform 再導入 / 7 DB / 8 Hasura Cloud / 9 API / 10 Web / 11 デプロイ CI。

- **`docs/context-map.drawio` を追加した。** 確定構成のコンテキストマップ。
  drawio の MCP サーバーが接続できないため、**mxfile 形式の XML を直接生成**している。

- **Supabase の一時停止対策と Render の Keep Warm を「1 つの判断」として扱うことにした。**
  どちらも定期アクセスでサービスの休止を回避する運用で、#29 本文が
  「サービスの想定利用から外れた運用」と留保を付けている。**片方だけ許容する理屈は立たない。**
  #105 の DoR に両方まとめて決めることを入れた。

## 2026-09-05

- **AWS を使わない判断が出たため、`infra/` の Terraform を削除することにした。**
  Issue [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) を起票（Board は `Backlog`）。
  `infra/main.tf` は VPC / RDS を定義しているが**一度も apply されておらず**、
  Discussion #29 が避けようとしている当のもの（常時起動で課金される RDS）だった。
  **Terraform をやめる変更ではない。** 段階 3 で無料枠プラットフォーム向けに作り直す。

- **計画を 2 段階から 3 段階へ組み替えた。** 「削除 → デプロイ準備 → デプロイ」の順にしたいという
  依頼に合わせ、削除を独立した段階として切り出した。層番号を振り直している。

  | 段階 | 層 | 内容 | Issue |
  | :- | :- | :- | :- |
  | 1 削除 | 1 | 認証なしの `/dummies` を削除 | #86（完了） |
  | 1 削除 | 2 | AWS 向け Terraform を削除 | **#99（新規）** |
  | 2 準備 | 3 | `apps/api` のコンテナ化 | #87 |
  | 2 準備 | 4 | CI の土台 | #88 |
  | 2 準備 | 5 | ベタ書き設定の外部化 | #89 |
  | 3 デプロイ | 6〜11 | Terraform 再導入 → DB → Hasura → API → Web → CI | 未起票（#29 待ち） |

  `phase-2.md` を `phase-3.md` に改名し、#87 / #88 / #89 の本文の層番号も合わせた。

- **[deploy/terraform-scope.md](/project/plan/deploy/terraform-scope.md) を全面的に書き直した。**
  「既存の AWS コードをどうするか」（3 案の比較）は決着したので削除し、代わりに
  **Terraform で管理するサービス / しないサービスの切り分け表**を中心に据えた。
  判定基準は 2 つだけにした。**(1) コミットのたびに変わるか**（Yes なら CI）、
  **(2) すでに別の正本があるか**（Yes ならその正本）。
  結果として Supabase・Hasura メタデータ・Prisma スキーマ・ビルド成果物・秘匿値は
  **すべて Terraform の管理外**になり、Terraform が持つのは
  静的ホスティング / コンテナサービス / DNS / Actions の変数キー / state 置き場だけになった。

- **Issue [#27](https://github.com/Hitamuki/study-web-modern-stack/issues/27)（Terraform の本番前セキュリティ設定）を
  not planned で close した。** AC がすべて `aws_db_instance` など `infra/main.tf` のリソース前提で、
  #99 でそのリソースごと消えるため。**削除ではなく close にした**のは、Wiki / Discussion #29 /
  この計画からの参照リンクを生かし「なぜ不要になったか」を辿れるようにするため
  （AGENTS.md「却下した候補も消さずに残す」と同じ考え方）。
  暗号化・バックアップ・TLS の論点自体は消えていないが、
  **Supabase の仕様に従う／PaaS が自動で終端する**形になり Terraform で書く対象ではなくなる。
  必要になれば #27 を再開せず新しい Issue を立てる。

- **README の【成功の定義】5「AWS でサービスが稼働すること」の書き換えを #99 の AC に入れた。**
  8/24 に「人間の判断が要る」として保留していた項目が、今回の判断で決着した。
  なお **成功条件 2（`plan` が通り `test` が成功する）は段階 2 の間だけ満たせなくなる**
  （対象が無いため）。段階 3 の層 6 で回復する。中間状態であることを #99 の AC に明記した。

## 2026-09-06

- **認証メールを Resend の custom SMTP に切り替えた（#71 完了）。** 送信ドメイン `sk8trickhub.com` を
  Resend で検証し、`supabase/config.toml` の `[auth.email.smtp]` を有効化して `make supabase-push` で適用した。
  **外部アドレス宛に受信トレイで到達することを実測**し、Discussion #70 の反証条件 3 が良い方向で解消した。
- **`[storage.vector] enabled` を false に修正した。** 雛形の既定 `true` は Free プランで使えず、
  `config push` が **402 で停止**する。Auth の適用は完了していたのに失敗に見えるため、
  「config push は書いていない設定を既定値で送る」というリスクが実際に顕在化した例として記録する。
- **順序の落とし穴を記録した。** SMTP を有効化する**前**に到達性を試すと、組み込み送信の制限で
  第三者に届かず Resend にも記録が残らない。設定ミスに見えるが順序の問題。
  作業用に置いていた `DNS-SETUP.md` は [manual/resend-smtp.md](/project/plan/auth/manual/resend-smtp.md) へ統合し、
  実値を除いて落とし穴 10 件を追記した。
- **サービス名が `SK8TrickHub` に決着した（Discussion #46）。** ドメインは `sk8trickhub.com`（#98）。
  評価軸 1（一意性）より軸 2・3（親近感・わかりやすさ）を優先した判断で、**軸の優先順位を変えた決定**である旨を
  Answer に明記した。

## 2026-08-24

- **`supabase/config.toml` を作成し、Supabase の認証設定をコード管理に移した。**
  `supabase init` で雛形を出し、本プロジェクトの現在値に合わせて調整した（`site_url` を Vite の 5173、
  `additional_redirect_urls` を SCR-004 の `/password-update`、`enable_confirmations` を true）。
  適用は `make supabase-push`（`supabase config push` のラッパー）。
- **`[auth.hook.custom_access_token]` を明示的に宣言した。** 雛形はコメントアウトされており、
  そのまま push すると **Hook が無効化されて JWT から `x-hasura-user-id` が消え、
  Hasura の行レベル権限が全件を弾く**（0 件になり権限バグに見える）。`config push` には
  dry-run も diff も無いため、Makefile 側に確認プロンプトと警告を入れた。
- **API キーの置き場所を前日の結論から変更した。** config.toml が
  `pass = "env(RESEND_API_KEY)"` で参照するため、**リポジトリ直下の `.env` に置く**のが正しくなった。
  `.env.example` にコメントだけ置いていたのを実変数に変えた。
  `apps/api/.env` に置かない理由は変わらず「NestJS がメールを送らず読む主体がいない」。
- **[docs/context-map.md](/docs/context-map.md) を現状に更新した。** 3 月時点の図には認証が無かったため、
  Supabase Auth / Hook / JWKS 検証 / 行レベル権限 / Actions の共有シークレット / Resend を追加し、
  未実装の経路（Resend・mobile・desktop）を破線で区別した。PostgreSQL が 2 つある理由も明記した。

- [deploy/](/project/plan/deploy/index.md) を追加。無料枠への常設デプロイ（Discussion
  [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29)）と Terraform での管理の計画。
  **Issue はまだ 1 つも起票していない。**

- **#29 の決着を待たずに進められる 4 層を切り出した。** #29 は未決着だが、
  「どこに載せるか」以前に**このリポジトリが今のままではどこにも安全に載らない**ことが
  判明したため、段階 1（前提条件）と段階 2（実際に載せる）に分けた。
  段階 1 の Issue には **#29 を DoR に含めない**。

- **`/dummies` が認証なしで全ユーザーのデータを読み書きできる状態を確認した**（層 1）。
  `dummy.controller.ts` は `ownerId` をリクエストボディから受け取り、`dummy.module.ts:26` で
  登録済み。Hasura の行レベル権限（#22）は**この経路に効かない**（Prisma へ直行するため）。
  [auth/findings.md](/project/plan/auth/findings.md) の 3 で「公開前に別 Issue で塞ぐ」と
  記録されたまま**起票されていなかった**もの。公開の可否と関係なく最優先で塞ぐ。

- **`make check` がテストを 1 件も実行していないことを確認した。** `main` で `make check` は
  通るが、`turbo run test` は 0 タスク（`test` スクリプトを持つパッケージが 1 つも無い）。
  担保されているのは整形と lint だけで、**DoD を通しても振る舞いの回帰は検出されない。**
  テストの導入はこの計画のスコープ外とし、別 Issue にする。

- **Terraform プロバイダの実態を Registry API で確認した**（確認日 2026-08-24）。
  Cloudflare / Vercel / Render / Google は活発だが、**Koyeb は 1 年半、Fly.io は 3 年更新が無く、
  Hasura Cloud にはプロバイダ自体が無い**（最終公開 2021 年）。
  つまり「**Terraform で管理したい**」という要望が候補を実際に絞る。
  これは **#29 の評価軸に入っていない**ため、評価軸として追記することを提案する
  （[deploy/decision.md](/project/plan/deploy/decision.md)）。

- **Supabase の設定を Terraform で管理しない方針を記録した。**
  同日に追加された `supabase/config.toml` が既に設定の正本であり、Terraform の
  `supabase_settings` を足すと二重管理になる。**`config push` には dry-run も diff も無い**ため、
  上書き事故に適用まで気づけない（上記の Hook 無効化と同じ事故になる）。

- **README の成功条件 5「AWS でサービスが稼働すること」が無料枠デプロイと両立しない**点を
  記録した（[deploy/terraform-scope.md](/project/plan/deploy/terraform-scope.md)）。
  【目的】側は「Terraform の**ローカル品質管理**」なので apply を求めておらず、衝突は 5 だけ。
  書き換える / 未達で残す / 一時的に apply して destroy する の 3 案を並べた。**判断は人間に委ねる。**

- [deploy/explain/](/project/plan/deploy/explain/index.md) を追加。初学者向けの解説として
  目的 / デプロイとは / 公開後の構成 / IaC とは / 無料枠の代償 / 技術要素の 6 本を置いた。

## 2026-08-23

- **認証メールの配信経路を Resend に確定し、手順書と解説を追加した。**
  [manual/resend-smtp.md](/project/plan/auth/manual/resend-smtp.md)（ダッシュボードと DNS の作業）と
  [explain/email.md](/project/plan/auth/explain/email.md)（誰がメールを送るのかの解説）を新設し、
  [auth/email-delivery.md](/project/plan/auth/email-delivery.md) に決定内容を反映した。
- **Resend の API キーはリポジトリに置かないことを明文化した。** `apps/api` も `apps/web` も
  送信処理を持たず、キーを読む処理が無いため。`.env` が `.gitignore` 済みで安全かどうかとは別の話で、
  **使われない環境変数を増やすと「設定したのに動かない」の原因になる**という理由。
  `.env.example` には変数ではなく所在を示すコメントだけを置いた。
  置き場所が変わる条件（Send Email Hook への切り替え / ローカル Supabase の `config.toml`）も記録した。
- **#71 の律速は Discussion #46（サービス名）のまま。** Resend はドメイン検証まで
  `onboarding@resend.dev` から自分の登録アドレスにしか送れず、**サービスを決めたことで前倒しできる作業は無い。**

- **通しの検証が完了した。** 実ユーザー 2 人で行レベル権限の分離を確認
  （ユーザー A は自分の 3 件のみ、B は 1 件のみ、トークン無しは拒否）。
  Actions 経由の作成・更新・削除も確認し、他人のレコードへの更新・削除が拒否されることを実測した。
- [auth/explain/](/project/plan/auth/explain/index.md) を追加。初学者向けの解説として
  目的とゴール / Supabase とは / 仕組み / 設定の意味 / 技術要素の 5 本を置いた。

- **`seed-auth-users.sql` を削除した。** ホストされた Supabase では `postgres` ロールが
  `auth.users` の所有者ではなく、直接 INSERT が `ERROR 42501: must be owner of table users`
  で失敗する（意図的なプラットフォーム制限）。ローカルで検証していたのは自前で模した
  `auth` スキーマだったため、この制限を再現できていなかった。
  代わりに Admin API を叩くスクリプトを用意したが、**これも削除した**。
  service_role キー（全権）の取り回しが必要で、検証用に 2 人作るだけならダッシュボードの
  Add user（Auto Confirm）のほうが安全なため。**手順書には方法 A だけを残した。**
  試して失敗した記録は `manual/supabase-users.md` に残している。

- [auth/manual/](/project/plan/auth/manual/index.md) を追加。**5 層の実装が完了した**ため、
  残りの人間の作業（検証用ユーザーの作成・Hook の確認・環境変数・シードの差し替え）を手順書にした。
- `seed-auth-users.sql` を追加。`auth.users` と `auth.identities` に検証用ユーザーを作る SQL。
  **ローカルの `auth` スキーマを模して実行検証済み**（bcrypt ハッシュの照合と冪等性を確認）。
- Discussion #75 が React Router v7 で決着。Issue #76（ルーター導入）を起票し実装した。
- `mise.toml` に `supabase` CLI を追加した。

## 2026-08-22

- Issue [#74](https://github.com/Hitamuki/study-web-modern-stack/issues/74)（Supabase プロジェクトのセットアップ）を起票。
  #22 と #71 の共通の前提でありながら、どの Issue にも属していなかったため独立させた。
- Discussion [#75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75)（画面遷移と URL の扱い）を起票。
  **「ルーターに何を使うか」ではなく「URL が担う役割は何か」から掘り直した。**
  H0（入れない）はブラウザ履歴の観点で落選、主仮説は H1（軽量ルーター）。

- [auth/email-delivery.md](/project/plan/auth/email-delivery.md) を追加。
  Supabase の組み込みメール送信が組織メンバー宛・2 通/時に限られる件と、Issue
  [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71)（Resend の custom SMTP 化）との関係を記録した。
  **層 5 はこれを待たない**（自分のアドレス宛なら確認できる）点を明示。

## 2026-08-18

- `project/plan/` を新設（Issue [#72](https://github.com/Hitamuki/study-web-modern-stack/issues/72)）。
  形式は OKF v0.2。AGENTS.md の「ドキュメントの置き場所」に 1 行追加した。
- [auth/](/project/plan/auth/index.md) を追加。認証・認可（Issue
  [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20)）の 5 層の積み方と、
  着手前に判明した 5 つの事実を記録。
