FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter backend...

COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/backend
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./package.json
# pnpm workspace: need root and package node_modules
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/backend/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
