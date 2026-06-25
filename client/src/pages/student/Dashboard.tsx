import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, FileText, Lock, Loader2, ArrowRight, Award, Compass, BarChart3, Trophy, MessageSquare } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: progress, isLoading: loadingProgress } = trpc.student.getMyProgress.useQuery();
  const { data: reports, isLoading: loadingReports } = trpc.student.getMyReports.useQuery();

  const isLoading = loadingProgress || loadingReports;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--gold)]" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if student is pending approval
  if (user?.status === 'pending') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
            <Card className="card-elevated border-slate-100 overflow-hidden text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--navy)] mb-3">Hesabınız Onay Bekliyor</h2>
              <p className="text-sm text-[var(--slate-muted)] leading-relaxed">
                Platform yöneticilerimiz ve rehberlik mentorlarımız başvurunuzu inceliyor. 
                Hesabınız aktif edildiğinde e-posta adresinize otomatik bir bildirim gönderilecektir.
              </p>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const totalStages = progress?.length || 3;
  const completedStages = progress?.filter(s => s.status === 'completed').length || 0;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'active') return <Clock className="w-5 h-5 text-[var(--steel)]" />;
    return <Lock className="w-5 h-5 text-[var(--slate-light)]" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'completed') return 'Tamamlandı';
    if (status === 'active') return 'Devam Ediyor';
    return 'Kilitli';
  };

  const getStatusClass = (status: string) => {
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'active') return 'bg-blue-50 text-[var(--steel)] border-blue-100';
    return 'bg-slate-50 text-[var(--slate-muted)] border-slate-100';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto py-4">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--navy)]">Hoş Geldin, {user?.name} 👋</h1>
            <p className="text-sm text-[var(--slate-muted)]">Kariyer adımlarını takip et ve gelişim etaplarını tamamla</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3.5 py-1.5 bg-gradient-to-r from-[var(--navy)] to-[var(--steel)] text-white rounded-full shadow-sm">
              Öğrenci Paneli
            </span>
            <span className="text-xs font-bold px-3.5 py-1.5 bg-[var(--gold)]/10 text-[var(--gold-dark)] border border-[var(--gold)]/20 rounded-full">
              {user?.ageGroup} Yaş Grubu
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-elevated border-slate-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[var(--slate-muted)] font-medium">Toplam Etap</div>
              <div className="text-2xl font-bold text-[var(--navy)]">{completedStages} / {totalStages}</div>
            </div>
          </Card>
          
          <Card className="card-elevated border-slate-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[var(--slate-muted)] font-medium">Oluşan Rapor</div>
              <div className="text-2xl font-bold text-[var(--navy)]">{(reports?.filter(r => r.status === 'approved').length) || 0} Adet</div>
            </div>
          </Card>

          <Card className="card-elevated border-slate-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[var(--slate-muted)] font-medium">Sertifika Durumu</div>
              <div className="text-sm font-bold text-[var(--navy)]">
                {completedStages === totalStages ? "Hak Kazandınız 🎉" : "Devam Ediyor"}
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="card-elevated border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--navy)] via-[var(--navy-light)] to-[var(--steel)] text-white px-6 py-4">
            <h2 className="font-bold text-lg text-white">Genel İlerleme</h2>
          </div>
          <CardContent className="space-y-4 pt-6">
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-[var(--slate-muted)]">Tamamlanan Etaplar</span>
                <span className="font-bold text-[var(--navy)]">{completedStages} / {totalStages}</span>
              </div>
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
            <p className="text-xs text-[var(--slate-muted)] font-medium leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
              💡 Her etabın tamamlanması, yeteneklerinizi ve mesleki yönelimlerinizi daha doğru analiz etmemizi sağlar. Aşamalar bittiğinde kapsamlı final raporunuz mentorunuz tarafından onaylanacaktır.
            </p>
          </CardContent>
        </Card>

        {/* Stages List */}
        <Card className="card-elevated border-slate-100">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-[var(--navy)]">Kariyer Adımlarınız</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {progress && progress.length > 0 ? (
              <div className="space-y-3">
                {progress.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {getStatusIcon(stage.status)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--navy)] text-sm">Etap {index + 1}: {stage.stageName}</p>
                        <p className="text-xs text-[var(--slate-muted)] leading-relaxed max-w-md hidden sm:block mt-0.5">{stage.stageDescription}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-lg uppercase tracking-wider ${getStatusClass(stage.status)}`}>
                        {getStatusText(stage.status)}
                      </span>

                      {stage.status === 'active' && (
                        <button
                          onClick={() => setLocation(`/dashboard/student/stage/${stage.stageId}`)}
                          className="btn-accent px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Başla <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--slate-muted)] text-center py-8">
                Hesabınız aktif edildiğinde etaplarınız burada görüntülenecektir.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Reports List */}
        {reports && reports.length > 0 && (
          <Card className="card-elevated border-slate-100">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-[var(--navy)]">Kariyer Raporlarınız</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between gap-4 bg-gradient-to-br from-white to-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--steel)]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--navy)] text-sm">
                            {report.type === 'final' ? 'Kapsamlı Kariyer Raporu' : `Etap Raporu`}
                          </p>
                          <p className="text-xs text-[var(--slate-muted)] font-medium mt-0.5">
                            {report.type === 'stage' ? `Etap ID: ${report.stageId}` : 'Final Analiz'}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-lg uppercase tracking-wider ${
                        report.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {report.status === 'approved' ? 'Onaylandı' : 'Onay Bekliyor'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                      <button
                        onClick={() => setLocation(`/dashboard/student/reports`)}
                        className="text-xs text-[var(--steel)] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                      >
                        Rapor Detayı <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      
                      {report.status === 'approved' && report.fileUrl && (
                        <button
                          onClick={() => window.open(report.fileUrl!, '_blank')}
                          className="btn-accent px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Raporu İndir
                        </button>
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
