import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const resetPasswordMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsResetDialogOpen(false);
      setResetEmail("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Şifre sıfırlama başarısız");
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Giriş başarılı!");
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        setLocation('/dashboard/admin');
      } else if (data.user.role === 'mentor') {
        setLocation('/dashboard/mentor');
      } else {
        setLocation('/dashboard/student');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Giriş başarısız");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>Meslegim.tr hesabınıza giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
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
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Şifreniz"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-primary hover:underline"
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
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="ornek@email.com"
                      />
                    </div>
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
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="text-muted-foreground hover:underline"
              >
                Ana sayfaya dön
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
