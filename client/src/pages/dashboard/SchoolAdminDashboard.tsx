import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, GraduationCap, UserCheck, Building2, Search, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { SEO } from '@/components/SEO';

export default function SchoolAdminDashboard() {
  const [studentSearch, setStudentSearch] = useState('');
  const [mentorSearch, setMentorSearch] = useState('');

  // school_admin kullanıcının schoolId'sini kullanarak kendi okulunu getir
  const { data: schoolData, isLoading: schoolLoading } = trpc.school.getAll.useQuery();
  const school = schoolData?.[0]; // school_admin sadece kendi okulunu görür
  const schoolId = school?.id;
  const { data: students, isLoading: studentsLoading } = trpc.school.getStudents.useQuery(
    { schoolId: schoolId! },
    { enabled: !!schoolId }
  );
  const { data: mentors, isLoading: mentorsLoading } = trpc.school.getMentors.useQuery(
    { schoolId: schoolId! },
    { enabled: !!schoolId }
  );
  const { data: stats } = trpc.school.getStats.useQuery(
    { schoolId: schoolId! },
    { enabled: !!schoolId }
  );

  if (schoolLoading || studentsLoading || mentorsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Building2 className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Okul Bulunamadı</h2>
          <p className="text-muted-foreground">Henüz bir okula atanmamışsınız. Lütfen sistem yöneticisi ile iletişime geçin.</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredStudents = (students || []).filter((s: any) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  const filteredMentors = (mentors || []).filter((m: any) => {
    if (!mentorSearch) return true;
    const q = mentorSearch.toLowerCase();
    return m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <SEO title={`${school.name} - Okul Yönetimi`} description="Okul yöneticisi paneli" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{school.name}</h1>
          <p className="text-muted-foreground mt-1">
            {school.city && `${school.city} - `}Okul Yönetim Paneli
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öğrenciler</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı öğrenci</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentorlar</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentors?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Atanmış mentor</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan Etap</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedStages || 0}</div>
              <p className="text-xs text-muted-foreground">Toplam tamamlanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students?.filter((s: any) => s.status === 'active').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Aktif durumdaki</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">
              <GraduationCap className="h-4 w-4 mr-2" />
              Öğrenciler ({students?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mentors">
              <UserCheck className="h-4 w-4 mr-2" />
              Mentorlar ({mentors?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Öğrenci Listesi</CardTitle>
                    <CardDescription>Okulunuzdaki tüm öğrencileri görüntüleyin</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Öğrenci ara..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
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
                      <TableHead>İlerleme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.ageGroup || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status === 'active' ? 'Aktif' : student.status === 'pending' ? 'Beklemede' : 'Pasif'}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.mentorName || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary rounded-full h-2"
                                  style={{ width: `${student.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{student.progress || 0}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {studentSearch ? 'Arama sonucu bulunamadı.' : 'Henüz öğrenci bulunmamaktadır.'}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mentor Listesi</CardTitle>
                    <CardDescription>Okulunuza atanmış mentorları görüntüleyin</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Mentor ara..."
                      value={mentorSearch}
                      onChange={(e) => setMentorSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Öğrenci Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMentors.length > 0 ? (
                      filteredMentors.map((mentor: any) => (
                        <TableRow key={mentor.id}>
                          <TableCell className="font-medium">{mentor.name}</TableCell>
                          <TableCell>{mentor.email}</TableCell>
                          <TableCell>{mentor.studentCount || 0}</TableCell>
                          <TableCell>
                            <Badge variant="default">Aktif</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {mentorSearch ? 'Arama sonucu bulunamadı.' : 'Henüz mentor atanmamıştır.'}
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
