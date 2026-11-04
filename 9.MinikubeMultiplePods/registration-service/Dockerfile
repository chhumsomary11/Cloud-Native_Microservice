#Note: Registration Service Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

ENV PORT=5001

EXPOSE 5001

USER node

CMD ["npm", "start"]