# Stage 1: Build, Lint & Test
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run lint
RUN npm run test

# Stage 2: Production Runtime Environment
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY index.js ./
COPY public/ ./public/
COPY routes/ ./routes/
COPY utils/ ./utils/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
