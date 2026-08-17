.DEFAULT_GOAL := help

# タスクの実体は turbo（モノレポのタスクランナー）と docker compose に寄せ、
# Makefile は「どのターゲットが何を起動するか」の入口だけを持ちます。
#
# 単体起動（*-start）は turbo を通さず pnpm から直接叩きます。turbo はタスクの
# 標準入力を子プロセスへ渡さないため、Expo の対話メニュー（i / a / r など）や
# Vite のキー操作が効かなくなるためです。turbo の interactive オプションは
# Terminal UI 必須で、出力をパイプした瞬間にタスクごと失敗するため使いません。
# 複数アプリを並列で回す dev / frontend-start だけ turbo に任せます。
TURBO := pnpm exec turbo
RUN   := pnpm --filter

# VS Code の拡張機能ホスト経由でコマンドを起動すると ELECTRON_RUN_AS_NODE=1 を引き継ぎます。
# これが立っていると Electron が素の Node として動き、require("electron") が API ではなく
# バイナリのパス文字列を返すため、main プロセスが app.whenReady() で落ちます。
# Electron を起動する経路では必ず外します。
NO_ELECTRON_NODE := env -u ELECTRON_RUN_AS_NODE

# フィルタ名は各 package.json の name です。ディレクトリ名（desktop）と
# パッケージ名がずれているものがあるため、変数にして 1 か所で管理します。
API_PKG      := @memo-app/api
WEB_PKG      := @memo-app/web
MOBILE_PKG   := @memo-app/mobile
DESKTOP_PKG  := desktop
GRAPHQL_PKG  := @repo/graphql

##@ ヘルプ

.PHONY: help
help: ## タスク一覧を表示します
	@awk 'BEGIN { FS = ":.*##" } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

##@ セットアップ

.PHONY: install
install: ## 依存関係をインストールします
	pnpm install

.PHONY: stack-setup
stack-setup: ## gh-stack 拡張と、エージェント向けスキルを導入します
	gh extension install github/gh-stack || gh extension upgrade gh-stack
	gh skill install github/gh-stack --agent claude-code --scope project --all --force

##@ 開発

.PHONY: dev
dev: backend-up ## バックエンドを起動し、API と全フロントエンドを同時に起動します
	$(NO_ELECTRON_NODE) $(TURBO) run dev

.PHONY: build
build: ## プロジェクトをビルドします
	$(TURBO) run build

##@ バックエンド

# backend-up は「コンテナを起動して疎通するまで待つ」だけの内部ターゲットです。
# `##` を付けていないため make のヘルプには出ません。
# 待たずに次へ進むと db push や metadata apply が接続エラーで落ちるため、
# 各ターゲットの前提としてここに集約しています。
.PHONY: backend-up
backend-up:
	docker compose up -d
	@printf "PostgreSQL の起動を待っています"
	@until docker compose exec -T postgres pg_isready -U user -d memo >/dev/null 2>&1; do printf "."; sleep 1; done
	@printf " ready\nHasura の起動を待っています"
	@until curl -sf http://localhost:8080/healthz >/dev/null 2>&1; do printf "."; sleep 1; done
	@echo " ready"

.PHONY: backend-init
backend-init: backend-up ## DB と Hasura を初期化します（スキーマ反映 → メタデータ適用 → シード投入。dummy の既存データは消えます）
	@command -v hasura >/dev/null 2>&1 || { \
		echo "hasura CLI が見つかりません。mise install か、公式手順で導入してください。" >&2; \
		exit 1; \
	}
	$(TURBO) run db:push --filter=$(API_PKG)
	hasura metadata apply --project hasura
	@$(MAKE) --no-print-directory db-seed
	@echo "初期化が完了しました。make backend-start で起動できます。"

.PHONY: backend-start
backend-start: backend-up ## PostgreSQL / Hasura / NestJS をデバッグ起動します（NestJS の inspector は 9229、PORT で待ち受けポートを変更可）
	$(RUN) $(API_PKG) run dev

.PHONY: backend-stop
backend-stop: ## PostgreSQL / Hasura のコンテナを停止します
	docker compose stop

##@ フロントエンド

# フロントエンドは Hasura に接続するため、先に make backend-start が必要です。

