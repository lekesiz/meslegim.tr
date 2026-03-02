import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Settings, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function PlatformSettings() {
  const utils = trpc.useUtils();

  // Fetch all platform settings
  const { data: settings, isLoading } = trpc.admin.getPlatformSettings.useQuery();

  // Local state for the delay days input
  const [delayDays, setDelayDays] = useState<string>('7');
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      const delaySetting = settings.find(s => s.key === 'stage_transition_delay_days');
      if (delaySetting) {
        setDelayDays(delaySetting.value);
      }
    }
  }, [settings]);

  const setSettingMutation = trpc.admin.setPlatformSetting.useMutation({
    onSuccess: () => {
      utils.admin.getPlatformSettings.invalidate();
      toast.success('Platform ayarları kaydedildi');
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Kaydetme hatası: ${error.message}`);
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    const parsed = parseInt(delayDays, 10);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Lütfen geçerli bir gün sayısı girin (0 veya daha fazla)');
      return;
    }
    if (parsed > 365) {
      toast.error('Maksimum 365 gün girebilirsiniz');
      return;
    }
    setIsSaving(true);
    setSettingMutation.mutate({
      key: 'stage_transition_delay_days',
      value: String(parsed),
      description: 'Bir etap tamamlandıktan sonra bir sonraki etabın açılması için bekleme süresi (gün)',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const currentDelay = settings?.find(s => s.key === 'stage_transition_delay_days')?.value ?? '7';
  const lastUpdated = settings?.find(s => s.key === 'stage_transition_delay_days')?.updatedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Platform Ayarları
        </h2>
        <p className="text-muted-foreground mt-1">
          Platformun genel davranışını yapılandırın. Değişiklikler anında geçerli olur.
        </p>
      </div>

      {/* Stage Transition Delay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Etap Geçiş Süresi
          </CardTitle>
          <CardDescription>
            Bir öğrenci bir etabı tamamladıktan sonra bir sonraki etabın otomatik olarak açılması için
            beklenecek gün sayısını belirleyin. Sıfır (0) girerseniz etaplar anında açılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="delay-days">Bekleme Süresi (Gün)</Label>
              <Input
                id="delay-days"
                type="number"
                min={0}
                max={365}
                value={delayDays}
                onChange={(e) => setDelayDays(e.target.value)}
                placeholder="7"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Mevcut değer: <strong>{currentDelay} gün</strong>
                {lastUpdated && (
                  <span className="ml-2 text-muted-foreground">
                    (Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')})
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || delayDays === currentDelay}
              className="mb-6"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
            <p className="font-medium">Bu ayar nasıl çalışır?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Öğrenci bir etabı tamamladığında, sistem bir sonraki etabı <strong>{delayDays || '?'} gün</strong> sonra açmak üzere planlar.</li>
              <li>Her gece yarısı çalışan otomatik görev, süresi dolan kilitli etapları aktif hale getirir.</li>
              <li>Değişiklik yalnızca yeni tamamlanan etaplara uygulanır; mevcut planlanmış etaplar etkilenmez.</li>
              <li>Değer 0 olursa etaplar tamamlanır tamamlanmaz anında açılır.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* All settings table (for transparency) */}
      {settings && settings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Platform Ayarları</CardTitle>
            <CardDescription>Sistemde kayıtlı tüm yapılandırma değerleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Anahtar</th>
                    <th className="px-4 py-2 text-left font-medium">Değer</th>
                    <th className="px-4 py-2 text-left font-medium">Açıklama</th>
                    <th className="px-4 py-2 text-left font-medium">Son Güncelleme</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((setting) => (
                    <tr key={setting.key} className="border-b last:border-0">
                      <td className="px-4 py-2 font-mono text-xs">{setting.key}</td>
                      <td className="px-4 py-2 font-semibold">{setting.value}</td>
                      <td className="px-4 py-2 text-muted-foreground">{setting.description || '-'}</td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">
                        {new Date(setting.updatedAt).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
