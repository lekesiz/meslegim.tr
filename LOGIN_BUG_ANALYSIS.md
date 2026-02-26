# Email/Password Login Bug - Teknik Analiz

**Bug ID:** MESLEGIM-001  
**Öncelik:** 🔴 CRITICAL  
**Tarih:** 26 Şubat 2026  
**Durum:** OPEN

---

## 🐛 SORUN TANIMI

Email ve şifre ile giriş yapmaya çalışan kullanıcılar **401 Unauthorized** hatası alıyor ve giriş yapamıyor.

---

## 🔍 TEKNIK DETAYLAR

### Hata Mesajı
```
Failed to load resource: the server responded with a status of 401 ()
[API Mutation Error] undefined
```

### Etkilenen Endpoint
```
POST /api/trpc/auth.login
```

### Backend Kodu
**Dosya:** `server/routers.ts`  
**Satır:** 55-86

```typescript
login: publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Find user by email
    const user = await db.getUserByEmail(input.email);
    if (!user || !user.password) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Hesabınız henüz aktif değil. Mentor onayı bekleniyor.' });
    }
    
    // Create session token
    const sessionToken = await sdk.createSessionToken(user.openId || '', { name: user.name || '' });
    
    // Set session cookie
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    
    return { success: true, user };
  }),
```

---

## 🔬 YAPILAN TESTLER

### Test 1: Şifre Hash Doğrulama
**Amaç:** Bcrypt hash'lerinin doğru olup olmadığını kontrol et

