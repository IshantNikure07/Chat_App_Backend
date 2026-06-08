FROM node:24-alpine

WORKDIR /chatAppBackend

COPY package*.json .

RUN npm install

COPY . .

RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

EXPOSE 3000

# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]