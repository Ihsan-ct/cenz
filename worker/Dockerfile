FROM node:22-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates curl openssl \
 && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp
WORKDIR /app
COPY worker/package.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npx prisma generate --schema=prisma/schema.prisma
COPY worker/index.mjs ./
CMD ["node", "index.mjs"]
