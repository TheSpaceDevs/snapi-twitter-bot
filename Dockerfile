FROM node:lts-alpine
LABEL org.opencontainers.image.source https://github.com/spaceflightnewsapi/snapi-twitter-bot

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
