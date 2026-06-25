import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
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
  ChevronRight,
  Shield,
  BarChart3,
  Quote,
  Menu,
  Award,
  User,
  Mail,
  Lock,
  Phone
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const quotes = [
  { text: "Kendini bilen insan, kariyerinde de doğru kararlar alır.", author: "Meslegim.tr" },
  { text: "Değerleriniz, kariyerinizin pusulasıdır.", author: "Meslegim.tr" },
  { text: "Doğru iş, sizin değerlerinizle örtüşen iştir.", author: "Meslegim.tr" },
];

const features = [
  { icon: Brain, title: "Bilimsel Temelli", desc: "Freya değer envanteri modeline dayanan, araştırılmış 46 değer kriteri.", color: "from-violet-500 to-indigo-500" },
  { icon: BarChart3, title: "6 Kategorili Analiz", desc: "Prestij, Toplumsal Etki, Çalışma Koşulları, Görev, Sosyal ve Özerklik.", color: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "Kişiselleştirilmiş Rapor", desc: "Size özel kariyer önerileri ve uygun çalışma ortamı tavsiyeleri.", color: "from-emerald-500 to-teal-500" },
  { icon: Users, title: "Uzman Mentor Desteği", desc: "Deneyimli kariyer mentorları raporlarınızı inceler ve onaylar.", color: "from-amber-500 to-orange-500" },
  { icon: Shield, title: "Güvenli ve Gizli", desc: "Verileriniz sadece size özeldir. KVKK uyumlu veri saklama altyapısı.", color: "from-rose-500 to-pink-500" },
  { icon: Sparkles, title: "Modern Arayüz", desc: "Kolay kullanımlı, etkileşimli ve görsel açıdan zengin deneyim.", color: "from-fuchsia-500 to-purple-500" },
];

const steps = [
  { num: "01", title: "Başvuru Yapın ve Onaylanın", desc: "Ücretsiz kayıt olun, mentor onayından sonra e-posta ile bilgilendirileceksiniz." },
  { num: "02", title: "Değerlendirmeyi Tamamlayın", desc: "9 aşamalı değerlendirme sürecinde her etapta yeteneklerinizi ve ilgi alanlarınızı keşfedin." },
  { num: "03", title: "Rapor ve Sertifikanızı Alın", desc: "AI destekli ve mentor onaylı kapsamlı kariyer raporunuzu ve sertifikanızı indirin." },
];

const socialProof = [
  { name: "Ayşe K.", role: "İK Uzmanı", text: "Meslegim.tr, kariyer danışmanlığı yaptığım öğrencilerimin değerlerini keşfetmelerinde kullandığım en etkili araçlardan biri." },
  { name: "Mehmet T.", role: "Yazılım Mühendisi", text: "Değerlendirmeleri tamamladıktan sonra kendimi çok daha iyi tanımaya başladım. AI destekli rapor gerçekten çok isabetliydi." },
  { name: "Zeynep A.", role: "Üniversite Öğrencisi", text: "Mezun olmadan önce kariyer yönümü belirlememde çok yardımcı oldu. Mentorların geri bildirimleri harikaydi." },
];

