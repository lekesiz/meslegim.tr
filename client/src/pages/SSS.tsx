import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, GraduationCap, CreditCard, Users, Brain, Shield, Clock, Award } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-muted/50 transition-colors rounded-lg"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <span className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-2 pb-4 text-muted-foreground leading-relaxed animate-in fade-in duration-200">
          {item.answer}
        </div>
      )}
    </div>
  );
}

const faqCategories: FAQCategory[] = [
  {
    title: "Genel Bilgiler",
    icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
    items: [
      {
        question: "Meslegim.tr nedir?",
        answer: "Meslegim.tr, 14-24 yaş arası gençlere yönelik AI destekli bir kariyer değerlendirme platformudur. Bilimsel olarak geçerliliği kanıtlanmış testler (RIASEC, Big Five, Holland Kodları) kullanarak öğrencilerin ilgi alanlarını, yeteneklerini, kişilik özelliklerini ve kariyer değerlerini analiz eder. Sonuçlar yapay zeka ile işlenerek kişiye özel kariyer önerileri sunulur."
      },
      {
        question: "Platform kimler için uygundur?",
        answer: "Platform öncelikle 14-24 yaş arası lise ve üniversite öğrencileri için tasarlanmıştır. Ancak kariyer değişikliği düşünen yetişkinler de platformdan faydalanabilir. Testler Türkçe olarak sunulmaktadır."
      },
      {
        question: "Testler bilimsel olarak geçerli mi?",
        answer: "Evet. Platformda kullanılan tüm değerlendirme araçları, uluslararası alanda kabul görmüş bilimsel modellere dayanmaktadır: Holland'ın RIASEC modeli (mesleki ilgi alanları), Big Five kişilik modeli (beş faktör kişilik envanteri), Schwartz Değerler Teorisi (kariyer değerleri) ve risk toleransı ölçekleri. Bu modeller onlarca yıllık akademik araştırmayla desteklenmektedir."
      },
      {
        question: "Sonuçlarım ne kadar güvenilir?",
        answer: "Sonuçların güvenilirliği, testleri ne kadar dürüst ve dikkatli yanıtladığınıza bağlıdır. Testleri samimi bir şekilde, acele etmeden yanıtlamanızı öneriyoruz. AI destekli analiz sistemi, tutarsız yanıtları tespit edebilir ve bunu raporlarınızda belirtir."
      },
    ]
  },
  {
    title: "Etap Sistemi",
    icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    items: [
      {
        question: "Etap sistemi nasıl çalışır?",
        answer: "Platform, 5 aşamalı bir değerlendirme sistemi kullanır. Her etap farklı bir boyutu ölçer: Etap 1 - İlgi Alanları Testi (RIASEC), Etap 2 - Yetenek Değerlendirmesi, Etap 3 - Kişilik Envanteri (Big Five), Etap 4 - Kariyer Değerleri Envanteri, Etap 5 - Kariyer Risk Analizi. Etaplar sırasıyla tamamlanır ve her biri bir öncekinin sonuçlarını zenginleştirir."
      },
      {
        question: "İlk etap gerçekten ücretsiz mi?",
        answer: "Evet, Etap 1 (İlgi Alanları Testi) tamamen ücretsizdir. Kayıt olduktan sonra hemen başlayabilirsiniz. Bu etap, RIASEC modelini kullanarak temel ilgi alanı profilinizi oluşturur. Sonraki etaplara devam etmek için ücretli paketlerden birini satın almanız gerekmektedir."
      },
      {
        question: "Bir etabı tamamlamak ne kadar sürer?",
        answer: "Her etap ortalama 15-25 dakika sürer. Etapları tek seferde tamamlamanız gerekmez; yarıda bırakıp daha sonra kaldığınız yerden devam edebilirsiniz. Ancak en doğru sonuçlar için bir etabı mümkünse tek oturumda tamamlamanızı öneriyoruz."
      },
      {
        question: "Etapları atlayabilir miyim?",
        answer: "Hayır, etaplar sıralı olarak tamamlanmalıdır. Her etap bir öncekinin sonuçlarını temel alarak daha derinlemesine bir analiz sunar. Bu nedenle sıralı ilerleme, en doğru ve kapsamlı sonuçları almanız için gereklidir."
      },
      {
        question: "Etap kilidi nasıl açılır?",
        answer: "Etap kilitleri iki şekilde açılabilir: Paket satın alarak (Temel, Profesyonel veya Kurumsal paket) veya tekli etap açma seçeneğiyle. Ayrıca mentorunuz veya okul yöneticiniz de etaplarınızı açabilir."
      },
    ]
  },
  {
    title: "Ödeme ve Paketler",
    icon: <CreditCard className="w-5 h-5 text-green-600" />,
    items: [
      {
        question: "Hangi paketler mevcut?",
        answer: "Üç paket sunuyoruz: Temel Paket (149 ₺) - İlk 3 etap erişimi ve temel RIASEC profili. Profesyonel Paket (299 ₺) - Tüm etaplar, AI kariyer raporu ve kariyer profili özeti. Kurumsal Paket (499 ₺) - Profesyonel paketteki her şey artı sertifika, mentor desteği ve öncelikli destek."
      },
      {
        question: "Ödeme güvenli mi?",
        answer: "Evet, tüm ödemeler Stripe altyapısı üzerinden güvenli bir şekilde işlenmektedir. Stripe, dünya genelinde milyonlarca işletme tarafından kullanılan, PCI DSS Level 1 sertifikalı bir ödeme altyapısıdır. Kart bilgileriniz hiçbir zaman sunucularımızda saklanmaz."
      },
      {
        question: "İade politikanız nedir?",
        answer: "Satın aldığınız paketteki hiçbir etabı henüz tamamlamadıysanız, satın alma tarihinden itibaren 14 gün içinde tam iade talep edebilirsiniz. İade taleplerinizi destek@meslegim.tr adresine gönderebilirsiniz. Tamamlanmış etaplar için iade yapılamamaktadır."
      },
      {
        question: "Promosyon kodu nasıl kullanılır?",
        answer: "Ödeme sayfasında 'Promosyon Kodu' alanına kodunuzu girerek indirimden yararlanabilirsiniz. Promosyon kodları tek kullanımlıktır ve belirli bir geçerlilik süresi vardır. Kodun geçerli olup olmadığı, girdiğiniz anda otomatik olarak kontrol edilir."
      },
      {
        question: "Kurumsal/okul indirimi var mı?",
        answer: "Evet, okullar ve eğitim kurumları için özel kurumsal fiyatlandırma sunuyoruz. 50 ve üzeri öğrenci için toplu indirimler mevcuttur. Detaylı bilgi için destek@meslegim.tr adresinden bizimle iletişime geçebilirsiniz."
      },
    ]
  },
  {
    title: "Mentor Desteği",
    icon: <Users className="w-5 h-5 text-purple-600" />,
    items: [
      {
        question: "Mentor desteği nedir?",
        answer: "Mentor desteği, Kurumsal Paket kapsamında sunulan birebir kariyer rehberliği hizmetidir. Size atanan profesyonel kariyer danışmanı, test sonuçlarınızı birlikte değerlendirir, kariyer seçeneklerinizi tartışır ve kişiselleştirilmiş bir kariyer yol haritası oluşturmanıza yardımcı olur."
      },
      {
        question: "Mentorumla nasıl iletişim kurabilirim?",
        answer: "Platform içindeki mesajlaşma sistemi üzerinden mentorunuzla doğrudan iletişim kurabilirsiniz. Mesajlarınız güvenli bir şekilde iletilir ve mentorunuz en kısa sürede yanıt verir. Mesajlaşma geçmişiniz her zaman erişilebilir durumda kalır."
      },
      {
        question: "Mentor ataması nasıl yapılır?",
        answer: "Kurumsal Paket satın aldığınızda, profilinize ve ilgi alanlarınıza uygun bir mentor otomatik olarak atanır. Okulunuz platforma kayıtlıysa, okulunuzun belirlediği mentor size atanabilir."
      },
    ]
  },
  {
    title: "AI Raporlar",
    icon: <Brain className="w-5 h-5 text-orange-600" />,
    items: [
      {
        question: "AI kariyer raporu nedir?",
        answer: "AI kariyer raporu, tamamladığınız tüm etapların sonuçlarını yapay zeka ile analiz ederek oluşturulan kapsamlı bir kariyer değerlendirme raporudur. Rapor; RIASEC profilinizi, Big Five kişilik analizinizi, kariyer değerlerinizi, risk toleransınızı ve bunlara dayalı kişiselleştirilmiş kariyer önerilerini içerir."
      },
      {
        question: "AI-Proof kariyer önerileri ne demek?",
        answer: "AI-Proof kariyer önerileri, yapay zekanın gelecekte otomasyona uğratma olasılığı düşük olan meslekleri vurgulayan özel bir analiz bölümüdür. Raporunuzda, önerilen her kariyer yolu için AI otomasyonu riski değerlendirmesi yapılır ve geleceğe dayanıklı kariyer seçenekleri öne çıkarılır."
      },
      {
        question: "Raporumu PDF olarak indirebilir miyim?",
        answer: "Evet, Profesyonel ve Kurumsal paket sahipleri raporlarını PDF formatında indirebilir. PDF rapor, profesyonel bir tasarımla hazırlanır ve okul başvuruları, kariyer danışmanlığı görüşmeleri veya kişisel arşiviniz için kullanılabilir."
      },
    ]
  },
  {
    title: "Gizlilik ve Güvenlik",
    icon: <Shield className="w-5 h-5 text-red-600" />,
    items: [
      {
        question: "Verilerim güvende mi?",
        answer: "Evet, verilerinizin güvenliği en yüksek önceliğimizdir. Tüm veriler şifreli olarak saklanır, KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) ve GDPR düzenlemelerine tam uyum sağlanır. Kişisel verileriniz hiçbir koşulda üçüncü taraflarla paylaşılmaz."
      },
      {
        question: "Test sonuçlarımı kim görebilir?",
        answer: "Test sonuçlarınız yalnızca siz, atanmış mentorunuz (varsa) ve okul yöneticiniz (okulunuz platforma kayıtlıysa) tarafından görülebilir. Platform yöneticileri istatistiksel verilere erişebilir ancak bireysel sonuçlarınız anonim olarak işlenir."
      },
      {
        question: "Hesabımı silebilir miyim?",
        answer: "Evet, KVKK kapsamındaki haklarınız gereği hesabınızı ve tüm verilerinizi kalıcı olarak sildirebilirsiniz. Bunun için destek@meslegim.tr adresine hesap silme talebinizi göndermeniz yeterlidir. Talebiniz 30 gün içinde işleme alınır."
      },
    ]
  },
  {
    title: "Sertifika ve Başarılar",
    icon: <Award className="w-5 h-5 text-yellow-600" />,
    items: [
      {
        question: "Sertifika nasıl alınır?",
        answer: "Kurumsal Paket sahipleri, tüm etapları tamamladıktan sonra profesyonel bir kariyer değerlendirme sertifikası alabilir. Sertifika, QR kod ile doğrulanabilir ve PDF formatında indirilebilir. Sertifika, tamamladığınız değerlendirmeleri ve kariyer profilinizi özetler."
      },
      {
        question: "Rozet sistemi nasıl çalışır?",
        answer: "Platform, motivasyonunuzu artırmak için bir rozet sistemi kullanır. Etapları tamamladıkça, belirli başarıları elde ettikçe ve platformu düzenli kullandıkça çeşitli rozetler kazanırsınız. Rozetlerinizi profilinizde sergileyebilirsiniz."
      },
    ]
  },
  {
    title: "Teknik Destek",
    icon: <Clock className="w-5 h-5 text-teal-600" />,
    items: [
      {
        question: "Teknik bir sorunla karşılaştım, ne yapmalıyım?",
        answer: "Teknik sorunlar için destek@meslegim.tr adresine e-posta gönderebilir veya İletişim sayfamızdaki formu doldurabilirsiniz. Sorununuzu detaylı bir şekilde açıklamanız (ekran görüntüsü, hata mesajı vb.) çözüm sürecini hızlandıracaktır. Destek ekibimiz en geç 24 saat içinde yanıt verir."
      },
      {
        question: "Şifremi unuttum, ne yapmalıyım?",
        answer: "Giriş sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz. Link 1 saat geçerlidir. E-postanız gelmezse spam/gereksiz klasörünüzü kontrol edin veya destek ekibimizle iletişime geçin."
      },
      {
        question: "Hangi tarayıcıları destekliyorsunuz?",
        answer: "Platform, tüm modern tarayıcılarda (Chrome, Firefox, Safari, Edge) sorunsuz çalışır. En iyi deneyim için tarayıcınızın güncel sürümünü kullanmanızı öneriyoruz. Mobil cihazlardan da tam erişim sağlanabilir."
      },
    ]
  },
];

