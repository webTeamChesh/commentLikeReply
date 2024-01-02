   
FROM node:18-alpine
LABEL org.opencontainers.image.source="https://github.com/<webTeamChesh>/<comment-like-reply>"
COPY . .
WORKDIR /app
EXPOSE 3001
RUN yarn install --production
CMD ["node", "index.js"]
