FROM node
EXPOSE 8080
RUN apt-get update && apt-get install -y rsync && rm -rf /var/lib/apt/lists/*
RUN npm install --global yarn
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY data ./data
COPY public ./public
COPY scripts ./scripts
RUN yarn
COPY . .
ENTRYPOINT ["yarn"]
CMD ["start"]