import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Loader2, UserCheck, Users, FileText, CheckCircle, XCircle, ExternalLink, MessageSquare, Unlock, History, ChevronDown, ChevronUp } from 'lucide-react';
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

// ─── Mentor Unlock Section ────────────────────────────────────────────────────────
function MentorUnlockSection() {
  const { data: studentsWithLocked, isLoading, refetch } = trpc.mentor.getMyStudentsWithLockedStages.useQuery();
  const { data: unlockLogs, isLoading: logsLoading } = trpc.mentor.getMyUnlockLogs.useQuery();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [showLogs, setShowLogs] = useState(false);

  const unlockMutation = trpc.mentor.unlockStudentStage.useMutation({
    onSuccess: (data) => {
      toast.success(`"${data.stageName}" etabı başarıyla açıldı! Öğrenciye bildirim e-postası gönderildi.`);
      setUnlocking(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
      setUnlocking(null);
    },
  });

  const handleUnlock = (userId: number, userStageId: number, stageName: string) => {
    if (!confirm(`"${stageName}" etabını şimdi açmak istediğinizden emin misiniz? Öğrenciye bildirim e-postası gönderilecek.`)) return;
    setUnlocking(userStageId);
    unlockMutation.mutate({
      userId,
      userStageId,
      note: noteInputs[userStageId] || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Students with locked stages */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="pb-3 mb-4 border-b border-slate-50">
          <h3 className="text-base font-bold text-[var(--navy)] flex items-center gap-2">
            <Unlock className="h-5 w-5 text-[var(--gold-dark)]" />
            Manuel Etap Kilidi Açma
          </h3>
          <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">
            Öğrencilerinizin kilitli etaplarını bekleme süresini atlayıp anlık açabilirsiniz. Açma işlemi denetim log'una kaydedilir.
          </p>
        </div>
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--steel)]" />
            </div>
          ) : !studentsWithLocked || studentsWithLocked.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-500">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <p className="text-sm font-medium">Şu anda kilitli etabı olan öğrencileriniz bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentsWithLocked.map((student: any) => (
                <div key={student.userId} className="border border-slate-100/80 rounded-xl overflow-hidden bg-slate-50/20">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all text-left"
                    onClick={() => setExpandedUser(expandedUser === student.userId ? null : student.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[var(--gold)]/15 flex items-center justify-center text-[var(--gold-dark)] font-extrabold text-sm shadow-xs border border-[var(--gold)]/10">
                        {student.userName?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--navy)]">{student.userName}</p>
                        <p className="text-xs text-slate-400 font-semibold">{student.userEmail} · {student.ageGroup} yaş grubu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[var(--steel)] text-white text-[10px] font-bold border-none px-2 py-0.5">{student.lockedStages.length} kilitli etap</Badge>
                      {expandedUser === student.userId ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedUser === student.userId && (
                    <div className="border-t border-slate-100 bg-white p-4 space-y-3">
                      {student.lockedStages.map((stage: any) => (
                        <div key={stage.id} className="space-y-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-[var(--navy)]">{stage.stageName}</p>
                              <p className="text-xs text-slate-400 font-medium">
                                Etap {stage.stageOrder} · {stage.ageGroup} yaş grubu
                                {stage.unlockedAt && (
                                  <span className="ml-2 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                    Planlanan açılış: {new Date(stage.unlockedAt).toLocaleDateString('tr-TR')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Gerekçe / Not ekle (isteğe bağlı)"
                              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 outline-none"
                              value={noteInputs[stage.id] ?? ''}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [stage.id]: e.target.value }))}
                            />
                            <button
                              onClick={() => handleUnlock(student.userId, stage.id, stage.stageName)}
                              disabled={unlocking === stage.id}
                              className="btn-accent px-4 py-1.5 text-xs font-bold flex items-center justify-center shrink-0 border-none disabled:opacity-50"
                            >
                              {unlocking === stage.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--navy)]" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 mr-1" />
                              )}
                              Kilidi Aç
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="pb-3 mb-4 border-b border-slate-50">
          <h3 className="text-base font-bold text-[var(--navy)] flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--steel)]" />
            Açma Geçmişi Logları
          </h3>
          <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Yaptığınız veya öğrencilerinize yapılan manuel etap açma işlemleri</p>
        </div>
        <div>
          {logsLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--steel)]" />
            </div>
          ) : !unlockLogs || unlockLogs.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">Henüz hiç manuel açma işlemi yapılmamış.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 overflow-x-auto shadow-xs">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Tarih</th>
                      <th className="px-4 py-3 text-left">Öğrenci</th>
                      <th className="px-4 py-3 text-left">Etap</th>
                      <th className="px-4 py-3 text-left">Açan Rolü</th>
                      <th className="px-4 py-3 text-left">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showLogs ? unlockLogs : unlockLogs.slice(0, 5)).map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-xs text-slate-400 font-semibold whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-[var(--navy)]">{log.studentName ?? `#${log.studentId}`}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--steel)]">{log.stageName}</td>
                        <td className="px-4 py-3">
                          <Badge className={log.unlockedByRole === 'admin' ? 'bg-red-50 text-red-700 border-none font-bold text-[10px]' : 'bg-slate-100 text-slate-700 border-none font-bold text-[10px]'}>
                            {log.unlockedByRole}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-medium">{log.note ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {unlockLogs.length > 5 && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="border-2 border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer w-full"
                >
                  {showLogs ? 'Daralt' : `Tümünü Göster (${unlockLogs.length} kayıt)`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--navy)] tracking-tight">Mentor Yönetim Paneli</h1>
          <p className="text-sm text-[var(--slate-muted)] mt-1.5 font-medium">
            Öğrencilerinizin gelişim süreçlerini kontrol edin, kilitli etaplarını yönetin ve raporlarını onaylayın.
          </p>
        </div>

        {/* Stats Charts */}
        {stats && (
          <MentorStatsChart stats={stats} />
        )}

        {/* Performance Trends */}
        <MentorPerformanceTrends />

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Bekleyen Onaylar</span>
              <UserCheck className="h-4.5 w-4.5 text-[var(--steel)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{pendingStudents?.length || 0}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Aktifleştirme bekleyen öğrenciler</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Öğrencilerim</span>
              <Users className="h-4.5 w-4.5 text-[var(--gold-dark)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{myStudents?.length || 0}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Aktif takip edilen öğrenciler</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Bekleyen Raporlar</span>
              <FileText className="h-4.5 w-4.5 text-[var(--steel)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{pendingReports?.length || 0}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Onay bekleyen etap & final raporları</p>
              {(pendingReports?.length || 0) > 0 && (
                <button
                  onClick={() => setLocation('/dashboard/mentor/reports')}
                  className="text-[10px] font-bold text-[var(--gold-dark)] hover:underline mt-1 bg-transparent border-none p-0 cursor-pointer block"
                >
                  Tümünü Gör →
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Yanıt Süresi</span>
              <CheckCircle className="h-4.5 w-4.5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{stats?.avgResponseTimeDays || 0} Gün</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Ortalama onay/red süresi</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50">
            <TabsTrigger value="pending" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Bekleyen Onaylar ({pendingStudents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Öğrencilerim ({myStudents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Bekleyen Raporlar ({pendingReports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Geri Bildirimler
            </TabsTrigger>
            <TabsTrigger value="unlock" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Etap Açma
            </TabsTrigger>
          </TabsList>

          {/* Pending Students Tab */}
          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingStudents && pendingStudents.length > 0 ? (
              pendingStudents.map((student: any) => (
                <div key={student.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[var(--navy)]">{student.name}</h3>
                      <Badge className="bg-amber-50 text-amber-700 border-none font-bold text-[10px]">Onay Bekliyor</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {student.email} • {student.phone}
                    </p>
                    <div className="flex gap-4 mt-3 flex-wrap text-xs text-slate-500 font-medium">
                      <p><span className="font-semibold text-[var(--navy)]">Yaş Grubu:</span> {student.ageGroup}</p>
                      <p><span className="font-semibold text-[var(--navy)]">TC Kimlik:</span> {student.tcKimlik}</p>
                      <p><span className="font-semibold text-[var(--navy)]">Kayıt:</span> {new Date(student.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="shrink-0 self-start md:self-center">
                    <button
                      onClick={() => activateStudentMutation.mutate({ studentId: student.id })}
                      disabled={activateStudentMutation.isPending}
                      className="btn-accent px-5 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm border-none disabled:opacity-50"
                    >
                      {activateStudentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-[var(--navy)]" />
                          Aktifleştiriliyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Aktif Et ve Onayla
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <p className="text-slate-400 font-medium">Bekleyen aktifleştirme onayı bulunmamaktadır.</p>
              </div>
            )}
          </TabsContent>

          {/* My Students Tab */}
          <TabsContent value="students" className="space-y-4 mt-6">
            {myStudents && myStudents.length > 0 ? (
              myStudents.map((student: any) => (
                <div key={student.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[var(--navy)]">{student.name}</h3>
                      <Badge className="bg-green-50 text-green-700 border-none font-bold text-[10px]">Aktif</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {student.email}
                    </p>
                    <div className="flex gap-4 mt-3 flex-wrap text-xs text-slate-500 font-medium">
                      <p><span className="font-semibold text-[var(--navy)]">Yaş Grubu:</span> {student.ageGroup}</p>
                      <p><span className="font-semibold text-[var(--navy)]">Aktifleşme:</span> {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('tr-TR') : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button 
                      onClick={() => setLocation(`/dashboard/student/${student.id}`)}
                      className="border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer"
                    >
                      Detayları Gör
                    </button>
                    <button
                      onClick={() => {
                        setChatStudent({ id: student.id, name: student.name });
                        setChatOpen(true);
                      }}
                      className="border border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-0.5" />
                      Mesaj Gönder
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <p className="text-slate-400 font-medium">Henüz aktif öğrenciniz bulunmamaktadır.</p>
              </div>
            )}
          </TabsContent>

          {/* Pending Reports Tab */}
          <TabsContent value="reports" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--slate-muted)] font-medium">
                Toplam {pendingReports?.length || 0} rapor onay bekliyor
              </p>
              <button 
                onClick={() => setLocation('/dashboard/mentor/reports')}
                className="border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Tüm Rapor Havuzuna Git
              </button>
            </div>
            {pendingReports && pendingReports.length > 0 ? (
              pendingReports.map((report: any) => (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-50">
                    <div>
                      <h3 className="font-bold text-base text-[var(--navy)]">
                        {report.stageName || (report.type === 'stage' ? 'Etap Raporu' : 'Final Raporu')}
                      </h3>
                      <p className="text-xs text-slate-450 font-semibold mt-1">
                        Öğrenci: <span className="font-bold text-[var(--navy)]">{report.studentName || 'Bilinmeyen Öğrenci'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tamamlanma Tarihi: {report.completedAt ? new Date(report.completedAt).toLocaleDateString('tr-TR') : new Date(report.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border-none font-bold text-[10px] self-start sm:self-center">Onay Bekliyor</Badge>
                  </div>
                  <div>
                    {report.summary && (
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-4">
                        <p className="text-[10px] font-extrabold mb-1 text-[var(--slate-muted)] uppercase tracking-wide">Etap Özeti / AI Görüşü</p>
                        <p className="text-xs text-[var(--slate-text)] leading-relaxed font-medium">{report.summary}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {report.fileUrl && (
                        <button
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          className="border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-0.5" />
                          Raporu Detaylı Oku
                        </button>
                      )}
                      <button
                        onClick={() => approveReportMutation.mutate({ reportId: report.id, approved: true })}
                        disabled={approveReportMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs px-4 py-2 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {approveReportMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Raporu Onayla
                      </button>
                      <button
                        onClick={() => {
                          setRejectReportId(report.id);
                          setRejectFeedback('');
                          setRejectDialogOpen(true);
                        }}
                        disabled={approveReportMutation.isPending}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs px-4 py-2 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 border-none"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Revizyon İste (Reddet)
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <p className="text-slate-400 font-medium">Onay bekleyen rapor bulunmamaktadır.</p>
              </div>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6">
            <MentorFeedbackStats />
          </TabsContent>

          {/* Stage Unlock Tab */}
          <TabsContent value="unlock" className="mt-6">
            <MentorUnlockSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>

    {/* Reject Dialog */}
    <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
      <DialogContent className="rounded-2xl max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[var(--navy)]">Raporu Reddet & Revizyon İste</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
            Öğrenciye iletilecek geri bildirimi yazın. Bu mesaj öğrenciye e-posta ile gönderilecektir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <Label htmlFor="reject-feedback" className="text-xs font-bold text-[var(--navy)]">Geri Bildirim Açıklaması <span className="text-red-500">*</span></Label>
          <Textarea
            id="reject-feedback"
            placeholder="Raporun neden reddedildiğini ve öğrencinin ne yapması gerektiğini açıklayın..."
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            rows={4}
            className="rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-xs"
          />
        </div>
        <DialogFooter className="flex gap-2">
          <button 
            onClick={() => setRejectDialogOpen(false)}
            className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer"
          >
            İptal
          </button>
          <button
            disabled={!rejectFeedback.trim() || approveReportMutation.isPending}
            onClick={() => {
              if (rejectReportId && rejectFeedback.trim()) {
                approveReportMutation.mutate(
                  { reportId: rejectReportId, approved: false, feedback: rejectFeedback },
                  { onSuccess: () => setRejectDialogOpen(false) }
                );
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs px-4 py-2 cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {approveReportMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            Reddet ve Bildir
          </button>
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
