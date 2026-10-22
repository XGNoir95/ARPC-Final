FROM node:24-alpine
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY Backend/src ./src
COPY Backend/scripts ./scripts
COPY Frontend/src/data /app/Frontend/src/data
COPY Frontend/package.json /app/Frontend/package.json
RUN mkdir /app/uploads && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
