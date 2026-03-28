# Reflektif-web Analiz ve Uyarlama Notları

## Uyarlanacak Test Kategorileri (reflektif-web/src/data/tests.ts)

Reflektif-web'de 6 test kategorisi var:
1. **Kişilik Envanteri (RiT)**: Big Five (60 soru) + RIASEC (48 soru) + Kariyer Değerleri (30 soru) = 138 soru
2. **Bilişsel Yetenek Testleri**: Sayısal (20) + Sözel (20) + Soyut Mantık (15) + Uzamsal (15) = 70 soru
3. **Hobi & İlgi Alanı Envanteri**: 150+ hobi taraması + Derinlik analizi = 165 soru
4. **Dil Yeterlilik Testleri**: İngilizce, Almanca, Fransızca, Diğer = 215 soru
5. **Durumsal Yargı ve Simülasyonlar**: Liderlik, müşteri ilişkileri, zaman yönetimi = 3-5 senaryo
6. **Video Mülakat Analizi**: AI destekli video mülakat

## Meslegim.tr İçin Uyarlama Planı (14-24 yaş, basitleştirilmiş)

Meslegim.tr'nin mevcut 9 etaplık yapısı zaten var. Reflektif-web'den uyarlanacak:

1. **RIASEC (Holland) Testi** → Etap 2'ye entegre (basitleştirilmiş 24 soru)
2. **Big Five Kişilik Analizi** → Etap 3'e entegre (basitleştirilmiş 30 soru)
3. **Kariyer Değerleri Envanteri** → Etap 5'e entegre (basitleştirilmiş 15 soru)
4. **AI Analiz Motoru** → Mevcut LLM entegrasyonu zaten var, prompt'ları Türkçe'ye çevir
5. **Form Validasyon Yapısı** → Zod ile güçlendir
6. **E-posta Şablonları** → Mevcut, iyileştir

## Mevcut Meslegim.tr Etapları ve Soru Yapısı
- 9 etap, her etapta farklı sorular
- Sorular JSON olarak veritabanında saklanıyor
- AI ile rapor oluşturma mevcut (reportHelper.ts + reportGeneration.ts)
- PDF export mevcut (pdfExport.ts)

## Kritik Eksikler (Meslegim.tr)
1. Profil düzenleme prosedürü YOK
2. E-posta doğrulama YOK
3. In-app bildirim sistemi YOK
4. reportGenerator.ts Fransızca prompt'lar içeriyor (kullanılmıyor ama temizlenmeli)
5. Google Fonts yüklenmemiş
6. Lazy loading yok
