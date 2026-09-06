# syntax=docker/dockerfile:1
#
# @memo-app/api（NestJS）の OCI イメージ。
# **ビルドコンテキストはリポジトリのルート**である（apps/api ではない）。
#   docker build -f apps/api/Dockerfile -t memo-app-api .
#
# apps/api 単体をコピーしても動かない。pnpm workspace の Catalogs（catalog:backend）は
# ルートの pnpm-lock.yaml 経由でしか解決できないため、ルートのマニフェストが要る。
# → project/plan/deploy/findings.md の 2

# ---- 共通の土台 --------------------------------------------------------------
# ビルド段と実行段で同じイメージを使う。Prisma のクエリエンジンは OS / libc に依存し、
# Alpine（musl）と Debian（glibc）で別バイナリになるため、揃えないと
# 「生成したエンジンが実行段で動かない」事故になる。
FROM node:24-bookworm-slim AS base
# Prisma のクエリエンジンが OpenSSL を要求する。-slim には入っていない。
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- 依存解決 ----------------------------------------------------------------
FROM base AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# pnpm のバージョンはルート package.json の packageManager が正本。corepack がそれを読む。
RUN corepack enable

# --frozen-lockfile はロックファイルの importers と実際の package.json の一致を検証するため、
# ビルド対象でないパッケージのマニフェストも要る。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/desktop/package.json apps/desktop/
COPY apps/mobile/package.json apps/mobile/
COPY apps/web/package.json apps/web/
COPY packages/graphql/package.json packages/graphql/

# apps/api の postinstall は prisma generate なので、install より前にスキーマを置く。
COPY apps/api/prisma apps/api/prisma
# schema.prisma の erd ジェネレータが docs/er-diagram.md へ書き出す。親ディレクトリが必要。
RUN mkdir -p docs

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --filter @memo-app/api

# ---- ビルド ------------------------------------------------------------------
FROM deps AS builder
COPY apps/api apps/api
RUN pnpm --filter @memo-app/api build

# 実行段に渡す「本番依存だけ」のツリーを作る。pnpm deploy はシンボリックリンクを
# 実体化した自己完結の node_modules を吐くため、そのままコピーできる。
#
# --ignore-scripts なのは、apps/api の postinstall（prisma generate）が prisma CLI を
# 要求するのに対し、CLI は devDependency で --prod では入らないため。生成は次の RUN で行う。
#
# --no-optional は @prisma/client の optionalDependencies（prisma CLI / typescript）を外すため。
# どちらも型生成にしか使わず、実行時には不要。typescript だけで 24MB ある。
RUN pnpm --filter @memo-app/api deploy --prod --no-optional --ignore-scripts /prod/api

# 実行段の node_modules に対して Prisma Client を生成する。schema.prisma の位置から
# 最も近い node_modules（/prod/api/node_modules）が出力先になるため、
# ビルド段の devDependencies を実行段へ持ち込まずに済む。
# --generator client で erd ジェネレータ（devDependency）を対象から外す。
RUN cd apps/api \
  && pnpm exec prisma generate --schema=/prod/api/prisma/schema.prisma --generator client

# ---- 実行 --------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
# main.ts が process.env.PORT を読む。PaaS が注入する値にそのまま追随する。
ENV PORT=3001

# node_modules は deploy が作った本番依存だけのツリー。devDependencies は入っていない。
COPY --from=builder --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/api/package.json ./package.json
# マイグレーション経路（prisma db push など）を実行できるようスキーマは残す。
COPY --from=builder --chown=node:node /prod/api/prisma ./prisma
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist

# DATABASE_URL / HASURA_ACTION_SECRET は実行時に環境変数で渡す。イメージに焼き込まない。
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
