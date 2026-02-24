import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MentorComparisonReport() {
  const { data: mentorStats, isLoading } = trpc.admin.getMentorComparison.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!mentorStats || mentorStats.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Henüz mentor verisi bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  // Find top performers
  const mostActiveMentor = mentorStats.reduce((prev, current) => 
    (current.totalStudents > prev.totalStudents) ? current : prev
  );
  
  const fastestApprover = mentorStats
    .filter(m => m.avgApprovalTimeDays > 0)
    .reduce((prev, current) => 
      (current.avgApprovalTimeDays < prev.avgApprovalTimeDays) ? current : prev
    , mentorStats[0]);
  
  const highestApprovalRate = mentorStats
    .filter(m => m.totalReports > 0)
    .reduce((prev, current) => 
      (current.approvalRate > prev.approvalRate) ? current : prev
    , mentorStats[0]);

  // Prepare chart data
  const chartData = mentorStats.map(m => ({
    name: m.mentorName.split(' ')[0], // First name only for chart
    'Toplam Öğrenci': m.totalStudents,
    'Aktif Öğrenci': m.activeStudents,
    'Onaylanan Rapor': m.approvedReports,
    'Tamamlanan Etap': m.completedStages,
  }));

  return (
    <div className="space-y-6">
      {/* Top Performers Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Aktif Mentor</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostActiveMentor.mentorName}</div>
            <p className="text-xs text-muted-foreground">
              {mostActiveMentor.totalStudents} öğrenci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Hızlı Onaylayan</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fastestApprover.mentorName}</div>
            <p className="text-xs text-muted-foreground">
              Ort. {fastestApprover.avgApprovalTimeDays} gün
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Yüksek Onay Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestApprovalRate.mentorName}</div>
            <p className="text-xs text-muted-foreground">
              %{highestApprovalRate.approvalRate} onay oranı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor Performans Karşılaştırması</CardTitle>
          <CardDescription>Tüm mentorların performans metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Toplam Öğrenci" fill="#8b5cf6" />
              <Bar dataKey="Aktif Öğrenci" fill="#3b82f6" />
              <Bar dataKey="Onaylanan Rapor" fill="#10b981" />
              <Bar dataKey="Tamamlanan Etap" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Mentor Karşılaştırması</CardTitle>
          <CardDescription>Tüm metriklerin detaylı görünümü</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead className="text-center">Toplam Öğrenci</TableHead>
                  <TableHead className="text-center">Aktif Öğrenci</TableHead>
                  <TableHead className="text-center">Bekleyen Öğrenci</TableHead>
                  <TableHead className="text-center">Toplam Rapor</TableHead>
                  <TableHead className="text-center">Onaylanan</TableHead>
                  <TableHead className="text-center">Bekleyen</TableHead>
                  <TableHead className="text-center">Onay Oranı</TableHead>
                  <TableHead className="text-center">Ort. Onay Süresi</TableHead>
                  <TableHead className="text-center">Tamamlanan Etap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentorStats.map((mentor) => (
                  <TableRow key={mentor.mentorId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{mentor.mentorName}</div>
                        <div className="text-xs text-muted-foreground">{mentor.mentorEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {mentor.totalStudents}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-green-500">
                        {mentor.activeStudents}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {mentor.pendingStudents}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{mentor.totalReports}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-blue-500 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {mentor.approvedReports}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {mentor.pendingReports}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={mentor.approvalRate >= 80 ? "default" : "secondary"}
                        className={mentor.approvalRate >= 80 ? "bg-green-500" : ""}
                      >
                        %{mentor.approvalRate}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {mentor.avgApprovalTimeDays > 0 ? (
                        <span className="text-sm">{mentor.avgApprovalTimeDays} gün</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-50">
                        {mentor.completedStages}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
