import { invokeLLM } from './llm';

export type ReportData = {
  studentName: string;
  studentEmail: string;
  ageGroup: string;
  stageAnswers: Array<{
    stageName: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  }>;
};

/**
 * Yaş grubuna göre kariyer raporu için özel bağlam ve yönlendirme üretir
 */
function getAgeGroupContext(ageGroup: string): {
  context: string;
  careerFocus: string;
  actionPlanFocus: string;
} {
  if (ageGroup === '14-17') {
    return {
      context: 'Lise öğrencisi (14-17 yaş): Henüz üniversite ve meslek seçimi sürecinde. Aile beklentileri, YKS hazırlığı ve keşif aşamasında.',
      careerFocus: `Kariyer önerilerinde şunlara odaklan:
- Türkiye'deki üniversite bölüm önerileri (YKS puanı türüne göre: SAY, EA, SÖZ, DİL)
- Her önerilen kariyer için yaklaşık YKS puan aralığı ve tercih edilebilecek üniversiteler
- Lise yıllarında yapılabilecek hazırlık aktiviteleri (kulüpler, kurslar, olimpiyatlar)
- Yapay zeka (AI) çağında bu mesleklerin geleceği ve AI-Proof skoru (0-100 arası, 100 = tamamen AI'ya dayanıklı)
- Türkiye'de ve dünyada bu mesleklerin iş bulma kolaylığı ve maaş potansiyeli`,
      actionPlanFocus: `Eylem planında şunlara odaklan:
- Kısa vade (0-6 ay): YKS hazırlık stratejisi, bölüm araştırması, aile ile kariyer konuşması
- Orta vade (6 ay - 2 yıl): Üniversite tercihleri, ilgi alanı geliştirme aktiviteleri, staj/gönüllülük
- Uzun vade (2-4 yıl): Üniversite seçimi, bölüm kararı, kariyer yol haritası`,
    };
  } else if (ageGroup === '18-21') {
    return {
      context: 'Üniversite öğrencisi veya yeni mezun (18-21 yaş): Bölüm seçimi yapılmış, kariyer yolunu netleştirme ve iş hayatına hazırlık sürecinde.',
      careerFocus: `Kariyer önerilerinde şunlara odaklan:
- Mevcut bölümüyle uyumlu ve uyumsuz kariyer alternatifleri
- Her kariyer için Türkiye ve global iş piyasasındaki talep durumu
- Staj, çift anadal veya yüksek lisans ile güçlendirilebilecek kariyer yolları
- Yapay zeka (AI) çağında bu mesleklerin geleceği ve AI-Proof skoru (0-100 arası)
- Mezuniyet sonrası ilk 1-2 yıl için gerçekçi maaş beklentisi (Türkiye piyasası)
- Yurt dışı fırsatları ve gerekli yetkinlikler`,
      actionPlanFocus: `Eylem planında şunlara odaklan:
- Kısa vade (0-6 ay): Staj bulma, sertifika alma, LinkedIn profili güçlendirme
- Orta vade (6 ay - 1 yıl): Portföy oluşturma, network kurma, iş başvuruları
- Uzun vade (1-3 yıl): İlk iş deneyimi, yüksek lisans kararı, kariyer geçişi planı`,
    };
  } else {
    return {
      context: 'Genç profesyonel veya yeni mezun (22-24 yaş): İş hayatına yeni girmiş veya kariyer geçişi düşünen, deneyim kazanma ve uzmanlaşma sürecinde.',
      careerFocus: `Kariyer önerilerinde şunlara odaklan:
- Mevcut deneyimle uyumlu kariyer ivmelendirme yolları
- Sektör değişikliği için gerekli beceriler ve geçiş stratejisi
- Liderlik ve uzmanlık yolları arasındaki seçim (IC vs Manager track)
- Yapay zeka (AI) çağında bu mesleklerin geleceği ve AI-Proof skoru (0-100 arası)
- Türkiye ve global piyasada 3-5 yıl sonraki maaş potansiyeli
- MBA / yüksek lisans yatırımının geri dönüş analizi`,
      actionPlanFocus: `Eylem planında şunlara odaklan:
- Kısa vade (0-3 ay): Acil beceri boşluklarını kapatma, network aktivasyonu
- Orta vade (3 ay - 1 yıl): Terfi veya iş değişikliği stratejisi, sertifikasyon
- Uzun vade (1-3 yıl): Liderlik pozisyonu veya uzmanlık yolu, MBA/yüksek lisans kararı`,
    };
  }
}

