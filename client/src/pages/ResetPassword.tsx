import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { CheckCircle, XCircle, Lock, ArrowLeft, Briefcase } from "lucide-react";
import { SEO } from "@/components/SEO";

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: "En az 8 karakter", valid: password.length >= 8 },
    { label: "Büyük harf (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Küçük harf (a-z)", valid: /[a-z]/.test(password) },
    { label: "Rakam (0-9)", valid: /[0-9]/.test(password) },
  ], [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      {checks.map((check, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {check.valid ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className={check.valid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ResetPassword() {
  const params = useParams();
  const token = params.token || "";
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const isPasswordValid = useMemo(() => {
    return newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword);
  }, [newPassword]);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      setSuccess(true);
      toast.success(data.message);
      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Şifre sıfırlama başarısız");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    
    if (!isPasswordValid) {
      toast.error("Şifre gereksinimleri karşılanmıyor");
      return;
    }
    
    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <SEO title="Şifre Güncellendi" noIndex />
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Şifreniz Güncellendi</h2>
            <p className="text-muted-foreground text-sm">
              Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <Button onClick={() => setLocation('/login')} variant="outline" className="mt-4">
              Giriş Sayfasına Git
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <SEO title="Yeni Şifre Belirle" noIndex />
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
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-xl">Yeni Şifre Belirle</CardTitle>
            <CardDescription>Hesabınız için güçlü bir şifre oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Güçlü bir şifre girin"
                  className="h-11"
                />
                <PasswordStrength password={newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className="h-11"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Şifreler eşleşmiyor
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Şifreler eşleşiyor
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || !isPasswordValid || newPassword !== confirmPassword}
                className="w-full h-11 !bg-blue-600 hover:!bg-blue-700 text-white font-medium"
              >
                {resetPasswordMutation.isPending ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Giriş sayfasına dön
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
