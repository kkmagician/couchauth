FROM node

RUN mkdir ui
COPY ["ui/package.json", "ui"]
WORKDIR /ui
RUN npm install

COPY ["ui/", "/ui"]
RUN mkdir server
COPY ["server/package.json", "/ui/server"]

WORKDIR /ui/server
RUN npm install

WORKDIR /ui
RUN npm run build; mv dist server

COPY ["server", "/ui/server"]
WORKDIR /ui/server
CMD ["node", "index.js"]