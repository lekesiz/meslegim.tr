import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { LogIn, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, UserPlus, ArrowLeft } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

const quotes = [
  { text: "Kendini bilen insan, kariyerinde de doğru kararlar alır.", author: "Meslegim.tr" },
  { text: "Değerleriniz, kariyerinizin pusulasıdır.", author: "Meslegim.tr" },
  { text: "Doğru iş, sizin değerlerinizle örtüşen iştir.", author: "Meslegim.tr" },
];

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
  const [quoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

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
    <div className="min-h-screen flex">
      <SEO title="Giriş Yap" description="Meslegim.tr kariyer değerlendirme platformuna giriş yapın." noIndex />
      
      {/* Left: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0F1D3B] via-[#1A2D4A] to-[#2C5282] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--gold)]/[0.06] blur-[100px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[var(--steel)]/[0.08] blur-[80px] animate-float-delayed" />
        </div>
        <div className="relative z-10 max-w-sm">
          <button onClick={() => setLocation('/')} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mb-8 shadow-xl shadow-[var(--gold)]/20 cursor-pointer">
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

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[var(--cream)] relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-60 h-60 rounded-full bg-[var(--gold)]/[0.04] blur-[60px]" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[var(--steel)]/[0.04] blur-[60px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
          <div className="card-elevated p-8 lg:p-10">
            <div className="text-center mb-8">
              <button onClick={() => setLocation('/')} className="inline-flex items-center gap-2.5 mb-6 lg:hidden cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-lg font-bold text-[var(--navy)]">Meslegim.tr</span>
              </button>
              <h1 className="text-2xl font-bold text-[var(--navy)] mb-2">Hoş Geldiniz</h1>
              <p className="text-sm text-[var(--slate-muted)]">Kariyer platformuna devam etmek için giriş yapın</p>
            </div>

            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">{resetSuccess}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <Label htmlFor="login-email" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-light)]" />
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all h-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-right">
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-[var(--steel)] hover:underline font-semibold cursor-pointer"
                    >
                      Şifremi Unuttum
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-[var(--navy)]">Şifre Sıfırlama</DialogTitle>
                      <DialogDescription className="text-sm text-[var(--slate-muted)]">
                        E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                      <div>
                        <Label htmlFor="reset-email" className="block text-sm font-medium text-[var(--slate-text)] mb-1.5">E-posta</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            setResetError("");
                          }}
                          className="w-full rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] h-11"
                          placeholder="ornek@email.com"
                        />
                      </div>
                      {resetError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-700">{resetError}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => resetPasswordMutation.mutate({ email: resetEmail })}
                        disabled={!resetEmail || resetPasswordMutation.isPending}
                        className="w-full rounded-xl h-11 bg-gradient-to-r from-[var(--navy)] to-[var(--steel)] text-white font-semibold cursor-pointer"
                      >
                        {resetPasswordMutation.isPending ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full btn-primary py-3.5 mt-2 cursor-pointer"
              >
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[var(--slate-muted)] font-medium">veya</span>
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4">
              <p className="text-sm text-[var(--slate-muted)]">
                Hesabınız yok mu?{" "}
                <button
                  type="button"
                  onClick={() => setLocation('/?kayit=1')}
                  className="text-[var(--steel)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Ücretsiz Kayıt Ol <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </p>
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="flex items-center gap-1.5 text-xs text-[var(--slate-muted)] hover:text-[var(--navy)] mx-auto transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Ana sayfaya dön
              </button>
            </div>
          </div>
          
          <p className="text-center text-xs text-[var(--slate-muted)] mt-8 leading-relaxed max-w-sm mx-auto">
            Giriş yaparak{" "}
            <button onClick={() => setLocation('/kullanim-sartlari')} className="underline hover:text-[var(--navy)] font-medium">
              Kullanım Şartları
            </button>
            {" "}ve{" "}
            <button onClick={() => setLocation('/gizlilik-politikasi')} className="underline hover:text-[var(--navy)] font-medium">
              Gizlilik Politikası
            </button>
            'nı kabul etmiş olursunuz.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
