FROM node:16-alpine

RUN apk --no-cache -U upgrade
WORKDIR /app

COPY . .
RUN yarn install --production && yarn build

EXPOSE 80
CMD ["node", "build/src/index.js"]
