import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from 'sonner';

const categories = [
  { value: 'genel', label: 'Genel Bilgi' },
  { value: 'teknik', label: 'Teknik Destek' },
  { value: 'odeme', label: 'Ödeme / Fatura' },
  { value: 'oneri', label: 'Öneri / Geri Bildirim' },
  { value: 'sikayet', label: 'Şikayet' },
] as const;

export default function Iletisim() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'genel' as 'genel' | 'teknik' | 'odeme' | 'oneri' | 'sikayet',
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Lütfen tüm alanları doldurunuz.");
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      <SEO 
        title="İletişim" 
        description="Meslegim.tr ile iletişime geçin. Teknik destek, ödeme sorunları, öneriler ve geri bildirimler için bize ulaşın." 
      />
      
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-lg">İletişim</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Başlık */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Bize Ulaşın</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki formu doldurun veya doğrudan iletişim bilgilerimizi kullanın.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            {/* İletişim Kartları */}
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
              <h2 className="text-lg font-semibold text-foreground">İletişim Bilgileri</h2>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">E-posta</p>
                  <a href="mailto:destek@meslegim.tr" className="text-blue-600 hover:underline text-sm">
                    destek@meslegim.tr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Telefon</p>
                  <p className="text-muted-foreground text-sm">+90 (212) 000 00 00</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Adres</p>
                  <p className="text-muted-foreground text-sm">İstanbul, Türkiye</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Çalışma Saatleri</p>
                  <p className="text-muted-foreground text-sm">Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p className="text-muted-foreground text-sm">E-posta: 24 saat içinde yanıt</p>
                </div>
              </div>
            </div>

            {/* Hızlı Linkler */}
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Hızlı Linkler</h2>
              <div className="space-y-2">
                <a href="/sss" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors py-1">
                  <span className="text-blue-600">→</span> Sıkça Sorulan Sorular
                </a>
                <a href="/gizlilik-politikasi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors py-1">
                  <span className="text-blue-600">→</span> Gizlilik Politikası
                </a>
                <a href="/kullanim-sartlari" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors py-1">
                  <span className="text-blue-600">→</span> Kullanım Koşulları
                </a>
                <a href="/fiyatlandirma" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors py-1">
                  <span className="text-blue-600">→</span> Fiyatlandırma
                </a>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Mesajınız Gönderildi</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Mesajınız başarıyla iletildi. Destek ekibimiz en kısa sürede size dönüş yapacaktır. 
                    Acil durumlar için destek@meslegim.tr adresinden bize ulaşabilirsiniz.
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setLocation('/')}>
                      Ana Sayfaya Dön
                    </Button>
                    <Button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '', category: 'genel' }); }}>
                      Yeni Mesaj Gönder
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-foreground mb-6">İletişim Formu</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                          Adınız Soyadınız <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Adınız Soyadınız"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                          E-posta Adresiniz <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="ornek@email.com"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="contact-category" className="text-sm font-medium text-foreground">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="contact-category"
                          value={formData.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
                          Konu <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          placeholder="Mesajınızın konusu"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                        Mesajınız <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Mesajınızı buraya yazın... (en az 10, en fazla 2000 karakter)"
                        rows={6}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        required
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.message.length}/2000
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Mesajı Gönder
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="text-center text-muted-foreground text-sm pt-8 pb-4">
          <p>Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </main>
    </div>
  );
}
