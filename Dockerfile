FROM node:20-alpine

# Kurulum için gerekli sistem paketleri
RUN apk add --no-cache libc6-compat

# Çalışma dizinini ayarla
WORKDIR /app

# Paket yöneticisini aktifleştir
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Bağımlılık dosyalarını kopyala
COPY package.json pnpm-lock.yaml ./

# Bağımlılıkları yükle (sadece prod için değil, build aşaması için tüm dependency'ler)
RUN pnpm install --frozen-lockfile

# Uygulama kodlarını kopyala
COPY . .

# Projeyi derle (Vite frontend + esbuild backend)
RUN pnpm build

# Sadece production ortamı için gerekli dosyaları barındırmak adına
ENV NODE_ENV=production

# Drizzle migration komutunu başlatmadan önce çalıştırabiliriz ancak render vb ortamlar için start scripti yeterli.
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
