import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Mail, Smartphone, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { isSupported, isSubscribed, isLoading: pushLoading, permission, subscribe, unsubscribe } = usePushNotifications();
  const emailPrefs = trpc.notifications.getEmailPreferences.useQuery();
  const updatePrefs = trpc.notifications.updateEmailPreferences.useMutation({
    onSuccess: () => {
      emailPrefs.refetch();
      toast.success('E-posta tercihleri güncellendi');
    },
    onError: () => {
      toast.error('Tercihler güncellenirken hata oluştu');
    },
  });

  const handlePushToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) toast.success('Push bildirimleri kapatıldı');
      else toast.error('Push bildirimleri kapatılamadı');
    } else {
      const success = await subscribe();
      if (success) toast.success('Push bildirimleri açıldı');
      else {
        if (permission === 'denied') {
          toast.error('Tarayıcı bildirimleri engellenmiş. Lütfen tarayıcı ayarlarından izin verin.');
        } else {
          toast.error('Push bildirimleri açılamadı');
        }
      }
    }
  };

  const handleEmailPrefChange = (key: string, value: boolean) => {
    updatePrefs.mutate({ [key]: value });
  };

  const emailPrefItems = [
    { key: 'stageActivation', label: 'Etap Açılma Bildirimi', desc: 'Yeni bir etap aktif olduğunda e-posta al' },
    { key: 'reportReady', label: 'Rapor Bildirimi', desc: 'Raporunuz hazır olduğunda veya incelendiğinde e-posta al' },
    { key: 'badgeEarned', label: 'Rozet Kazanım Bildirimi', desc: 'Yeni bir rozet kazandığınızda e-posta al' },
    { key: 'certificateReady', label: 'Sertifika Bildirimi', desc: 'Sertifikanız hazır olduğunda e-posta al' },
    { key: 'stageReminder', label: 'Etap Hatırlatması', desc: 'Tamamlanmamış etaplar için hatırlatma e-postası al' },
    { key: 'weeklyDigest', label: 'Haftalık Özet', desc: 'Haftalık ilerleme özeti e-postası al' },
    { key: 'marketingEmails', label: 'Duyuru ve Haberler', desc: 'Platform duyuruları ve yeni özellikler hakkında e-posta al' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bildirim Ayarları</h1>
        <p className="text-muted-foreground mt-1">Bildirim tercihlerinizi yönetin</p>
      </div>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Tarayıcı Push Bildirimleri</CardTitle>
              <CardDescription>Tarayıcınız üzerinden anlık bildirimler alın</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Info className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Tarayıcınız push bildirimlerini desteklemiyor. Lütfen güncel bir tarayıcı kullanın.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSubscribed ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" /> Kapalı
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isSubscribed
                      ? 'Push bildirimleri açık. Anlık bildirimler alıyorsunuz.'
                      : 'Push bildirimleri kapalı. Açmak için butona tıklayın.'}
                  </span>
                </div>
                <Button
                  variant={isSubscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                >
                  {pushLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : isSubscribed ? (
                    <BellOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Bell className="h-4 w-4 mr-1" />
                  )}
                  {isSubscribed ? 'Kapat' : 'Aç'}
                </Button>
              </div>
              {permission === 'denied' && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Bildirim izni engellenmiş. Tarayıcı ayarlarından meslegim.tr için bildirimlere izin verin.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">E-posta Bildirimleri</CardTitle>
              <CardDescription>Hangi olaylarda e-posta almak istediğinizi seçin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emailPrefs.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {emailPrefItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={(emailPrefs.data as any)?.[item.key] ?? true}
                    onCheckedChange={(checked) => handleEmailPrefChange(item.key, checked)}
                    disabled={updatePrefs.isPending}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Platform içi bildirimler (zil ikonu) her zaman aktiftir ve kapatılamaz.</p>
              <p>E-posta ve push bildirimleri yukarıdaki tercihlerinize göre gönderilir.</p>
              <p>Hesap güvenliği ile ilgili e-postalar (şifre sıfırlama vb.) her zaman gönderilir.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
