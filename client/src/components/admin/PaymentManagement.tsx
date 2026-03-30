import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, DollarSign, CreditCard, RefreshCcw, AlertTriangle, TrendingUp, Package, Undo2 } from 'lucide-react';

const PRODUCT_NAMES: Record<string, string> = {
  basic_package: 'Temel Paket',
  professional_package: 'Profesyonel Paket',
  enterprise_package: 'Kurumsal Paket',
  ai_career_report: 'AI Kariyer Raporu',
  single_stage_unlock: 'Tekli Etap Açma',
};

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  completed: { label: 'Tamamlandı', variant: 'default' },
  pending: { label: 'Beklemede', variant: 'secondary' },
  failed: { label: 'Başarısız', variant: 'destructive' },
  refunded: { label: 'İade Edildi', variant: 'outline' },
};

function formatCurrency(amountInCents: number): string {
  return `${(amountInCents / 100).toFixed(2)} ₺`;
}

export function PaymentManagement() {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');

  const { data: purchases, isLoading: purchasesLoading } = trpc.admin.getAllPurchases.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.admin.getPurchaseStats.useQuery();
  const utils = trpc.useUtils();

  const refundMutation = trpc.admin.refundPurchase.useMutation({
    onSuccess: () => {
      toast.success('İade başarıyla gerçekleştirildi');
      utils.admin.getAllPurchases.invalidate();
      utils.admin.getPurchaseStats.invalidate();
      setRefundDialogOpen(false);
      setSelectedPurchase(null);
      setRefundReason('');
    },
    onError: (error) => {
      toast.error(`İade başarısız: ${error.message}`);
    },
  });

  const handleRefund = () => {
    if (!selectedPurchase) return;
    refundMutation.mutate({
      purchaseId: selectedPurchase.id,
      reason: refundReason || undefined,
    });
  };

  if (purchasesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tamamlanan ödemelerden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPurchases || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedPurchases || 0} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İade Edilen</CardTitle>
            <Undo2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.refundedPurchases || 0}</div>
            <p className="text-xs text-muted-foreground">
              İade işlemi yapıldı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingPurchases || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ödeme bekleniyor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Satın Alma Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Satın Alma Geçmişi</CardTitle>
          <CardDescription>
            Tüm satın alma işlemlerini görüntüleyin ve iade yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: any) => {
                    const statusInfo = STATUS_MAP[purchase.status] || { label: purchase.status, variant: 'outline' as const };
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono text-sm">#{purchase.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.userName || 'Bilinmiyor'}</div>
                            <div className="text-xs text-muted-foreground">{purchase.userEmail || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PRODUCT_NAMES[purchase.productId] || purchase.productId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(purchase.amountInCents)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(purchase.createdAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          {purchase.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                setRefundDialogOpen(true);
                              }}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              İade
                            </Button>
                          )}
                          {purchase.status === 'refunded' && (
                            <span className="text-xs text-muted-foreground">İade edildi</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz satın alma kaydı bulunmamaktadır.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* İade Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              İade Onayı
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Stripe üzerinden iade yapılacak ve kullanıcının paketi düşürülecektir.
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Kullanıcı:</span>
                  <span className="text-sm font-medium">{selectedPurchase.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ürün:</span>
                  <span className="text-sm font-medium">
                    {PRODUCT_NAMES[selectedPurchase.productId] || selectedPurchase.productId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tutar:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(selectedPurchase.amountInCents)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundReason">İade Nedeni (Opsiyonel)</Label>
                <Input
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Örn: Müşteri talebi, hatalı satın alma..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialogOpen(false);
                setSelectedPurchase(null);
                setRefundReason('');
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İade Yapılıyor...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  İade Onayla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
