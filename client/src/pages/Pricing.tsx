import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, ArrowLeft, Loader2, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Pricing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  const { data: products } = trpc.payment.getProducts.useQuery();
  const { data: myAccess } = trpc.payment.getMyAccess.useQuery(undefined, {
    enabled: !!user,
  });

  const createCheckout = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      toast.error(err.message || "Ödeme işlemi başlatılamadı");
      setLoadingProduct(null);
    },
  });

  const handlePurchase = (productId: string) => {
    if (!user) {
      toast.info("Satın almak için giriş yapmanız gerekiyor");
      navigate("/login");
      return;
    }
    setLoadingProduct(productId);
    createCheckout.mutate({ productId: productId as any });
  };

  const isCurrentPackage = (pkgId: string) => myAccess?.currentPackage === pkgId;

  const packageIcons: Record<string, React.ReactNode> = {
    basic_package: <Zap className="h-6 w-6" />,
    professional_package: <Star className="h-6 w-6" />,
    enterprise_package: <Crown className="h-6 w-6" />,
  };

  const packageColors: Record<string, string> = {
    basic_package: "from-blue-500 to-blue-600",
    professional_package: "from-amber-500 to-amber-600",
    enterprise_package: "from-purple-500 to-purple-600",
  };

  const packageBorderColors: Record<string, string> = {
    basic_package: "border-blue-200 hover:border-blue-400",
    professional_package: "border-amber-300 hover:border-amber-500 ring-2 ring-amber-200",
    enterprise_package: "border-purple-200 hover:border-purple-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Meslegim.tr
          </h1>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Panelim
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Giriş Yap
            </Button>
          )}
        </div>
      </header>

      <main className="container py-12 md:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Kariyer Yolculuğunuza Yatırım Yapın
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Size Uygun Paketi Seçin
          </h2>
          <p className="text-lg text-muted-foreground">
            İlk etap her zaman ücretsiz. Kariyer keşfinizi derinleştirmek için ihtiyacınıza uygun paketi seçin.
          </p>
        </div>

        {/* Freemium Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Ücretsiz Başlayın</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                İlk etap (İlgi Alanları Testi - RIASEC) tamamen ücretsiz. Kayıt olun ve hemen başlayın!
              </p>
            </div>
            {!user && (
              <Button onClick={() => navigate("/login")} className="ml-auto bg-green-600 hover:bg-green-700 shrink-0">
                Ücretsiz Başla
              </Button>
            )}
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {products?.packages.map((pkg) => {
            const isCurrent = isCurrentPackage(pkg.id);
            const isPopular = pkg.popular;

            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 ${packageBorderColors[pkg.id] || ""} ${isPopular ? "scale-[1.02] shadow-xl" : "shadow-md hover:shadow-lg"}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <div className={`bg-gradient-to-r ${packageColors[pkg.id]} text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg`}>
                      {pkg.badge}
                    </div>
                  </div>
                )}

                {/* Package Icon Header */}
                <div className={`bg-gradient-to-r ${packageColors[pkg.id]} p-6 text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    {packageIcons[pkg.id]}
                    <CardTitle className="text-xl text-white">{pkg.name}</CardTitle>
                  </div>
                  <CardDescription className="text-white/80">{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{(pkg.priceInCents / 100).toFixed(0)}</span>
                    <span className="text-lg ml-1">₺</span>
                    <span className="text-sm text-white/70 ml-2">tek seferlik</span>
                  </div>
                </div>

                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-0 pb-6">
                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Mevcut Paketiniz
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={loadingProduct === pkg.id}
                      className={`w-full ${isPopular ? `bg-gradient-to-r ${packageColors[pkg.id]} hover:opacity-90` : ""}`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      {loadingProduct === pkg.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Yönlendiriliyor...
                        </>
                      ) : (
                        "Satın Al"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Single Products */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Tek Seferlik Ürünler</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {products?.singleProducts.map((product) => (
              <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{(product.priceInCents / 100).toFixed(0)}</span>
                    <span className="text-lg ml-1">₺</span>
                  </div>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={loadingProduct === product.id}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingProduct === product.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Yönlendiriliyor...
                      </>
                    ) : (
                      "Satın Al"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h3 className="text-2xl font-bold text-center mb-8">Sıkça Sorulan Sorular</h3>
          <div className="space-y-4">
            {[
              {
                q: "İlk etap gerçekten ücretsiz mi?",
                a: "Evet! İlk etap (İlgi Alanları Testi - RIASEC) tamamen ücretsiz. Kayıt olduktan sonra hemen başlayabilirsiniz.",
              },
              {
                q: "Ödeme güvenli mi?",
                a: "Tüm ödemeler Stripe altyapısı üzerinden güvenli bir şekilde işlenmektedir. Kart bilgileriniz bizim sunucularımızda saklanmaz.",
              },
              {
                q: "Paket yükseltme yapabilir miyim?",
                a: "Evet, istediğiniz zaman daha üst bir pakete geçiş yapabilirsiniz. Mevcut ilerlemeniz korunur.",
              },
              {
                q: "İade politikanız nedir?",
                a: "Satın alma tarihinden itibaren 7 gün içinde, henüz ücretli etaplara başlamadıysanız tam iade yapılabilir.",
              },
            ].map((faq, i) => (
              <div key={i} className="border rounded-lg p-5">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Meslegim.tr - Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
