import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Loader2, ArrowLeft, FileText, CheckCircle, Clock } from 'lucide-react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

export default function StudentDetailView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.mentor.getStudentDetails.useQuery(
    { studentId: parseInt(id || '0') },
    { enabled: !!id }
  );

  const student = data?.student;
  const stages = data?.stages;
  const reports = data?.reports;

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setLocation('/dashboard/mentor')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Öğrenci bulunamadı.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation('/dashboard/mentor')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription className="mt-2">{student.email}</CardDescription>
              </div>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {student.status === 'active' ? 'Aktif' : student.status === 'pending' ? 'Beklemede' : 'İnaktif'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="text-base">{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yaş Grubu</p>
                <p className="text-base">{student.ageGroup || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">TC Kimlik</p>
                <p className="text-base">{student.tcKimlik || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</p>
                <p className="text-base">
                  {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stages Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Etap İlerlemesi</CardTitle>
            <CardDescription>Öğrencinin tamamladığı ve devam eden etaplar</CardDescription>
          </CardHeader>
          <CardContent>
            {stages && stages.length > 0 ? (
              <div className="space-y-4">
                {stages.map((stage: any) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {stage.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : stage.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium">{stage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.status === 'completed'
                            ? 'Tamamlandı'
                            : stage.status === 'in_progress'
                            ? 'Devam Ediyor'
                            : 'Başlanmadı'}
                        </p>
                      </div>
                    </div>
                    {stage.status === 'completed' && stage.completedAt && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(stage.completedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Henüz etap bulunmamaktadır.</p>
            )}
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Raporlar</CardTitle>
            <CardDescription>Öğrencinin oluşturulmuş raporları</CardDescription>
          </CardHeader>
          <CardContent>
            {reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
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
                      <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                        {report.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                      </Badge>
                      {report.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          Görüntüle
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Henüz rapor bulunmamaktadır.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
