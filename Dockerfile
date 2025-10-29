# Gunakan image Node.js versi terbaru
FROM node:18

# Tentukan folder kerja di dalam container
WORKDIR /app

# Salin semua file project ke dalam container
COPY . .

# Install semua dependency
RUN npm install

# Buka port 3000
EXPOSE 3000

# Jalankan server.js
CMD ["node", "server.js"]
