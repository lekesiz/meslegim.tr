import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function KullanimSartlari() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      <SEO title="Kullanım Şartları" description="Meslegim.tr kullanım şartları, hizmet koşulları ve kullanıcı sözleşmesi." />
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-lg">Kullanım Şartları</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-card rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Kullanım Şartları ve Hizmet Sözleşmesi</h1>
            <p className="text-muted-foreground">Son güncelleme: 1 Nisan 2026</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Platformumuzu kullanarak bu kullanım şartlarını okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.
              Lütfen dikkatle okuyunuz.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Tanımlar</h2>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-foreground font-medium min-w-[120px]">Platform:</span>
                  <span className="text-muted-foreground">meslegim.tr web sitesi ve tüm alt hizmetleri</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground font-medium min-w-[120px]">Hizmet Sağlayıcı:</span>
                  <span className="text-muted-foreground">Meslegim.tr Kariyer Değerlendirme Platformu</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground font-medium min-w-[120px]">Kullanıcı:</span>
                  <span className="text-muted-foreground">Platformu kullanan tüm bireyler (öğrenci, mentor, okul yöneticisi, admin)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground font-medium min-w-[120px]">Hizmet:</span>
                  <span className="text-muted-foreground">AI destekli kariyer değerlendirme, mentorluk, raporlama ve ilgili tüm hizmetler</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Hizmet Tanımı</h2>
              <p className="text-muted-foreground leading-relaxed">
                Meslegim.tr, 14-24 yaş arası gençlere yönelik AI destekli kariyer değerlendirme platformudur. Platform;
                9 aşamalı kariyer değerlendirme anketleri, yapay zeka destekli kariyer raporları, profesyonel mentor desteği,
                okul bazlı raporlama ve sertifika hizmetleri sunmaktadır. Bu kullanım şartları, platformumuzu kullanan
                tüm kullanıcılar (öğrenciler, mentorlar, okul yöneticileri ve yöneticiler) için geçerlidir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Hesap Oluşturma ve Güvenlik</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Hesap oluşturma ve kullanımıyla ilgili kurallar:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Kayıt sırasında doğru, güncel ve eksiksiz bilgi vermekle yükümlüsünüz</li>
                <li>Her kullanıcı yalnızca bir hesap oluşturabilir</li>
                <li>Şifreniz en az 8 karakter uzunluğunda olmalı, büyük harf, küçük harf ve rakam içermelidir</li>
                <li>Hesap bilgilerinizi gizli tutmak ve üçüncü kişilerle paylaşmamak sizin sorumluluğunuzdadır</li>
                <li>Hesabınızda yetkisiz erişim tespit etmeniz halinde derhal bize bildirmeniz gerekmektedir</li>
                <li>Sahte kimlik bilgileri veya başkasına ait T.C. kimlik numarası kullanmak yasaktır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Yaş Sınırı ve Ebeveyn Onayı</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platform, 14-24 yaş aralığındaki gençlere yönelik tasarlanmıştır. 18 yaş altındaki kullanıcıların
                platforma kaydolabilmesi için ebeveyn veya yasal vasi onayı gerekmektedir. Kayıt işlemini tamamlayarak,
                18 yaş altındaki kullanıcılar adına ebeveyn veya yasal vasinin bu onayı verdiği kabul edilmektedir.
                14 yaş altındaki bireylerin platformu kullanması yasaktır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Kullanıcı Yükümlülükleri</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Platform kullanıcıları aşağıdaki kurallara uymakla yükümlüdür:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Platformu yalnızca meşru ve kişisel kariyer değerlendirme amaçları için kullanmak</li>
                <li>Diğer kullanıcıların haklarına ve gizliliğine saygı göstermek</li>
                <li>Platformun güvenliğini tehdit edecek eylemlerden kaçınmak</li>
                <li>Spam, zararlı yazılım veya kötü amaçlı içerik paylaşmamak</li>
                <li>Platformu otomatik araçlarla (bot, scraper) kullanmamak</li>
                <li>Anket yanıtlarını dürüst ve samimi şekilde vermek</li>
                <li>Mentor-öğrenci iletişiminde saygılı ve profesyonel olmak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Ödeme ve İade Koşulları</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Platformdaki ücretli hizmetlere ilişkin koşullar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Ödeme işlemleri güvenli ödeme altyapısı (Stripe) üzerinden gerçekleştirilir</li>
                <li>Fiyatlar Türk Lirası (TL) cinsinden belirtilir ve KDV dahildir</li>
                <li>Satın alınan paketler, ödeme onayı sonrasında aktif hale gelir</li>
                <li>Dijital hizmet niteliğinde olduğundan, hizmetin kullanılmaya başlanmasından sonra cayma hakkı bulunmamaktadır (6502 sayılı Kanun, Madde 53/ç)</li>
                <li>Teknik bir sorun nedeniyle hizmetin sunulamaması durumunda tam iade yapılır</li>
                <li>Promosyon kodları, belirtilen koşullar dahilinde geçerlidir ve birleştirilemez</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Hizmetin Kapsamı ve Sınırlamaları</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Meslegim.tr, kariyer değerlendirme ve yönlendirme hizmeti sunmaktadır. Ancak:
              </p>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4 space-y-2">
                <p className="text-muted-foreground text-sm">- Platform, kesin kariyer garantisi vermemektedir</p>
                <p className="text-muted-foreground text-sm">- AI raporları bilgilendirme amaçlıdır, profesyonel kariyer danışmanlığının yerini tutmaz</p>
                <p className="text-muted-foreground text-sm">- Mentor görüşleri bireysel değerlendirmelerdir, bağlayıcı nitelik taşımaz</p>
                <p className="text-muted-foreground text-sm">- Platform, teknik bakım veya güncellemeler nedeniyle geçici olarak erişilemez olabilir</p>
                <p className="text-muted-foreground text-sm">- AI teknolojisinin sınırlamaları nedeniyle raporlarda hata olabilir</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Fikri Mülkiyet Hakları</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platformdaki tüm içerik, tasarım, yazılım, algoritmalar, AI modelleri ve materyaller Meslegim.tr'ye aittir
                ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunmaktadır. Kullanıcılar, platform içeriğini ticari
                amaçla kopyalayamaz, dağıtamaz, değiştiremez veya tersine mühendislik yapamaz. Kullanıcıların platforma
                yüklediği içerikler (anket yanıtları, profil bilgileri) kullanıcıya ait olmakla birlikte, hizmetin
                sunulması ve iyileştirilmesi amacıyla Meslegim.tr tarafından anonim ve toplu olarak kullanılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-muted-foreground leading-relaxed">
                Meslegim.tr, kullanım şartlarını ihlal eden, platformu kötüye kullanan, sahte bilgi veren veya diğer
                kullanıcılara zarar veren hesapları önceden bildirim yapmaksızın askıya alma veya sonlandırma hakkını
                saklı tutar. Kullanıcılar da istedikleri zaman hesaplarını kapatabilir; bu durumda kişisel verileri
                yasal saklama süreleri dışında silinir. Hesap kapatma talebi için{" "}
                <a href="mailto:destek@meslegim.tr" className="text-indigo-600 hover:underline">destek@meslegim.tr</a>{" "}
                adresine başvurabilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Sorumluluk Sınırlaması</h2>
              <p className="text-muted-foreground leading-relaxed">
                Meslegim.tr, platformun kullanımından kaynaklanan dolaylı, tesadüfi veya sonuçsal zararlardan sorumlu değildir.
                Platform "olduğu gibi" sunulmakta olup, kesintisiz veya hatasız çalışacağı garanti edilmemektedir.
                Platformda sunulan kariyer önerileri ve AI raporları bilgilendirme amaçlıdır; bu bilgilere dayanılarak
                alınan kararlardan Meslegim.tr sorumlu tutulamaz. Kullanıcının platforma sağladığı bilgilerin doğruluğundan
                kullanıcı sorumludur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Mücbir Sebepler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Doğal afetler, savaş, terör, salgın hastalık, hükümet kararları, internet altyapı sorunları,
                siber saldırılar ve benzeri mücbir sebep halleri nedeniyle hizmetin sunulamamasından
                Meslegim.tr sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Değişiklikler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Meslegim.tr, bu kullanım şartlarını önceden bildirim yaparak değiştirme hakkını saklı tutar.
                Önemli değişiklikler platform üzerinden ve/veya e-posta yoluyla bildirilecektir. Değişiklikler
                yayınlandıktan sonra platformu kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Uyuşmazlık Çözümü</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bu kullanım şartları Türkiye Cumhuriyeti hukukuna tabidir. Taraflar arasında doğabilecek
                uyuşmazlıklarda öncelikle uzlaşma yolu aranacaktır. Uzlaşma sağlanamaması halinde,
                Türkiye Cumhuriyeti mahkemeleri ve icra daireleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">14. İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kullanım şartlarıyla ilgili sorularınız için{" "}
                <a href="mailto:destek@meslegim.tr" className="text-indigo-600 hover:underline">destek@meslegim.tr</a>{" "}
                adresine ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/gizlilik-politikasi" className="hover:text-indigo-600 transition-colors">Gizlilik Politikası</a>
          <span>·</span>
          <a href="/" className="hover:text-indigo-600 transition-colors">Ana Sayfa</a>
        </div>
      </footer>
    </div>
  );
}
