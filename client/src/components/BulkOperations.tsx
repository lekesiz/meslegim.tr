import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, UserCheck, Loader2 } from 'lucide-react';

export function BulkOperations() {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailTarget, setEmailTarget] = useState<'all' | '14-17' | '18-21' | '22-24' | 'pending' | 'active'>('all');
  
  const sendBulkEmail = trpc.admin.sendBulkEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Email gönderimi tamamlandı! ${data.successCount} başarılı, ${data.failCount} başarısız`, { duration: 5000 });
      setEmailSubject('');
      setEmailMessage('');
    },
    onError: (error) => {
      toast.error(`Email gönderimi başarısız: ${error.message}`);
    },
  });

  const bulkActivate = trpc.admin.bulkActivateStudents.useMutation({
    onSuccess: (data) => {
      toast.success(`Toplu aktivasyon tamamlandı! ${data.successCount} öğrenci aktif edildi`);
    },
    onError: (error) => {
      toast.error(`Toplu aktivasyon başarısız: ${error.message}`);
    },
  });

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Konu ve mesaj alanları zorunludur');
      return;
    }

    sendBulkEmail.mutate({
      subject: emailSubject,
      message: emailMessage,
      targetGroup: emailTarget,
    });
  };

  const handleBulkActivate = () => {
    if (confirm('Bekleyen tüm öğrencileri aktif etmek istediğinizden emin misiniz?')) {
      bulkActivate.mutate({ activateAll: true });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Bulk Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Toplu Email Gönderimi
          </CardTitle>
          <CardDescription>
            Seçilen gruba toplu email gönderin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-target">Hedef Grup</Label>
            <Select value={emailTarget} onValueChange={(value: any) => setEmailTarget(value)}>
              <SelectTrigger id="email-target">
                <SelectValue placeholder="Hedef grup seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öğrenciler</SelectItem>
                <SelectItem value="14-17">14-17 Yaş Grubu</SelectItem>
                <SelectItem value="18-21">18-21 Yaş Grubu</SelectItem>
                <SelectItem value="22-24">22-24 Yaş Grubu</SelectItem>
                <SelectItem value="pending">Bekleyen Öğrenciler</SelectItem>
                <SelectItem value="active">Aktif Öğrenciler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Konusu</Label>
            <Input
              id="email-subject"
              placeholder="Örn: Yeni Etap Duyurusu"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-message">Email Mesajı</Label>
            <Textarea
              id="email-message"
              placeholder="Email içeriğini buraya yazın..."
              rows={6}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Mesaj otomatik olarak Meslegim.tr template'i ile gönderilecektir
            </p>
          </div>

          <Button
            onClick={handleSendEmail}
            disabled={sendBulkEmail.isPending}
            className="w-full"
          >
            {sendBulkEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Email Gönder
              </>
            )}
          </Button>

          {sendBulkEmail.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
              <p className="font-medium text-green-800">Gönderim Tamamlandı</p>
              <p className="text-green-700">
                {sendBulkEmail.data.successCount} başarılı, {sendBulkEmail.data.failCount} başarısız
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Activation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Toplu Öğrenci Aktifleştirme
          </CardTitle>
          <CardDescription>
            Bekleyen öğrencileri toplu olarak aktif edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Toplu Aktivasyon</h4>
            <p className="text-sm text-blue-800 mb-4">
              Bu işlem bekleyen tüm öğrencileri aktif edecek ve her birine onay email'i gönderecektir.
            </p>
            <ul className="text-sm text-blue-700 space-y-1 mb-4">
              <li>• Öğrenci durumu "aktif" olarak güncellenecek</li>
              <li>• Her öğrenciye onay email'i gönderilecek</li>
              <li>• İlk etapları otomatik aktif olacak</li>
            </ul>
          </div>

          <Button
            onClick={handleBulkActivate}
            disabled={bulkActivate.isPending}
            variant="default"
            className="w-full"
          >
            {bulkActivate.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aktifleştiriliyor...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Tüm Bekleyen Öğrencileri Aktif Et
              </>
            )}
          </Button>

          {bulkActivate.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
              <p className="font-medium text-green-800">Aktivasyon Tamamlandı</p>
              <p className="text-green-700">
                {bulkActivate.data.successCount} öğrenci başarıyla aktif edildi
              </p>
            </div>
          )}

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Not:</strong> Resend test modunda olduğu için email'ler sadece mikaillekesiz@gmail.com adresine gönderilecektir. 
              Production'da domain doğrulaması yapıldıktan sonra tüm öğrencilere email gidecektir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
