FROM node:10

# Informs Docker that the container listens on the specified port at runtime
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# Install rsync as it is a dependency of ./scripts/vendor.sh
RUN apt-get update && \
    apt-get install -y rsync && \
    rm -rf /var/lib/apt/lists/*

# Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile
# https://docs.docker.com/engine/reference/builder/#workdir
WORKDIR /usr/src/app

# Copies the package.json and yarn.lock files first to ensure the cache is only invalidated when these files change
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/#creating-a-dockerfile
COPY package.json yarn.lock ./

# For this project, additional files must also be copied as yarn hooks depend on them
COPY data ./data
COPY public ./public
COPY scripts ./scripts

RUN yarn

# Copy remaining files
COPY . .

# Sets the entrypoint to yarn and the default command to start
ENTRYPOINT ["yarn"]
CMD ["start"]