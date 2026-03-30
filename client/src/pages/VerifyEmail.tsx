import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, params] = useRoute("/verify-email/:token");
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyMutation = trpc.profile.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message);
    },
  });

  useEffect(() => {
    if (params?.token) {
      verifyMutation.mutate({ token: params.token });
    }
  }, [params?.token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-muted-foreground">E-posta adresiniz doğrulanıyor...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-700 font-medium">{message}</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                Panele Git
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-700 font-medium">{message}</p>
              <Button onClick={() => navigate("/login")} variant="outline" className="mt-4">
                Giriş Sayfasına Dön
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
