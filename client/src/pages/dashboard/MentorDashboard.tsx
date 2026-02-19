import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Loader2, UserCheck, Users, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: pendingStudents, isLoading: pendingLoading } = trpc.mentor.getPendingStudents.useQuery();
  const { data: myStudents, isLoading: studentsLoading } = trpc.mentor.getMyStudents.useQuery();
  const { data: pendingReports, isLoading: reportsLoading } = trpc.mentor.getPendingReports.useQuery();

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
    onSuccess: () => {
      toast.success('Rapor başarıyla onaylandı!');
      utils.mentor.getPendingReports.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  if (!user) {
    return null;
  }

  if (pendingLoading || studentsLoading || reportsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Mentor Paneli</h1>
          <p className="text-muted-foreground mt-2">
            Öğrencilerinizi yönetin ve raporları onaylayın
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Detayları Görüntüle
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
            {pendingReports && pendingReports.length > 0 ? (
              pendingReports.map((report: any) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu'}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Öğrenci: {report.user?.name || 'Bilinmiyor'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Beklemede</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Oluşturulma: {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {report.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          Raporu Görüntüle
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => approveReportMutation.mutate({ reportId: report.id })}
                        disabled={approveReportMutation.isPending}
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
