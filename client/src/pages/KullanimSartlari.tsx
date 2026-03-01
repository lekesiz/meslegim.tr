import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function KullanimSartlari() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
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
        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanım Şartları</h1>
            <p className="text-muted-foreground">Son güncelleme: 1 Mart 2026</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Hizmet Tanımı</h2>
              <p className="text-gray-600 leading-relaxed">
                Meslegim.tr, 14-24 yaş arası gençlere yönelik AI destekli kariyer değerlendirme platformudur. Platform;
                kariyer anketleri, etap bazlı değerlendirmeler, AI raporları ve mentor desteği sunmaktadır.
                Bu kullanım şartları, platformumuzu kullanan tüm kullanıcılar için geçerlidir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Kullanıcı Yükümlülükleri</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Platform kullanıcıları aşağıdaki kurallara uymakla yükümlüdür:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Kayıt sırasında doğru ve güncel bilgi vermek</li>
                <li>Hesap bilgilerini gizli tutmak ve üçüncü kişilerle paylaşmamak</li>
                <li>Platformu yalnızca meşru amaçlar için kullanmak</li>
                <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                <li>Platformun güvenliğini tehdit edecek eylemlerden kaçınmak</li>
                <li>Sahte kimlik veya bilgi kullanmamak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Yaş Sınırı</h2>
              <p className="text-gray-600 leading-relaxed">
                Platform, 14-24 yaş aralığındaki gençlere yönelik tasarlanmıştır. 18 yaş altındaki kullanıcıların
                platforma kaydolabilmesi için ebeveyn veya yasal vasi onayı gerekmektedir. Kayıt işlemi bu onayın
                verildiğini kabul etmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Hizmetin Kapsamı ve Sınırlamaları</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Meslegim.tr, kariyer değerlendirme ve yönlendirme hizmeti sunmaktadır. Ancak:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Platform, kesin kariyer garantisi vermemektedir</li>
                <li>AI raporları bilgilendirme amaçlıdır, profesyonel kariyer danışmanlığının yerini tutmaz</li>
                <li>Mentor görüşleri bireysel değerlendirmelerdir, bağlayıcı nitelik taşımaz</li>
                <li>Platform, teknik nedenlerle zaman zaman erişilemez olabilir</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Fikri Mülkiyet</h2>
              <p className="text-gray-600 leading-relaxed">
                Platformdaki tüm içerik, tasarım, yazılım ve materyaller Meslegim.tr'ye aittir ve telif hakkı yasalarıyla
                korunmaktadır. Kullanıcılar, platform içeriğini ticari amaçla kopyalayamaz, dağıtamaz veya değiştiremez.
                Kullanıcıların platforma yüklediği içerikler (anket yanıtları vb.) kullanıcıya ait olmakla birlikte,
                hizmetin sunulması amacıyla Meslegim.tr tarafından kullanılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-gray-600 leading-relaxed">
                Meslegim.tr, kullanım şartlarını ihlal eden, platformu kötüye kullanan veya diğer kullanıcılara zarar veren
                hesapları önceden bildirim yapmaksızın askıya alma veya sonlandırma hakkını saklı tutar. Kullanıcılar da
                istedikleri zaman hesaplarını kapatabilir; bu durumda kişisel verileri yasal saklama süreleri dışında silinir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Sorumluluk Sınırlaması</h2>
              <p className="text-gray-600 leading-relaxed">
                Meslegim.tr, platformun kullanımından kaynaklanan dolaylı, tesadüfi veya sonuçsal zararlardan sorumlu değildir.
                Platform "olduğu gibi" sunulmakta olup, kesintisiz veya hatasız çalışacağı garanti edilmemektedir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Değişiklikler</h2>
              <p className="text-gray-600 leading-relaxed">
                Meslegim.tr, bu kullanım şartlarını önceden bildirim yaparak değiştirme hakkını saklı tutar. Değişiklikler
                platform üzerinde yayınlandıktan sonra platformu kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz
                anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Uygulanacak Hukuk</h2>
              <p className="text-gray-600 leading-relaxed">
                Bu kullanım şartları Türk hukukuna tabidir. Uyuşmazlıkların çözümünde Türkiye mahkemeleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">10. İletişim</h2>
              <p className="text-gray-600 leading-relaxed">
                Kullanım şartlarıyla ilgili sorularınız için{" "}
                <a href="mailto:destek@meslegim.tr" className="text-indigo-600 hover:underline">destek@meslegim.tr</a>{" "}
                adresine ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
