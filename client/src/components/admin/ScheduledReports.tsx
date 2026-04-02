import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduledReports() {
  const { data: settings, isLoading } = trpc.admin.getScheduledReportSettings.useQuery();
  const utils = trpc.useUtils();
  
  const setSettingMutation = trpc.admin.setScheduledReportSetting.useMutation({
    onSuccess: () => {
      utils.admin.getScheduledReportSettings.invalidate();
      toast.success('Raporlama ayarı güncellendi');
    },
    onError: () => {
      toast.error('Ayar güncellenirken hata oluştu');
    },
  });

  const sendManualMutation = trpc.admin.sendManualKPIReport.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success('KPI raporu email adresinize gönderildi');
      } else {
        toast.error('Rapor gönderilemedi. Email ayarlarınızı kontrol edin.');
      }
    },
    onError: () => {
      toast.error('Rapor gönderilirken hata oluştu');
    },
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Henüz gönderilmedi';
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Otomatik KPI Raporlama</h3>
          <p className="text-sm text-muted-foreground">
            Platform KPI özetini belirli aralıklarla admin email adreslerine otomatik gönderir
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sendManualMutation.mutate()}
          disabled={sendManualMutation.isPending}
        >
          {sendManualMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Şimdi Gönder
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Report */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Haftalık Rapor
              </CardTitle>
              <Switch
                checked={settings?.weeklyEnabled ?? true}
                onCheckedChange={(checked) => {
                  setSettingMutation.mutate({ period: 'weekly', enabled: checked });
                }}
                disabled={setSettingMutation.isPending}
              />
            </div>
            <CardDescription>Her Pazartesi saat 08:00'de gönderilir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Son gönderim:</span>
              <span className="font-medium">{formatDate(settings?.lastWeeklySent ?? null)}</span>
            </div>
            <div className="mt-2">
              {settings?.weeklyEnabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                </Badge>
              ) : (
                <Badge variant="secondary">Devre Dışı</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Report */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                Aylık Rapor
              </CardTitle>
              <Switch
                checked={settings?.monthlyEnabled ?? true}
                onCheckedChange={(checked) => {
                  setSettingMutation.mutate({ period: 'monthly', enabled: checked });
                }}
                disabled={setSettingMutation.isPending}
              />
            </div>
            <CardDescription>Her ayın 1'inde saat 08:00'de gönderilir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Son gönderim:</span>
              <span className="font-medium">{formatDate(settings?.lastMonthlySent ?? null)}</span>
            </div>
            <div className="mt-2">
              {settings?.monthlyEnabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                </Badge>
              ) : (
                <Badge variant="secondary">Devre Dışı</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Rapor İçeriği</p>
              <p>
                Otomatik raporlar şu KPI'ları içerir: toplam kullanıcı sayısı, yeni kayıtlar, 
                gelir özeti, aktif kullanıcılar, dönüşüm oranı, tamamlanan etaplar, rapor sayıları 
                ve bekleyen raporlar. Raporlar tüm admin rolündeki kullanıcılara gönderilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
