.DEFAULT_GOAL := help

##@ ヘルプ

.PHONY: help
help: ## タスク一覧を表示します
	@awk 'BEGIN { FS = ":.*##" } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
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
dev: ## 開発サーバーを起動します
	pnpm dev

.PHONY: build
build: ## プロジェクトをビルドします
	pnpm build

##@ データベース

# DB の構造は Prisma が正本です（hasura/README.md の役割分担を参照）。
# Hasura 側はメタデータのみを管理するため、テーブル定義の変更は必ず Prisma から流します。

.PHONY: db-push
db-push: ## Prisma スキーマを DB に反映します
	pnpm --filter @memo-app/api exec prisma db push

.PHONY: db-seed
db-seed: ## SCR-001 の動作確認用データを投入します（既存の dummy を全削除します）
	docker compose exec -T postgres psql -U user -d memo -q < apps/api/prisma/seed.sql

##@ 品質

.PHONY: lint
lint: ## 静的解析を実行します
	pnpm lint

.PHONY: format
format: ## コードを整形します
	pnpm format

.PHONY: format-check
format-check: ## 整形崩れがないかを確認します（書き換えません）
	pnpm format:check

.PHONY: test
test: ## テストを実行します
	pnpm test

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
