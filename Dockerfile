# Gunakan Node.js versi stabil
FROM node:18

# Tentukan folder kerja
WORKDIR /app

# Salin file project
COPY . .

# Install dependency
RUN npm install

# Expose port
EXPOSE 3000

# Jalankan app
CMD ["node", "server.js"]
