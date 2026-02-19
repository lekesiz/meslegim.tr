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

export async function generateCareerReport(data: ReportData): Promise<string> {
  const prompt = `Sen bir kariyer danışmanısın. Aşağıdaki öğrenci verilerine dayanarak kapsamlı bir kariyer değerlendirme raporu hazırla.

**Öğrenci Bilgileri:**
- Ad: ${data.studentName}
- E-posta: ${data.studentEmail}
- Yaş Grubu: ${data.ageGroup}

**Etap Cevapları:**
${data.stageAnswers.map((stage, index) => `
### ${index + 1}. ${stage.stageName}
${stage.questions.map((q, qi) => `
**Soru ${qi + 1}:** ${q.question}
**Cevap:** ${q.answer}
`).join('\n')}
`).join('\n')}

**Rapor Formatı:**
Lütfen aşağıdaki bölümleri içeren profesyonel bir Markdown raporu hazırla:

1. **Yönetici Özeti**: Genel değerlendirme ve ana bulgular
2. **Güçlü Yönler**: Öğrencinin öne çıkan yetenekleri ve özellikleri
3. **Gelişim Alanları**: İyileştirme gerektiren konular
4. **Kariyer Önerileri**: Uygun kariyer yolları ve meslek önerileri
5. **Eylem Planı**: Kısa, orta ve uzun vadeli adımlar
6. **Sonuç**: Genel değerlendirme ve motivasyon mesajı

Rapor Türkçe olmalı, profesyonel ve yapıcı bir dil kullanmalı.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir kariyer danışmanısın. Öğrencilere kapsamlı ve yapıcı kariyer raporları hazırlıyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
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
  answers: Array<{ question: string; answer: string }>
): Promise<string> {
  const prompt = `Sen bir kariyer danışmanısın. ${studentName} isimli öğrencinin "${stageName}" etabındaki cevaplarını değerlendir.

**Cevaplar:**
${answers.map((a, i) => `
**Soru ${i + 1}:** ${a.question}
**Cevap:** ${a.answer}
`).join('\n')}

**Ara Değerlendirme Raporu:**
Lütfen kısa ve öz bir ara değerlendirme raporu hazırla (maksimum 500 kelime):

1. **Bu Etaptaki Performans**: Cevapların genel değerlendirmesi
2. **Öne Çıkan Noktalar**: Güçlü yönler
3. **Dikkat Edilmesi Gerekenler**: İyileştirme önerileri
4. **Sonraki Adımlar**: Bir sonraki etap için öneriler

Rapor Türkçe, kısa ve öz olmalı.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir kariyer danışmanısın. Öğrencilere ara değerlendirme raporları hazırlıyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
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
