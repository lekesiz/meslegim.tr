# Test Kullanıcıları - Giriş Bilgileri

**Oluşturma Tarihi:** 26 Şubat 2026  
**Amaç:** Gerçek kullanıcı testleri için test kullanıcıları

---

## 🔐 GİRİŞ BİLGİLERİ

### Öğrenci Kullanıcıları

#### Test Öğrenci 1 (14-17 Yaş Grubu)
```
Email: test.ogrenci1@gmail.com
Şifre: password123
Rol: Student
Yaş Grubu: 14-17
Status: Pending (Mentor onayı bekliyor)
Mentor: test.mentor@gmail.com
OpenId: test-student-1-openid-001
```

#### Test Öğrenci 2 (18-21 Yaş Grubu)
```
Email: test.ogrenci2@gmail.com
Şifre: password123
Rol: Student
Yaş Grubu: 18-21
Status: Pending (Mentor onayı bekliyor)
Mentor: test.mentor@gmail.com
OpenId: test-student-2-openid-001
```

#### Test Öğrenci 3 (22-24 Yaş Grubu)
```
Email: test.ogrenci3@gmail.com
Şifre: password123
Rol: Student
Yaş Grubu: 22-24
Status: Pending (Mentor onayı bekliyor)
Mentor: test.mentor@gmail.com
OpenId: test-student-3-openid-001
```

---

### Mentor Kullanıcısı

#### Test Mentor
```
Email: test.mentor@gmail.com
Şifre: password123
Rol: Mentor
Status: Active
OpenId: test-mentor-openid-001
Atanmış Öğrenciler: 3 (test.ogrenci1, test.ogrenci2, test.ogrenci3)
```

---

### Admin Kullanıcısı

#### Mevcut Admin (Gerçek Kullanıcı)
```
Email: mikaillekesiz@gmail.com
Şifre: [Gerçek kullanıcı şifresi - bilinmiyor]
Rol: Admin
Status: Active
Giriş Yöntemi: OAuth (Manus)
```

---

## 📋 TEST SENARYOLARI

### Senaryo 1: Öğrenci Kaydı ve İlk Etap
**Kullanıcı:** test.ogrenci1@gmail.com  
**Adımlar:**
1. Login sayfasına git
2. Email ve şifre ile giriş yap
3. ⚠️ **BUG:** 401 hatası alınıyor - giriş yapılamıyor
4. Dashboard'a yönlendirilmeli (çalışmıyor)
5. Etap 1 sorularını görüntüle (test edilemedi)
6. 20 soruyu yanıtla (test edilemedi)
7. Etap 1'i tamamla (test edilemedi)

**Beklenen Sonuç:** Öğrenci etap 1'i tamamlar ve rapor oluşturulur  
**Gerçek Sonuç:** ❌ Login başarısız, test tamamlanamadı

---

### Senaryo 2: Mentor Onaylama
**Kullanıcı:** test.mentor@gmail.com  
**Adımlar:**
1. Login sayfasına git
2. Email ve şifre ile giriş yap
3. ⚠️ **BUG:** 401 hatası alınıyor - giriş yapılamıyor
4. "Bekleyen Onaylar" tab'ına git (test edilemedi)
5. test.ogrenci1'i görüntüle (test edilemedi)
6. "Aktif Et" butonuna tıkla (test edilemedi)

**Beklenen Sonuç:** Öğrenci aktif edilir ve email gönderilir  
**Gerçek Sonuç:** ❌ Login başarısız, test tamamlanamadı

---

## 🔧 DATABASE DURUMU

### Kullanıcı Tablosu
```sql
SELECT id, name, email, role, status, ageGroup, mentorId, openId 
FROM users 
WHERE email IN ('test.ogrenci1@gmail.com', 'test.ogrenci2@gmail.com', 'test.ogrenci3@gmail.com', 'test.mentor@gmail.com');
```

**Beklenen Sonuç:**
| Email | Role | Status | AgeGroup | MentorId | OpenId |
|-------|------|--------|----------|----------|--------|
| test.ogrenci1@gmail.com | student | pending | 14-17 | [mentor_id] | test-student-1-openid-001 |
| test.ogrenci2@gmail.com | student | pending | 18-21 | [mentor_id] | test-student-2-openid-001 |
| test.ogrenci3@gmail.com | student | pending | 22-24 | [mentor_id] | test-student-3-openid-001 |
| test.mentor@gmail.com | mentor | active | NULL | NULL | test-mentor-openid-001 |

---

## ⚠️ BİLİNEN SORUNLAR

### 1. Email/Password Login Çalışmıyor
**Durum:** 🔴 CRITICAL  
**Açıklama:** Test kullanıcıları email ve şifre ile giriş yapamıyor  
**Hata:** 401 Unauthorized  
**Çözüm:** Bekleniyor (LOGIN_BUG_ANALYSIS.md'ye bakın)

### 2. OAuth Login Gerekli
**Durum:** 🟡 WORKAROUND  
**Açıklama:** Şu anda sadece OAuth ile giriş yapılabiliyor  
**Çözüm:** Test kullanıcılarını OAuth ile oluştur VEYA login bug'ını düzelt

---

## 📝 NOTLAR

1. **Şifre Hash:** `$2b$10$gNo54bQjtVOHyxH6XcQPUufzx73bUxGfH/hnu3PdfDYaGq4kPUT22` (password123)
2. **KVKK Consent:** Tüm test kullanıcıları için `true` olarak ayarlandı
3. **Created At:** 26 Şubat 2026
4. **Test Amacı:** Gerçek kullanıcı akışlarını simüle etmek
5. **Kullanım:** Sadece test ortamında kullanılmalı, production'da silinmeli

---

## 🗑️ TEMİZLEME

Test tamamlandıktan sonra bu kullanıcıları silmek için:

```sql
-- Test kullanıcılarını sil
DELETE FROM users WHERE email IN (
  'test.ogrenci1@gmail.com',
  'test.ogrenci2@gmail.com',
  'test.ogrenci3@gmail.com',
  'test.mentor@gmail.com'
);

-- İlişkili verileri de sil (cascade delete yoksa)
DELETE FROM stages WHERE userId IN (SELECT id FROM users WHERE email LIKE 'test.%@gmail.com');
DELETE FROM reports WHERE studentId IN (SELECT id FROM users WHERE email LIKE 'test.%@gmail.com');
DELETE FROM feedbacks WHERE studentId IN (SELECT id FROM users WHERE email LIKE 'test.%@gmail.com');
DELETE FROM certificates WHERE studentId IN (SELECT id FROM users WHERE email LIKE 'test.%@gmail.com');
```

---

**Oluşturan:** Manus AI Agent  
**Tarih:** 26 Şubat 2026  
**Versiyon:** 1.0
