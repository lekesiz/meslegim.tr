import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { 
  Target, 
  Brain, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Clock,
  Award
} from "lucide-react";

export default function Home() {
  const [showForm, setShowForm] = useState(() => {
    // URL'de ?kayit=1 parametresi varsa formu otomatik aç
    return window.location.search.includes('kayit=1');
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tcKimlik: "",
    password: "",
    ageGroup: "",
    kvkkConsent: false,
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setFormSuccess("Başvurunuz alındı! Mentor onayından sonra e-posta ile bilgilendirileceksiniz.");
      setFormError("");
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
      }, 3000);
      setFormData({
        name: "",
        email: "",
        phone: "",
        tcKimlik: "",
        password: "",
        ageGroup: "",
        kvkkConsent: false,
      });
    },
    onError: (error: any) => {
      setFormError(error.message || "Kayıt sırasında bir hata oluştu");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.kvkkConsent) {
      setFormError("KVKK metnini onaylamanız gerekmektedir");
      return;
    }

    if (!formData.ageGroup) {
      setFormError("Lütfen yaş grubunuzu seçiniz");
      return;
    }
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tcKimlik: formData.tcKimlik,
      password: formData.password,
      ageGroup: formData.ageGroup as "14-17" | "18-21" | "22-24",
    });
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Başvuru Formu
            </h1>
            <p className="text-gray-600">
              Lütfen bilgilerinizi eksiksiz doldurunuz
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div>
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="5XX XXX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="tcKimlik">TC Kimlik No *</Label>
              <Input
                id="tcKimlik"
                type="text"
                required
                maxLength={11}
                value={formData.tcKimlik}
                onChange={(e) =>
                  setFormData({ ...formData, tcKimlik: e.target.value })
                }
                placeholder="11 haneli TC kimlik numaranız"
              />
            </div>

            <div>
              <Label htmlFor="password">Şifre *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="En az 6 karakter"
              />
            </div>

            <div>
              <Label htmlFor="ageGroup">Yaş Grubu *</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value) =>
                  setFormData({ ...formData, ageGroup: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yaş grubunuzu seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14-17">14-17 yaş</SelectItem>
                  <SelectItem value="18-21">18-21 yaş</SelectItem>
                  <SelectItem value="22-24">22-24 yaş</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="kvkk"
                  checked={formData.kvkkConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, kvkkConsent: checked === true })
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="kvkk"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    <span className="font-semibold">KVKK Aydınlatma Metni:</span>{" "}
                    Kişisel verilerimin, 6698 sayılı Kişisel Verilerin Korunması
                    Kanunu kapsamında kariyer değerlendirme hizmeti sunulması
                    amacıyla işlenmesine, saklanmasına ve kullanılmasına açık
                    rıza gösteriyorum. *
                  </Label>
                </div>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                ✅ {formSuccess}
              </div>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1"
              >
                {registerMutation.isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" 
              alt="Meslegim.tr Logo" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-gray-900">Meslegim.tr</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/login">Giriş Yap</a>
            </Button>
            <Button onClick={() => setShowForm(true)}>
              Ücretsiz Başla
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI Destekli Kariyer Değerlendirme
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Geleceğin Mesleğini
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Keşfet</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            14-24 yaş arası gençler için özel olarak tasarlanmış, 
            AI destekli kariyer değerlendirme platformu ile yeteneklerini keşfet, 
            doğru mesleği bul.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => window.location.href = '/login'}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              Giriş Yap
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">9</div>
              <div className="text-sm text-gray-600">Aşamalı Değerlendirme</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Günlük Aktivasyon</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">AI</div>
              <div className="text-sm text-gray-600">Destekli Raporlama</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Neden Meslegim.tr?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bilimsel yöntemler ve yapay zeka desteğiyle kariyer yolculuğunda sana rehberlik ediyoruz
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Kişiselleştirilmiş Değerlendirme
            </h3>
            <p className="text-gray-600">
              Yaş grubuna özel hazırlanmış sorularla yeteneklerini, ilgi alanlarını 
              ve kişilik özelliklerini kapsamlı şekilde değerlendiriyoruz.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Brain className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI Destekli Raporlama
            </h3>
            <p className="text-gray-600">
              Yapay zeka teknolojisi ile cevaplarını analiz ediyor, 
              sana özel kariyer önerileri ve gelişim planı hazırlıyoruz.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Uzman Mentor Desteği
            </h3>
            <p className="text-gray-600">
              Deneyimli kariyer mentorları raporlarını inceliyor, 
              onaylıyor ve gerektiğinde ek önerilerle destekliyor.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Üç basit adımda kariyer yolculuğuna başla
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex gap-6 items-start bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Kayıt Ol ve Onay Bekle
              </h3>
              <p className="text-gray-600">
                Ücretsiz kayıt ol, mentor onayından sonra e-posta ile bilgilendirileceksin. 
                Onay süreci genellikle 24 saat içinde tamamlanır.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Değerlendirme Etaplarını Tamamla
              </h3>
              <p className="text-gray-600">
                9 aşamalı değerlendirme sürecinde her 7 günde bir yeni etap aktif olur. 
                Her etapta yeteneklerini, ilgi alanlarını ve hedeflerini keşfedeceksin.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Raporunu Al ve Geleceğini Planla
              </h3>
              <p className="text-gray-600">
                AI tarafından hazırlanan ve mentor onaylı raporunu indir. 
                Kariyer önerileri, gelişim planı ve meslek tavsiyeleri ile geleceğini şekillendir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Geleceğin Mesleğini Keşfetmeye Hazır Mısın?
          </h2>
          <p className="text-lg mb-8 text-blue-50">
            Binlerce genç gibi sen de kariyer yolculuğuna bugün başla
          </p>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Hemen Başla - Ücretsiz
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600 text-sm space-y-3">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a href="/gizlilik-politikasi" className="hover:text-indigo-600 transition-colors">
              Gizlilik Politikası
            </a>
            <a href="/kullanim-sartlari" className="hover:text-indigo-600 transition-colors">
              Kullanım Şartları
            </a>
            <a href="/gizlilik-politikasi" className="hover:text-indigo-600 transition-colors">
              KVKK Aydınlatma Metni
            </a>
            <a href="mailto:destek@meslegim.tr" className="hover:text-indigo-600 transition-colors">
              İletişim
            </a>
          </div>
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