export default function SSS() {
  const [, setLocation] = useLocation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      <SEO 
        title="Sıkça Sorulan Sorular (SSS)" 
        description="Meslegim.tr hakkında sıkça sorulan sorular. Etap sistemi, ödeme, mentor desteği, AI raporlar ve daha fazlası hakkında bilgi edinin." 
      />
      
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-lg">Sıkça Sorulan Sorular</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Başlık */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Sıkça Sorulan Sorular</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Meslegim.tr hakkında merak ettiğiniz her şey. Aradığınız cevabı bulamadıysanız{" "}
            <a href="/iletisim" className="text-blue-600 hover:underline">iletişim sayfamızdan</a> bize ulaşabilirsiniz.
          </p>
        </div>

        {/* FAQ Kategorileri */}
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-card rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-muted/30 border-b flex items-center gap-3">
              {category.icon}
              <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
            </div>
            <div className="px-4 py-2">
              {category.items.map((item, itemIndex) => (
                <AccordionItem
                  key={itemIndex}
                  item={item}
                  isOpen={openItems[`${categoryIndex}-${itemIndex}`] || false}
                  onToggle={() => toggleItem(categoryIndex, itemIndex)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Hala sorunuz mu var?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Aradığınız cevabı bulamadıysanız, destek ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => setLocation('/iletisim')}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              İletişime Geçin
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = 'mailto:destek@meslegim.tr'}
              className="border-white text-white hover:bg-white/10"
            >
              destek@meslegim.tr
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm pt-4 pb-8">
          <p>Son güncelleme: Nisan 2026</p>
        </div>
      </main>
    </div>
  );
}
