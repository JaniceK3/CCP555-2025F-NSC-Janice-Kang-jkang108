FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS test
COPY . .
RUN npm run lint && npm test
RUN npm prune --omit=dev

FROM node:20-alpine AS production

LABEL maintainer="Janice Kang <jkanggj0330@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

COPY --from=test /app/package*.json ./
COPY --from=test /app/node_modules ./node_modules
COPY --from=test /app/src ./src
COPY --from=test /app/tests/.htpasswd ./tests/.htpasswd

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 8080
CMD ["npm","start"]

