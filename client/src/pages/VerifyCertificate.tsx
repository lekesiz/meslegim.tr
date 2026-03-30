import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Award, Shield, Calendar, User, Hash } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-amber-200/50 shadow-xl">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-muted-foreground font-medium">Sertifika dogrulanıyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200/50 shadow-xl">
          <CardContent className="pt-10 pb-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-red-700">Sertifika Bulunamadı</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Bu sertifika numarası sistemde kayıtlı degil veya gecersiz.
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-red-400" />
                <p className="text-xs font-medium text-red-500">Aranan Sertifika No</p>
              </div>
              <p className="font-mono text-sm text-red-800 dark:text-red-300">{certificateNumber}</p>
            </div>

            <p className="text-sm text-muted-foreground text-center mb-4">
              Lutfen sertifika numarasını kontrol edin veya sertifikayı veren kurumla iletisime gecin.
            </p>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Ana Sayfaya Don
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-amber-200/50 shadow-2xl overflow-hidden">
        {/* Gold header bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
        
        <CardContent className="pt-8 pb-8">
          {/* Verified badge */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-xl">
                <Award className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-3 border-white dark:border-gray-800 shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Sertifika Dogrulandı</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bu sertifika Meslegim.tr platformu tarafından verilmistir ve gecerlidir.
              </p>
            </div>
          </div>

          {/* Certificate details */}
          <div className="space-y-3">
            {/* Certificate number */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-medium text-amber-600">Sertifika Numarası</p>
              </div>
              <p className="font-mono text-base font-semibold text-amber-900">
                {certificate.certificateNumber}
              </p>
            </div>

            {/* Student info */}
            <div className="bg-muted/50/80 border border-border/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Ogrenci</p>
                  <p className="text-base font-semibold text-foreground">
                    {certificate.studentName || 'Bilinmeyen'}
                  </p>
                </div>
              </div>

              {certificate.studentAgeGroup && (
                <div className="flex items-start gap-3">
                  <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Yas Grubu</p>
                    <p className="text-sm font-medium text-foreground">
                      {certificate.studentAgeGroup}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Verilis Tarihi</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(certificate.issueDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Bu sertifika, Meslegim.tr Kariyer Degerlendirme Platformu'nda tum etapların basarıyla tamamlandıgını belgeler.</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-amber-200 hover:bg-amber-50"
              onClick={() => window.location.href = '/'}
            >
              Ana Sayfaya Don
            </Button>
          </div>
        </CardContent>

        {/* Gold footer bar */}
        <div className="h-1 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400" />
      </Card>
    </div>
  );
}
