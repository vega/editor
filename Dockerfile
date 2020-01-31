FROM node:12

# Informs Docker that the container listens on the specified port at runtime
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# Fetch updated list of packages and upgrade operating system for next step (install rsync)
RUN apt-get update && apt-get upgrade -y

# Install rsync as it is a dependency of ./scripts/vendor.sh
RUN apt-get -y install rsync

# Install dos2unix to remove 'r' characters from scripts
RUN apt-get install dos2unix

# Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile
# https://docs.docker.com/engine/reference/builder/#workdir
WORKDIR /usr/src/app

# Copy all files
COPY . .

# Remove 'r' characters from the scripts (otherwise it won't execute)
RUN dos2unix ./scripts/generate-example-images.sh ./scripts/vendor.sh ./scripts/version.sh

# Run Yarn
RUN yarn

# Sets the container executable (ENTRYPOINT) as yarn and the default argument (CMD) as start
# https://docs.docker.com/engine/reference/builder/#entrypoint
# https://docs.docker.com/engine/reference/builder/#cmd
ENTRYPOINT ["yarn"]
CMD ["start"]
