import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Clock, CheckCircle2, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: progress, isLoading: progressLoading } = trpc.student.getMyProgress.useQuery();
  const { data: activeStage, isLoading: stageLoading } = trpc.student.getActiveStage.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.student.getMyReports.useQuery();

  if (!user) {
    return null;
  }

  if (progressLoading || stageLoading || reportsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const completedStages = progress?.filter(s => s.status === 'completed').length || 0;
  const totalStages = progress?.length || 0;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Kariyer değerlendirme sürecinizi buradan takip edebilirsiniz.
          </p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
            <CardDescription>
              {completedStages} / {totalStages} etap tamamlandı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground text-right">
                %{progressPercentage.toFixed(0)} tamamlandı
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Stage Card */}
        {activeStage ? (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktif Etap</CardTitle>
                  <CardDescription className="mt-2">
                    {activeStage.stageName}
                  </CardDescription>
                </div>
                <Badge variant="default">Aktif</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {activeStage.stageDescription}
              </p>
              <Button onClick={() => setLocation(`/dashboard/student/stage/${activeStage.stageId}`)}>
                Etabı Başlat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aktif Etap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Şu anda aktif bir etabınız bulunmamaktadır. Bir önceki etabı tamamladıktan sonra 7 gün içinde yeni etap otomatik olarak aktif hale gelecektir.
              </p>
            </CardContent>
          </Card>
        )}

        {/* All Stages */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Etaplar</CardTitle>
            <CardDescription>Kariyer değerlendirme sürecinizin tüm aşamaları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress?.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : stage.status === 'active' ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{stage.stageName}</p>
                      <p className="text-sm text-muted-foreground">
                        {stage.stageDescription}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      stage.status === 'completed'
                        ? 'default'
                        : stage.status === 'active'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {stage.status === 'completed'
                      ? 'Tamamlandı'
                      : stage.status === 'active'
                      ? 'Aktif'
                      : 'Kilitli'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports */}
        {reports && reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Raporlarım</CardTitle>
              <CardDescription>Tamamlanan etaplarınızın raporları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={report.status === 'approved' ? 'default' : 'secondary'}
                      >
                        {report.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                      </Badge>
                      {report.status === 'approved' && report.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => window.open(report.fileUrl!, '_blank')}
                        >
                          Görüntüle
                        </Button>
                      )}
                    </div>
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
