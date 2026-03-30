import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, FileText, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MentorDashboard() {
  const { data: pendingStudents, isLoading: loadingPending, refetch: refetchPending } = 
    trpc.mentor.getPendingStudents.useQuery();
  const { data: myStudents, isLoading: loadingStudents } = 
    trpc.mentor.getMyStudents.useQuery();
  const { data: pendingReports, isLoading: loadingReports } = 
    trpc.mentor.getPendingReports.useQuery();

  const activateStudentMutation = trpc.mentor.activateStudent.useMutation({
    onSuccess: () => {
      toast.success("Öğrenci başarıyla aktifleştirildi");
      refetchPending();
    },
    onError: () => {
      toast.error("Aktifleştirme sırasında bir hata oluştu");
    },
  });

  const isLoading = loadingPending || loadingStudents || loadingReports;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    pending: pendingStudents?.length || 0,
    active: myStudents?.filter(s => s.status === 'active').length || 0,
    reports: pendingReports?.length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mentor Paneli</h1>
          <p className="text-muted-foreground">Öğrencilerinizi ve ilerlemelerini yönetin</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Onaylanacak öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öğrencilerim</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Aktif öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Raporlar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports}</div>
              <p className="text-xs text-muted-foreground">
                Onaylanacak rapor
              </p>
            </CardContent>
          </Card>
        </div>

        {pendingStudents && pendingStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Onay Bekleyen Öğrenciler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Yaş Grubu: {student.ageGroup}
                      </p>
                    </div>
                    <Button
                      onClick={() => activateStudentMutation.mutate({ studentId: student.id })}
                      disabled={activateStudentMutation.isPending}
                    >
                      {activateStudentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Aktifleştir"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Henüz kayıtlı aktivite bulunmuyor.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
