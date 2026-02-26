# Meslegim.tr - Kapsamlı A-Z Kullanıcı Simülasyon Test Planı

**Test Tarihi:** 26 Şubat 2026  
**Test Eden:** Manus AI Agent  
**Amaç:** Tüm kullanıcı tiplerinin (Admin, Mentor, Öğrenci) tüm akışlarını gerçek kullanıcı gibi test etmek ve sorunları tespit etmek

---

## 📋 Test Senaryoları

### 1. ADMIN AKILARI

#### 1.1 Login ve Dashboard
- [ ] Admin hesabıyla giriş yap (mikaillekesiz@gmail.com)
- [ ] Dashboard yüklenme kontrolü
- [ ] İstatistik kartları doğruluğu
- [ ] Grafikler render kontrolü

#### 1.2 Kullanıcı Yönetimi
- [ ] Kullanıcı Yönetimi tab'ına git
- [ ] Kullanıcı listesi yüklenme kontrolü
- [ ] Kullanıcı düzenleme modal'ı aç
- [ ] Rol değiştirme testi
- [ ] Status güncelleme testi
- [ ] Mentor atama testi

#### 1.3 Öğrenci Yönetimi
- [ ] Öğrenciler tab'ına git
- [ ] Öğrenci listesi görüntüleme
- [ ] Öğrenci detayları görüntüleme
- [ ] Öğrenci filtreleme (yaş grubu, status)

#### 1.4 Mentor Yönetimi
- [ ] Mentorlar tab'ına git
- [ ] Mentor listesi görüntüleme
- [ ] Mentor detayları görüntüleme

#### 1.5 Rapor Yönetimi
- [ ] Raporlar tab'ına git
- [ ] Rapor listesi görüntüleme
- [ ] Rapor detayları görüntüleme

#### 1.6 Etap ve Soru Yönetimi
- [ ] Etaplar tab'ına git (9 etap kontrolü)
- [ ] Sorular tab'ına git (180 soru kontrolü)
- [ ] Yaş gruplarına göre soru dağılımı kontrolü

#### 1.7 Toplu İşlemler
- [ ] Toplu İşlemler tab'ına git
- [ ] CSV export testi

#### 1.8 Mentor Karşılaştırma
- [ ] Mentor Karşılaştırma tab'ına git
- [ ] Top Performers kartları kontrolü
- [ ] Performans karşılaştırma chart kontrolü
- [ ] Detaylı mentor tablosu kontrolü

#### 1.9 Feedback Özeti
- [ ] Feedback Özeti tab'ına git
- [ ] Platform geneli istatistikler kontrolü
- [ ] Mentor feedback chart kontrolü
- [ ] Son feedbackler listesi kontrolü

---

### 2. MENTOR AKILARI

#### 2.1 Login ve Dashboard
- [ ] Mentor hesabıyla giriş yap (mentor@test.com)
- [ ] Dashboard yüklenme kontrolü
- [ ] İstatistik kartları doğruluğu

#### 2.2 Bekleyen Onaylar
- [ ] Bekleyen Onaylar tab'ına git
- [ ] Pending students listesi görüntüleme
- [ ] Öğrenci aktivasyon butonu testi
- [ ] Aktivasyon sonrası email gönderimi kontrolü

#### 2.3 Öğrenci Takibi
- [ ] Aktif öğrenciler listesi görüntüleme
- [ ] Öğrenci detayları görüntüleme
- [ ] Öğrenci ilerleme takibi

#### 2.4 Rapor Onaylama
- [ ] Bekleyen raporlar listesi görüntüleme
- [ ] Rapor detayları görüntüleme
- [ ] Rapor onaylama testi
- [ ] Rapor reddetme testi
- [ ] Email gönderimi kontrolü

#### 2.5 Performans Trendi
- [ ] Performans Trendi tab'ına git
- [ ] Öğrenci büyümesi chart kontrolü
- [ ] Rapor onaylama hızı chart kontrolü
- [ ] Etap tamamlama trendi chart kontrolü

#### 2.6 Geri Bildirimler
- [ ] Geri Bildirimler tab'ına git
- [ ] Feedback istatistikleri kontrolü
- [ ] Feedback listesi görüntüleme
- [ ] Puan dağılımı chart kontrolü

---

### 3. ÖĞRENCİ AKILARI

#### 3.1 Login ve Dashboard
- [ ] Öğrenci hesabıyla giriş yap (test@student.com)
- [ ] Dashboard yüklenme kontrolü
- [ ] İlerleme çubuğu kontrolü
- [ ] Etap kartları görüntüleme

#### 3.2 Etap Tamamlama
- [ ] Aktif etap kartına tıkla
- [ ] Soru sayfası yüklenme kontrolü
- [ ] Sorular arası navigasyon
- [ ] Cevap kaydetme testi
- [ ] Etap tamamlama testi
- [ ] Rapor oluşturma testi

#### 3.3 Rapor Görüntüleme
- [ ] Raporlarım sayfasına git
- [ ] Rapor listesi görüntüleme
- [ ] Rapor detayları görüntüleme
- [ ] Rapor status kontrolü (pending, approved, rejected)

#### 3.4 Feedback Verme
- [ ] Onaylanmış rapor sayfasına git
- [ ] Feedback formu görüntüleme
- [ ] Feedback gönderme testi
- [ ] Başarı mesajı kontrolü

#### 3.5 Sertifika
- [ ] Tüm etaplar tamamlandıktan sonra sertifika kartı görüntüleme
- [ ] Sertifika oluşturma butonu testi
- [ ] PDF sertifika indirme testi
- [ ] QR kod kontrolü
- [ ] Email gönderimi kontrolü

---

## 🔍 Responsive Design Kontrol

### Mobil (375px)
- [ ] Ana sayfa görünümü
- [ ] Login sayfası görünümü
- [ ] Dashboard görünümü
- [ ] Navigation menü (hamburger) kontrolü
- [ ] Grafikler responsive kontrolü
- [ ] Tablolar responsive kontrolü

### Tablet (768px)
- [ ] Ana sayfa görünümü
- [ ] Dashboard görünümü
- [ ] Grafikler görünümü
- [ ] Tablolar görünümü

---

## ⚠️ Error Handling Kontrol

- [ ] Geçersiz login bilgileri testi
- [ ] Yetkisiz sayfa erişimi testi
- [ ] API hata mesajları kontrolü
- [ ] Toast notifications kontrolü
- [ ] Form validation mesajları kontrolü

---

## ⏳ Loading States Kontrol

- [ ] Dashboard loading skeleton
- [ ] Tablo loading states
- [ ] Grafik loading states
- [ ] Button loading states (mutation sırasında)
- [ ] Page transition loading

---

## 📊 Test Sonuçları

### Tespit Edilen Sorunlar
(Test sırasında tespit edilen sorunlar buraya eklenecek)

### Başarılı Testler
(Başarıyla geçen testler buraya eklenecek)

---

**Test Durumu:** 🟡 Devam Ediyor
