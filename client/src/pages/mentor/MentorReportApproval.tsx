import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MentorReportApproval() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const { data: pendingReports, isLoading } = trpc.mentor.getPendingReports.useQuery();
  const utils = trpc.useUtils();

  const approveReportMutation = trpc.mentor.approveReport.useMutation({
    onSuccess: () => {
      toast.success('Rapor başarıyla onaylandı!');
      setSelectedReport(null);
      setFeedback('');
      utils.mentor.getPendingReports.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleApprove = (reportId: number, approved: boolean) => {
    approveReportMutation.mutate({ 
      reportId, 
      approved,
      feedback: feedback || undefined 
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Raporlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Rapor Onaylama</h1>
        <p className="text-muted-foreground mt-2">
          Öğrencilerinizin tamamladığı etap raporlarını inceleyin ve onaylayın
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Raporlar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports List */}
      {!pendingReports || pendingReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Bekleyen rapor yok</p>
            <p className="text-sm text-muted-foreground">
              Tüm raporlar onaylanmış durumda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingReports.map((report: any) => (
            <Card key={report.id} className={selectedReport === report.id ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {report.studentName}
                      <Badge variant="outline" className="ml-2">
                        {report.stageName}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Tamamlanma: {new Date(report.completedAt).toLocaleDateString('tr-TR')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Onay Bekliyor
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Report Summary */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Rapor Özeti</h4>
                  <p className="text-sm text-muted-foreground">
                    {report.summary || 'Rapor özeti mevcut değil'}
                  </p>
                </div>

                {/* Feedback Section */}
                {selectedReport === report.id && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor={`feedback-${report.id}`}>
                        Geri Bildirim (Opsiyonel)
                      </Label>
                      <Textarea
                        id={`feedback-${report.id}`}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Öğrenciye geri bildiriminizi yazın..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedReport === report.id ? (
                    <>
                      <Button
                        onClick={() => handleApprove(report.id, true)}
                        disabled={approveReportMutation.isPending}
                        className="flex-1"
                      >
                        {approveReportMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Onaylanıyor...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Onayla
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleApprove(report.id, false)}
                        disabled={approveReportMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedReport(null);
                          setFeedback('');
                        }}
                        variant="outline"
                      >
                        İptal
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setSelectedReport(report.id)}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      İncele ve Onayla
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
