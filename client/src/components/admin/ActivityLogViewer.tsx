import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Activity, Clock, User } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  'user.login': 'Giriş Yaptı',
  'user.register': 'Kayıt Oldu',
  'user.roleChange': 'Rol Değişikliği',
  'school.create': 'Okul Oluşturuldu',
  'school.update': 'Okul Güncellendi',
  'school.delete': 'Okul Silindi',
  'promo.create': 'Promosyon Oluşturuldu',
  'promo.update': 'Promosyon Güncellendi',
  'promo.delete': 'Promosyon Silindi',
  'payment.checkout': 'Ödeme Başlatıldı',
  'payment.success': 'Ödeme Başarılı',
  'payment.refund': 'İade Yapıldı',
  'stage.complete': 'Etap Tamamlandı',
  'stage.unlock': 'Etap Açıldı',
  'report.generate': 'Rapor Oluşturuldu',
  'mentor.assign': 'Mentor Atandı',
};

const ACTION_COLORS: Record<string, string> = {
  'user': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'school': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'promo': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'payment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'stage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'report': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'mentor': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export function ActivityLogViewer() {
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: logs, isLoading } = trpc.superAdmin.getActivityLogs.useQuery({
    limit: 100,
    action: actionFilter || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredLogs = logs?.filter((log: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.entityType?.toLowerCase().includes(q)
    );
  }) || [];

  const getActionCategory = (action: string) => action.split('.')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Aktivite Logları</h2>
        <p className="text-muted-foreground">Sistemdeki tüm önemli aksiyonları takip edin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs?.filter((l: any) => {
                const today = new Date();
                const logDate = new Date(l.createdAt);
                return logDate.toDateString() === today.toDateString();
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benzersiz Kullanıcı</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs?.map((l: any) => l.userId)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı veya aksiyon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tüm aksiyonlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Aksiyonlar</SelectItem>
            <SelectItem value="user.login">Giriş</SelectItem>
            <SelectItem value="user.register">Kayıt</SelectItem>
            <SelectItem value="user.roleChange">Rol Değişikliği</SelectItem>
            <SelectItem value="school.create">Okul Oluşturma</SelectItem>
            <SelectItem value="payment.success">Ödeme Başarılı</SelectItem>
            <SelectItem value="payment.refund">İade</SelectItem>
            <SelectItem value="promo.create">Promosyon Oluşturma</SelectItem>
            <SelectItem value="stage.complete">Etap Tamamlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Aksiyon</TableHead>
                <TableHead>Varlık</TableHead>
                <TableHead>Detay</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(log.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName || `User #${log.userId}`}</TableCell>
                    <TableCell>
                      <Badge className={ACTION_COLORS[getActionCategory(log.action)] || 'bg-muted text-foreground'}>
                        {ACTION_LABELS[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.entityType ? (
                        <span className="text-sm text-muted-foreground">
                          {log.entityType}{log.entityId ? ` #${log.entityId}` : ''}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.ipAddress || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aktivite kaydı bulunmamaktadır.
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