.PHONY: frontend-start
frontend-start: ## Web / Mobile / Desktop をまとめてデバッグ起動します
	$(NO_ELECTRON_NODE) $(TURBO) run dev --filter=$(WEB_PKG) --filter=$(MOBILE_PKG) --filter=$(DESKTOP_PKG)

.PHONY: web-start
web-start: ## Web をデバッグ起動します（Vite / http://localhost:5173）
	$(RUN) $(WEB_PKG) run dev

.PHONY: mobile-start
mobile-start: ## Mobile をデバッグ起動します（Expo）
	$(RUN) $(MOBILE_PKG) run dev

.PHONY: desktop-start
desktop-start: ## Desktop をデバッグ起動します（Electron / renderer 5174・inspector 5858・DevTools 9222）
	$(NO_ELECTRON_NODE) $(RUN) $(DESKTOP_PKG) run dev

##@ データベース

# DB の構造は Prisma が正本です（hasura/README.md の役割分担を参照）。
# Hasura 側はメタデータのみを管理するため、テーブル定義の変更は必ず Prisma から流します。

.PHONY: db-push
db-push: ## Prisma スキーマを DB に反映します
	$(TURBO) run db:push --filter=$(API_PKG)

.PHONY: db-seed
db-seed: ## SCR-005 の動作確認用データを投入します（既存の dummy を全削除します）
	docker compose exec -T postgres psql -U user -d memo -q < apps/api/prisma/seed.sql

.PHONY: codegen
codegen: ## Hasura のスキーマから GraphQL の型を生成します（Hasura の起動が必要）
	$(TURBO) run codegen --filter=$(GRAPHQL_PKG)

##@ 品質

.PHONY: lint
lint: ## 静的解析を実行します
	$(TURBO) run lint

.PHONY: format
format: ## コードを整形します
	pnpm format

.PHONY: format-check
format-check: ## 整形崩れがないかを確認します（書き換えません）
	pnpm format:check

.PHONY: test
test: ## テストを実行します
	$(TURBO) run test

# check は DoD の確認用なので、整形は format ではなく format-check（書き換えなし）を使います。
# 整形崩れで落ちなければゲートとして意味がなく、並列実行時に --write が lint / test と競合します。
.PHONY: check
check: format-check lint test ## lint / format-check / test をまとめて実行します（DoD の確認用）

##@ Wiki

# Wiki は <リポジトリ>.wiki.git という別リポジトリです。`.wiki/` に clone して
# 通常の Markdown として編集します。運用ルールは .github/guides/WIKI.md を参照してください。

# コミットメッセージは環境変数で渡します。$(value m) で make の再展開を止め、
# シェルへはクォートを解釈させずに渡すため（`$` や `"` を含むメッセージが壊れない）。
export WIKI_MESSAGE := $(value m)

.PHONY: wiki-sync
wiki-sync: ## Wiki を .wiki/ に clone / pull します
	@if [ -d .wiki/.git ]; then \
		git -C .wiki pull --ff-only; \
	else \
		if ! repo_url="$$(gh repo view --json url --jq .url)" || [ -z "$$repo_url" ]; then \
			echo "リポジトリの URL を取得できませんでした。gh auth status を確認してください。" >&2; \
			exit 1; \
		fi; \
		url="$$repo_url.wiki.git"; \
		if ! git ls-remote "$$url" >/dev/null 2>&1; then \
			echo "Wiki が未初期化です。GitHub の Wiki タブで最初のページ（Home）を作成してください。" >&2; \
			exit 1; \
		fi; \
		git clone "$$url" .wiki; \
	fi

.PHONY: wiki-push
wiki-push: ## Wiki の変更をコミットして push します（例: make wiki-push m="docs(wiki): ... #14"）
	@if [ -z "$$WIKI_MESSAGE" ]; then \
		echo 'コミットメッセージを指定してください（例: make wiki-push m="docs(wiki): 状態管理に Zustand を追加 #14"）' >&2; \
		exit 1; \
	fi; \
	if [ ! -d .wiki/.git ]; then \
		echo "先に make wiki-sync を実行してください。" >&2; \
		exit 1; \
	fi; \
	if [ -z "$$(git -C .wiki status --porcelain)" ]; then \
		echo "変更がありません。"; \
		exit 0; \
	fi; \
	git -C .wiki add -A && \
	git -C .wiki commit -m "$$WIKI_MESSAGE" && \
	git -C .wiki push
