FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3020

# Запускаем сборку и preview на порту 3020
CMD ["npm", "run", "docker-start"]
