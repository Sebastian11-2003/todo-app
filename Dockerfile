# Gunakan image Node.js versi stabil
FROM node:18-alpine

# Tentukan folder kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu (agar cache efisien)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Salin semua file project ke container
COPY . .

# Expose port aplikasi
EXPOSE 3000

# Jalankan server.js
CMD ["node", "server.js"]
