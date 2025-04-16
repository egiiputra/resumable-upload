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

# Build the NestJS application
RUN pnpm run build

# FOR PRODUCTION
FROM node:22.14-slim AS prod

# Set the working directory inside the container
WORKDIR /usr/src/app

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY --from=build /usr/src/app/package*.json .
COPY --from=build /usr/src/app/pnpm-lock.yaml .

COPY --from=build /usr/src/app/dist /usr/src/app/dist
# Expose the application port
EXPOSE 3000

RUN pnpm install --prod

# Command to run the application
CMD ["node", "dist/main"]
