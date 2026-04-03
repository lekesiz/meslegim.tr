import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Mail, Send, Users, Eye, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle, BarChart3, History } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  all: 'Tüm Kullanıcılar',
  active: 'Aktif Kullanıcılar (7 gün içinde giriş)',
  inactive: 'İnaktif Kullanıcılar (30+ gün)',
  trial: 'Ücretsiz Kullanıcılar',
  premium: 'Premium Kullanıcılar',
  pending: 'Onay Bekleyen Kullanıcılar',
};

const SEGMENT_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  trial: 'bg-yellow-100 text-yellow-800',
  premium: 'bg-purple-100 text-purple-800',
  pending: 'bg-orange-100 text-orange-800',
};

const EMAIL_TEMPLATES = [
  {
    name: 'Hoş Geldin',
    subject: 'Meslegim.tr\'ye Hoş Geldiniz, {{name}}!',
    content: '<h2>Merhaba {{name}},</h2><p>Meslegim.tr kariyer değerlendirme platformuna hoş geldiniz! Kariyer yolculuğunuzda size rehberlik etmekten mutluluk duyacağız.</p><p>Platformumuzda sizi bekleyen özellikler:</p><ul><li>9 aşamalı kapsamlı kariyer değerlendirmesi</li><li>AI destekli kişiselleştirilmiş raporlar</li><li>Uzman mentor desteği</li></ul><p>Hemen başlamak için giriş yapın!</p>',
  },
  {
    name: 'Yeni Özellik Duyurusu',
    subject: 'Yeni Özellikler Sizi Bekliyor!',
    content: '<h2>Merhaba {{name}},</h2><p>Platformumuza eklenen yeni özelliklerden haberdar olmak ister misiniz?</p><p>Son güncellememizle birlikte:</p><ul><li>Geliştirilmiş kariyer analiz raporları</li><li>Yeni değerlendirme etapları</li><li>İyileştirilmiş kullanıcı deneyimi</li></ul><p>Detaylar için platformumuzu ziyaret edin!</p>',
  },
  {
    name: 'Hatırlatma',
    subject: 'Kariyer Yolculuğunuz Sizi Bekliyor, {{name}}!',
    content: '<h2>Merhaba {{name}},</h2><p>Kariyer değerlendirme sürecinizde kaldığınız yerden devam etmek ister misiniz?</p><p>Her etap, geleceğiniz için önemli bir adım. Şimdi devam ederek kariyer hedeflerinize bir adım daha yaklaşın!</p>',
  },
  {
    name: 'Boş Şablon',
    subject: '',
    content: '',
  },
];

