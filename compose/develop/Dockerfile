FROM node:18-alpine3.19

RUN apk update && \
    apk add --no-cache httpie && \
    npm install -g typescript nodemon ts-node@latest


WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install


COPY . .


EXPOSE 5500

CMD ["npm", "run", "dev"]
