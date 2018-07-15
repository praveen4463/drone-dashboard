FROM node:10
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . /app

EXPOSE 2999

CMD npm start