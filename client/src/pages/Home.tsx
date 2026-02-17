import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2, GraduationCap, Target, TrendingUp } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tcKimlik: "",
    ageGroup: "",
    kvkkConsent: false,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect based on role
    const dashboardPath = 
      user.role === 'admin' ? '/dashboard/admin' :
      user.role === 'mentor' ? '/dashboard/mentor' :
      '/dashboard/student';
    
    window.location.href = dashboardPath;
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Manus OAuth with registration data in state
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Meslegim.tr</h1>
          </div>
          <Button variant="outline" onClick={() => window.location.href = getLoginUrl()}>
            Giriş Yap
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kariyer Yolculuğunuz Burada Başlıyor
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              14-24 yaş arası gençlere özel, çok aşamalı ve yapay zeka destekli kariyer değerlendirme platformu. 
              Yeteneklerinizi keşfedin, potansiyelinizi ortaya çıkarın ve size özel kariyer yol haritanızı alın.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">3 Etap</p>
                <p className="text-sm text-gray-600">Değerlendirme</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">AI Destekli</p>
                <p className="text-sm text-gray-600">Raporlama</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Mentor</p>
                <p className="text-sm text-gray-600">Desteği</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Kayıt Ol</CardTitle>
              <CardDescription>
                Kariyer değerlendirmenize başlamak için bilgilerinizi girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tcKimlik">TC Kimlik No *</Label>
                  <Input
                    id="tcKimlik"
                    maxLength={11}
                    required
                    value={formData.tcKimlik}
                    onChange={(e) => setFormData({ ...formData, tcKimlik: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="ageGroup">Yaş Grubu *</Label>
                  <Select
                    required
                    value={formData.ageGroup}
                    onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yaş grubunuzu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14-17">14-17 Yaş (Lise)</SelectItem>
                      <SelectItem value="18-21">18-21 Yaş (Üniversite)</SelectItem>
                      <SelectItem value="22-24">22-24 Yaş (Yeni Mezun)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* KVKK Consent */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="kvkkConsent"
                      required
                      checked={formData.kvkkConsent}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, kvkkConsent: checked as boolean })
                      }
                    />
                    <Label htmlFor="kvkkConsent" className="text-sm leading-relaxed cursor-pointer">
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-primary underline cursor-pointer">
                            Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
                          </span>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>KVKK Aydınlatma Metni</DialogTitle>
                            <DialogDescription>
                              Kişisel verilerinizin işlenmesi hakkında bilgilendirme
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4 text-sm">
                              <section>
                                <h3 className="font-semibold mb-2">1. Veri Sorumlusu</h3>
                                <p>Meslegim.tr platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">2. İşlenen Kişisel Veriler</h3>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Kimlik Bilgileri: Ad, soyad, TC Kimlik No</li>
                                  <li>İletişim Bilgileri: E-posta, telefon</li>
                                  <li>Değerlendirme Verileri: Anket cevapları, test sonuçları</li>
                                  <li>Demografik Bilgiler: Yaş grubu</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">3. Kişisel Verilerin İşlenme Amacı</h3>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Kariyer değerlendirme hizmetlerinin sunulması</li>
                                  <li>Kişiselleştirilmiş raporların oluşturulması</li>
                                  <li>Mentor-öğrenci eşleştirmesi</li>
                                  <li>İletişim ve bilgilendirme</li>
                                  <li>Hizmet kalitesinin iyileştirilmesi</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">4. Kişisel Verilerin Aktarılması</h3>
                                <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Atanmış mentorlara</li>
                                  <li>Yapay zeka rapor oluşturma servisleri (Manus AI)</li>
                                  <li>Bulut altyapı sağlayıcılarına (Vercel, NeonDB)</li>
                                </ul>
                                <p className="mt-2">aktarılabilecektir.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">5. Kişisel Verilerin Toplanma Yöntemi</h3>
                                <p>Kişisel verileriniz, kayıt formları, değerlendirme anketleri ve platform kullanımı sırasında elektronik ortamda toplanmaktadır.</p>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">6. Haklarınız</h3>
                                <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                                  <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                                  <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                                  <li>Düzeltme, silme ve yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                                  <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                                  <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                                </ul>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">7. Veri Saklama Süresi</h3>
                                <p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal yükümlülüklerimiz çerçevesinde saklanacaktır.</p>
                              </section>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      {" "}metnini okudum, anladım ve kişisel verilerimin bu amaçlar doğrultusunda işlenmesini kabul ediyorum. *
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Kayıt Ol ve Devam Et
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Kayıt olduktan sonra, hesabınız bir mentor tarafından onaylanacaktır.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Kayıt Olun</h4>
              <p className="text-gray-600">Bilgilerinizi girin ve mentor onayını bekleyin</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Değerlendirmeleri Tamamlayın</h4>
              <p className="text-gray-600">3 etaplık değerlendirme sürecini tamamlayın</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Raporunuzu Alın</h4>
              <p className="text-gray-600">AI destekli kişiselleştirilmiş kariyer raporunuzu inceleyin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
