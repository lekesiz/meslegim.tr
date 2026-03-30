# Meslegim.tr - A-Z Kapsamlı Proje İncelemesi (30 Mart 2026)

## Proje Ekip Analizi

Bu projenin normal şartlarda geliştirilmesi için gereken minimum ekip:

| Rol | Sayı | Uzmanlık Alanları |
|-----|------|-------------------|
| Backend Mühendisi | 1 | Node.js, Express, tRPC, MySQL, Stripe, güvenlik |
| Frontend Mühendisi | 1 | React, Tailwind CSS, UI/UX, erişilebilirlik |
| QA Mühendisi | 1 | Test stratejisi, otomasyon, edge case analizi |
| Güvenlik Uzmanı | 0.5 | Auth, XSS, CSRF, veri koruma, KVKK |
| İçerik/SEO Uzmanı | 0.5 | Türkçe içerik, meta etiketler, SEO optimizasyonu |
| Proje Yöneticisi | 0.5 | Scrum, iletişim, timeline yönetimi |

Toplam: 4-5 kişilik ekip

---

## 1. Backend Mühendisi İncelemesi

### Olumlu Bulgular
- 25 protectedProcedure, 12 publicProcedure - iyi ayrım
- 135 zod validasyonu - input doğrulama kapsamlı
- 51 TRPCError - hata yönetimi mevcut
- Veritabanı indeksleri kapsamlı
- Rate limiting mevcut (global + auth)
- Helmet + CSP yapılandırması
- bcrypt şifre hashleme
- Stripe webhook imza doğrulaması

### Kritik Sorunlar

#### 1.1 Transaction Kullanımı YOK
- Stripe webhook'ta purchase + user güncelleme ayrı sorgular
- Race condition riski

#### 1.2 Paket Bazlı Etap Kilitleme EKSİK
- PACKAGE_ACCESS tanımlı ama kullanılmıyor
- Ödeme sonrası etap açma otomatik değil

#### 1.3 Stripe Instance Her Çağrıda Yeniden Oluşturuluyor

#### 1.4 N+1 Sorgu Riski
- getMyRIASECProfile: for döngüsünde her stage için ayrı sorgu

#### 1.5 Router Dosyası Çok Büyük (2011 satır)

### Orta Seviye
- JWT Session süresi 1 yıl (çok uzun)
- Debug log'lar production'da
- Pagination tutarsızlığı

---

## Yapılacaklar (Öncelik Sırasına Göre)

1. [KRİTİK] Paket bazlı etap kilitleme backend + frontend
2. [KRİTİK] Admin ödeme yönetimi paneli
3. [YÜKSEK] Ödeme başarı bildirimi
4. [YÜKSEK] Stripe singleton pattern
5. [ORTA] N+1 sorgu optimizasyonu
6. [DÜŞÜK] Debug log'ları temizle
