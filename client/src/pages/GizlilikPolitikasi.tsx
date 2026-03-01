import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function GizlilikPolitikasi() {
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
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-lg">Gizlilik Politikası</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gizlilik Politikası</h1>
            <p className="text-muted-foreground">Son güncelleme: 1 Mart 2026</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Giriş</h2>
              <p className="text-gray-600 leading-relaxed">
                Meslegim.tr olarak, kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası, platformumuzu
                kullandığınızda hangi kişisel verileri topladığımızı, bu verileri nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.
                Platformumuzu kullanarak bu politikayı kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Toplanan Kişisel Veriler</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Platformumuza kayıt olurken ve kullanırken aşağıdaki kişisel verilerinizi topluyoruz:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası</li>
                <li><strong>Demografik Bilgiler:</strong> Yaş grubu</li>
                <li><strong>Kariyer Değerlendirme Verileri:</strong> Anket yanıtları, etap sonuçları, AI tarafından oluşturulan raporlar</li>
                <li><strong>Kullanım Verileri:</strong> Platform üzerindeki aktiviteler, giriş zamanları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Verilerin Kullanım Amacı</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Toplanan kişisel verileriniz aşağıdaki amaçlarla kullanılmaktadır:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Kariyer değerlendirme hizmetinin sunulması</li>
                <li>Kişiselleştirilmiş AI raporlarının oluşturulması</li>
                <li>Mentor-öğrenci eşleştirmesi ve iletişimi</li>
                <li>Platform güvenliğinin sağlanması</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Veri Güvenliği</h2>
              <p className="text-gray-600 leading-relaxed">
                Kişisel verilerinizin güvenliği için endüstri standardı güvenlik önlemleri uygulamaktayız. Verileriniz şifrelenmiş
                bağlantılar (SSL/TLS) üzerinden iletilmekte ve güvenli sunucularda saklanmaktadır. T.C. kimlik numaranız yalnızca
                doğrulama amacıyla kullanılmakta ve şifreli biçimde saklanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Verilerin Paylaşımı</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmamaktadır:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Size atanan mentor ile kariyer değerlendirme verileri paylaşılır</li>
                <li>Yasal zorunluluk halinde yetkili kurumlarla paylaşılabilir</li>
                <li>Hizmet sağlayıcılarımız (e-posta, bulut depolama) ile teknik gereklilikler kapsamında paylaşılır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Haklarınız (KVKK Kapsamında)</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Çerezler (Cookies)</h2>
              <p className="text-gray-600 leading-relaxed">
                Platformumuz, oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler, güvenli giriş yapmanızı ve
                oturumunuzun korunmasını sağlar. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda
                platformun bazı özellikleri çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. İletişim</h2>
              <p className="text-gray-600 leading-relaxed">
                Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız için{" "}
                <a href="mailto:kvkk@meslegim.tr" className="text-indigo-600 hover:underline">kvkk@meslegim.tr</a>{" "}
                adresine e-posta gönderebilirsiniz.
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
