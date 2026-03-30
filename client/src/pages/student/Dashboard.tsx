import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, FileText, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: progress, isLoading: loadingProgress } = trpc.student.getMyProgress.useQuery();
  const { data: reports, isLoading: loadingReports } = trpc.student.getMyReports.useQuery();

  const isLoading = loadingProgress || loadingReports;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if student is pending approval
  if (user?.status === 'pending') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Hesap Onay Bekliyor</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Clock className="w-16 h-16 mx-auto text-yellow-500" />
              <p className="text-muted-foreground">
                Hesabınız mentor onayı bekliyor. 
                Hesabınız aktif edildiğinde size e-posta ile bildirim gönderilecektir.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const totalStages = 3;
  const completedStages = progress?.filter(s => s.status === 'completed').length || 0;
  const progressPercentage = (completedStages / totalStages) * 100;

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'active') return <Clock className="w-5 h-5 text-blue-500" />;
    return <Lock className="w-5 h-5 text-muted-foreground/70" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'completed') return 'Tamamlandı';
    if (status === 'active') return 'Devam Ediyor';
    return 'Kilitli';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldin, {user?.name}</h1>
          <p className="text-muted-foreground">İlerlemenizi takip edin ve değerlendirmelerinizi tamamlayın</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tamamlanan Etaplar</span>
                <span className="font-medium">{completedStages} / {totalStages}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Yaş Grubu: <span className="font-medium">{user?.ageGroup}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Etaplarınız</CardTitle>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-4">
                {progress.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(stage.status)}
                      <div>
                        <p className="font-medium">Etap {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{getStatusText(stage.status)}</p>
                      </div>
                    </div>
                    {stage.status === 'active' && (
                      <Button onClick={() => window.location.href = '/dashboard/student/stage'}>
                        Başla
                      </Button>
                    )}
                    {stage.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Hesabınız aktif edildiğinde etaplarınız burada görünecektir.
              </p>
            )}
          </CardContent>
        </Card>

        {reports && reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Raporlarınız</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">
                          {report.type === 'final' ? 'Final Raporu' : `Etap ${report.stageId} Raporu`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {report.status === 'approved' ? 'Onaylandı' : 'Onay Bekliyor'}
                        </p>
                      </div>
                    </div>
                    {report.status === 'approved' && report.fileUrl && (
                      <Button variant="outline" onClick={() => window.open(report.fileUrl!, '_blank')}>
                        İndir
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
