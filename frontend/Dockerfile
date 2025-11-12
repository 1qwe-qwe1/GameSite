FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Создать необходимые файлы
RUN mkdir -p src public

# Запустить сборку CSS
RUN npm run build:css

EXPOSE 3000

CMD ["npm", "start"]