import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Loader2, UserCheck, Users, FileText, CheckCircle, XCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ChatDialog } from '@/components/ChatDialog';
import MentorStatsChart from '@/components/MentorStatsChart';
import { MentorPerformanceTrends } from '@/components/MentorPerformanceTrends';
import MentorFeedbackStats from '@/components/MentorFeedbackStats';

export default function MentorDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReportId, setRejectReportId] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStudent, setChatStudent] = useState<{ id: number; name: string | null } | null>(null);

  const { data: pendingStudents, isLoading: pendingLoading } = trpc.mentor.getPendingStudents.useQuery();
  const { data: myStudents, isLoading: studentsLoading } = trpc.mentor.getMyStudents.useQuery();
  const { data: pendingReports, isLoading: reportsLoading } = trpc.mentor.getPendingReports.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.mentor.getMyStats.useQuery();

  const activateStudentMutation = trpc.mentor.activateStudent.useMutation({
    onSuccess: () => {
      toast.success('Öğrenci başarıyla aktif edildi!');
      utils.mentor.getPendingStudents.invalidate();
      utils.mentor.getMyStudents.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const approveReportMutation = trpc.mentor.approveReport.useMutation({
    onSuccess: (_, variables) => {
      if (variables.approved === false) {
        toast.success('Rapor reddedildi ve öğrenci bilgilendirildi.');
      } else {
        toast.success('Rapor başarıyla onaylandı!');
      }
      utils.mentor.getPendingReports.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  if (!user) {
    return null;
  }

  if (pendingLoading || studentsLoading || reportsLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Mentor Paneli</h1>
          <p className="text-muted-foreground mt-2">
            Öğrencilerinizi yönetin ve raporları onaylayın
          </p>
        </div>

        {/* Stats Charts */}
        {stats && (
          <MentorStatsChart stats={stats} />
        )}

        {/* Performance Trends */}
        <MentorPerformanceTrends />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Onaylar</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingStudents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktif edilmeyi bekleyen öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öğrencilerim</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myStudents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktif öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Raporlar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Onay bekleyen rapor
              </p>
              {(pendingReports?.length || 0) > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setLocation('/dashboard/mentor/reports')}
                  className="mt-2 p-0 h-auto"
                >
                  Tümünü Gör →
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Yanıt Süresi</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgResponseTimeDays || 0} gün</div>
              <p className="text-xs text-muted-foreground">
                Rapor onaylama süresi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Bekleyen Onaylar ({pendingStudents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="students">
              Öğrencilerim ({myStudents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reports">
              Bekleyen Raporlar ({pendingReports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="feedback">
              Geri Bildirimler
            </TabsTrigger>
          </TabsList>

          {/* Pending Students Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingStudents && pendingStudents.length > 0 ? (
              pendingStudents.map((student: any) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{student.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {student.email} • {student.phone}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Beklemede</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Yaş Grubu:</span> {student.ageGroup}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">TC Kimlik:</span> {student.tcKimlik}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kayıt Tarihi: {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => activateStudentMutation.mutate({ studentId: student.id })}
                        disabled={activateStudentMutation.isPending}
                      >
                        {activateStudentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Aktif Ediliyor...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aktif Et
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Bekleyen onay bulunmamaktadır.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {myStudents && myStudents.length > 0 ? (
              myStudents.map((student: any) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{student.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {student.email}
                        </CardDescription>
                      </div>
                      <Badge variant="default">Aktif</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Yaş Grubu:</span> {student.ageGroup}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Aktif Edilme: {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('tr-TR') : '-'}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/dashboard/student/${student.id}`)}
                      >
                        Detayları Görüntüle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChatStudent({ id: student.id, name: student.name });
                          setChatOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Mesaj Gönder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Henüz aktif öğrenciniz bulunmamaktadır.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pendingReports?.length || 0} rapor onay bekliyor
              </p>
              <Button variant="outline" size="sm" onClick={() => setLocation('/dashboard/mentor/reports')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Tüm Raporları Gör
              </Button>
            </div>
            {pendingReports && pendingReports.length > 0 ? (
              pendingReports.map((report: any) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {report.stageName || (report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu')}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Öğrenci: <span className="font-medium text-foreground">{report.studentName || 'Bilinmiyor'}</span>
                        </CardDescription>
                        <CardDescription>
                          Tamamlanma: {report.completedAt ? new Date(report.completedAt).toLocaleDateString('tr-TR') : new Date(report.createdAt).toLocaleDateString('tr-TR')}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Beklemede</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {report.summary && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Rapor Özeti</p>
                        <p className="text-sm">{report.summary}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {report.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Raporu Görüntüle
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => approveReportMutation.mutate({ reportId: report.id, approved: true })}
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
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectReportId(report.id);
                          setRejectFeedback('');
                          setRejectDialogOpen(true);
                        }}
                        disabled={approveReportMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Onay bekleyen rapor bulunmamaktadır.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <MentorFeedbackStats />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>

    {/* Reject Dialog */}
    <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raporu Reddet</DialogTitle>
          <DialogDescription>
            Öğrenciye iletilecek geri bildirimi yazın. Bu mesaj öğrenciye e-posta ile gönderilecektir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reject-feedback">Geri Bildirim <span className="text-destructive">*</span></Label>
          <Textarea
            id="reject-feedback"
            placeholder="Raporun neden reddedildiğini ve öğrencinin ne yapması gerektiğini açıklayın..."
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>İptal</Button>
          <Button
            variant="destructive"
            disabled={!rejectFeedback.trim() || approveReportMutation.isPending}
            onClick={() => {
              if (rejectReportId && rejectFeedback.trim()) {
                approveReportMutation.mutate(
                  { reportId: rejectReportId, approved: false, feedback: rejectFeedback },
                  { onSuccess: () => setRejectDialogOpen(false) }
                );
              }
            }}
          >
            {approveReportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Reddet ve Bildir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Chat Dialog */}
    {chatStudent && (
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        otherUser={chatStudent}
        currentUserRole={user.role}
      />
    )}
    </>
  );
}
