import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyCertificate() {
  const params = useParams();
  const certificateNumber = params.id;

  const { data: certificate, isLoading, error } = trpc.auth.verifyCertificate.useQuery(
    { certificateNumber: certificateNumber || '' },
    { enabled: !!certificateNumber }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Sertifika doğrulanıyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-600">Sertifika Bulunamadı</CardTitle>
            </div>
            <CardDescription>
              Bu sertifika numarası sistemde kayıtlı değil veya geçersiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Sertifika No:</strong> {certificateNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Lütfen sertifika numarasını kontrol edin veya sertifikayı veren kurumla iletişime geçin.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-600">Sertifika Doğrulandı</CardTitle>
          </div>
          <CardDescription>
            Bu sertifika Meslegim.tr platformu tarafından verilmiştir ve geçerlidir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Certificate Icon */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-1">
                  <strong>Sertifika No:</strong>
                </p>
                <p className="text-lg font-mono text-green-900">
                  {certificate.certificateNumber}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Öğrenci</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.studentName || 'Bilinmeyen'}
                  </p>
                </div>

                {certificate.studentAgeGroup && (
                  <div>
                    <p className="text-sm text-muted-foreground">Yaş Grubu</p>
                    <p className="text-base text-gray-900">
                      {certificate.studentAgeGroup}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Veriliş Tarihi</p>
                  <p className="text-base text-gray-900">
                    {new Date(certificate.issueDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Bu sertifika, Meslegim.tr Kariyer Değerlendirme Platformu'nda tüm etapların başarıyla tamamlandığını belgeler.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
