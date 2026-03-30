import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, Copy, Tag, Percent } from 'lucide-react';
import { toast } from 'sonner';

export function PromotionCodeManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: codes, isLoading } = trpc.promotionCode.getAll.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.promotionCode.create.useMutation({
    onSuccess: () => {
      toast.success('Promosyon kodu oluşturuldu');
      utils.promotionCode.getAll.invalidate();
      setCreateOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = trpc.promotionCode.update.useMutation({
    onSuccess: () => {
      toast.success('Promosyon kodu güncellendi');
      utils.promotionCode.getAll.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.promotionCode.delete.useMutation({
    onSuccess: () => {
      toast.success('Promosyon kodu silindi');
      utils.promotionCode.getAll.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod kopyalandı');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promosyon Kodları</h2>
          <p className="text-muted-foreground">İndirim kodlarını oluşturun ve yönetin</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kod Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Promosyon Kodu</DialogTitle>
              <DialogDescription>Yeni bir indirim kodu oluşturun</DialogDescription>
            </DialogHeader>
            <PromoCodeForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kod</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kodlar</CardTitle>
            <Tag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes?.filter((c: any) => c.isActive).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanım</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes?.reduce((sum: number, c: any) => sum + (c.currentUses || 0), 0) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Code List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Kullanım</TableHead>
                <TableHead>Geçerlilik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes && codes.length > 0 ? (
                codes.map((code: any) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(code.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {code.discountType === 'percentage' ? `%${code.discountValue}` : `${code.discountValue} TL`}
                    </TableCell>
                    <TableCell>
                      {code.currentUses}/{code.maxUses || '∞'}
                    </TableCell>
                    <TableCell>
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.isActive ? 'default' : 'secondary'}>
                        {code.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMutation.mutate({ id: code.id, isActive: !code.isActive })}
                        >
                          {code.isActive ? 'Devre Dışı' : 'Aktif Et'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Bu kodu silmek istediğinize emin misiniz?')) {
                              deleteMutation.mutate({ id: code.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Henüz promosyon kodu bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PromoCodeForm({ onSubmit, isPending, onCancel }: {
  onSubmit: (data: any) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'MESLEGIM-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : 1,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Promosyon Kodu *</Label>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: MESLEGIM-2024"
            required
            className="font-mono"
          />
          <Button type="button" variant="outline" onClick={generateCode}>
            Oluştur
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>İndirim Tipi *</Label>
          <Select value={discountType} onValueChange={setDiscountType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Yüzde (%)</SelectItem>
              <SelectItem value="fixed">Sabit (TL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>İndirim Değeri *</Label>
          <Input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? 'Örn: 20' : 'Örn: 50'}
            required
            min="1"
            max={discountType === 'percentage' ? '100' : '10000'}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Maks. Kullanım</Label>
          <Input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Sınırsız"
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label>Kişi Başı Maks.</Label>
          <Input
            type="number"
            value={maxUsesPerUser}
            onChange={(e) => setMaxUsesPerUser(e.target.value)}
            placeholder="1"
            min="1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Son Geçerlilik Tarihi</Label>
        <Input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Oluştur
        </Button>
      </div>
    </form>
  );
}
