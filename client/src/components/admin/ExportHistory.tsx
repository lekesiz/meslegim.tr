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
import { trpc } from '@/lib/trpc';
import { Loader2, FileDown, ChevronLeft, ChevronRight, Clock, User, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const EXPORT_TYPE_LABELS: Record<string, string> = {
  kpi: 'KPI Özet',
  daily_registrations: 'Günlük Kayıtlar',
  monthly_revenue: 'Aylık Gelir',
  daily_revenue: 'Günlük Gelir',
  report_stats: 'Rapor İstatistikleri',
  user_activity: 'Kullanıcı Aktivite',
  package_distribution: 'Paket Dağılımı',
  all: 'Toplu Dışa Aktarma',
};

const PRESET_LABELS: Record<string, string> = {
  today: 'Bugün',
  last7: 'Son 7 Gün',
  last30: 'Son 30 Gün',
  last90: 'Son 3 Ay',
  all: 'Tüm Zamanlar',
  custom: 'Özel Aralık',
};

function getExportTypeBadgeColor(type: string): string {
  switch (type) {
    case 'kpi': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'daily_registrations': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'monthly_revenue': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    case 'daily_revenue': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
    case 'report_stats': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    case 'user_activity': return 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';
    case 'package_distribution': return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
    case 'all': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  }
}

const PAGE_SIZE = 20;

export function ExportHistory() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = trpc.admin.getCsvExportLogs.useQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!logs.length) return null;
    const typeCount = new Map<string, number>();
    logs.forEach(log => {
      const current = typeCount.get(log.exportType) || 0;
      typeCount.set(log.exportType, current + 1);
    });
    return {
      totalOnPage: logs.length,
      totalAll: total,
      byType: Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [logs, total]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">tüm zamanlar</p>
          </CardContent>
        </Card>
        {summaryStats?.byType.slice(0, 3).map(([type, count]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {EXPORT_TYPE_LABELS[type] || type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mt-1">bu sayfada</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                CSV Dışa Aktarma Geçmişi
              </CardTitle>
              <CardDescription>
                Yöneticiler tarafından yapılan tüm CSV dışa aktarma işlemleri
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {total} kayıt
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileDown className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Henüz dışa aktarma yapılmamış</p>
              <p className="text-sm mt-1">Analitik panelden CSV dışa aktarma yaptığınızda burada görünecektir.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Export Tipi</TableHead>
                      <TableHead>Dosya Adı</TableHead>
                      <TableHead className="text-center">Kayıt Sayısı</TableHead>
                      <TableHead>Tarih Filtresi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, idx) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {page * PAGE_SIZE + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(log.createdAt), 'd MMM yyyy HH:mm', { locale: tr })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{log.userName || `Kullanıcı #${log.userId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getExportTypeBadgeColor(log.exportType)}`}>
                            {EXPORT_TYPE_LABELS[log.exportType] || log.exportType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono text-muted-foreground">
                            {log.fileName}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {log.recordCount !== null ? (
                            <Badge variant="outline" className="text-xs">
                              {log.recordCount}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">
                              {log.dateFilterPreset 
                                ? PRESET_LABELS[log.dateFilterPreset] || log.dateFilterPreset
                                : 'Belirtilmemiş'
                              }
                            </span>
                            {log.dateFilterPreset === 'custom' && log.dateFilterStart && log.dateFilterEnd && (
                              <span className="text-xs text-muted-foreground">
                                ({format(new Date(log.dateFilterStart), 'd MMM', { locale: tr })} - {format(new Date(log.dateFilterEnd), 'd MMM', { locale: tr })})
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Sayfa {page + 1} / {totalPages} ({total} toplam kayıt)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
