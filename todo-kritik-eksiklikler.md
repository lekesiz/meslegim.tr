# Meslegim.tr - Kritik Eksiklikler (A-Z Kontrol Sonrası)

**Tarih:** 19 Şubat 2026  
**Durum:** 🔴 ERKEN GELİŞTİRME AŞAMASI (~15% tamamlanmış)

---

## 🔴 P0 - BLOCKER (Hemen Yapılmalı)

### 1. Dashboard Sayfaları Tamamen Eksik
- [ ] `/dashboard/admin` sayfası oluştur
- [ ] `/dashboard/mentor` sayfası oluştur
- [ ] `/dashboard/student` sayfası oluştur
- [ ] Dashboard routing ekle (App.tsx)
- [ ] DashboardLayout'u kullan

### 2. Soru Bankası Boş
- [ ] Seed script oluştur (`drizzle/seed.ts`)
- [ ] 14-17 yaş grubu soruları ekle (Etap 1, 2, 3)
- [ ] 18-21 yaş grubu soruları ekle (Etap 1, 2, 3)
- [ ] 22-24 yaş grubu soruları ekle (Etap 1, 2, 3)
- [ ] Seed script'i çalıştır

### 3. Etap Tanımları Boş
- [ ] 14-17 yaş grubu etapları tanımla
- [ ] 18-21 yaş grubu etapları tanımla
- [ ] 22-24 yaş grubu etapları tanımla
- [ ] Seed script'e ekle

### 4. Student submitStage Tamamlanmamış
- [ ] Tüm required soruların cevaplanıp cevaplanmadığını kontrol et
- [ ] Stage'i completed olarak işaretle
- [ ] completedAt timestamp'i güncelle
- [ ] Rapor oluşturma tetikle
- [ ] 7 gün sonra sonraki etap aktivasyonunu planla

### 5. Rapor Oluşturma Sistemi Yok
- [ ] `/server/lib/manus-report.ts` helper oluştur
- [ ] Manus AI API entegrasyonu yap
- [ ] Stage report generation fonksiyonu
- [ ] Final report generation fonksiyonu
- [ ] PDF'i Vercel Blob Storage'a kaydet
- [ ] reports tablosuna kaydet

---

## ⚠️ P1 - HIGH PRIORITY

### 6. E-posta Bildirim Sistemi Yok
- [ ] Resend API konfigürasyonu (`/server/lib/email.ts`)
- [ ] E-posta template'leri oluştur (Türkçe)
- [ ] Yeni etap aktivasyonu bildirimi
- [ ] Rapor hazır bildirimi
- [ ] Öğrenci onaylandı bildirimi

### 7. Otomatik Etap Aktivasyonu Yok
- [ ] Cron job sistemi kur
- [ ] 7 gün kontrolü implement et
- [ ] `userStages.status` güncelle (locked → active)
- [ ] `userStages.unlockedAt` kaydet
- [ ] `system.checkAndActivateStages` endpoint

### 8. Admin CRUD Endpoints Eksik
- [ ] `admin.createQuestion` endpoint
- [ ] `admin.updateQuestion` endpoint
- [ ] `admin.deleteQuestion` endpoint
- [ ] `admin.createStage` endpoint
- [ ] `admin.updateStage` endpoint
- [ ] `admin.deleteStage` endpoint

### 9. Admin Panel UI Eksik
- [ ] Kullanıcı listesi ve filtreleme
- [ ] Mentor atama interface'i
- [ ] Soru CRUD interface'i
- [ ] Etap CRUD interface'i
- [ ] Sistem istatistikleri dashboard

### 10. Mentor Panel UI Eksik
- [ ] Bekleyen başvurular listesi
- [ ] Öğrenci aktivasyon butonu
- [ ] Atanmış öğrenciler listesi
- [ ] Öğrenci detay sayfası
- [ ] Rapor onaylama interface'i
- [ ] Manuel öğrenci ekleme formu

### 11. Student Panel UI Eksik
- [ ] İlerleme göstergesi (progress bar)
- [ ] Etap formu sayfası
- [ ] Multiple choice soru component'i
- [ ] Likert scale soru component'i
- [ ] Ranking soru component'i
- [ ] Text input soru component'i
- [ ] Cevap kaydetme butonu
- [ ] Etap tamamlama butonu
- [ ] Rapor görüntüleme sayfası
- [ ] Profil yönetimi sayfası

---

## 🟡 P2 - MEDIUM PRIORITY

### 12. Unit Test Coverage Düşük
- [ ] Admin procedures testleri
- [ ] Mentor procedures testleri
- [ ] Student procedures testleri
- [ ] Report generator testleri
- [ ] Email sender testleri
- [ ] Cron job testleri
- [ ] Coverage %80'e çıkar

### 13. Bundle Size Optimizasyonu
- [ ] Code-splitting ekle
- [ ] Lazy loading implement et
- [ ] Tree-shaking optimize et
- [ ] 869 kB → 400 kB hedef

### 14. Database Optimizasyonu
- [ ] Foreign key constraints ekle
- [ ] Index'leri optimize et
- [ ] Query performance test

---

## 🟢 P3 - LOW PRIORITY

### 15. UI/UX İyileştirmeleri
- [ ] Responsive design test (mobil/tablet)
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Loading states ve skeletons
- [ ] Error handling ve toast notifications
- [ ] Empty states

### 16. Accessibility ve Performance
- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse score 90+
- [ ] SEO optimization
- [ ] Meta tags

---

## TAHMİNİ SÜRE

- **P0 Blocker:** 5-6 iş günü
- **P1 High Priority:** 3-4 iş günü
- **P2 Medium Priority:** 2 iş günü
- **P3 Low Priority:** 1 iş günü

**TOPLAM:** 11-13 iş günü

---

## ÖNCELİK SIRASI

1. **Gün 1-2:** Seed data + Dashboard sayfaları (skeleton)
2. **Gün 3-4:** Student panel + Form components
3. **Gün 5:** Mentor panel + Admin panel (temel)
4. **Gün 6:** submitStage + Rapor sistemi
5. **Gün 7:** E-posta + Otomatik aktivasyon
6. **Gün 8-9:** Admin CRUD + UI polish
7. **Gün 10-11:** Testing + Optimization
8. **Gün 12:** Final test + Deployment

---

## NOT

Bu liste, A-Z kontrol sonrası tespit edilen **kritik eksiklikleri** içermektedir. 
Mevcut todo.md ile birlikte kullanılmalıdır.
