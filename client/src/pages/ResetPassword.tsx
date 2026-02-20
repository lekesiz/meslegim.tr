import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function ResetPassword() {
  const params = useParams();
  const token = params.token || "";
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
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
    
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }
    
    resetPasswordMutation.mutate({ token, newPassword });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
          <CardDescription>Hesabınız için yeni bir şifre oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full"
            >
              {resetPasswordMutation.isPending ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-primary hover:underline"
              >
                Giriş sayfasına dön
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
