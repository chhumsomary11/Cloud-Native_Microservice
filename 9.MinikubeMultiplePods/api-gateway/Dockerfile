FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY gateway.js ./

ENV PORT=4000

EXPOSE 4000

USER node

CMD ["npm", "start"]