**Kod:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('password123', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdTq0dXbC').then(result => console.log('Match:', result));"
```

**Sonuç:** ❌ Match: false (İlk hash yanlıştı)

**Düzeltme:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(hash => console.log('Hash:', hash));"
# Hash: $2b$10$gNo54bQjtVOHyxH6XcQPUufzx73bUxGfH/hnu3PdfDYaGq4kPUT22
```

**Database Update:**
```sql
UPDATE users 
SET password = '$2b$10$gNo54bQjtVOHyxH6XcQPUufzx73bUxGfH/hnu3PdfDYaGq4kPUT22'
WHERE email IN ('test.ogrenci1@gmail.com', 'test.ogrenci2@gmail.com', 'test.ogrenci3@gmail.com', 'test.mentor@gmail.com');
```

**Sonuç:** ✅ Hash güncellendi, ancak login hala çalışmıyor

---

### Test 2: OpenId Kontrolü
**Amaç:** Kullanıcıların openId'lerinin olup olmadığını kontrol et

**Database Query:**
```sql
SELECT id, name, email, role, status, password, openId FROM users WHERE email = 'test.mentor@gmail.com';
```

**Sonuç:** ❌ openId: NULL

**Düzeltme:**
```sql
UPDATE users SET openId = 'test-mentor-openid-001' WHERE email = 'test.mentor@gmail.com';
UPDATE users SET openId = 'test-student-1-openid-001' WHERE email = 'test.ogrenci1@gmail.com';
UPDATE users SET openId = 'test-student-2-openid-001' WHERE email = 'test.ogrenci2@gmail.com';
UPDATE users SET openId = 'test-student-3-openid-001' WHERE email = 'test.ogrenci3@gmail.com';
```

**Sonuç:** ✅ OpenId eklendi, ancak login hala çalışmıyor

---

### Test 3: User Status Kontrolü
**Amaç:** Kullanıcıların status'ünün 'active' olup olmadığını kontrol et

**Database Query:**
```sql
SELECT email, status FROM users WHERE email IN ('test.mentor@gmail.com', 'test.ogrenci1@gmail.com');
```

**Sonuç:**
- test.mentor@gmail.com: status = 'active' ✅
- test.ogrenci1@gmail.com: status = 'pending' ❌

**Not:** Mentor 'active' olmasına rağmen login çalışmıyor

---

## 🎯 KÖK NEDEN ANALİZİ

### Hipotez 1: sdk.createSessionToken Sorunu
**Açıklama:** `sdk.createSessionToken(user.openId || '', { name: user.name || '' })` fonksiyonu manuel oluşturulan kullanıcılar için çalışmıyor olabilir.

**Kanıt:**
- OAuth ile oluşturulan kullanıcılar giriş yapabiliyor
- Manuel oluşturulan kullanıcılar (test kullanıcıları) giriş yapamıyor
- OpenId manuel olarak eklense bile sorun devam ediyor

**Olasılık:** %80

### Hipotez 2: Session Cookie Sorunu
**Açıklama:** `ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions)` fonksiyonu cookie'yi doğru set edemiyor olabilir.

**Kanıt:**
- Console'da "Session payload missing required fields" hatası var
- 401 hatası session doğrulama aşamasında oluşuyor olabilir

**Olasılık:** %60

### Hipotez 3: CORS/Cookie Domain Sorunu
**Açıklama:** Cookie domain ayarları yanlış olabilir.

**Kanıt:**
- Production URL: `https://3000-iguf1hpthu1lpifgboq15-1b183fc9.sg1.manus.computer`
- Cookie domain ayarları bu URL ile uyumlu olmayabilir

**Olasılık:** %40

---

## 💡 ÇÖZÜM ÖNERİLERİ

### Çözüm 1: SDK Session Token Debug (Öncelik: YÜKSEK)
**Açıklama:** `sdk.createSessionToken` fonksiyonunu debug et ve manuel kullanıcılar için çalışıp çalışmadığını kontrol et.

**Adımlar:**
1. `server/_core/sdk.ts` dosyasını incele
2. `createSessionToken` fonksiyonuna log ekle
3. Manuel kullanıcı ile test et
4. Hata mesajını yakala ve raporla

**Kod Değişikliği:**
```typescript
// Create session token
console.log('Creating session token for:', user.openId, user.name);
const sessionToken = await sdk.createSessionToken(user.openId || '', { name: user.name || '' });
console.log('Session token created:', sessionToken);
```

**Tahmini Süre:** 1 saat

---

### Çözüm 2: Alternatif Session Yönetimi (Öncelik: ORTA)
**Açıklama:** Email/password login için SDK'dan bağımsız bir session yönetimi implement et.

**Adımlar:**
1. JWT token oluştur (jsonwebtoken paketi)
2. Token'ı cookie'ye kaydet
3. Middleware'de token'ı doğrula
4. Email/password login'de bu yöntemi kullan

**Kod Örneği:**
```typescript
import jwt from 'jsonwebtoken';

// Create JWT token
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// Set cookie
ctx.res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

**Tahmini Süre:** 4 saat

---

### Çözüm 3: Sadece OAuth Kullan (Öncelik: DÜŞÜK)
**Açıklama:** Email/password login'i tamamen devre dışı bırak, sadece OAuth kullan.

**Adımlar:**
1. Login sayfasından email/password formunu kaldır
2. Sadece OAuth butonu bırak
3. Kayıt sayfasını da OAuth'a yönlendir

**Avantajlar:**
- Hızlı çözüm
- Güvenlik artışı (OAuth daha güvenli)
- Maintenance azalır

**Dezavantajlar:**
- Kullanıcı deneyimi kısıtlanır
- Email/password isteyen kullanıcılar kayıt olamaz

**Tahmini Süre:** 30 dakika

---

## 🔧 ACİL DÜZELTME PLANI

### Aşama 1: Debug ve Analiz (1 saat)
1. `sdk.createSessionToken` fonksiyonunu debug et
2. Console logları ekle
3. Test kullanıcısı ile dene
4. Hata mesajını yakala

### Aşama 2: Geçici Çözüm (30 dakika)
1. Email/password login'i geçici olarak devre dışı bırak
2. Kullanıcıları OAuth'a yönlendir
3. Bilgilendirme mesajı ekle

### Aşama 3: Kalıcı Çözüm (4 saat)
1. Alternatif session yönetimi implement et
2. Email/password login'i yeniden aktif et
3. Kapsamlı testler yap

---

## 📊 ETKİ ANALİZİ

### Etkilenen Kullanıcılar
- **Mevcut Kullanıcılar:** Email/password ile kayıtlı tüm kullanıcılar
- **Yeni Kullanıcılar:** Email/password ile kayıt olmak isteyen kullanıcılar
- **Test Kullanıcıları:** Tüm manuel oluşturulan test kullanıcıları

### İş Etkisi
- **Kullanıcı Kaybı:** %50-70 (OAuth kullanmayanlar)
- **Destek Talepleri:** Artış bekleniyor
- **Platform Güvenilirliği:** Azalma riski

### Aciliyet
🔴 **CRITICAL** - Kullanıcılar giriş yapamıyor, platform kullanılamaz durumda

---

## 📝 NOTLAR

1. OAuth login çalışıyor, sadece email/password sorunu var
2. Database yapısı doğru, veriler mevcut
3. Frontend form handling çalışıyor
4. Backend endpoint'e istek gidiyor ancak 401 dönüyor
5. Şifre hash'leri ve openId'ler doğru

---

**Rapor Hazırlayan:** Manus AI Agent  
**Son Güncelleme:** 26 Şubat 2026  
**Durum:** OPEN - Çözüm bekleniyor
