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
FROM node:22.14-slim AS prod

WORKDIR /usr/src/app

RUN npm i -g serve

COPY --from=build /usr/src/app/dist ./dist

CMD ["serve", "-s", "dist", "-l", "80"]
