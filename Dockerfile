FROM node:24-alpine

WORKDIR /chatAppBackend

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]