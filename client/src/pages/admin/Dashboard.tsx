import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, Clock, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto py-4 animate-pulse">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg"></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-6 h-[100px] shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                </div>
                <div className="h-8 w-12 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    totalUsers: users?.length || 0,
    students: users?.filter(u => u.role === 'student').length || 0,
    mentors: users?.filter(u => u.role === 'mentor').length || 0,
    pendingStudents: users?.filter(u => u.role === 'student' && u.status === 'pending').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--navy)]">Yönetici Paneli</h1>
          <p className="text-sm text-[var(--slate-muted)]">Platform genel durum özeti ve analizleri</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.totalUsers}</div>
              <p className="text-[10px] text-[var(--slate-muted)] font-medium mt-1">Platformdaki toplam üye</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Öğrenciler</CardTitle>
              <GraduationCap className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.students}</div>
              <p className="text-[10px] text-[var(--slate-muted)] font-medium mt-1">Aktif & Bekleyen öğrenciler</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Mentorlar</CardTitle>
              <Users className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.mentors}</div>
              <p className="text-[10px] text-[var(--slate-muted)] font-medium mt-1">Sistemdeki mentorlar</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
              <CardTitle className="text-sm font-semibold text-[var(--navy)]">Onay Bekleyenler</CardTitle>
              <ShieldCheck className="h-4 w-4 text-[var(--steel)]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-extrabold text-[var(--navy)]">{stats.pendingStudents}</div>
              <p className="text-[10px] text-[var(--slate-muted)] font-medium mt-1">Onay bekleyen başvurular</p>
            </CardContent>
          </Card>
        </div>

        {/* Son Aktiviteler */}
        <Card className="card-elevated border-slate-100 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-[var(--navy)]">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-[var(--navy)] mb-1">Kayıt Bulunmuyor</h3>
              <p className="text-xs text-[var(--slate-muted)]">
                Platform genelindeki en son kullanıcı aktiviteleri burada görüntülenecektir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
