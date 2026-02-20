# Testing Guide

Meslegim.tr projesi için test stratejisi ve çalıştırma talimatları.

## Test Türleri

### 1. Unit Tests (Vitest)
Backend business logic ve utility fonksiyonları için unit testler.

```bash
# Tüm unit testleri çalıştır
pnpm test

# Watch mode
pnpm test --watch

# Coverage raporu
pnpm test --coverage
```

**Mevcut Testler:**
- `server/auth.logout.test.ts` - Authentication logout testi

### 2. E2E Tests (Playwright)
Kullanıcı akışlarını test eden end-to-end testler.

```bash
# Tüm E2E testleri çalıştır (headless)
pnpm test:e2e

# UI mode (interactive)
pnpm test:e2e:ui

# Headed mode (browser görünür)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# Test raporu görüntüle
pnpm test:report
```

**Mevcut E2E Test Senaryoları:**

#### Student Registration (`student-registration.spec.ts`)
- ✅ Kayıt formunun görüntülenmesi
- ✅ Zorunlu alan validasyonu
- ✅ Email format validasyonu
- ✅ TC Kimlik format validasyonu
- ✅ KVKK onayı kontrolü
- ✅ Başarılı kayıt akışı
- ✅ Duplicate email kontrolü

#### Mentor Approval Flow (`mentor-approval.spec.ts`)
- ✅ Mentor girişi
- ✅ Bekleyen öğrenciler listesi
- ✅ Öğrenci aktifleştirme
- ✅ Aktif öğrenciler görüntüleme
- ✅ Öğrenci detayları
- ✅ Çıkış yapma

#### Student Journey (`student-journey.spec.ts`)
- ✅ Öğrenci girişi
- ✅ Mevcut etapları görüntüleme
- ✅ Etap formunu başlatma
- ✅ Form doldurma ve gönderme
- ✅ Rapor durumu görüntüleme
- ✅ Onaylı raporu görüntüleme
- ✅ PDF indirme
- ✅ İlerleme göstergesi

## Test Ortamı Gereksinimleri

### Ön Koşullar
1. Development server çalışır durumda olmalı (`pnpm dev`)
2. Database bağlantısı aktif olmalı
3. Test kullanıcıları database'de mevcut olmalı

### Test Kullanıcıları

**Mentor:**
- Email: `mikaillekesiz@gmail.com`
- Password: `Test123!`
- Role: `admin,mentor`

**Student (Active):**
- Email: `test.student@example.com`
- Password: `Test123!`
- Status: `active`

## Test Yazma Rehberi

### Unit Test Örneği
```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeEmail } from './sanitization';

describe('sanitizeEmail', () => {
  it('should return lowercase trimmed email', () => {
    const result = sanitizeEmail('  TEST@EXAMPLE.COM  ');
    expect(result).toBe('test@example.com');
  });

  it('should return null for invalid email', () => {
    const result = sanitizeEmail('invalid-email');
    expect(result).toBeNull();
  });
});
```

### E2E Test Örneği
```typescript
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button:has-text("Giriş Yap")');
  await expect(page).toHaveURL('**/dashboard');
});
```

## CI/CD Entegrasyonu

### GitHub Actions Workflow Örneği
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: http://localhost:3000
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage Hedefleri

### Mevcut Coverage
- **Unit Tests:** ~5% (1 test dosyası)
- **E2E Tests:** ~40% (3 kritik akış)

### Hedef Coverage
- **Unit Tests:** 70%+ (tüm business logic)
- **E2E Tests:** 80%+ (tüm kullanıcı akışları)

### Öncelikli Test Alanları
1. ✅ Authentication (login, logout, registration)
2. ✅ Student registration flow
3. ✅ Mentor approval process
4. ✅ Stage form submission
5. ⏳ Report generation
6. ⏳ Admin operations
7. ⏳ Email notifications
8. ⏳ Error handling

## Best Practices

### Unit Tests
- Her fonksiyon için en az 2-3 test case
- Edge case'leri test et (null, undefined, empty string)
- Mock external dependencies (database, API calls)
- Test isimleri açıklayıcı olmalı

### E2E Tests
- Test isolation: Her test bağımsız çalışmalı
- Flaky testlerden kaçın (hard-coded wait yerine waitFor kullan)
- Page Object Model kullanın (büyük projelerde)
- Screenshot ve video kaydet (failure durumunda)

### Performance
- E2E testleri parallel çalıştır
- Gereksiz browser launch'tan kaçın
- Test data'yı seed script ile hazırla

## Troubleshooting

### E2E Testler Başarısız Oluyor
1. Dev server çalışıyor mu? (`pnpm dev`)
2. Database bağlantısı aktif mi?
3. Test kullanıcıları mevcut mu?
4. Port 3000 kullanılabilir mi?

### Playwright Browser Hatası
```bash
# Browser'ları yeniden yükle
npx playwright install --with-deps chromium
```

### Test Timeout
```typescript
// Timeout süresini artır
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

## Kaynaklar

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
