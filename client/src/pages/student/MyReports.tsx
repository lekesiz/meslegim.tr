import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

export default function MyReports() {
  const [, setLocation] = useLocation();
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);
  const { data: reports, isLoading, refetch } = trpc.student.getMyReports.useQuery();
  const utils = trpc.useUtils();

  const generatePdfMutation = trpc.student.generateReportPDF.useMutation({
    onSuccess: async (data, variables) => {
      toast.success('PDF başarıyla oluşturuldu!');
      await refetch();
      // Open the PDF in a new tab
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error('PDF oluşturulurken hata: ' + error.message);
    },
    onSettled: () => {
      setGeneratingPdf(null);
    }
  });

  const handleDownloadPdf = async (report: any) => {
    if (report.fileUrl) {
      // Already generated, open directly
      window.open(report.fileUrl, '_blank');
    } else {
      // Generate PDF first
      setGeneratingPdf(report.id);
      generatePdfMutation.mutate({ reportId: report.id });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Raporlar yükleniyor...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Onay Bekliyor</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Raporlarım</h1>
          <p className="text-muted-foreground mt-2">
            Tamamladığınız etapların değerlendirme raporlarını buradan görüntüleyebilirsiniz.
          </p>
        </div>

        {!reports || reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz Rapor Yok</h3>
              <p className="text-muted-foreground text-center">
                Etapları tamamladıkça raporlarınız burada görünecektir.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <Card key={report.id} className={`hover:shadow-md transition-shadow ${report.status === 'rejected' ? 'border-red-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {report.stageName || (report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu')}
                      </CardTitle>
                      <CardDescription>
                        Oluşturulma: {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mentor Feedback for rejected reports */}
                  {report.status === 'rejected' && report.mentorFeedback && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">Mentor Geri Bildirimi</span>
                      </div>
                      <p className="text-sm text-red-800">{report.mentorFeedback}</p>
                    </div>
                  )}

                  {/* Pending status info */}
                  {report.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        Raporunuz mentorunuz tarafından inceleniyor. Onaylandığında e-posta ile bildirim alacaksınız.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {report.status !== 'pending' && (
                      <Button
                        onClick={() => setLocation(`/dashboard/student/reports/${report.id}`)}
                        variant={report.status === 'approved' ? 'default' : 'outline'}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Raporu Görüntüle
                      </Button>
                    )}
                    {report.status === 'approved' && (
                      <Button
                        onClick={() => handleDownloadPdf(report)}
                        variant="outline"
                        disabled={generatingPdf === report.id}
                      >
                        {generatingPdf === report.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            PDF Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {report.fileUrl ? 'PDF İndir' : 'PDF Oluştur & İndir'}
                          </>
                        )}
                      </Button>
                    )}
                    {report.status === 'rejected' && (
                      <Button
                        onClick={() => setLocation(`/dashboard/student/stage/${report.stageId}`)}
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Etabı Yeniden Tamamla
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
