# Dockerfile for the Fragments microservice (Lab 5)
# Builds a runnable image of our Node.js service.
# See: https://docs.docker.com/engine/reference/builder/

# Base image (pin a version to match your local Node)
FROM node:20.19.5

# Smaller base, good defaults
FROM node:20-alpine

# Metadata
LABEL maintainer="Janice Kang <jkanggj0330@gmail.com>"
LABEL description="Fragments node.js microservice"

# App env (non-secrets)
ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Install only production dependencies using the lockfile
COPY package*.json ./
# If you have a package-lock.json, npm ci is fastest & reproducible
RUN npm ci --omit=dev

# Copy source and the htpasswd file (only that file, not the whole tests dir)
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Drop root for security
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 8080
CMD ["npm","start"]


