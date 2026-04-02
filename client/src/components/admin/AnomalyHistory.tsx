import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, AlertOctagon, CheckCircle, TrendingUp, TrendingDown, ShieldAlert, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AnomalyHistory() {
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<string>('all');
  const [acknowledgeDialog, setAcknowledgeDialog] = useState<{ id: number; label: string } | null>(null);
  const [notes, setNotes] = useState('');

  const limit = 10;

  const { data: summary, isLoading: summaryLoading } = trpc.admin.getAnomalySummary.useQuery();

  const { data: anomalies, isLoading, refetch } = trpc.admin.getKpiAnomalies.useQuery({
    page,
    limit,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    acknowledged: acknowledgedFilter === 'all' ? undefined : acknowledgedFilter === 'yes',
  });

  const acknowledgeMutation = trpc.admin.acknowledgeAnomaly.useMutation({
    onSuccess: () => {
      toast.success('Anomali onaylandı');
      refetch();
      setAcknowledgeDialog(null);
      setNotes('');
    },
    onError: () => toast.error('Onaylama başarısız'),
  });

  const runCheckMutation = trpc.admin.runAnomalyCheck.useMutation({
    onSuccess: (data) => {
      toast.success(`Anomali kontrolü tamamlandı: ${data.anomaliesFound} anomali tespit edildi`);
      refetch();
    },
    onError: () => toast.error('Anomali kontrolü başarısız'),
  });

  const handleAcknowledge = useCallback(() => {
    if (!acknowledgeDialog) return;
    acknowledgeMutation.mutate({
      anomalyId: acknowledgeDialog.id,
      notes: notes || undefined,
    });
  }, [acknowledgeDialog, notes, acknowledgeMutation]);

  const totalPages = Math.ceil((anomalies?.total || 0) / limit);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Onay Bekleyen</p>
                <p className="text-xl font-bold">{summary?.unacknowledged ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kritik</p>
                <p className="text-xl font-bold">{summary?.criticalCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bugün</p>
                <p className="text-xl font-bold">{summary?.todayCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bu Hafta</p>
                <p className="text-xl font-bold">{summary?.thisWeekCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler ve Manuel Kontrol */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">Anomali Geçmişi</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Seviye" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Seviyeler</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                  <SelectItem value="warning">Uyarı</SelectItem>
                </SelectContent>
              </Select>

              <Select value={acknowledgedFilter} onValueChange={(v) => { setAcknowledgedFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="no">Onay Bekleyen</SelectItem>
                  <SelectItem value="yes">Onaylanmış</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => runCheckMutation.mutate()}
                disabled={runCheckMutation.isPending}
              >
                <Play className="h-3 w-3 mr-1" />
                {runCheckMutation.isPending ? 'Kontrol ediliyor...' : 'Manuel Kontrol'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              ))}
            </div>
          ) : anomalies?.items && anomalies.items.length > 0 ? (
            <div className="space-y-2">
              {anomalies.items.map((anomaly: any) => (
                <div
                  key={anomaly.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    anomaly.acknowledged
                      ? 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800'
                      : anomaly.severity === 'critical'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  {/* İkon */}
                  <div className={`p-2 rounded-full ${
                    anomaly.severity === 'critical'
                      ? 'bg-red-100 dark:bg-red-900/50'
                      : 'bg-amber-100 dark:bg-amber-900/50'
                  }`}>
                    {anomaly.direction === 'up'
                      ? <TrendingUp className={`h-4 w-4 ${anomaly.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                      : <TrendingDown className={`h-4 w-4 ${anomaly.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                    }
                  </div>

                  {/* Detay */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{anomaly.kpiLabel}</span>
                      <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {anomaly.severity === 'critical' ? 'Kritik' : 'Uyarı'}
                      </Badge>
                      {anomaly.acknowledged && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Onaylandı
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {anomaly.direction === 'up' ? '↑' : '↓'} %{Math.round(anomaly.deviationPercent / 100)} sapma
                      {' · '}Günlük: {anomaly.currentValue} · Ortalama: {anomaly.avgValue}
                      {' · '}{formatDate(anomaly.date)}
                    </p>
                    {anomaly.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">Not: {anomaly.notes}</p>
                    )}
                  </div>

                  {/* Aksiyon */}
                  {!anomaly.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs shrink-0"
                      onClick={() => setAcknowledgeDialog({ id: anomaly.id, label: anomaly.kpiLabel })}
                    >
                      Onayla
                    </Button>
                  )}
                </div>
              ))}

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3">
                  <p className="text-xs text-muted-foreground">
                    Toplam {anomalies.total} anomali
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {page} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz anomali tespit edilmedi</p>
              <p className="text-xs mt-1">Sistem günlük olarak KPI değerlerini kontrol eder</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onaylama Dialog */}
      <Dialog open={!!acknowledgeDialog} onOpenChange={() => { setAcknowledgeDialog(null); setNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anomaliyi Onayla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>{acknowledgeDialog?.label}</strong> anomalisini incelediğinizi onaylayın.
            </p>
            <Textarea
              placeholder="Not ekleyin (opsiyonel)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAcknowledgeDialog(null); setNotes(''); }}>
              İptal
            </Button>
            <Button onClick={handleAcknowledge} disabled={acknowledgeMutation.isPending}>
              {acknowledgeMutation.isPending ? 'Onaylanıyor...' : 'Onayla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
