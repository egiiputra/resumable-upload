FROM node:22.14-slim AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install the application dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

RUN pnpm run build

# FOR PRODUCTION
FROM nginx:1.28-alpine3.21-slim AS prod

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80