export async function generateCareerReport(data: ReportData): Promise<string> {
  const ageGroupCtx = getAgeGroupContext(data.ageGroup);

  const systemPrompt = `Sen Türkiye'nin en deneyimli kariyer danışmanlarından birisin. ${data.ageGroup} yaş grubundaki gençlere özel, derinlemesine ve kişiselleştirilmiş kariyer raporları hazırlıyorsun.

**Hedef Kitle Bağlamı:**
${ageGroupCtx.context}

**Rapor Yazım İlkelerin:**
- Her zaman Türkçe yaz, profesyonel ama sıcak ve teşvik edici bir dil kullan
- Öğrencinin verdiği cevaplara spesifik referanslar ver (genel değil, kişiye özel)
- Gerçekçi ve uygulanabilir öneriler sun, boş övgüden kaçın
- Türkiye iş piyasası gerçeklerini göz önünde bulundur
- Yapay zekanın meslekler üzerindeki etkisini mutlaka değerlendir`;

  const userPrompt = `# Kariyer Değerlendirme Raporu Talebi

**Öğrenci:** ${data.studentName}
**Yaş Grubu:** ${data.ageGroup}

## Etap Cevapları
${data.stageAnswers.map((stage, index) => `
### Etap ${index + 1}: ${stage.stageName}
${stage.questions.map((q, qi) => `
**Soru ${qi + 1}:** ${q.question}
**Cevap:** ${q.answer}
`).join('')}
`).join('\n')}

---

## Lütfen Aşağıdaki Formatta Kapsamlı Bir Kariyer Raporu Hazırla:

### 1. 📋 YÖNETİCİ ÖZETİ
${data.studentName}'in kariyer profilinin 3-4 cümlelik özeti. En güçlü özelliklerini ve kariyer potansiyelini vurgula.

### 2. 💪 GÜÇLÜ YÖNLER VE YETKİNLİKLER
Cevaplardan tespit edilen 4-6 güçlü yön. Her biri için:
- Güçlü yön adı
- Cevaplardan kanıt (hangi cevap bu güçlü yönü ortaya koyuyor)
- Kariyer hayatında nasıl kullanabileceği

### 3. 🎯 GELİŞİM ALANLARI
Dikkat edilmesi gereken 3-4 alan. Her biri için:
- Gelişim alanı
- Neden önemli
- Nasıl geliştirilebilir (somut öneriler)

### 4. 🚀 KARİYER ÖNERİLERİ
${ageGroupCtx.careerFocus}

5-7 kariyer önerisi sun. Her biri için:
- Meslek/Kariyer adı
- Neden bu öğrenciye uygun (cevaplara dayalı gerekçe)
- Türkiye'de iş bulma kolaylığı (Kolay/Orta/Zor)
- AI-Proof Skoru: X/100 (kısa açıklama)
- Gerekli adımlar (2-3 madde)

### 5. 📅 EYLEM PLANI
${ageGroupCtx.actionPlanFocus}

### 6. 💬 SONUÇ VE MOTİVASYON MESAJI
${data.studentName}'e özel, içten ve motive edici bir kapanış paragrafı. Güçlü yönlerini hatırlat ve geleceğe dair umut verici bir mesaj ilet.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const reportContent = typeof messageContent === 'string' ? messageContent : '';

    if (!reportContent) {
      throw new Error('Rapor içeriği oluşturulamadı');
    }

    return reportContent;
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Rapor oluşturulurken bir hata oluştu');
  }
}

export async function generateStageReport(
  studentName: string,
  stageName: string,
  ageGroup: string,
  answers: Array<{ question: string; answer: string }>
): Promise<string> {
  const ageGroupCtx = getAgeGroupContext(ageGroup);

  const systemPrompt = `Sen deneyimli bir kariyer danışmanısın. ${ageGroup} yaş grubundaki öğrencilere ara değerlendirme raporları hazırlıyorsun.

**Hedef Kitle Bağlamı:**
${ageGroupCtx.context}

Her zaman Türkçe yaz, kısa ve öz tut (maksimum 400 kelime), profesyonel ama sıcak bir dil kullan.`;

  const userPrompt = `${studentName} isimli öğrencinin "${stageName}" etabındaki cevaplarını değerlendir.

**Cevaplar:**
${answers.map((a, i) => `
**Soru ${i + 1}:** ${a.question}
**Cevap:** ${a.answer}
`).join('\n')}

**Ara Değerlendirme Raporu Formatı:**

### 🔍 Bu Etaptaki Performans
Cevapların genel değerlendirmesi (2-3 cümle, kişiye özel)

### ⭐ Öne Çıkan Noktalar
3 güçlü yön (cevaplara dayalı, somut)

### 💡 Dikkat Edilmesi Gerekenler
2-3 iyileştirme önerisi (yapıcı ve uygulanabilir)

### ➡️ Sonraki Adımlar
Bir sonraki etap için 2-3 hazırlık önerisi`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const reportContent = typeof messageContent === 'string' ? messageContent : '';

    if (!reportContent) {
      throw new Error('Ara rapor içeriği oluşturulamadı');
    }

    return reportContent;
  } catch (error) {
    console.error('Stage report generation error:', error);
    throw new Error('Ara rapor oluşturulurken bir hata oluştu');
  }
}
