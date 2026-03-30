import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, XCircle, Clock, Package } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  completed: { label: "Tamamlandı", variant: "default", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pending: { label: "Bekliyor", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  failed: { label: "Başarısız", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  refunded: { label: "İade Edildi", variant: "outline", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const productNameMap: Record<string, string> = {
  basic_package: "Temel Paket",
  professional_package: "Profesyonel Paket",
  enterprise_package: "Kurumsal Paket",
  ai_career_report: "AI Kariyer Raporu",
  single_stage_unlock: "Tekli Etap Açma",
};

export default function PaymentHistory() {
  const { data: purchases, isLoading } = trpc.payment.getMyPurchases.useQuery();
  const { data: access } = trpc.payment.getMyAccess.useQuery();

  return (
    <div className="space-y-6">
      {/* Current Package */}
      {access && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Mevcut Paketiniz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {access.currentPackage === 'free' ? 'Ücretsiz Plan' : productNameMap[access.currentPackage] || access.currentPackage}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Maksimum {access.access.maxStages === 99 ? 'sınırsız' : access.access.maxStages} etap erişimi
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {access.access.aiReport && <Badge variant="outline" className="text-xs">AI Rapor</Badge>}
              {access.access.careerProfile && <Badge variant="outline" className="text-xs">Kariyer Profili</Badge>}
              {access.access.certificate && <Badge variant="outline" className="text-xs">Sertifika</Badge>}
              {access.access.mentorSupport && <Badge variant="outline" className="text-xs">Mentor Desteği</Badge>}
              {access.access.prioritySupport && <Badge variant="outline" className="text-xs">Öncelikli Destek</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Ödeme Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
          ) : !purchases || purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Henüz bir ödeme kaydınız bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase: any) => {
                const status = statusMap[purchase.status] || statusMap.pending;
                return (
                  <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2 shrink-0">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {productNameMap[purchase.productId] || purchase.productId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-11 sm:ml-0">
                      <span className="font-semibold text-sm">
                        {(purchase.amountInCents / 100).toFixed(0)} ₺
                      </span>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
