import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { useEffect } from 'react';
import { toast } from 'sonner';
import FeedbackForm from '@/components/FeedbackForm';
import { Streamdown } from 'streamdown';
import { analytics } from '@/lib/analytics';

export default function ReportView() {
  const [, params] = useRoute('/dashboard/student/reports/:id');
  const [, setLocation] = useLocation();
  // Toast removed
  const reportId = params?.id ? parseInt(params.id) : 0;

  const { data: report, isLoading } = trpc.student.getReport.useQuery(
    { reportId },
    { enabled: reportId > 0 }
  );

  const generatePDFMutation = trpc.student.generateReportPDF.useMutation({
    onSuccess: (data) => {
      if (data.pdfUrl) {
        analytics.reportDownloadPDF(reportId);
        window.open(data.pdfUrl, '_blank');
        toast.success('PDF başarıyla oluşturuldu ve indiriliyor!');
      }
    },
    onError: (error) => {
      toast.error(`PDF oluşturulurken hata: ${error.message}`);
    },
  });

  // Auto-download PDF if query param is set
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('download') === 'true' && report?.status === 'approved' && !generatePDFMutation.isPending) {
      generatePDFMutation.mutate({ reportId });
    }
  }, [report, reportId]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Rapor yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Rapor Bulunamadı</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aradığınız rapor bulunamadı veya erişim yetkiniz yok.
            </p>
            <Button onClick={() => setLocation('/dashboard/student/reports')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Raporlara Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Onay Bekliyor</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/dashboard/student/reports')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Raporlara Dön
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {(report as any).stageName || `Etap ${report.stageId} Raporu`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Oluşturulma: {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              {getStatusBadge(report.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {report.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <Clock className="w-4 h-4 inline mr-2" />
                Bu rapor henüz mentor tarafından onaylanmamıştır. Onaylandıktan sonra PDF olarak indirebilirsiniz.
              </p>
            </div>
          )}

          {report.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <XCircle className="w-4 h-4 inline mr-2" />
                Bu rapor mentor tarafından reddedilmiştir.
              </p>
            </div>
          )}

          <div className="prose prose-sm max-w-none dark:prose-invert mb-6">
            {report.content ? (
              <Streamdown>{report.content}</Streamdown>
            ) : (
              <p className="text-muted-foreground">Rapor içeriği henüz hazır değil.</p>
            )}
          </div>

          {report.status === 'approved' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => generatePDFMutation.mutate({ reportId })}
                disabled={generatePDFMutation.isPending}
              >
                {generatePDFMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PDF Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    PDF İndir
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Form - Sadece onaylanmış raporlarda göster */}
      {report.status === 'approved' && 'mentorId' in report && report.mentorId && (
        <div className="mt-6">
          <FeedbackForm 
            reportId={reportId} 
            mentorId={report.mentorId}
            mentorName={('mentorName' in report && report.mentorName) ? report.mentorName : 'Mentor'}
          />
        </div>
      )}
    </div>
  );
}
