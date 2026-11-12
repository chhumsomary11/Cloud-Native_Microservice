FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY gateway.js ./
ENV NODE_ENV=production
EXPOSE 4000
USER node
CMD ["npm", "start"]
