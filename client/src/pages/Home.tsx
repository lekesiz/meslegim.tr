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
import { toast } from "sonner";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
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
      toast.success("Başvurunuz alındı! Mentor onayından sonra e-posta ile bilgilendirileceksiniz.");
      setShowForm(false);
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
      toast.error(error.message || "Kayıt sırasında bir hata oluştu");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kvkkConsent) {
      toast.error("KVKK metnini onaylamanız gerekmektedir");
      return;
    }

    if (!formData.ageGroup) {
      toast.error("Lütfen yaş grubunuzu seçiniz");
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meslegim.tr
          </h1>
          <p className="text-xl text-gray-600">
            Kariyer Değerlendirme Platformu
          </p>
        </div>

        <div className="text-center">
          <p className="text-gray-700 mb-6">
            14-24 yaş arası gençler için özel olarak tasarlanmış kariyer
            değerlendirme platformuna hoş geldiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="text-lg px-8"
            >
              Başvuru Yap
            </Button>
            <Button
              onClick={() => window.location.href = '/login'}
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              Giriş Yap
            </Button>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">9</div>
            <div className="text-gray-700">Aşamalı Değerlendirme</div>
          </div>
          <div className="text-center p-6 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">7</div>
            <div className="text-gray-700">Günlük Aktivasyon</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
            <div className="text-gray-700">Destekli Raporlama</div>
          </div>
        </div>
      </div>
    </div>
  );
}