export default function Home() {
  const [, setLocation] = useLocation();
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
  const [quoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      analytics.register(formData.ageGroup);
      setFormSuccess("Başvurunuz alındı! Mentor onayından sonra e-posta ile bilgilendirileceksiniz.");
      setFormError("");
      toast.success("Başvurunuz başarıyla gönderildi!");
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
      toast.error(error.message || "Kayıt sırasında bir hata oluştu");
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

    // Password policy validation
    if (formData.password.length < 8) {
      setFormError("Şifre en az 8 karakter olmalıdır");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setFormError("Şifre en az bir büyük harf içermelidir");
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setFormError("Şifre en az bir küçük harf içermelidir");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setFormError("Şifre en az bir rakam içermelidir");
      return;
    }

    // TC Kimlik validation
    if (formData.tcKimlik.length !== 11 || !/^\d{11}$/.test(formData.tcKimlik) || formData.tcKimlik[0] === '0') {
      setFormError("Geçerli bir TC Kimlik numarası giriniz (11 haneli, 0 ile başlamaz)");
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
      <div className="min-h-screen flex">
        <Toaster position="top-center" richColors />
        <SEO title="Kayıt Ol" description="Meslegim.tr kariyer değerlendirme platformuna başvurun." noIndex />
        
        {/* Left Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0F1D3B] via-[#1A2D4A] to-[#2C5282] items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--gold)]/[0.06] blur-[100px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[var(--steel)]/[0.08] blur-[80px] animate-float-delayed" />
          </div>
          <div className="relative z-10 max-w-sm">
            <button onClick={() => setShowForm(false)} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mb-8 shadow-xl shadow-[var(--gold)]/20 cursor-pointer">
              <span className="text-[var(--navy)] font-extrabold text-3xl">M</span>
            </button>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Profesyonel<br />Değer Envanteri</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10">Kariyerinizde sizi gerçekten motive eden değerleri keşfedin. Bilimsel temelli değer envanteri ile kariyerinize yön verin.</p>

            <div className="border-l-2 border-[var(--gold)]/30 pl-5">
              <p className="text-white/60 text-sm italic leading-relaxed mb-3">"{quotes[quoteIndex].text}"</p>
              <p className="text-[var(--gold)]/60 text-xs font-medium">— {quotes[quoteIndex].author}</p>
            </div>

            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['A', 'M', 'Z'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[var(--navy)] flex items-center justify-center text-white text-xs font-bold">{c}</div>
                ))}
              </div>
              <p className="text-white/30 text-xs">Binlerce kişi kariyerini şekillendirdi</p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[var(--cream)] relative overflow-y-auto">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-60 h-60 rounded-full bg-[var(--gold)]/[0.04] blur-[60px]" />
            <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-[var(--steel)]/[0.04] blur-[60px]" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-lg my-8">
            <div className="card-elevated p-8 lg:p-10">
              <div className="text-center mb-8">
                <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-2.5 mb-6 lg:hidden cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <span className="text-lg font-bold text-[var(--navy)]">Meslegim.tr</span>
                </button>
                <h1 className="text-2xl font-bold text-[var(--navy)] mb-2">Başvuru Formu</h1>
                <p className="text-sm text-[var(--slate-muted)]">Kariyer analizi sürecini başlatmak için başvuru bilgilerinizi doldurun</p>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  ⚠️ {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  ✅ {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">Ad Soyad *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">E-posta Adresi *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">Telefon Numarası *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tcKimlik" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">T.C. Kimlik No *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
                    <Input
                      id="tcKimlik"
                      type="text"
                      required
                      maxLength={11}
                      value={formData.tcKimlik}
                      onChange={(e) => setFormData({ ...formData, tcKimlik: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                      placeholder="11 haneli kimlik numaranız"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">Şifre *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                      placeholder="En az 8 karakter, büyük/küçük harf ve rakam"
                    />
                  </div>
                  {formData.password && formData.password.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs px-1">
                      <div className={formData.password.length >= 8 ? "text-green-600 font-medium" : "text-red-500"}>
                        {formData.password.length >= 8 ? "✓" : "✗"} En az 8 karakter
                      </div>
                      <div className={/[A-Z]/.test(formData.password) ? "text-green-600 font-medium" : "text-red-500"}>
                        {/[A-Z]/.test(formData.password) ? "✓" : "✗"} En az bir büyük harf
                      </div>
                      <div className={/[a-z]/.test(formData.password) ? "text-green-600 font-medium" : "text-red-500"}>
                        {/[a-z]/.test(formData.password) ? "✓" : "✗"} En az bir küçük harf
                      </div>
                      <div className={/[0-9]/.test(formData.password) ? "text-green-600 font-medium" : "text-red-500"}>
                        {/[0-9]/.test(formData.password) ? "✓" : "✗"} En az bir rakam
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="ageGroup" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">Yaş Grubu *</Label>
                  <Select
                    value={formData.ageGroup}
                    onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] h-11">
                      <SelectValue placeholder="Yaş grubunuzu seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14-17">14-17 yaş (Lise)</SelectItem>
                      <SelectItem value="18-21">18-21 yaş (Üniversite)</SelectItem>
                      <SelectItem value="22-24">22-24 yaş (Kariyer/Mezun)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="kvkk"
                      checked={formData.kvkkConsent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, kvkkConsent: checked === true })
                      }
                      className="mt-1 shrink-0"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="kvkk"
                        className="text-xs text-[var(--slate-muted)] cursor-pointer leading-relaxed"
                      >
                        <span className="font-bold text-[var(--navy)]">KVKK Aydınlatma Metni:</span>{" "}
                        Kişisel verilerimin, 6698 sayılı Kişisel Verilerin Korunması
                        Kanunu kapsamında kariyer değerlendirme hizmeti sunulması
                        amacıyla işlenmesine, saklanmasına ve kullanılmasına açık
                        rıza gösteriyorum. *
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl h-11 border-[var(--border)] text-[var(--slate-muted)] hover:bg-slate-50 cursor-pointer"
                  >
                    İptal
                  </Button>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 btn-primary py-0 h-11 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    {registerMutation.isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
                <p className="text-sm text-[var(--slate-muted)]">
                  Zaten hesabınız var mı?{' '}
                  <button onClick={() => setLocation('/login')} className="text-[var(--steel)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer">
                    Giriş Yap <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] relative">
      <SEO
        title="Ana Sayfa"
        description="Meslegim.tr - Kariyer değerlendirme platformu. Kişisel yeteneklerini keşfet, kariyer yolunu belirle. Yapay zeka destekli kariyer analizi ve profesyonel rehberlik."
        keywords="kariyer değerlendirme, meslek seçimi, yetenek testi, kariyer rehberliği, meslek testi, üniversite tercih"
      />
      <Toaster position="top-center" richColors />

      {/* HERO SECTION */}
      <section aria-label="Giriş" className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0F1D3B] via-[#1A2D4A] to-[#2C5282]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--gold)]/[0.07] blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--steel)]/[0.1] blur-[100px] animate-float-delayed" />
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-[var(--gold)]/[0.04] blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Header/Navbar */}
        <nav aria-label="Ana navigasyon" className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto section-padding h-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/20">
                <span className="text-[var(--navy)] font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Meslegim.tr</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/fiyatlandirma" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Fiyatlandırma</a>
              <a href="/sss" className="text-sm font-medium text-white/70 hover:text-white transition-colors">SSS</a>
              <a href="/iletisim" className="text-sm font-medium text-white/70 hover:text-white transition-colors">İletişim</a>
              <ThemeToggle />
              <button onClick={() => setLocation('/login')} className="text-sm font-medium text-white/60 hover:text-white transition-colors px-4 py-2 cursor-pointer">Giriş Yap</button>
              <button onClick={() => setShowForm(true)} className="btn-accent text-xs py-2.5 px-5 cursor-pointer">Ücretsiz Başla</button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menü</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-[var(--navy)] border-white/10 text-white">
                  <nav className="flex flex-col gap-5 mt-8">
                    <a href="/fiyatlandirma" className="text-lg font-medium text-white/80 hover:text-white transition-colors py-2 border-b border-white/5">Fiyatlandırma</a>
                    <a href="/sss" className="text-lg font-medium text-white/80 hover:text-white transition-colors py-2 border-b border-white/5">SSS</a>
                    <a href="/iletisim" className="text-lg font-medium text-white/80 hover:text-white transition-colors py-2 border-b border-white/5">İletişim</a>
                    <button onClick={() => { setLocation('/login'); }} className="text-left text-lg font-medium text-white/80 hover:text-white transition-colors py-2 border-b border-white/5 cursor-pointer">Giriş Yap</button>
                    <button onClick={() => { setShowForm(true); }} className="btn-accent text-sm w-full py-3 mt-4 cursor-pointer">Ücretsiz Başla</button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        {/* Hero Body */}
        <div className="relative max-w-7xl mx-auto section-padding w-full pt-28 pb-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-[var(--gold)]/20 mb-6">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-sm font-medium text-[var(--gold-light)]">AI Destekli Değerlendirme</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Geleceğin Mesleğini<br /><span className="text-gradient-gold">Keşfedin</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base lg:text-lg text-white/50 mb-8 leading-relaxed max-w-lg">
                14-24 yaş arası gençler için özel tasarlanmış bilimsel değer envanteri ve yapay zeka analizi ile yeteneklerinize ve değerlerinize en uygun kariyer yolunu belirleyin.
              </motion.p>

              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4 mb-10">
                <button onClick={() => setShowForm(true)} className="btn-accent px-8 py-4 text-base cursor-pointer">Ücretsiz Değerlendirme Al <ArrowRight className="w-5 h-5 ml-2" /></button>
                <button onClick={() => document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-sm font-semibold text-white/70 border-2 border-white/15 rounded-xl hover:border-white/30 hover:text-white transition-all cursor-pointer">Nasıl Çalışır?</button>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex items-center gap-8">
                {[{ v: "9", l: "Aşama" }, { v: "375", l: "Değer Sorusu" }, { v: "AI", l: "Gelişim Planı" }].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-[var(--gold)] font-bold text-sm">{s.v}</span>
                    </div>
                    <span className="text-xs text-white/40 font-medium">{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Elevated Card Mockup */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[var(--gold)]/10 via-[var(--steel)]/5 to-transparent blur-2xl" />
                <div className="relative card-elevated p-8 backdrop-blur-xl bg-white/90">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-medium text-[var(--slate-muted)] bg-slate-100 px-2 py-1 rounded-md">Etap 1 / Değerler</span>
                  </div>
                  <p className="text-[var(--slate-muted)] text-sm mb-3 text-center">İş hayatınızda sizin için neyin önemli olduğunu düşünün</p>
                  <p className="text-lg font-bold text-[var(--navy)] leading-relaxed text-center mb-6">
                    İş yerinde <span className="text-[var(--gold-dark)]">motivasyonunuzu yükselten</span> bir ortamda çalışmak
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs text-[var(--slate-muted)] w-16 text-right">Önemsiz</span>
                    <input type="range" min="1" max="11" defaultValue="8" className="flex-1" readOnly style={{ background: 'linear-gradient(to right, var(--gold) 70%, #e2e8f0 70%)' }} />
                    <span className="text-xs text-[var(--slate-muted)] w-20">Çok Önemli</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/30">
                      <ChevronRight className="w-5 h-5 text-[var(--navy)]" />
                    </div>
                  </div>
                </div>

                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-4 -right-8 card-elevated p-4 bg-white shadow-xl border border-[var(--gold)]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center"><Target className="w-5 h-5 text-white" /></div>
                    <div><div className="text-xs text-[var(--slate-muted)] font-medium">RIASEC Profili</div><div className="text-sm font-bold text-[var(--navy)]">Sosyal / Girişimci</div></div>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-4 -left-8 card-elevated p-4 bg-white shadow-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-white" /></div>
                    <div><div className="text-xs text-[var(--slate-muted)] font-medium">Grup Uyumu</div><div className="text-sm font-bold text-[var(--navy)]">%92 Kariyer Uyumu</div></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto"><path d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z" fill="#F8FAFC" className="fill-[var(--cream)]" /></svg>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[var(--cream)] pt-4 pb-16">
        <div className="max-w-5xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative -mt-20 lg:-mt-24 z-10 grid grid-cols-2 md:grid-cols-4 gap-0 bg-[var(--navy)] rounded-2xl overflow-hidden shadow-2xl shadow-[var(--navy)]/20">
            {[{ v: "9", l: "Değerlendirme Etabı" }, { v: "7 Gün", l: "Geçiş Süresi" }, { v: "3 Yaş Grubu", l: "Özel İçerik" }, { v: "100%", l: "Kişiye Özel Rapor" }].map((s, i) => (
              <div key={i} className={`text-center py-8 px-4 ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <div className="text-3xl font-extrabold text-gradient-gold mb-1">{s.v}</div>
                <div className="text-xs text-white/50 font-medium uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-[var(--gold-dark)] uppercase tracking-[0.15em] mb-3 block">Özellikler</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">Neden <span className="text-gradient-gold">Meslegim.tr</span>?</h2>
            <p className="text-[var(--slate-muted)] max-w-xl mx-auto leading-relaxed">Kariyer yolculuğunuzda en doğru kararları almak için önce kendinizi keşfedin. Yapay zeka ve uzman mentor eşleşmeleri ile yanınızdayız.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="card-elevated p-8 group cursor-default transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--slate-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="nasil-calisir" className="py-24 bg-[var(--cream)]">
        <div className="max-w-6xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-[var(--gold-dark)] uppercase tracking-[0.15em] mb-3 block">Süreç</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">Nasıl <span className="text-gradient-gold">Çalışır</span>?</h2>
            <p className="text-[var(--slate-muted)] max-w-lg mx-auto">Basit ve adım adım ilerleyen süreçle yetenek ve değer haritanızı oluşturun.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] mb-6 shadow-lg shadow-[var(--navy)]/20 relative z-10">
                  <span className="text-white font-bold text-2xl">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--navy)] mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--slate-muted)] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold text-[var(--gold-dark)] uppercase tracking-[0.15em] mb-3 block">Kullanıcı Yorumları</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)]">Kariyerine Yön Veren <span className="text-gradient-gold">Gençlerin Hikayeleri</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {socialProof.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elevated p-8 relative">
                <Quote className="w-8 h-8 text-[var(--gold)]/20 absolute top-6 right-6" />
                <p className="text-sm text-[var(--slate-text)] leading-relaxed mb-6 italic">&ldquo;{p.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--navy)]">{p.name}</div>
                    <div className="text-xs text-[var(--slate-muted)]">{p.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section aria-label="Harekete geç" className="py-20 bg-[var(--cream)]">
        <div className="max-w-5xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--steel)] to-[var(--navy)] p-12 lg:p-16 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[var(--gold)] blur-3xl" />
              <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[var(--gold)] blur-3xl" />
            </div>
            <div className="relative">
              <Award className="h-16 w-16 mx-auto mb-6 text-[var(--gold)]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Geleceğinizi Planlamaya Başlayın</h2>
              <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">Bilimsel temelli değerlendirmeyi tamamlayarak hedeflerinize emin adımlarla ilerleyin.</p>
              <button onClick={() => setShowForm(true)} className="btn-accent text-base px-10 py-4 cursor-pointer">
                Hemen Başla - Ücretsiz <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer aria-label="Site altı" className="bg-[var(--navy)] text-white py-14">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center">
                  <span className="text-[var(--navy)] font-bold">M</span>
                </div>
                <span className="text-lg font-bold">Meslegim.tr</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">Profesyonel değer envanteri ve AI kariyer analizi platformu.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[var(--gold-light)]">Sayfalar</h4>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li><a href="/fiyatlandirma" className="hover:text-[var(--gold)] transition-colors">Fiyatlandırma</a></li>
                <li><a href="/sss" className="hover:text-[var(--gold)] transition-colors">Sıkça Sorulan Sorular</a></li>
                <li><a href="/iletisim" className="hover:text-[var(--gold)] transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[var(--gold-light)]">Sözleşmeler</h4>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li><a href="/gizlilik-politikasi" className="hover:text-[var(--gold)] transition-colors">Gizlilik Politikası</a></li>
                <li><a href="/kullanim-sartlari" className="hover:text-[var(--gold)] transition-colors">Kullanım Şartları</a></li>
                <li><a href="/gizlilik-politikasi#kvkk" className="hover:text-[var(--gold)] transition-colors">KVKK Aydınlatma Metni</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[var(--gold-light)]">Destek</h4>
              <p className="text-sm text-white/40">Destek almak için iletişim sayfamızı kullanabilir ya da e-posta atabilirsiniz:</p>
              <p className="text-sm text-[var(--gold-light)] mt-2 font-medium">info@meslegim.tr</p>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 text-center text-xs text-white/25">
            &copy; 2026 Meslegim.tr. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
