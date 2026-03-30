import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Loader2, FileText, Eye, AlertCircle, User, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Streamdown } from 'streamdown';

export default function MentorReportApproval() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [isRejectMode, setIsRejectMode] = useState(false);

  const { data: pendingReports, isLoading } = trpc.mentor.getPendingReports.useQuery();
  const utils = trpc.useUtils();

  const approveReportMutation = trpc.mentor.approveReport.useMutation({
    onSuccess: (_, variables) => {
      if (variables.approved === false) {
        toast.success('Rapor reddedildi. Öğrenci yeniden değerlendirme için bilgilendirildi.');
      } else {
        toast.success('Rapor başarıyla onaylandı! Öğrenci bilgilendirildi.');
      }
      setSelectedReport(null);
      setFeedback('');
      setRejectFeedback('');
      setIsRejectMode(false);
      utils.mentor.getPendingReports.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleApprove = (reportId: number) => {
    approveReportMutation.mutate({ 
      reportId, 
      approved: true,
      feedback: feedback || undefined 
    });
  };

  const handleReject = (reportId: number) => {
    if (!rejectFeedback.trim()) {
      toast.error('Reddetmek için geri bildirim yazmanız zorunludur.');
      return;
    }
    approveReportMutation.mutate({ 
      reportId, 
      approved: false,
      feedback: rejectFeedback
    });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Onay bekliyor</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reports List */}
        {!pendingReports || pendingReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold mb-2">Tüm raporlar onaylandı!</p>
              <p className="text-sm text-muted-foreground">
                Şu anda onay bekleyen rapor bulunmamaktadır.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingReports.map((report: any) => (
              <Card key={report.id} className={`transition-all ${selectedReport === report.id ? 'border-primary shadow-md' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-indigo-500" />
                        {report.studentName || 'Öğrenci'}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-sm">
                          {report.stageName || 'Etap Raporu'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {report.completedAt 
                            ? new Date(report.completedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                            : new Date(report.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                          }
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Onay Bekliyor
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Report Summary */}
                  {report.summary && (
                    <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rapor Özeti</h4>
                      <p className="text-sm leading-relaxed">{report.summary}</p>
                    </div>
                  )}

                  {/* Approve Feedback Section */}
                  {selectedReport === report.id && !isRejectMode && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor={`feedback-${report.id}`} className="flex items-center gap-2">
                          Onay Geri Bildirimi
                          <span className="text-xs text-muted-foreground">(opsiyonel)</span>
                        </Label>
                        <Textarea
                          id={`feedback-${report.id}`}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Öğrenciye tebrik veya yönlendirme mesajı yazabilirsiniz..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Reject Feedback Section */}
                  {selectedReport === report.id && isRejectMode && (
                    <div className="space-y-3 pt-4 border-t border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">Reddetme Gerekçesi</span>
                        <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                      </div>
                      <Textarea
                        value={rejectFeedback}
                        onChange={(e) => setRejectFeedback(e.target.value)}
                        placeholder="Öğrenciye reddedilme gerekçesini ve nasıl iyileştirebileceğini açıklayın..."
                        className="min-h-[100px] border-red-200 focus:border-red-400"
                      />
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Bu geri bildirim öğrenciye iletilecektir. Öğrenci etabı yeniden tamamlayabilecektir.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* View Report Button */}
                    {report.content && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingReport(report)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Raporu Oku
                      </Button>
                    )}
                    {report.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(report.fileUrl, '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        PDF Görüntüle
                      </Button>
                    )}

                    {selectedReport === report.id ? (
                      <>
                        {!isRejectMode ? (
                          <>
                            <Button
                              onClick={() => handleApprove(report.id)}
                              disabled={approveReportMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {approveReportMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Onayla
                            </Button>
                            <Button
                              onClick={() => setIsRejectMode(true)}
                              variant="destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reddet
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedReport(null);
                                setFeedback('');
                                setIsRejectMode(false);
                              }}
                              variant="outline"
                            >
                              İptal
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleReject(report.id)}
                              disabled={approveReportMutation.isPending || !rejectFeedback.trim()}
                              variant="destructive"
                            >
                              {approveReportMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Reddi Onayla
                            </Button>
                            <Button
                              onClick={() => setIsRejectMode(false)}
                              variant="outline"
                            >
                              Geri Dön
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedReport(report.id);
                          setIsRejectMode(false);
                          setFeedback('');
                          setRejectFeedback('');
                        }}
                        className="ml-auto"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        İncele ve Değerlendir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Content Dialog */}
        <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingReport?.studentName} - {viewingReport?.stageName}
              </DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              {viewingReport?.content && (
                <Streamdown>{viewingReport.content}</Streamdown>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
