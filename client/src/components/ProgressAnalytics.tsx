import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function ProgressAnalytics() {
  const { data: progressStats, isLoading } = trpc.admin.getProgressStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!progressStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            İstatistik verisi bulunamadı
          </p>
        </CardContent>
      </Card>
    );
  }

  // Stage completion chart data
  const stageCompletionData = {
    labels: progressStats.stageStats.map(s => s.stageName),
    datasets: [
      {
        label: 'Tamamlandı',
        data: progressStats.stageStats.map(s => s.completed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Devam Ediyor',
        data: progressStats.stageStats.map(s => s.inProgress),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Başlanmadı',
        data: progressStats.stageStats.map(s => s.notStarted),
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
      },
    ],
  };

  // Average completion time chart data
  const completionTimeData = {
    labels: progressStats.avgCompletionByStage.map(s => s.stageName),
    datasets: [
      {
        label: 'Ortalama Tamamlama Süresi (Gün)',
        data: progressStats.avgCompletionByStage.map(s => s.avgDays),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      },
    ],
  };

  // Dropout rate doughnut chart
  const dropoutData = {
    labels: ['Aktif', 'İnaktif (30+ gün)'],
    datasets: [
      {
        data: [100 - progressStats.dropoutRate, progressStats.dropoutRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dropout Oranı</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.dropoutRate}%</div>
            <p className="text-xs text-muted-foreground">
              {progressStats.inactiveStudents} öğrenci 30+ gün inaktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Tamamlama</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                progressStats.avgCompletionByStage.reduce((sum, s) => sum + s.avgDays, 0) /
                  progressStats.avgCompletionByStage.length
              )} gün
            </div>
            <p className="text-xs text-muted-foreground">
              Etap başına ortalama süre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Etap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.stageStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Tüm yaş grupları
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stage Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Etap Tamamlama Durumu</CardTitle>
            <CardDescription>
              Her etaptaki öğrenci dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={stageCompletionData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Dropout Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aktiflik Durumu</CardTitle>
            <CardDescription>
              30+ gün inaktif öğrenci oranı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-[250px] h-[250px]">
                <Doughnut data={dropoutData} options={chartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ortalama Tamamlama Süreleri</CardTitle>
          <CardDescription>
            Her etap için ortalama tamamlama süresi (gün)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={completionTimeData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stage Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Etap İstatistikleri</CardTitle>
          <CardDescription>
            Her etap için detaylı durum bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Etap</th>
                  <th className="text-left p-2">Yaş Grubu</th>
                  <th className="text-right p-2">Tamamlandı</th>
                  <th className="text-right p-2">Devam Ediyor</th>
                  <th className="text-right p-2">Başlanmadı</th>
                  <th className="text-right p-2">Ort. Süre</th>
                </tr>
              </thead>
              <tbody>
                {progressStats.stageStats.map((stage, idx) => {
                  const avgTime = progressStats.avgCompletionByStage.find(
                    s => s.stageId === stage.stageId
                  );
                  return (
                    <tr key={stage.stageId} className="border-b">
                      <td className="p-2">{stage.stageName}</td>
                      <td className="p-2">{stage.ageGroup}</td>
                      <td className="text-right p-2 text-green-600 font-medium">
                        {stage.completed}
                      </td>
                      <td className="text-right p-2 text-blue-600 font-medium">
                        {stage.inProgress}
                      </td>
                      <td className="text-right p-2 text-muted-foreground">
                        {stage.notStarted}
                      </td>
                      <td className="text-right p-2">
                        {avgTime?.avgDays || 0} gün
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
