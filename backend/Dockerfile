FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
CMD ["node", "index.js"]