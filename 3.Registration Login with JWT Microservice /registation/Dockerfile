#Note: Registration Service Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

ENV PORT=5001

EXPOSE 3000

USER node

CMD ["npm", "start"]