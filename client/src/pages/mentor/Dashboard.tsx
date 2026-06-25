import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, FileText, Clock, Loader2 } from "lucide-react";
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
        <div className="space-y-6 max-w-5xl mx-auto py-4 animate-pulse">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg"></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-6 h-[116px] shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-12 bg-slate-200 rounded"></div>
                  <div className="h-3 w-28 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="h-5 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg h-[74px]">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-48 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
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
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--navy)]">Mentor Paneli</h1>
          <p className="text-sm text-[var(--slate-muted)]">Öğrencilerinizi ve ilerlemelerini yönetin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Onay Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.pending}</div>
              <p className="text-xs text-[var(--slate-muted)] font-medium mt-1">
                Onaylanacak öğrenci başvurusu
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Öğrencilerim</CardTitle>
              <GraduationCap className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.active}</div>
              <p className="text-xs text-[var(--slate-muted)] font-medium mt-1">
                Aktif olarak takip edilen öğrenci
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Onaylanacak Raporlar</CardTitle>
              <FileText className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.reports}</div>
              <p className="text-xs text-[var(--slate-muted)] font-medium mt-1">
                İnceleme bekleyen etap raporu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Students Card */}
        <Card className="card-elevated border-slate-100 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-[var(--navy)]">Onay Bekleyen Öğrenciler</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {pendingStudents && pendingStudents.length > 0 ? (
              <div className="space-y-4">
                {pendingStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-slate-300 hover:bg-slate-50/30 transition-all duration-300"
                  >
                    <div>
                      <p className="font-bold text-[var(--navy)] text-sm">{student.name}</p>
                      <p className="text-xs text-[var(--slate-muted)] mt-0.5">{student.email}</p>
                      <p className="text-[10px] font-semibold text-[var(--steel)] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg inline-block mt-1">
                        Yaş Grubu: {student.ageGroup}
                      </p>
                    </div>
                    <Button
                      onClick={() => activateStudentMutation.mutate({ studentId: student.id })}
                      disabled={activateStudentMutation.isPending}
                      className="btn-accent text-xs font-semibold px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform"
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
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-semibold text-[var(--navy)] mb-1">Onay Bekleyen Öğrenci Yok</h3>
                <p className="text-xs text-[var(--slate-muted)]">
                  Şu an için onayınızı bekleyen yeni bir öğrenci başvurusu bulunmuyor.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Card */}
        <Card className="card-elevated border-slate-100 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-[var(--navy)]">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-[var(--navy)] mb-1">Kayıt Bulunmuyor</h3>
              <p className="text-xs text-[var(--slate-muted)]">
                Öğrencileriniz etapları tamamladıkça aktiviteleri burada listelenecektir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
