import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, ArrowLeft, FileText } from 'lucide-react';
import { Streamdown } from 'streamdown';

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: report, isLoading } = trpc.student.getReport.useQuery(
    { reportId: parseInt(id || '0') },
    { enabled: !!id }
  );

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold">Rapor Bulunamadı</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Bu rapor mevcut değil veya erişim yetkiniz bulunmamaktadır.
                </p>
              </div>
              <Button onClick={() => setLocation('/dashboard/student')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Panele Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generatePDFMutation = trpc.student.generateReportPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.pdfUrl, '_blank');
    },
    onError: (error) => {
      alert('PDF oluşturulurken hata oluştu: ' + error.message);
    },
  });

  const handleDownload = () => {
    if (report.fileUrl) {
      // PDF already exists, download directly
      window.open(report.fileUrl, '_blank');
    } else {
      // Generate PDF first
      generatePDFMutation.mutate({ reportId: report.id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard/student')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Panele Dön
          </Button>
          {report.status === 'approved' && (
            <Button 
              onClick={handleDownload}
              disabled={generatePDFMutation.isPending}
            >
              {generatePDFMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PDF Oluşturuluyor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  PDF İndir
                </>
              )}
            </Button>
          )}
        </div>

        {/* Report Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                    {report.status === 'pending' ? 'Beklemede' : 
                     report.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Content */}
            {report.content ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <Streamdown>{report.content}</Streamdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Rapor içeriği henüz hazır değil.</p>
                {report.status === 'pending' && (
                  <p className="text-sm mt-2">
                    Raporunuz mentor onayı bekliyor.
                  </p>
                )}
              </div>
            )}

            {/* Mentor Feedback */}
            {report.mentorFeedback && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Mentor Yorumu</h3>
                <p className="text-sm text-muted-foreground">
                  {report.mentorFeedback}
                </p>
              </div>
            )}

            {/* Approval Info */}
            {report.status === 'approved' && report.approvedAt && (
              <div className="border-t pt-4 text-sm text-muted-foreground">
                <p>
                  Onaylayan: {report.approvedBy || 'Mentor'} • 
                  Onay Tarihi: {new Date(report.approvedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
