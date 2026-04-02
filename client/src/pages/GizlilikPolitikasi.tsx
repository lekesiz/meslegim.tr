import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone, Building2, Scale } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function GizlilikPolitikasi() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      <SEO title="Gizlilik Politikası ve KVKK Aydınlatma Metni" description="Meslegim.tr gizlilik politikası, KVKK aydınlatma metni ve kişisel verilerin korunması hakkında bilgilendirme." />
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
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
        {/* Ana Gizlilik Politikası */}
        <div className="bg-card rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
            <p className="text-muted-foreground">Son güncelleme: 1 Nisan 2026</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Veri Sorumlusu</h2>
              <p className="text-muted-foreground leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel verileriniz veri sorumlusu sıfatıyla
                <strong className="text-foreground"> Meslegim.tr Kariyer Değerlendirme Platformu</strong> tarafından aşağıda
                açıklanan kapsamda işlenebilecektir. Bu aydınlatma metni, KVKK'nın 10. maddesi ile Aydınlatma Yükümlülüğünün
                Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Toplanan Kişisel Veriler</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Platformumuza kayıt olurken ve kullanırken aşağıdaki kişisel verileriniz toplanmaktadır:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-foreground text-sm">Kimlik Bilgileri</h3>
                  <p className="text-muted-foreground text-sm">Ad, soyad, T.C. kimlik numarası, yaş grubu</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">İletişim Bilgileri</h3>
                  <p className="text-muted-foreground text-sm">E-posta adresi, telefon numarası</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Eğitim ve Kariyer Verileri</h3>
                  <p className="text-muted-foreground text-sm">Anket yanıtları, etap sonuçları, kariyer profili verileri, AI tarafından oluşturulan raporlar, mentor değerlendirmeleri</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Finansal Bilgiler</h3>
                  <p className="text-muted-foreground text-sm">Ödeme işlem kayıtları (kart bilgileri platformumuzda saklanmaz, Stripe tarafından işlenir)</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Kullanım Verileri</h3>
                  <p className="text-muted-foreground text-sm">Platform üzerindeki aktiviteler, giriş zamanları, IP adresi, tarayıcı bilgileri</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Kariyer değerlendirme hizmetinin sunulması ve kişiselleştirilmesi</li>
                <li>AI destekli kariyer raporlarının oluşturulması</li>
                <li>Mentor-öğrenci eşleştirmesi ve iletişimin sağlanması</li>
                <li>Okul bazlı raporlama ve istatistik hizmetlerinin sunulması</li>
                <li>Ödeme işlemlerinin gerçekleştirilmesi ve faturalandırma</li>
                <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
                <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
                <li>Hizmet kalitesinin iyileştirilmesi ve analiz</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Bildirim ve iletişim hizmetlerinin sunulması</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Açık rıza:</strong> Kariyer değerlendirme anketlerinin işlenmesi, AI raporlarının oluşturulması</li>
                <li><strong className="text-foreground">Sözleşmenin ifası:</strong> Hizmetin sunulması, ödeme işlemleri</li>
                <li><strong className="text-foreground">Yasal yükümlülük:</strong> Vergi mevzuatı, 5651 sayılı Kanun kapsamında log tutma</li>
                <li><strong className="text-foreground">Meşru menfaat:</strong> Platform güvenliği, hizmet iyileştirme, istatistiksel analiz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Veri Güvenliği Tedbirleri</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler uygulanmaktadır:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="font-medium text-foreground text-sm mb-1">Teknik Tedbirler</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>- SSL/TLS şifreli iletişim</li>
                    <li>- Şifrelerin bcrypt ile hash'lenmesi</li>
                    <li>- Rate limiting (brute force koruması)</li>
                    <li>- HTTP güvenlik başlıkları (Helmet.js)</li>
                    <li>- Input sanitization (XSS koruması)</li>
                    <li>- Rol tabanlı erişim kontrolü (RBAC)</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="font-medium text-foreground text-sm mb-1">İdari Tedbirler</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>- Erişim yetki matrisi</li>
                    <li>- Veri işleme envanteri</li>
                    <li>- Gizlilik politikası eğitimi</li>
                    <li>- Düzenli güvenlik denetimleri</li>
                    <li>- Veri ihlali müdahale planı</li>
                    <li>- Üçüncü taraf güvenlik değerlendirmesi</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Kişisel Verilerin Aktarılması</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kişisel verileriniz, aşağıdaki durumlar ve taraflarla paylaşılabilmektedir:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Mentor:</strong> Size atanan mentor ile kariyer değerlendirme verileri paylaşılır</li>
                <li><strong className="text-foreground">Okul yönetimi:</strong> Okulunuzla ilişkilendirilmişseniz, okul yöneticisi istatistiksel verilere erişebilir</li>
                <li><strong className="text-foreground">Ödeme hizmet sağlayıcısı:</strong> Stripe Inc. (ödeme işlemleri için, PCI DSS uyumlu)</li>
                <li><strong className="text-foreground">E-posta hizmet sağlayıcısı:</strong> Resend (bildirim e-postaları için)</li>
                <li><strong className="text-foreground">Bulut altyapı sağlayıcısı:</strong> Veritabanı ve dosya depolama hizmetleri</li>
                <li><strong className="text-foreground">Yasal zorunluluk:</strong> Yetkili kamu kurum ve kuruluşları (mahkeme kararı, yasal talep)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong className="text-foreground">Yurt dışına aktarım:</strong> Bazı hizmet sağlayıcılarımız (Stripe, Resend) yurt dışında
                faaliyet göstermektedir. Bu aktarımlar, KVKK'nın 9. maddesi kapsamında yeterli koruma sağlayan ülkelere veya
                açık rızanıza dayanılarak gerçekleştirilmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Kişisel Verilerin Saklanma Süresi</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca saklanmaktadır:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hesap bilgileri</span>
                  <span className="text-foreground font-medium">Hesap aktif olduğu sürece + 1 yıl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kariyer değerlendirme verileri</span>
                  <span className="text-foreground font-medium">Hesap aktif olduğu sürece + 2 yıl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ödeme kayıtları</span>
                  <span className="text-foreground font-medium">10 yıl (vergi mevzuatı)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İşlem logları</span>
                  <span className="text-foreground font-medium">2 yıl (5651 sayılı Kanun)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Çerez verileri</span>
                  <span className="text-foreground font-medium">Oturum süresi</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Çerezler (Cookies)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz, oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler, güvenli giriş yapmanızı ve
                oturumunuzun korunmasını sağlar. Analitik amaçlı çerezler yalnızca anonim kullanım istatistikleri toplamak
                için kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda
                platformun bazı özellikleri çalışmayabilir.
              </p>
            </section>

            <section id="kvkk">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                9. KVKK Kapsamında Haklarınız
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">a)</span>
                  <p className="text-muted-foreground text-sm">Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">b)</span>
                  <p className="text-muted-foreground text-sm">Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">c)</span>
                  <p className="text-muted-foreground text-sm">Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">d)</span>
                  <p className="text-muted-foreground text-sm">Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">e)</span>
                  <p className="text-muted-foreground text-sm">Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">f)</span>
                  <p className="text-muted-foreground text-sm">KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">g)</span>
                  <p className="text-muted-foreground text-sm">(e) ve (f) bentleri uyarınca yapılan işlemlerin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">h)</span>
                  <p className="text-muted-foreground text-sm">İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold text-sm mt-0.5">ı)</span>
                  <p className="text-muted-foreground text-sm">Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Çocukların Gizliliği</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz 14-24 yaş aralığındaki gençlere yönelik tasarlanmıştır. 18 yaş altındaki kullanıcıların
                kişisel verilerinin işlenmesi, ebeveyn veya yasal vasinin onayına tabidir. Kayıt işlemi sırasında
                bu onayın verildiği kabul edilmektedir. 14 yaş altındaki bireylerin kişisel verileri bilerek
                toplanmamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Başvuru Yöntemi</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvuruda bulunabilirsiniz:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">E-posta ile başvuru</p>
                    <a href="mailto:kvkk@meslegim.tr" className="text-sm text-indigo-600 hover:underline">kvkk@meslegim.tr</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Genel iletişim</p>
                    <a href="mailto:destek@meslegim.tr" className="text-sm text-indigo-600 hover:underline">destek@meslegim.tr</a>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-3 text-sm">
                Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak
                sonuçlandırılacaktır. İşlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma
                Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Politika Değişiklikleri</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bu gizlilik politikası ve KVKK aydınlatma metni, yasal düzenlemeler veya hizmet değişiklikleri
                doğrultusunda güncellenebilir. Önemli değişiklikler, platform üzerinden ve/veya e-posta yoluyla
                bildirilecektir. Güncel versiyonu her zaman bu sayfada bulabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/kullanim-sartlari" className="hover:text-indigo-600 transition-colors">Kullanım Şartları</a>
          <span>·</span>
          <a href="/" className="hover:text-indigo-600 transition-colors">Ana Sayfa</a>
        </div>
      </footer>
    </div>
  );
}
