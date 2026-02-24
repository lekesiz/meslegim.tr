# Email Domain Doğrulama Rehberi - Resend

Bu rehber, Meslegim.tr platformunun production email gönderimini aktifleştirmek için Resend'de domain doğrulamasının nasıl yapılacağını açıklar.

---

## 📋 Gereksinimler

- Resend hesabı (https://resend.com)
- meslegim.tr domain'ine DNS erişimi
- Domain registrar (GoDaddy, Namecheap, CloudFlare vb.) admin paneli erişimi

---

## 🚀 Adım Adım Kurulum

### 1. Resend Dashboard'a Giriş

1. https://resend.com adresine gidin
2. Hesabınızla giriş yapın
3. Sol menüden **"Domains"** sekmesine tıklayın

### 2. Domain Ekleme

1. **"Add Domain"** butonuna tıklayın
2. Domain adını girin: `meslegim.tr`
3. **"Add"** butonuna tıklayın

### 3. DNS Kayıtlarını Alma

Resend, domain doğrulaması için aşağıdaki DNS kayıtlarını sağlayacaktır:

#### SPF Kaydı (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### DKIM Kaydı (TXT)
```
Type: TXT
Name: resend._domainkey
Value: [Resend tarafından sağlanan unique değer]
TTL: 3600
```

#### DMARC Kaydı (TXT) - Opsiyonel ama önerilir
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@meslegim.tr
TTL: 3600
```

### 4. DNS Kayıtlarını Domain Registrar'a Ekleme

#### GoDaddy için:
1. GoDaddy hesabınıza giriş yapın
2. **"My Products"** > **"Domains"** > **"meslegim.tr"** > **"DNS"**
3. **"Add"** butonuna tıklayın
4. Yukarıdaki DNS kayıtlarını tek tek ekleyin

#### Namecheap için:
1. Namecheap hesabınıza giriş yapın
2. **"Domain List"** > **"meslegim.tr"** > **"Advanced DNS"**
3. **"Add New Record"** butonuna tıklayın
4. Yukarıdaki DNS kayıtlarını tek tek ekleyin

#### CloudFlare için:
1. CloudFlare dashboard'a giriş yapın
2. **"meslegim.tr"** domain'ini seçin
3. **"DNS"** sekmesine gidin
4. **"Add record"** butonuna tıklayın
5. Yukarıdaki DNS kayıtlarını tek tek ekleyin

### 5. DNS Propagation Bekleme

- DNS değişikliklerinin yayılması **15 dakika ile 48 saat** arasında sürebilir
- Genellikle 1-2 saat içinde tamamlanır
- DNS propagation'ı kontrol etmek için: https://dnschecker.org

### 6. Domain Doğrulaması

1. Resend dashboard'da **"Domains"** sekmesine dönün
2. **"meslegim.tr"** domain'inin yanındaki **"Verify"** butonuna tıklayın
3. Doğrulama başarılı olursa, domain durumu **"Verified"** olarak değişecek

---

## ✅ Doğrulama Kontrolü

Domain doğrulandıktan sonra, aşağıdaki komutlarla DNS kayıtlarını kontrol edebilirsiniz:

```bash
# SPF kaydını kontrol et
dig TXT meslegim.tr

# DKIM kaydını kontrol et
dig TXT resend._domainkey.meslegim.tr

# DMARC kaydını kontrol et
dig TXT _dmarc.meslegim.tr
```

---

## 📧 Test Email Gönderimi

Domain doğrulandıktan sonra, platformdan test email gönderin:

1. Mentor olarak giriş yapın
2. Bir öğrencinin etabını tamamlayın
3. Raporu onaylayın
4. Öğrencinin email adresini kontrol edin

**Beklenen Sonuç:** Öğrenci, "Raporunuz onaylandı!" konulu bir email almalıdır.

---

## 🔧 Sorun Giderme

### Domain doğrulanamıyor
- DNS kayıtlarının doğru eklendiğini kontrol edin
- TTL süresinin geçmesini bekleyin (genellikle 1 saat)
- DNS cache'i temizleyin: `sudo systemd-resolve --flush-caches`

### Email gönderilmiyor
- Resend API key'inin doğru olduğunu kontrol edin
- Backend log'larını kontrol edin: `pnpm logs`
- Resend dashboard'da email log'larını kontrol edin

### Email spam'e düşüyor
- DMARC kaydını ekleyin
- SPF ve DKIM kayıtlarının doğru olduğunu kontrol edin
- Email içeriğini spam filtrelerine uygun hale getirin

---

## 📊 Production Checklist

- [ ] Resend'de domain eklendi
- [ ] DNS kayıtları eklendi (SPF, DKIM, DMARC)
- [ ] DNS propagation tamamlandı
- [ ] Domain doğrulandı (Verified)
- [ ] Test email gönderildi ve alındı
- [ ] Email spam'e düşmüyor
- [ ] Backend'de RESEND_API_KEY environment variable set edildi

---

## 🔗 Faydalı Linkler

- Resend Documentation: https://resend.com/docs
- DNS Checker: https://dnschecker.org
- SPF Record Checker: https://mxtoolbox.com/spf.aspx
- DKIM Record Checker: https://mxtoolbox.com/dkim.aspx
- Email Spam Tester: https://www.mail-tester.com

---

**Not:** Bu rehber, Meslegim.tr platformunun production email gönderimini aktifleştirmek için hazırlanmıştır. Herhangi bir sorun yaşarsanız, Resend support ekibiyle iletişime geçebilirsiniz.