export default function BulkEmailCampaigns() {
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const segmentCounts = trpc.admin.getSegmentCounts.useQuery();
  const campaignHistory = trpc.admin.getBulkEmailCampaigns.useQuery();
  const inactivityHistory = trpc.admin.getInactivityNotificationHistory.useQuery();
  const inactiveStudents = trpc.admin.getInactiveStudents.useQuery();

  const sendCampaign = trpc.admin.sendBulkCampaignEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Kampanya gönderildi! ${data.sentCount} başarılı, ${data.failedCount} başarısız`, { duration: 5000 });
      setEmailSubject('');
      setEmailContent('');
      campaignHistory.refetch();
    },
    onError: (error) => {
      toast.error(`Kampanya gönderilemedi: ${error.message}`);
    },
  });

  const sendInactivityReminders = trpc.admin.sendInactivityReminders.useMutation({
    onSuccess: (data) => {
      toast.success(`Hareketsizlik uyarıları gönderildi! ${data.sentCount} başarılı, ${data.failCount} başarısız`, { duration: 5000 });
      inactivityHistory.refetch();
      inactiveStudents.refetch();
    },
    onError: (error) => {
      toast.error(`Uyarı gönderilemedi: ${error.message}`);
    },
  });

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = EMAIL_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  const handleSendCampaign = () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Konu ve içerik alanları zorunludur');
      return;
    }
    if (!confirm(`"${SEGMENT_LABELS[selectedSegment]}" segmentine (${segmentCounts.data?.[selectedSegment as keyof typeof segmentCounts.data] || '?'} kişi) email göndermek istediğinizden emin misiniz?`)) {
      return;
    }
    sendCampaign.mutate({
      subject: emailSubject,
      htmlContent: emailContent,
      segment: selectedSegment,
    });
  };

  const previewHtml = useMemo(() => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Meslegim.tr</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          ${emailContent.replace(/\{\{name\}\}/g, 'Ahmet Yılmaz')}
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Bu e-posta Meslegim.tr tarafından gönderilmiştir.</p>
          </div>
        </div>
      </div>
    `;
  }, [emailContent]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Kampanyaları</h2>
        <p className="text-muted-foreground">Toplu email gönderimi ve hareketsizlik uyarıları yönetimi</p>
      </div>

      {/* Segment Özeti */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
          <Card key={key} className={`cursor-pointer transition-all ${selectedSegment === key ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => { setSelectedSegment(key); setActiveTab('compose'); }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{segmentCounts.data?.[key as keyof typeof segmentCounts.data] ?? '-'}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Kampanya Oluştur
          </TabsTrigger>
          <TabsTrigger value="inactivity" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Hareketsizlik Uyarıları
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Kampanya Geçmişi
          </TabsTrigger>
        </TabsList>

        {/* Kampanya Oluştur */}
        <TabsContent value="compose" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Yeni Kampanya
                  </CardTitle>
                  <CardDescription>
                    Seçilen segmente toplu email gönderin. <code>{'{{name}}'}</code> kullanarak kişiselleştirin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hedef Segment</Label>
                      <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label} ({segmentCounts.data?.[key as keyof typeof segmentCounts.data] ?? '?'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Şablon</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Şablon seçin (opsiyonel)" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMAIL_TEMPLATES.map(t => (
                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Konusu</Label>
                    <Input
                      placeholder="Örn: Yeni Özellik Duyurusu"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email İçeriği (HTML)</Label>
                    <Textarea
                      placeholder="HTML içerik yazın. {{name}} ile kişiselleştirin..."
                      rows={10}
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      <code>{'{{name}}'}</code> otomatik olarak kullanıcı adıyla değiştirilir. İçerik Meslegim.tr email şablonuyla sarmalanır.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={!emailContent.trim()}>
                          <Eye className="h-4 w-4 mr-2" />
                          Önizleme
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Email Önizleme</DialogTitle>
                          <DialogDescription>
                            Konu: {emailSubject.replace(/\{\{name\}\}/g, 'Ahmet Yılmaz')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="border rounded-lg p-4 bg-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={handleSendCampaign}
                      disabled={sendCampaign.isPending || !emailSubject.trim() || !emailContent.trim()}
                      className="flex-1"
                    >
                      {sendCampaign.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gönderiliyor...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" />Kampanyayı Gönder ({segmentCounts.data?.[selectedSegment as keyof typeof segmentCounts.data] ?? '?'} kişi)</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Panel - Bilgi */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Segment Bilgisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Badge className={SEGMENT_COLORS[selectedSegment]}>{SEGMENT_LABELS[selectedSegment]}</Badge>
                    <p className="text-muted-foreground mt-2">
                      {selectedSegment === 'active' && 'Son 7 gün içinde giriş yapmış kullanıcılar.'}
                      {selectedSegment === 'inactive' && 'Son 30 gün içinde giriş yapmamış kullanıcılar.'}
                      {selectedSegment === 'trial' && 'Henüz paket satın almamış kullanıcılar.'}
                      {selectedSegment === 'premium' && 'Paket satın almış kullanıcılar.'}
                      {selectedSegment === 'pending' && 'Onay bekleyen yeni kayıtlar.'}
                      {selectedSegment === 'all' && 'Tüm aktif ve bekleyen kullanıcılar.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Son Kampanya
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {campaignHistory.data?.campaigns?.[0] ? (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{(campaignHistory.data.campaigns[0] as any).subject}</p>
                      <p className="text-muted-foreground">
                        {new Date((campaignHistory.data.campaigns[0] as any).createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-green-600">
                          {(campaignHistory.data.campaigns[0] as any).sentCount} gönderildi
                        </Badge>
                        {(campaignHistory.data.campaigns[0] as any).failedCount > 0 && (
                          <Badge variant="outline" className="text-red-600">
                            {(campaignHistory.data.campaigns[0] as any).failedCount} başarısız
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz kampanya gönderilmedi</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hareketsizlik Uyarıları */}
        <TabsContent value="inactivity" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Hareketsiz Öğrenciler
                </CardTitle>
                <CardDescription>
                  7+ gün platformda işlem yapmayan öğrenciler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-2xl font-bold text-amber-800">
                      {inactiveStudents.data?.length ?? 0}
                    </p>
                    <p className="text-sm text-amber-600">Hareketsiz öğrenci</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (confirm(`${inactiveStudents.data?.length || 0} hareketsiz öğrenciye hatırlatma emaili göndermek istediğinizden emin misiniz?`)) {
                        sendInactivityReminders.mutate({});
                      }
                    }}
                    disabled={sendInactivityReminders.isPending || !inactiveStudents.data?.length}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    {sendInactivityReminders.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gönderiliyor...</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" />Uyarı Gönder</>
                    )}
                  </Button>
                </div>

                {inactiveStudents.data && inactiveStudents.data.length > 0 && (
                  <div className="max-h-[300px] overflow-auto space-y-2">
                    {(inactiveStudents.data as any[]).slice(0, 20).map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div>
                          <p className="font-medium">{student.name || 'İsimsiz'}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                        <Badge variant="outline" className="text-amber-600">
                          {student.daysSinceLastActivity} gün
                        </Badge>
                      </div>
                    ))}
                    {inactiveStudents.data.length > 20 && (
                      <p className="text-xs text-center text-muted-foreground">
                        ve {inactiveStudents.data.length - 20} kişi daha...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Uyarı Geçmişi
                </CardTitle>
                <CardDescription>Son gönderilen hareketsizlik uyarıları</CardDescription>
              </CardHeader>
              <CardContent>
                {inactivityHistory.data?.notifications && inactivityHistory.data.notifications.length > 0 ? (
                  <div className="max-h-[400px] overflow-auto space-y-2">
                    {(inactivityHistory.data.notifications as any[]).map((notif: any) => (
                      <div key={notif.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div>
                          <p className="font-medium">{notif.userName || 'Bilinmiyor'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notif.emailSentAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{notif.inactiveDays} gün</Badge>
                          {notif.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Henüz uyarı gönderilmedi</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Kampanya Geçmişi */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Kampanya Geçmişi
              </CardTitle>
              <CardDescription>Gönderilen tüm email kampanyaları</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignHistory.data?.campaigns && campaignHistory.data.campaigns.length > 0 ? (
                <div className="space-y-3">
                  {(campaignHistory.data.campaigns as any[]).map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{campaign.subject}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={SEGMENT_COLORS[campaign.segment] || 'bg-gray-100 text-gray-800'}>
                            {SEGMENT_LABELS[campaign.segment] || campaign.segment}
                          </Badge>
                          <span>
                            {new Date(campaign.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {campaign.adminName && <span>- {campaign.adminName}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-green-600 font-medium">{campaign.sentCount} gönderildi</p>
                          {campaign.failedCount > 0 && (
                            <p className="text-red-500">{campaign.failedCount} başarısız</p>
                          )}
                        </div>
                        <Badge variant={
                          campaign.campaignStatus === 'completed' ? 'default' :
                          campaign.campaignStatus === 'sending' ? 'secondary' :
                          campaign.campaignStatus === 'failed' ? 'destructive' : 'outline'
                        }>
                          {campaign.campaignStatus === 'completed' ? 'Tamamlandı' :
                           campaign.campaignStatus === 'sending' ? 'Gönderiliyor' :
                           campaign.campaignStatus === 'failed' ? 'Başarısız' : 'Taslak'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Henüz kampanya gönderilmedi</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('compose')}>
                    İlk Kampanyayı Oluştur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
