import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <p className="text-muted-foreground mt-2">
            Sistem yönetimi ve kullanıcı kontrolü
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Sistemdeki tüm kullanıcılar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öğrenciler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingStudents.length} beklemede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentorlar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentors.length}</div>
              <p className="text-xs text-muted-foreground">
                Aktif mentor sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adminler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
              <p className="text-xs text-muted-foreground">
                Sistem yöneticisi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard-analytics" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analitik Panel
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              İlerleme Analizi
            </TabsTrigger>
            <TabsTrigger value="students">
              Öğrenciler ({students.length})
            </TabsTrigger>
            <TabsTrigger value="mentors">
              Mentorlar ({mentors.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              Raporlar ({reports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="stages">
              Etaplar ({stages?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Sorular ({questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Zap className="h-4 w-4 mr-2" />
              Toplu İşlemler
            </TabsTrigger>
            <TabsTrigger value="mentor-comparison">
              <TrendingUp className="h-4 w-4 mr-2" />
              Mentor Karşılaştırma
            </TabsTrigger>
            <TabsTrigger value="feedback-summary">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback Özeti
            </TabsTrigger>
            <TabsTrigger value="user-management">
              <Users className="h-4 w-4 mr-2" />
              Kullanıcı Yönetimi
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Ödeme Yönetimi
            </TabsTrigger>
            <TabsTrigger value="schools">
              <Layers className="h-4 w-4 mr-2" />
              Okul Yönetimi
            </TabsTrigger>
            <TabsTrigger value="promotions">
              <Zap className="h-4 w-4 mr-2" />
              Promosyon Kodları
            </TabsTrigger>
            <TabsTrigger value="activity-logs">
              <Eye className="h-4 w-4 mr-2" />
              Aktivite Logları
            </TabsTrigger>
            <TabsTrigger value="export-history">
              <FileDown className="h-4 w-4 mr-2" />
              Rapor Geçmişi
            </TabsTrigger>
            <TabsTrigger value="pilot-feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Pilot Geri Bildirim
            </TabsTrigger>
            <TabsTrigger value="anomaly-history">
              <AlertTriangle className="h-4 w-4 mr-1" /> Anomali Takibi
            </TabsTrigger>
            <TabsTrigger value="scheduled-reports">
              <Mail className="h-4 w-4 mr-2" />
              Otomatik Raporlama
            </TabsTrigger>
            <TabsTrigger value="platform-settings">
              <Settings className="h-4 w-4 mr-2" />
              Platform Ayarları
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Analytics Tab */}
          <TabsContent value="dashboard-analytics">
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
          <TabsContent value="analytics">
            <ProgressAnalytics />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk">
            <BulkOperations />
          </TabsContent>

          {/* Mentor Comparison Tab */}
          <TabsContent value="mentor-comparison">
            <MentorComparisonReport />
          </TabsContent>

          {/* Feedback Summary Tab */}
          <TabsContent value="feedback-summary">
            <AdminFeedbackSummary />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <SchoolManagement />
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <PromotionCodeManagement />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity-logs">
            <ActivityLogViewer />
          </TabsContent>

          {/* Export History Tab */}
          <TabsContent value="export-history">
            <ExportHistory />
          </TabsContent>

          {/* Pilot Feedback Tab */}
          <TabsContent value="pilot-feedback">
            <PilotFeedbackPanel />
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="anomaly-history">
            <AnomalyHistory />
          </TabsContent>

          <TabsContent value="scheduled-reports">
            <ScheduledReports />
          </TabsContent>

          {/* Platform Settings Tab */}
          <TabsContent value="platform-settings">
            <PlatformSettings />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Öğrenci Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm öğrencileri görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Yaş Grubu</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.ageGroup || '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === 'active'
                                  ? 'default'
                                  : student.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {student.status === 'active'
                                ? 'Aktif'
                                : student.status === 'pending'
                                ? 'Beklemede'
                                : 'Pasif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.mentorName || (student.mentorId ? `Mentor #${student.mentorId}` : '-')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingStudent(student)}
                            >
                              Düzenle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Henüz öğrenci bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mentor Listesi</CardTitle>
                    <CardDescription>
                      Sistemdeki tüm mentorları görüntüleyin ve yönetin
                    </CardDescription>
                  </div>
                  <CreateMentorDialog />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.length > 0 ? (
                      mentors.map((mentor: any) => (
                        <TableRow key={mentor.id}>
                          <TableCell className="font-medium">{mentor.name}</TableCell>
                          <TableCell>{mentor.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">Aktif</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingMentor(mentor)}
                            >
                              Düzenle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Henüz mentor bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Rapor Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm raporları görüntüleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Öğrenci</TableHead>
                      <TableHead>Etap</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead>İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports && reports.length > 0 ? (
                      reports.map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.id}</TableCell>
                          <TableCell>{(report as any).studentName || report.userId}</TableCell>
                          <TableCell>{(report as any).stageName || report.stageId || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {report.type === 'stage' ? 'Etap' : 'Final'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === 'approved'
                                  ? 'default'
                                  : report.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {report.status === 'approved'
                                ? 'Onaylandı'
                                : report.status === 'pending'
                                ? 'Beklemede'
                                : 'Reddedildi'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            {report.pdfUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(report.pdfUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Henüz rapor bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stages Tab */}
          <TabsContent value="stages">
            <Card>
              <CardHeader>
                <CardTitle>Etap Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm etapları görüntüleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Etap Adı</TableHead>
                      <TableHead>Yaş Grubu</TableHead>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Açıklama</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stages && stages.length > 0 ? (
                      stages.map((stage: any) => (
                        <TableRow key={stage.id}>
                          <TableCell>{stage.id}</TableCell>
                          <TableCell className="font-medium">{stage.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{stage.ageGroup}</Badge>
                          </TableCell>
                          <TableCell>{stage.order}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {stage.description}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Henüz etap bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Soru Bankası</CardTitle>
                <CardDescription>
                  Sistemdeki tüm soruları görüntüleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Soru Metni</TableHead>
                      <TableHead>Etap ID</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Zorunlu</TableHead>
                      <TableHead>Sıra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions && questions.length > 0 ? (
                      questions.map((question: any) => (
                        <TableRow key={question.id}>
                          <TableCell>{question.id}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {question.text}
                          </TableCell>
                          <TableCell>{question.stageId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.type === 'likert' ? 'Likert' : 
                               question.type === 'multiple_choice' ? 'Çoktan Seçmeli' :
                               question.type === 'ranking' ? 'Sıralama' : 'Metin'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {question.required ? (
                              <Badge variant="default">Evet</Badge>
                            ) : (
                              <Badge variant="secondary">Hayır</Badge>
                            )}
                          </TableCell>
                          <TableCell>{question.order}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Henüz soru bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Mentor Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Mentor Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir mentor ekleyin. Mentor otomatik olarak aktif olacaktır.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Örn: ahmet@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createMentorMutation.isPending}>
              {createMentorMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Oluştur'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
