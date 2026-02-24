import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MentorStatsChartProps {
  stats: {
    totalStudents: number;
    approvedReports: number;
    pendingReports: number;
    avgResponseTimeDays: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function MentorStatsChart({ stats }: MentorStatsChartProps) {
  const barData = [
    { name: 'Toplam Öğrenci', value: stats.totalStudents },
    { name: 'Onaylanan Rapor', value: stats.approvedReports },
    { name: 'Bekleyen Rapor', value: stats.pendingReports },
    { name: 'Ort. Yanıt Süresi (Gün)', value: Math.round(stats.avgResponseTimeDays) },
  ];

  const pieData = [
    { name: 'Onaylanan Rapor', value: stats.approvedReports },
    { name: 'Bekleyen Rapor', value: stats.pendingReports },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Genel İstatistikler</CardTitle>
          <CardDescription>Tüm metriklerin özeti</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Durumu</CardTitle>
          <CardDescription>Onaylanan ve bekleyen rapor dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
