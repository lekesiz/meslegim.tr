# Email Domain Doğrulama Rehberi - meslegim.tr

## 📧 Resend ile Email Domain Doğrulaması

Bu rehber, `meslegim.tr` domain'ini Resend'de doğrulamak için gereken adımları içerir.

---

## 🎯 Gereksinimler

- Resend hesabı (mevcut: `RESEND_API_KEY` zaten yapılandırılmış)
- `meslegim.tr` domain'ine DNS yönetim erişimi
- SPF, DKIM ve DMARC kayıtlarını ekleyebilme yetkisi

---

## 📝 Adım 1: Resend Dashboard'da Domain Ekle

1. [Resend Dashboard](https://resend.com/domains) → **Domains** bölümüne git
2. **Add Domain** butonuna tıkla
3. Domain adını gir: `meslegim.tr` veya subdomain (önerilen: `mail.meslegim.tr`)

**Subdomain Kullanmanın Avantajları:**
- Gönderim itibarını izole eder
- Ana domain'i korur
- Daha iyi deliverability sağlar

**Önerilen Subdomain:** `mail.meslegim.tr` veya `updates.meslegim.tr`

---

## 📝 Adım 2: DNS Kayıtlarını Al

Resend, domain eklendikten sonra 3 tür DNS kaydı sağlar:

### 1. SPF Kaydı (TXT Record)
- **Tip:** TXT
- **Host:** `@` (veya subdomain kullanıyorsanız `mail`)
- **Value:** `v=spf1 include:_spf.resend.com ~all`
- **TTL:** 3600 (veya DNS sağlayıcınızın önerdiği değer)

**SPF Nedir?**
Sender Policy Framework - Domain adınız adına email göndermeye yetkili IP adreslerini listeler.

### 2. DKIM Kaydı (TXT Record)
- **Tip:** TXT
- **Host:** `resend._domainkey` (Resend tarafından sağlanacak)
- **Value:** Resend dashboard'dan alınacak (uzun bir public key)
- **TTL:** 3600

**DKIM Nedir?**
DomainKeys Identified Mail - Email'in gerçekten sizin domain'inizden geldiğini doğrular.

### 3. MX Kaydı (Return-Path için)
- **Tip:** MX
- **Host:** `send` (veya custom return path)
- **Value:** `feedback-smtp.us-east-1.amazonses.com`
- **Priority:** 10
- **TTL:** 3600

---

## 📝 Adım 3: DNS Kayıtlarını Ekle

DNS sağlayıcınıza (örn. Cloudflare, GoDaddy, Namecheap) giriş yapın ve yukarıdaki kayıtları ekleyin.

**Örnek (Cloudflare):**
1. Cloudflare Dashboard → **DNS** → **Records**
2. **Add record** butonuna tıkla
3. Her kayıt için:
   - Type: TXT veya MX
   - Name: Host değeri
   - Content: Value değeri
   - TTL: Auto veya 3600
   - **Save** butonuna tıkla

---

## 📝 Adım 4: DNS Propagation Bekle

DNS kayıtlarının yayılması **birkaç dakika ile 72 saat** arasında sürebilir.

**DNS Kontrolü için:**
- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/)
- Resend'in kendi DNS lookup tool: [dns.email](https://dns.email/)

---

## 📝 Adım 5: Resend'de Domain Doğrula

1. Resend Dashboard → **Domains** → Domain'inizi seçin
2. **Verify DNS Records** butonuna tıklayın
3. Resend, DNS kayıtlarını kontrol edecek

**Domain Durumları:**
- `not_started`: Henüz doğrulama başlatılmadı
- `pending`: Doğrulama devam ediyor
- `verified`: ✅ Domain başarıyla doğrulandı
- `failed`: ❌ 72 saat içinde DNS kayıtları bulunamadı

---

## 📝 Adım 6: DMARC Kaydı Ekle (Opsiyonel ama Önerilen)

DMARC, SPF ve DKIM'i destekler ve mailbox sağlayıcılarına ek güven verir.

**DMARC Kaydı:**
- **Tip:** TXT
- **Host:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@meslegim.tr`
- **TTL:** 3600

**DMARC Politikaları:**
- `p=none`: Sadece raporla (başlangıç için önerilen)
- `p=quarantine`: Şüpheli emailleri spam'e gönder
- `p=reject`: Şüpheli emailleri reddet

---

## 🧪 Test Etme

Domain doğrulandıktan sonra test email gönderin:

```typescript
// server/routers.ts içinde test endpoint
testEmail: publicProcedure
  .input(z.object({ to: z.string().email() }))
  .mutation(async ({ input }) => {
    const { sendEmail } = await import('./server/_core/email');
    
    await sendEmail({
      to: input.to,
      subject: 'Test Email - meslegim.tr',
      html: '<p>Bu bir test emailidir. Domain doğrulaması başarılı!</p>',
    });
    
    return { success: true };
  }),
```

---

## 📊 Mevcut Durum

✅ **Resend API Key:** Zaten yapılandırılmış (`RESEND_API_KEY`)  
✅ **Email Gönderim Fonksiyonu:** `server/_core/email.ts` mevcut  
⏳ **Domain Doğrulaması:** Manuel olarak yapılması gerekiyor  

---

## 🚀 Sonraki Adımlar

1. DNS sağlayıcınıza giriş yapın
2. Resend Dashboard'da domain ekleyin
3. Sağlanan DNS kayıtlarını ekleyin
4. DNS propagation bekleyin (birkaç dakika - 72 saat)
5. Resend'de domain'i doğrulayın
6. Test email gönderin

---

## 📞 Destek

Sorun yaşarsanız:
- [Resend Knowledge Base](https://resend.com/docs/knowledge-base)
- [DNS Guides](https://resend.com/docs/knowledge-base)
- [Resend Support](https://resend.com/support)

---

**Not:** Bu işlem manuel bir DNS yapılandırması gerektirir ve otomatik olarak tamamlanamaz. DNS kayıtlarını ekledikten sonra bana bildirin, test email gönderim sistemini hazırlayacağım.
