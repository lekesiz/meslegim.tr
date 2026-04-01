import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Briefcase, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";

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
      analytics.login('user');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <SEO title="Giriş Yap" description="Meslegim.tr kariyer değerlendirme platformuna giriş yapın." noIndex />
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Meslegim.tr
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Kariyer Değerlendirme Platformu</p>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Hesabınıza Giriş Yapın</CardTitle>
            <CardDescription>E-posta ve şifrenizle devam edin</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Şifre sıfırlama başarı mesajı */}
            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">{resetSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-posta</Label>
                <Input
                  id="login-email"
                  name="login-email"
                  type="email"
                  required
                  autoComplete="username"
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
                <Label htmlFor="login-password">Şifre</Label>
                <Input
                  id="login-password"
                  name="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
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
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 !bg-blue-600 hover:!bg-blue-700 text-white font-medium"
              >
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>

              <div className="flex items-center justify-between text-sm pt-1">
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-700 dark:text-red-300">{resetError}</p>
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
                <span className="bg-card px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <button
                  type="button"
                  onClick={() => setLocation('/?kayit=1')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
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
