# Dockerfile for the Fragments microservice (Lab 5)
# Builds a runnable image of our Node.js service.
# See: https://docs.docker.com/engine/reference/builder/

# 1) Base image (pin a version to match your local Node)
FROM node:20.19.5

# 2) Image metadata
LABEL maintainer="Janice Kang <jkanggj0330@gmail.com>"
LABEL description="Fragments node.js microservice"

# 3) Environment defaults (safe, non-secret)
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# 4) App working directory
WORKDIR /app

# 5) Install dependencies using only package files (leverages Docker cache)
COPY package*.json ./
RUN npm install

# 6) Copy source
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# (Optional) Document the container port
EXPOSE 8080

# 7) Default command: start the server
CMD npm start
