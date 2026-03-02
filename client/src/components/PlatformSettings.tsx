import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Save, Settings, Clock, Users, Unlock, AlertCircle, ChevronDown, ChevronUp, Bell, History, Mail, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const AGE_GROUPS = [
  { key: '14-17', label: '14–17 Yaş', settingKey: 'stage_transition_delay_days_14_17' },
  { key: '18-21', label: '18–21 Yaş', settingKey: 'stage_transition_delay_days_18_21' },
  { key: '22-24', label: '22–24 Yaş', settingKey: 'stage_transition_delay_days_22_24' },
];

function AgeGroupDelayCard({
  ageGroup,
  settings,
  globalDelay,
  onSave,
}: {
  ageGroup: typeof AGE_GROUPS[0];
  settings: Array<{ key: string; value: string; description: string | null; updatedAt: Date }> | undefined;
  globalDelay: string;
  onSave: (key: string, value: string, description: string) => void;
}) {
  const currentSetting = settings?.find(s => s.key === ageGroup.settingKey);
  const [value, setValue] = useState<string>(currentSetting?.value ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSetting) setValue(currentSetting.value);
  }, [currentSetting]);

  const effectiveDelay = currentSetting?.value ?? globalDelay;

  const handleSave = () => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 365) {
      toast.error('0–365 arasında geçerli bir gün sayısı girin');
      return;
    }
    setIsSaving(true);
    onSave(
      ageGroup.settingKey,
      String(parsed),
      `${ageGroup.label} grubu için etap geçiş bekleme süresi (gün)`
    );
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleClear = () => {
    // Setting to empty means "use global" - we save the global value as placeholder
    setValue('');
    toast.info(`${ageGroup.label} için özel süre kaldırıldı, global ayar kullanılacak`);
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{ageGroup.label}</span>
          {currentSetting ? (
            <Badge variant="secondary" className="text-xs">Özel: {currentSetting.value} gün</Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">Global kullanıyor: {globalDelay} gün</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Etkin süre: <strong>{effectiveDelay} gün</strong>
          {currentSetting?.updatedAt && (
            <span className="ml-2">
              (Güncellendi: {new Date(currentSetting.updatedAt).toLocaleDateString('tr-TR')})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={365}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={globalDelay}
          className="w-24 text-center"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || value === (currentSetting?.value ?? '')}
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
        </Button>
        {currentSetting && (
          <Button size="sm" variant="ghost" onClick={handleClear} title="Özel ayarı kaldır">
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

function InstantUnlockSection() {
  const { data: studentsWithLocked, isLoading, refetch } = trpc.admin.getStudentsWithLockedStages.useQuery();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState<number | null>(null);

  const unlockMutation = trpc.admin.unlockStageNow.useMutation({
    onSuccess: (data) => {
      toast.success(`"${data.stageName}" etabı başarıyla açıldı! Öğrenciye bildirim e-postası gönderildi.`);
      setUnlocking(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
      setUnlocking(null);
    },
  });

  const handleUnlock = (userId: number, userStageId: number, stageName: string) => {
    if (!confirm(`"${stageName}" etabını şimdi açmak istediğinizden emin misiniz? Öğrenciye bildirim e-postası gönderilecek.`)) return;
    setUnlocking(userStageId);
    unlockMutation.mutate({ userId, userStageId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentsWithLocked || studentsWithLocked.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 text-muted-foreground">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">Şu anda kilitli etabı olan aktif öğrenci bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {studentsWithLocked.map((student) => (
        <div key={student.userId} className="border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
            onClick={() => setExpandedUser(expandedUser === student.userId ? null : student.userId)}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {student.userName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-medium text-sm">{student.userName}</p>
                <p className="text-xs text-muted-foreground">{student.userEmail} · {student.ageGroup} yaş</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{student.lockedStages.length} kilitli etap</Badge>
              {expandedUser === student.userId ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedUser === student.userId && (
            <div className="border-t bg-muted/10 p-3 space-y-2">
              {student.lockedStages.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between p-2 rounded bg-background border">
                  <div>
                    <p className="text-sm font-medium">{stage.stageName}</p>
                    <p className="text-xs text-muted-foreground">
                      Etap {stage.stageOrder} · {stage.ageGroup} yaş grubu
                      {stage.unlockedAt && (
                        <span className="ml-2 text-amber-600">
                          · Planlanan açılış: {new Date(stage.unlockedAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleUnlock(student.userId, stage.id, stage.stageName)}
                    disabled={unlocking === stage.id}
                    className="gap-1.5"
                  >
                    {unlocking === stage.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                    Şimdi Aç
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Audit Log Component ──────────────────────────────────────────────────────
function StageUnlockAuditLog() {
  const { data: logs, isLoading } = trpc.admin.getStageUnlockLogs.useQuery({ limit: 50 });
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Etap Açılış Denetim Logu
        </CardTitle>
        <CardDescription>
          Hangi admin/mentor, hangi öğrencinin etabını ne zaman manuel olarak açtığının kayıtları (son 50 kayıt)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 text-muted-foreground">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <p className="text-sm">Henüz hiç manuel etap açma işlemi yapılmamış.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{logs.length} kayıt bulundu</span>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Daralt' : 'Tümünü Göster'}
              </Button>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">Tarih</th>
                    <th className="px-3 py-2 text-left font-medium">Açan</th>
                    <th className="px-3 py-2 text-left font-medium">Öğrenci</th>
                    <th className="px-3 py-2 text-left font-medium">Etap</th>
                    <th className="px-3 py-2 text-left font-medium">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {(expanded ? logs : logs.slice(0, 10)).map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={log.unlockedByRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {log.unlockedByRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{log.unlockedByUserId}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm">{log.studentName ?? `#${log.studentId}`}</td>
                      <td className="px-3 py-2 text-sm font-medium">{log.stageName}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{log.note ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!expanded && logs.length > 10 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                +{logs.length - 10} daha fazla kayıt var. "Tümünü Göster" butonuna tıklayın.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Test Reminder Email Component ────────────────────────────────────────────
function TestReminderEmailCard({ adminEmail }: { adminEmail?: string }) {
  const [toEmail, setToEmail] = useState(adminEmail ?? '');
  const [daysUntilOpen, setDaysUntilOpen] = useState('2');
  const [isSending, setIsSending] = useState(false);

  const sendTestMutation = trpc.admin.sendTestReminderEmail.useMutation({
    onSuccess: () => {
      toast.success(`Test e-postası ${toEmail} adresine başarıyla gönderildi!`);
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(`Gönderilemedi: ${error.message}`);
      setIsSending(false);
    },
  });

  const handleSend = () => {
    if (!toEmail || !toEmail.includes('@')) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }
    const days = parseInt(daysUntilOpen, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      toast.error('1–30 arasında geçerli bir gün sayısı girin');
      return;
    }
    setIsSending(true);
    sendTestMutation.mutate({ toEmail, daysUntilOpen: days });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Hatırlatma E-postası Önizleme
        </CardTitle>
        <CardDescription>
          Hatırlatma e-postası şablonunu test etmek için belirtilen adrese örnek bir e-posta gönderin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="test-email">Alıcı E-posta Adresi</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="admin@ornek.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 w-32">
            <Label htmlFor="test-days">Gün Sayısı</Label>
            <Input
              id="test-days"
              type="number"
              min={1}
              max={30}
              value={daysUntilOpen}
              onChange={(e) => setDaysUntilOpen(e.target.value)}
              placeholder="2"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={isSending || !toEmail}
            className="gap-2 mb-0"
          >
            {isSending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Gönderiliyor...</>
            ) : (
              <><Mail className="h-4 w-4" />Test Gönder</>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Bu işlev gerçek bir öğrenciye e-posta göndermez; yalnızca belirtilen adrese örnek bir hatırlatma e-postası gönderir.
        </p>
      </CardContent>
    </Card>
  );
}

export function PlatformSettings() {
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.admin.getPlatformSettings.useQuery();

  const [delayDays, setDelayDays] = useState<string>('7');
  const [reminderDays, setReminderDays] = useState<string>('2');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  useEffect(() => {
    if (settings) {
      const delaySetting = settings.find(s => s.key === 'stage_transition_delay_days');
      if (delaySetting) setDelayDays(delaySetting.value);
      const reminderSetting = settings.find(s => s.key === 'stage_reminder_days_before');
      if (reminderSetting) setReminderDays(reminderSetting.value);
    }
  }, [settings]);

  const setSettingMutation = trpc.admin.setPlatformSetting.useMutation({
    onSuccess: () => {
      utils.admin.getPlatformSettings.invalidate();
      toast.success('Ayar kaydedildi');
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Kaydetme hatası: ${error.message}`);
      setIsSaving(false);
    },
  });

  const handleSaveGlobal = () => {
    const parsed = parseInt(delayDays, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 365) {
      toast.error('Lütfen 0–365 arasında geçerli bir gün sayısı girin');
      return;
    }
    setIsSaving(true);
    setSettingMutation.mutate({
      key: 'stage_transition_delay_days',
      value: String(parsed),
      description: 'Bir etap tamamlandıktan sonra bir sonraki etabın açılması için varsayılan bekleme süresi (gün)',
    });
  };

  const handleSaveAgeGroup = (key: string, value: string, description: string) => {
    setSettingMutation.mutate({ key, value, description });
  };

  const handleSaveReminder = () => {
    const parsed = parseInt(reminderDays, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 30) {
      toast.error('0–30 arasında geçerli bir gün sayısı girin (0 = hatırlatma kapalı)');
      return;
    }
    setIsSavingReminder(true);
    setSettingMutation.mutate({
      key: 'stage_reminder_days_before',
      value: String(parsed),
      description: 'Etap açılmadan kaç gün önce hatırlatma e-postası gönderilsin (0 = kapalı)',
    });
    setTimeout(() => setIsSavingReminder(false), 1000);
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

      {/* Global Stage Transition Delay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Etap Geçiş Süresi — Varsayılan (Global)
          </CardTitle>
          <CardDescription>
            Yaş grubuna özel bir süre tanımlanmamışsa bu değer kullanılır. Sıfır (0) girerseniz etaplar anında açılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="delay-days">Varsayılan Bekleme Süresi (Gün)</Label>
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
                  <span className="ml-2">
                    (Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')})
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleSaveGlobal}
              disabled={isSaving || delayDays === currentDelay}
              className="mb-6"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Kaydediliyor...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Kaydet</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Age Group Specific Delays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Yaş Grubuna Özel Süreler
          </CardTitle>
          <CardDescription>
            Her yaş grubu için farklı bekleme süresi tanımlayabilirsiniz. Boş bırakırsanız global ayar kullanılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AGE_GROUPS.map((ag) => (
            <AgeGroupDelayCard
              key={ag.key}
              ageGroup={ag}
              settings={settings}
              globalDelay={currentDelay}
              onSave={handleSaveAgeGroup}
            />
          ))}
          <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Öncelik sırası:</p>
            <p>1. Yaş grubuna özel süre (tanımlanmışsa) → 2. Global varsayılan süre</p>
            <p>Örnek: 14-17 yaş için 5 gün, 22-24 yaş için 10 gün, diğerleri için global (7 gün) kullanılır.</p>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Hatırlatma E-postası
          </CardTitle>
          <CardDescription>
            Etap açılmadan kaç gün önce öğrenciye hatırlatma e-postası gönderileceğini belirleyin.
            Sıfır (0) girerseniz hatırlatma e-postası gönderilmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="reminder-days">Açılıştan Kaç Gün Önce (0 = kapalı)</Label>
              <Input
                id="reminder-days"
                type="number"
                min={0}
                max={30}
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="2"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Mevcut değer: <strong>
                  {settings?.find(s => s.key === 'stage_reminder_days_before')?.value ?? '2'} gün önce
                </strong>
                {reminderDays === '0' && (
                  <span className="ml-2 text-amber-600">(Hatırlatma kapalı)</span>
                )}
              </p>
            </div>
            <Button
              onClick={handleSaveReminder}
              disabled={isSavingReminder || reminderDays === (settings?.find(s => s.key === 'stage_reminder_days_before')?.value ?? '2')}
              className="mb-6"
            >
              {isSavingReminder ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Kaydediliyor...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Kaydet</>
              )}
            </Button>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
            <p>Hatırlatma e-postası her sabah saat 09:00'da otomatik olarak gönderilir.</p>
            <p className="mt-1">Etap açılmadan tam <strong>{reminderDays || '?'} gün</strong> önce öğrenciye "Etabınız yakında açılıyor" bildirimi ulaştırılır.</p>
          </div>
        </CardContent>
      </Card>

      {/* Instant Unlock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-primary" />
            Anlık Etap Açma
          </CardTitle>
          <CardDescription>
            Kilitli etabı olan öğrenciler için bekleme süresini atlayarak etabı anında açın.
            Açma işleminde öğrenciye otomatik bildirim e-postası gönderilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstantUnlockSection />
        </CardContent>
      </Card>

      {/* Audit Log */}
      <StageUnlockAuditLog />

      {/* Test Reminder Email */}
      <TestReminderEmailCard adminEmail={undefined} />

      {/* All settings table */}
      {settings && settings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Platform Ayarları</CardTitle>
            <CardDescription>Sistemde kayıtlı tüm yapılandırma değerleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
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
