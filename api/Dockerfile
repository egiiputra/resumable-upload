FROM node:22.14-slim

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

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]