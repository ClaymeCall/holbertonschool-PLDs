# --- Build client (Node officiel) ---
FROM node:20-bookworm AS client-build
WORKDIR /opt/platform

COPY private/platform/package.json private/platform/package-lock.json ./
RUN npm ci --omit=dev

COPY private/platform/client/package.json private/platform/client/package-lock.json ./client/
RUN npm --prefix client ci

COPY private/platform/client ./client
RUN npm --prefix client run build

# --- Runtime JDK + Node (serveur Express + javac/java) ---
FROM eclipse-temurin:21-jdk-jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/platform

COPY private/platform/package.json private/platform/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=client-build /opt/platform/client/dist ./client/dist
COPY private/platform/server ./server

ENV NODE_ENV=production
ENV PORT=8080
ENV ARENA_WORK=/arena/work
ENV ARENA_PRIVATE=/arena/private
ENV CLIENT_DIST=/opt/platform/client/dist

EXPOSE 8080

CMD ["node", "server/index.js"]
