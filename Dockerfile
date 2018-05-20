# Use image from latest npm with Long Time Support
FROM node:8.11.1

# Create dir for project
RUN mkdir /code

# Install global depedencies
RUN npm install -g gulp-cli

# Add dependecies file before code to prevent rebuilding
ADD package.json .

# Install all project dependecies
RUN npm install

ENV NODE_PATH=/node_modules/

# Change workdir
WORKDIR /code

# Add files to project
ADD . /code