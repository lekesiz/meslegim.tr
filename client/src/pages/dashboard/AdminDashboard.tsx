import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, FileQuestion, Layers, Plus, TrendingUp, Zap, MessageSquare, Eye, Settings, CreditCard, BarChart3, FileDown, Mail, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ProgressAnalytics } from '@/components/ProgressAnalytics';
import { BulkOperations } from '@/components/BulkOperations';
import { toast } from 'sonner';
import { EditStudentDialog } from '@/components/EditStudentDialog';
import { EditMentorDialog } from '@/components/EditMentorDialog';
import MentorComparisonReport from '@/components/MentorComparisonReport';
import { AdminFeedbackSummary } from '@/components/AdminFeedbackSummary';
import { UserManagement } from '@/components/UserManagement';
import { PlatformSettings } from '@/components/PlatformSettings';
import { PilotFeedbackPanel } from '@/components/admin/PilotFeedbackPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { SchoolManagement } from '@/components/admin/SchoolManagement';
import { PromotionCodeManagement } from '@/components/admin/PromotionCodeManagement';
import { ActivityLogViewer } from '@/components/admin/ActivityLogViewer';
import { ExportHistory } from '@/components/admin/ExportHistory';
import ScheduledReports from '@/components/admin/ScheduledReports';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import ActiveUsersWidget from '@/components/admin/ActiveUsersWidget';
import AnomalyHistory from '@/components/admin/AnomalyHistory';
import UserJourneyMap from '@/components/admin/UserJourneyMap';
import BulkEmailCampaigns from '@/pages/admin/BulkEmailCampaigns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingMentor, setEditingMentor] = useState<any>(null);

  const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.admin.getAllReports.useQuery();
  const { data: stages, isLoading: stagesLoading } = trpc.admin.getAllStages.useQuery();
  const { data: questions, isLoading: questionsLoading } = trpc.admin.getAllQuestions.useQuery();
  const { data: stats } = trpc.admin.getSystemStats.useQuery();

  if (!user) {
    return null;
  }

  if (usersLoading || reportsLoading || stagesLoading || questionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--steel)]" />
        </div>
      </DashboardLayout>
    );
  }

  const students = users?.filter(u => u.role === 'student') || [];
  const mentors = users?.filter(u => u.role === 'mentor') || [];
  const admins = users?.filter(u => u.role === 'admin') || [];
  const pendingStudents = students.filter(s => s.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--navy)] tracking-tight">Sistem Yönetim Paneli (Admin)</h1>
          <p className="text-sm text-[var(--slate-muted)] mt-1.5 font-medium">
            Tüm platform kullanıcılarını yönetin, sistem analitiklerini inceleyin ve platform ayarlarını yapılandırın.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Toplam Kullanıcı</span>
              <Users className="h-4.5 w-4.5 text-[var(--steel)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{users?.length || 0}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Sistemdeki tüm kayıtlı hesaplar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Toplam Öğrenci</span>
              <Users className="h-4.5 w-4.5 text-[var(--gold-dark)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{students.length}</p>
              <p className="text-[10px] font-bold text-[var(--gold-dark)] mt-1">{pendingStudents.length} aktifleştirme bekliyor</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Aktif Mentorlar</span>
              <Users className="h-4.5 w-4.5 text-[var(--steel)]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{mentors.length}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Sisteme tanımlı aktif mentorlar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[var(--slate-muted)] uppercase tracking-wider">Yöneticiler</span>
              <Users className="h-4.5 w-4.5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--navy)]">{admins.length}</p>
              <p className="text-[10px] font-bold text-[var(--slate-light)] mt-1">Sistem admin yetkili hesaplar</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard-analytics" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50">
            <TabsTrigger value="dashboard-analytics" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <BarChart3 className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Analitik Panel
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              İlerleme Analizi
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Öğrenciler ({students.length})
            </TabsTrigger>
            <TabsTrigger value="mentors" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Mentorlar ({mentors.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Raporlar ({reports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="stages" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Etaplar ({stages?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              Sorular ({questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="bulk" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Zap className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Toplu İşlemler
            </TabsTrigger>
            <TabsTrigger value="mentor-comparison" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Mentor Karşılaştırma
            </TabsTrigger>
            <TabsTrigger value="feedback-summary" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Geri Bildirimler
            </TabsTrigger>
            <TabsTrigger value="user-management" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Kullanıcı Yönetimi
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <CreditCard className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Ödemeler
            </TabsTrigger>
            <TabsTrigger value="schools" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Layers className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Okullar
            </TabsTrigger>
            <TabsTrigger value="promotions" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Zap className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Kuponlar
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Eye className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Loglar
            </TabsTrigger>
            <TabsTrigger value="export-history" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <FileDown className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Rapor Dışa Aktarım
            </TabsTrigger>
            <TabsTrigger value="pilot-feedback" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Pilot Geri Bildirim
            </TabsTrigger>
            <TabsTrigger value="user-journey" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Kullanıcı Yolculuğu
            </TabsTrigger>
            <TabsTrigger value="anomaly-history" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-500" />
              Anomali Takibi
            </TabsTrigger>
            <TabsTrigger value="scheduled-reports" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Mail className="h-3.5 w-3.5 mr-1 text-[var(--gold-dark)]" />
              Otomatik Raporlar
            </TabsTrigger>
            <TabsTrigger value="email-campaigns" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Mail className="h-3.5 w-3.5 mr-1 text-[var(--steel)]" />
              Kampanyalar
            </TabsTrigger>
            <TabsTrigger value="platform-settings" className="text-xs font-bold rounded-lg px-4 py-2 cursor-pointer transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--navy)] data-[state=active]:shadow-sm">
              <Settings className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Analytics Tab */}
          <TabsContent value="dashboard-analytics" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                <ActiveUsersWidget />
                <AnalyticsDashboard />
              </div>
              <div className="space-y-4">
                <AdminActivityFeed />
              </div>
            </div>
          </TabsContent>

          {/* Progress Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <ProgressAnalytics />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk" className="mt-6">
            <BulkOperations />
          </TabsContent>

          {/* Mentor Comparison Tab */}
          <TabsContent value="mentor-comparison" className="mt-6">
            <MentorComparisonReport />
          </TabsContent>

          {/* Feedback Summary Tab */}
          <TabsContent value="feedback-summary" className="mt-6">
            <AdminFeedbackSummary />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="user-management" className="mt-6">
            <UserManagement />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <PaymentManagement />
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="mt-6">
            <SchoolManagement />
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="mt-6">
            <PromotionCodeManagement />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity-logs" className="mt-6">
            <ActivityLogViewer />
          </TabsContent>

          {/* Export History Tab */}
          <TabsContent value="export-history" className="mt-6">
            <ExportHistory />
          </TabsContent>

          {/* Pilot Feedback Tab */}
          <TabsContent value="pilot-feedback" className="mt-6">
            <PilotFeedbackPanel />
          </TabsContent>

          {/* User Journey Map Tab */}
          <TabsContent value="user-journey" className="mt-6">
            <UserJourneyMap />
          </TabsContent>

          {/* Anomaly History Tab */}
          <TabsContent value="anomaly-history" className="mt-6">
            <AnomalyHistory />
          </TabsContent>

          <TabsContent value="scheduled-reports" className="mt-6">
            <ScheduledReports />
          </TabsContent>

          <TabsContent value="email-campaigns" className="mt-6">
            <BulkEmailCampaigns />
          </TabsContent>

          {/* Platform Settings Tab */}
          <TabsContent value="platform-settings" className="mt-6">
            <PlatformSettings />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="pb-3 mb-4 border-b border-slate-50">
                <h3 className="text-base font-bold text-[var(--navy)]">Öğrenci Hesap Listesi</h3>
                <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Sistemdeki tüm öğrencileri görüntüleyin ve yönetin</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <TableHead className="px-4 py-3 text-left">Ad Soyad</TableHead>
                      <TableHead className="px-4 py-3 text-left">E-posta</TableHead>
                      <TableHead className="px-4 py-3 text-left">Yaş Grubu</TableHead>
                      <TableHead className="px-4 py-3 text-left">Durum</TableHead>
                      <TableHead className="px-4 py-3 text-left">Mentor</TableHead>
                      <TableHead className="px-4 py-3 text-left">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student: any) => (
                        <TableRow key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <TableCell className="font-bold text-sm text-[var(--navy)] px-4 py-3">{student.name}</TableCell>
                          <TableCell className="text-sm px-4 py-3">{student.email}</TableCell>
                          <TableCell className="text-xs font-semibold px-4 py-3">{student.ageGroup || '-'}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              className={
                                student.status === 'active'
                                  ? 'bg-green-50 text-green-700 border-none font-bold text-[10px]'
                                  : student.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-none font-bold text-[10px]'
                                  : 'bg-slate-100 text-slate-500 border-none font-bold text-[10px]'
                              }
                            >
                              {student.status === 'active'
                                ? 'Aktif'
                                : student.status === 'pending'
                                ? 'Beklemede'
                                : 'Pasif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-[var(--steel)] px-4 py-3">
                            {student.mentorName || (student.mentorId ? `Mentor #${student.mentorId}` : '-')}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <button 
                              onClick={() => setEditingStudent(student)}
                              className="border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-3 py-1.5 transition-all text-xs bg-white cursor-pointer"
                            >
                              Düzenle
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 font-medium py-8">
                          Henüz öğrenci bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="pb-3 mb-4 border-b border-slate-50 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--navy)]">Mentor Hesap Listesi</h3>
                  <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Sistemdeki tüm mentorları görüntüleyin ve yönetin</p>
                </div>
                <CreateMentorDialog />
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <TableHead className="px-4 py-3 text-left">Ad Soyad</TableHead>
                      <TableHead className="px-4 py-3 text-left">E-posta</TableHead>
                      <TableHead className="px-4 py-3 text-left">Durum</TableHead>
                      <TableHead className="px-4 py-3 text-left">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.length > 0 ? (
                      mentors.map((mentor: any) => (
                        <TableRow key={mentor.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <TableCell className="font-bold text-sm text-[var(--navy)] px-4 py-3">{mentor.name}</TableCell>
                          <TableCell className="text-sm px-4 py-3">{mentor.email}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className="bg-green-50 text-green-700 border-none font-bold text-[10px]">Aktif</Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <button 
                              onClick={() => setEditingMentor(mentor)}
                              className="border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-3 py-1.5 transition-all text-xs bg-white cursor-pointer"
                            >
                              Düzenle
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 font-medium py-8">
                          Henüz mentor bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="pb-3 mb-4 border-b border-slate-50">
                <h3 className="text-base font-bold text-[var(--navy)]">Tüm Raporlar</h3>
                <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Sistemdeki tüm onaylı veya onay bekleyen raporları görüntüleyin</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <TableHead className="px-4 py-3 text-left">ID</TableHead>
                      <TableHead className="px-4 py-3 text-left">Öğrenci</TableHead>
                      <TableHead className="px-4 py-3 text-left">Etap</TableHead>
                      <TableHead className="px-4 py-3 text-left">Tip</TableHead>
                      <TableHead className="px-4 py-3 text-left">Durum</TableHead>
                      <TableHead className="px-4 py-3 text-left">Oluşturulma</TableHead>
                      <TableHead className="px-4 py-3 text-left">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports && reports.length > 0 ? (
                      reports.map((report: any) => (
                        <TableRow key={report.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <TableCell className="text-xs text-slate-450 font-bold px-4 py-3">#{report.id}</TableCell>
                          <TableCell className="font-bold text-sm text-[var(--navy)] px-4 py-3">{(report as any).studentName || report.userId}</TableCell>
                          <TableCell className="text-sm font-medium text-[var(--steel)] px-4 py-3">{(report as any).stageName || report.stageId || '-'}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge variant="outline" className="border-slate-200 text-slate-650 bg-slate-50/50 font-bold text-[10px]">
                              {report.type === 'stage' ? 'Etap' : 'Final'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              className={
                                report.status === 'approved'
                                  ? 'bg-green-50 text-green-700 border-none font-bold text-[10px]'
                                  : report.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-none font-bold text-[10px]'
                                  : 'bg-red-50 text-red-700 border-none font-bold text-[10px]'
                              }
                            >
                              {report.status === 'approved'
                                ? 'Onaylandı'
                                : report.status === 'pending'
                                ? 'Beklemede'
                                : 'Reddedildi'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-450 font-semibold px-4 py-3">
                            {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {report.pdfUrl && (
                              <button
                                onClick={() => window.open(report.pdfUrl, '_blank')}
                                className="border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-3 py-1.5 transition-all text-xs bg-white cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5 mr-0.5" />
                                Görüntüle (PDF)
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 font-medium py-8">
                          Henüz rapor bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Stages Tab */}
          <TabsContent value="stages" className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="pb-3 mb-4 border-b border-slate-50">
                <h3 className="text-base font-bold text-[var(--navy)]">Platform Etap Tanımları</h3>
                <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Sistemde tanımlı tüm aktif aşamalar</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <TableHead className="px-4 py-3 text-left">ID</TableHead>
                      <TableHead className="px-4 py-3 text-left">Etap Adı</TableHead>
                      <TableHead className="px-4 py-3 text-left">Yaş Grubu</TableHead>
                      <TableHead className="px-4 py-3 text-left">Sıra No</TableHead>
                      <TableHead className="px-4 py-3 text-left">Açıklama</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stages && stages.length > 0 ? (
                      stages.map((stage: any) => (
                        <TableRow key={stage.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <TableCell className="text-xs font-bold text-slate-400 px-4 py-3">#{stage.id}</TableCell>
                          <TableCell className="font-bold text-sm text-[var(--navy)] px-4 py-3">{stage.name}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className="bg-[var(--gold)]/10 text-[var(--gold-dark)] border-none font-bold text-[10px] px-2 py-0.5">{stage.ageGroup}</Badge>
                          </TableCell>
                          <TableCell className="font-extrabold text-sm px-4 py-3">{stage.order}</TableCell>
                          <TableCell className="text-xs font-medium text-slate-500 max-w-md truncate px-4 py-3">
                            {stage.description}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 font-medium py-8">
                          Henüz etap bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="pb-3 mb-4 border-b border-slate-50">
                <h3 className="text-base font-bold text-[var(--navy)]">Soru Bankası</h3>
                <p className="text-xs text-[var(--slate-muted)] mt-1 font-medium">Tüm etaplarda öğrencilere yöneltilen sorular</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 text-[var(--navy)] font-bold text-xs uppercase tracking-wide">
                      <TableHead className="px-4 py-3 text-left">ID</TableHead>
                      <TableHead className="px-4 py-3 text-left">Soru Metni</TableHead>
                      <TableHead className="px-4 py-3 text-left">Etap ID</TableHead>
                      <TableHead className="px-4 py-3 text-left">Tip</TableHead>
                      <TableHead className="px-4 py-3 text-left">Zorunlu</TableHead>
                      <TableHead className="px-4 py-3 text-left">Sıra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions && questions.length > 0 ? (
                      questions.map((question: any) => (
                        <TableRow key={question.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <TableCell className="text-xs text-slate-400 font-bold px-4 py-3">#{question.id}</TableCell>
                          <TableCell className="text-sm font-semibold text-[var(--navy)] max-w-md truncate px-4 py-3">
                            {question.text}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-500 px-4 py-3">Etap #{question.stageId}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className="bg-slate-100 text-slate-650 border-none font-bold text-[10px]">
                              {question.type === 'likert' ? 'Likert' : 
                               question.type === 'multiple_choice' ? 'Çoktan Seçmeli' :
                               question.type === 'ranking' ? 'Sıralama' : 'Metin'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {question.required ? (
                              <Badge className="bg-red-50 text-red-700 border-none font-bold text-[10px]">Evet</Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px]">Hayır</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-600 px-4 py-3">{question.order}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 font-medium py-8">
                          Henüz soru bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <EditStudentDialog
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
          student={editingStudent}
        />
      )}

      {/* Edit Mentor Dialog */}
      {editingMentor && (
        <EditMentorDialog
          open={!!editingMentor}
          onOpenChange={(open) => !open && setEditingMentor(null)}
          mentor={editingMentor}
        />
      )}
    </DashboardLayout>
  );
}

// CreateMentorDialog Component
function CreateMentorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const utils = trpc.useUtils();

  const createMentorMutation = trpc.admin.createMentor.useMutation({
    onSuccess: () => {
      toast.success('Mentor başarıyla oluşturuldu', {
        description: 'Yeni mentor sisteme eklendi.',
      });
      utils.admin.getUsers.invalidate();
      setOpen(false);
      setName('');
      setEmail('');
      setPassword('');
    },
    onError: (error) => {
      toast.error('Hata', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMentorMutation.mutate({ name, email, password });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-gradient-to-br from-[var(--navy)] to-[var(--steel)] text-white font-semibold rounded-xl hover:shadow-md hover:from-[var(--navy-light)] hover:to-[var(--steel-light)] transition-all text-xs flex items-center gap-1.5 cursor-pointer border-none shrink-0">
          <Plus className="h-4 w-4 text-[var(--gold)]" />
          Yeni Mentor Ekle
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl max-w-md p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[var(--navy)]">Yeni Mentor Ekle</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Sisteme yeni bir mentor ekleyin. Mentor otomatik olarak aktif olacaktır.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-[var(--navy)]">Ad Soyad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              required
              className="rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-[var(--navy)]">E-posta Adresi</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Örn: ahmet@example.com"
              required
              className="rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-[var(--navy)]">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              minLength={6}
              className="rounded-xl border-slate-200 bg-slate-50/50 p-4 transition-all focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border-2 border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl font-bold px-4 py-2 transition-all text-xs bg-white cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit" 
              disabled={createMentorMutation.isPending}
              className="btn-accent px-5 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer border-none disabled:opacity-50"
            >
              {createMentorMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin text-[var(--navy)]" />
                  Oluşturuluyor...
                </>
              ) : (
                'Oluştur'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
