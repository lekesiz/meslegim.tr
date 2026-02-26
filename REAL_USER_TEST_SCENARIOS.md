# Meslegim.tr - Gerçek Kullanıcı Test Senaryoları

**Test Tarihi:** 26 Şubat 2026  
**Test Eden:** Manus AI Agent  
**Amaç:** Production ortamında gerçek kullanıcı akışlarını simüle etmek

---

## TEST KULLANICILARI

### 1. Öğrenci Kullanıcıları
- **test.ogrenci1@gmail.com** (14-17 yaş grubu) - Yeni kayıt
- **test.ogrenci2@gmail.com** (18-21 yaş grubu) - Yeni kayıt
- **test.ogrenci3@gmail.com** (22-24 yaş grubu) - Yeni kayıt

### 2. Mentor Kullanıcısı
- **test.mentor@gmail.com** - Öğrenci aktivasyonu ve rapor onaylama

### 3. Admin Kullanıcısı
- **mikaillekesiz@gmail.com** - MEVCUT (sistem yönetimi)

---

## TEST SENARYOLARI

### SENARYO 1: Yeni Öğrenci Kaydı ve İlk Etap (14-17 Yaş)
**Kullanıcı:** test.ogrenci1@gmail.com  
**Adımlar:**
1. Ana sayfaya git
2. "Ücretsiz Başla" butonuna tıkla
3. Kayıt formunu doldur (14-17 yaş grubu seç)
4. KVKK onayı ver
5. Kayıt ol
6. Mentor onayını bekle (email kontrolü)
7. Mentor onayından sonra giriş yap
8. Etap 1 sorularını yanıtla (20 soru)
9. Etap 1'i tamamla
10. Rapor oluşturulmasını bekle

**Beklenen Sonuç:**
- Kayıt başarılı
- Email bildirimi gönderildi
- Mentor onayı bekleniyor statüsü
- Etap 1 soruları görünüyor (14-17 yaş grubuna özel)

---

### SENARYO 2: Mentor - Öğrenci Aktivasyonu ve Rapor Onaylama
**Kullanıcı:** test.mentor@gmail.com  
**Adımlar:**
1. Giriş yap
2. "Bekleyen Onaylar" tab'ına git
3. test.ogrenci1@gmail.com kullanıcısını görüntüle
4. "Aktif Et" butonuna tıkla
5. Öğrenciye email gönderildiğini doğrula
6. "Raporlar" tab'ına git
7. test.ogrenci1'in raporunu görüntüle
8. Raporu onayla veya reddet
9. Yorum ekle
10. Öğrenciye bildirim gönderildiğini doğrula

**Beklenen Sonuç:**
- Öğrenci başarıyla aktif edildi
- Email bildirimi gönderildi
- Rapor onaylandı
- Öğrenci bir sonraki etaba geçti

---

### SENARYO 3: Öğrenci - Tüm Etapları Tamamlama ve Sertifika Alma
**Kullanıcı:** test.ogrenci1@gmail.com  
**Adımlar:**
1. Giriş yap
2. Etap 2'yi tamamla (20 soru)
3. Rapor onayını bekle
4. Etap 3'ü tamamla (20 soru)
5. Final rapor onayını bekle
6. Dashboard'da "Sertifika Oluştur" butonunu gör
7. Sertifika oluştur
8. PDF sertifikayı indir
9. QR kod ile sertifika doğrulamasını test et

**Beklenen Sonuç:**
- 3 etap başarıyla tamamlandı
- Her etap sonrası email bildirimi geldi
- Sertifika başarıyla oluşturuldu
- PDF indirme çalıştı
- QR kod doğrulama sayfası çalıştı

---

### SENARYO 4: Öğrenci - Mentor'a Feedback Verme
**Kullanıcı:** test.ogrenci1@gmail.com  
**Adımlar:**
1. Dashboard'a git
2. Son onaylanan raporu görüntüle
3. Rapor sayfasında feedback formu gör
4. 5 yıldız ver
5. Yorum yaz
6. Feedback gönder
7. Başarı mesajını gör

**Beklenen Sonuç:**
- Feedback formu görünüyor
- Feedback başarıyla gönderildi
- Toast notification gösterildi

---

### SENARYO 5: Mentor - Feedback İstatistiklerini Görüntüleme
**Kullanıcı:** test.mentor@gmail.com  
**Adımlar:**
1. Giriş yap
2. "Geri Bildirimler" tab'ına git
3. Ortalama puanı gör
4. Puan dağılımı chart'ını gör
5. Son yorumları oku

**Beklenen Sonuç:**
- Feedback istatistikleri görünüyor
- Chart doğru render ediliyor
- Yorumlar listeleniyor

---

### SENARYO 6: Admin - Kullanıcı Yönetimi
**Kullanıcı:** mikaillekesiz@gmail.com  
**Adımlar:**
1. Giriş yap
2. "Kullanıcı Yönetimi" tab'ına git
3. Tüm kullanıcıları gör (filtrele: Öğrenci, Mentor, Admin)
4. Bir kullanıcıyı düzenle (rol değiştir)
5. Değişiklikleri kaydet
6. Başarı mesajını gör

**Beklenen Sonuç:**
- Kullanıcı listesi görünüyor
- Filtreleme çalışıyor
- Düzenleme başarılı
- Toast notification gösterildi

---

### SENARYO 7: Admin - Mentor Karşılaştırma Raporu
**Kullanıcı:** mikaillekesiz@gmail.com  
**Adımlar:**
1. Giriş yap
2. "Mentor Karşılaştırma" tab'ına git
3. Top Performers kartlarını gör
4. Performans karşılaştırma chart'ını gör
5. Detaylı tablo'yu gör

**Beklenen Sonuç:**
- İstatistikler doğru
- Chart render ediliyor
- Tablo tüm mentorları gösteriyor

---

### SENARYO 8: Admin - Feedback Özeti
**Kullanıcı:** mikaillekesiz@gmail.com  
**Adımlar:**
1. Giriş yap
2. "Feedback Özeti" tab'ına git
3. Platform geneli istatistikleri gör
4. Mentor feedback chart'ını gör
5. Detaylı feedback tablosunu gör

**Beklenen Sonuç:**
- Platform istatistikleri görünüyor
- Chart render ediliyor
- Tablo tüm feedback'leri gösteriyor

---

## TEST SONUÇLARI

### Başarılı Testler: ⏳ DEVAM EDİYOR...
### Başarısız Testler: ⏳ DEVAM EDİYOR...
### Tespit Edilen Sorunlar: ⏳ DEVAM EDİYOR...

