FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=10000
EXPOSE 10000

CMD ["npm", "run", "start"]
