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
import { Loader2, Users, FileQuestion, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

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
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
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
          </TabsList>

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
                            {student.mentorId ? `Mentor #${student.mentorId}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm mentorları görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            <Button variant="outline" size="sm">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Kullanıcı ID</TableHead>
                      <TableHead>Etap ID</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports && reports.length > 0 ? (
                      reports.map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.id}</TableCell>
                          <TableCell>{report.userId}</TableCell>
                          <TableCell>{report.stageId || '-'}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
