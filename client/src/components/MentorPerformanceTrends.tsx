import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function MentorPerformanceTrends() {
  const { data: trends, isLoading } = trpc.mentor.getPerformanceTrends.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yükleniyor...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!trends) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Öğrenci Büyümesi */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Büyümesi</CardTitle>
          <CardDescription>Aylık yeni öğrenci sayısı trendi</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Yeni Öğrenci"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rapor Onaylama Hızı */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Onaylama Hızı</CardTitle>
          <CardDescription>Ortalama onaylama süresi (gün)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.approvalSpeed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgDays" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Ort. Gün"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Etap Tamamlama */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Etap Tamamlama Trendi</CardTitle>
          <CardDescription>Aylık tamamlanan etap sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.stageCompletion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Tamamlanan Etap" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
