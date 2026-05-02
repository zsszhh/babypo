FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 安装编译依赖并重新编译 sqlite3
RUN apk add --no-cache --virtual .build-deps g++ make python3 \
    && npm rebuild sqlite3 --build-from-source \
    && apk del .build-deps

EXPOSE 3000

CMD ["node", "src/index.js"]