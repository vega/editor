FROM node:13

# Informs Docker that the container listens on the specified port at runtime
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# Fetch updated list of packages and upgrade operating system for next step (install rsync)
RUN apt-get update && apt-get upgrade -y

# Install rsync as it is a dependency of ./scripts/vendor.sh
RUN apt-get -y install rsync

# Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile
# https://docs.docker.com/engine/reference/builder/#workdir
WORKDIR /usr/src/app

# Copies the package.json and yarn.lock files first to ensure the cache is only invalidated when these files change
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/#creating-a-dockerfile
COPY package.json yarn.lock ./

# For this project, additional files must also be copied as yarn hooks depend on them
COPY scripts ./scripts

# Remove 'r' characters from the vendor script (otherwise it won't execute)
RUN sed $'s/\r$//' ./scripts/vendor.sh > ./scripts/vendor.sh

# Copy remaining files
COPY . .

# Run Yarn
RUN yarn

# Sets the container executable (ENTRYPOINT) as yarn and the default argument (CMD) as start
# https://docs.docker.com/engine/reference/builder/#entrypoint
# https://docs.docker.com/engine/reference/builder/#cmd
ENTRYPOINT ["yarn"]
CMD ["start"]
