FROM node:23-alpine3.21

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

RUN source /root/.shrc

RUN apt-get install -y postgresql-client