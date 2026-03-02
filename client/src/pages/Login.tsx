import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Briefcase, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  const resetPasswordMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setResetSuccess(data.message || "Şifre sıfırlama linki e-posta adresinize gönderildi.");
      setResetError("");
      setIsResetDialogOpen(false);
      setResetEmail("");
    },
    onError: (error: any) => {
      setResetError(error.message || "Şifre sıfırlama başarısız. Lütfen tekrar deneyin.");
      setResetSuccess("");
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setErrorMessage("");
      // Hard redirect so auth state is fully refreshed
      window.location.replace('/dashboard');
    },
    onError: (error: any) => {
      const msg = error.message || "";
      if (msg.includes("onay") || msg.includes("pending") || msg.includes("approved")) {
        setErrorMessage("Hesabınız henüz onaylanmamış. Mentor onayından sonra e-posta ile bilgilendirileceksiniz.");
      } else if (msg.includes("şifre") || msg.includes("password") || msg.includes("credentials") || msg.includes("Invalid")) {
        setErrorMessage("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      } else if (msg.includes("bulunamadı") || msg.includes("not found")) {
        setErrorMessage("Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.");
      } else {
        setErrorMessage(msg || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Meslegim.tr
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Kariyer Değerlendirme Platformu</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Hesabınıza Giriş Yapın</CardTitle>
            <CardDescription>E-posta ve şifrenizle devam edin</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Şifre sıfırlama başarı mesajı */}
            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">{resetSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrorMessage("");
                  }}
                  placeholder="ornek@email.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrorMessage("");
                  }}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>

              {/* Hata mesajı */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>

              <div className="flex items-center justify-between text-sm pt-1">
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Şifremi Unuttum
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Şifre Sıfırlama</DialogTitle>
                      <DialogDescription>
                        E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="reset-email">E-posta</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            setResetError("");
                          }}
                          placeholder="ornek@email.com"
                        />
                      </div>
                      {resetError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-700">{resetError}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => resetPasswordMutation.mutate({ email: resetEmail })}
                        disabled={!resetEmail || resetPasswordMutation.isPending}
                        className="w-full"
                      >
                        {resetPasswordMutation.isPending ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <button
                  type="button"
                  onClick={() => setLocation('/?kayit=1')}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Ücretsiz Kayıt Ol
                </button>
              </p>
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Ana sayfaya dön
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Giriş yaparak{" "}
          <button onClick={() => setLocation('/kullanim-sartlari')} className="underline hover:text-foreground">
            Kullanım Şartları
          </button>
          {" "}ve{" "}
          <button onClick={() => setLocation('/gizlilik-politikasi')} className="underline hover:text-foreground">
            Gizlilik Politikası
          </button>
          'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
