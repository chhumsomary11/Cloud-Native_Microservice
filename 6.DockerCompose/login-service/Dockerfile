#Note: Login Service Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

ENV PORT=5002

EXPOSE 5002

USER node

CMD ["npm", "start"]