import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="text-primary hover:underline"
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
