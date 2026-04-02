import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Target, ArrowUpRight, ArrowDownRight, FileText, Award, UserCheck } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useMemo } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(amountInCents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}

// Türkçe ay isimleri
const MONTHS_TR: Record<string, string> = {
  '01': 'Oca', '02': 'Şub', '03': 'Mar', '04': 'Nis',
  '05': 'May', '06': 'Haz', '07': 'Tem', '08': 'Ağu',
  '09': 'Eyl', '10': 'Eki', '11': 'Kas', '12': 'Ara',
};

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${MONTHS_TR[month] || month} ${year}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_TR[String(d.getMonth() + 1).padStart(2, '0')] || ''}`;
}

// KPI Card with trend indicator
function KPICard({ title, value, subtitle, trend, trendLabel, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: any;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {(subtitle || trendLabel) && (
            <span className="text-xs text-muted-foreground">{trendLabel || subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.admin.getDashboardKPIs.useQuery();
  const { data: dailyRegs } = trpc.admin.getDailyRegistrations.useQuery({ days: 30 });
  const { data: monthlyRevenue } = trpc.admin.getMonthlyRevenue.useQuery({ months: 12 });
  const { data: dailyRevenue } = trpc.admin.getDailyRevenue.useQuery({ days: 30 });
  const { data: userActivity } = trpc.admin.getUserActivitySummary.useQuery();
  const { data: reportStats } = trpc.admin.getReportGenerationStats.useQuery({ months: 6 });
  const { data: packageDist } = trpc.admin.getPackageDistribution.useQuery();

  // Process daily registrations for chart
  const registrationChartData = useMemo(() => {
    if (!dailyRegs) return null;
    
    // Group by date
    const dateMap = new Map<string, { student: number; mentor: number; other: number }>();
    dailyRegs.forEach((r: any) => {
      const existing = dateMap.get(r.date) || { student: 0, mentor: 0, other: 0 };
      if (r.role === 'student') existing.student += Number(r.count);
      else if (r.role === 'mentor') existing.mentor += Number(r.count);
      else existing.other += Number(r.count);
      dateMap.set(r.date, existing);
    });
    
    const dates = Array.from(dateMap.keys()).sort();
    return {
      labels: dates.map(formatDate),
      datasets: [
        {
          label: 'Öğrenci',
          data: dates.map(d => dateMap.get(d)?.student || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Mentor',
          data: dates.map(d => dateMap.get(d)?.mentor || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [dailyRegs]);

  // Monthly revenue chart
  const revenueChartData = useMemo(() => {
    if (!monthlyRevenue) return null;
    
    return {
      labels: monthlyRevenue.map((r: any) => formatMonth(r.month)),
      datasets: [
        {
          label: 'Gelir (₺)',
          data: monthlyRevenue.map((r: any) => Number(r.totalRevenue) / 100),
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [monthlyRevenue]);

  // Daily revenue chart
  const dailyRevenueChartData = useMemo(() => {
    if (!dailyRevenue) return null;
    
    return {
      labels: dailyRevenue.map((r: any) => formatDate(r.date)),
      datasets: [
        {
          label: 'Günlük Gelir (₺)',
          data: dailyRevenue.map((r: any) => Number(r.totalRevenue) / 100),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [dailyRevenue]);

  // User role distribution
  const roleDistributionData = useMemo(() => {
    if (!userActivity) return null;
    
    return {
      labels: ['Öğrenci', 'Mentor', 'Admin', 'Okul Yöneticisi'],
      datasets: [{
        data: [
          userActivity.byRole.student,
          userActivity.byRole.mentor,
          userActivity.byRole.admin,
          userActivity.byRole.school_admin,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
      }],
    };
  }, [userActivity]);

  // Package distribution
  const packageDistData = useMemo(() => {
    if (!userActivity) return null;
    
    return {
      labels: ['Ücretsiz', 'Temel', 'Premium', 'Okul'],
      datasets: [{
        data: [
          userActivity.byPackage.free,
          userActivity.byPackage.basic,
          userActivity.byPackage.premium,
          userActivity.byPackage.school,
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 0,
      }],
    };
  }, [userActivity]);

  // Report generation stats
  const reportChartData = useMemo(() => {
    if (!reportStats) return null;
    
    return {
      labels: reportStats.map((r: any) => formatMonth(r.month)),
      datasets: [
        {
          label: 'Onaylanan',
          data: reportStats.map((r: any) => Number(r.approved)),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
        },
        {
          label: 'Bekleyen',
          data: reportStats.map((r: any) => Number(r.pending)),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
        },
      ],
    };
  }, [reportStats]);

  // User status distribution
  const statusDistData = useMemo(() => {
    if (!userActivity) return null;
    
    return {
      labels: ['Aktif', 'Beklemede', 'İnaktif'],
      datasets: [{
        data: [
          userActivity.byStatus.active,
          userActivity.byStatus.pending,
          userActivity.byStatus.inactive,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      }],
    };
  }, [userActivity]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, padding: 15 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, padding: 12, font: { size: 11 } },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, padding: 15 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section: KPI Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Temel Göstergeler (KPI)</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Toplam Kullanıcı"
            value={formatNumber(kpis?.totalUsers || 0)}
            trend={kpis?.userGrowthPercent}
            trendLabel="geçen aya göre"
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Bu Ay Gelir"
            value={formatCurrency(kpis?.thisMonthRevenue || 0)}
            trend={kpis?.revenueGrowthPercent}
            trendLabel="geçen aya göre"
            icon={DollarSign}
            color="green"
          />
          <KPICard
            title="Aktif Kullanıcı (7 gün)"
            value={formatNumber(kpis?.activeUsersWeek || 0)}
            subtitle={`${kpis?.totalUsers ? Math.round((kpis.activeUsersWeek / kpis.totalUsers) * 100) : 0}% toplam kullanıcı`}
            icon={Activity}
            color="purple"
          />
          <KPICard
            title="Dönüşüm Oranı"
            value={`%${kpis?.conversionRate || 0}`}
            subtitle="kayıt → ödeme yapan"
            icon={Target}
            color="orange"
          />
        </div>
      </div>

      {/* Section: Secondary KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Bu Ay Yeni Kayıt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{kpis?.thisMonthNewUsers || 0}</div>
            <p className="text-xs text-muted-foreground">geçen ay: {kpis?.lastMonthNewUsers || 0}</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(kpis?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">{kpis?.totalPurchases || 0} satış</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tamamlanan Etap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatNumber(kpis?.totalCompletedStages || 0)}</div>
            <p className="text-xs text-muted-foreground">toplam tamamlama</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Toplam Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{kpis?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">{kpis?.pendingReports || 0} beklemede</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Öğrenci / Mentor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{kpis?.students || 0} / {kpis?.mentors || 0}</div>
            <p className="text-xs text-muted-foreground">
              oran: {kpis?.mentors ? Math.round((kpis?.students || 0) / kpis.mentors) : 0}:1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section: Revenue Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Aylık Gelir Trendi
            </CardTitle>
            <CardDescription>Son 12 aylık gelir grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {revenueChartData ? (
                <Line data={revenueChartData} options={lineOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Günlük Gelir
            </CardTitle>
            <CardDescription>Son 30 günlük gelir dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {dailyRevenueChartData ? (
                <Bar data={dailyRevenueChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: User Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Registrations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Günlük Kayıtlar
            </CardTitle>
            <CardDescription>Son 30 günlük yeni kullanıcı kayıtları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {registrationChartData ? (
                <Bar data={registrationChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Rol Dağılımı
            </CardTitle>
            <CardDescription>Kullanıcı rollerine göre dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {roleDistributionData ? (
                <Doughnut data={roleDistributionData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Package & Status Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Paket Dağılımı
            </CardTitle>
            <CardDescription>Kullanıcıların paket tercihleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {packageDistData ? (
                <Doughnut data={packageDistData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Durum Dağılımı
            </CardTitle>
            <CardDescription>Kullanıcı hesap durumları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statusDistData ? (
                <Doughnut data={statusDistData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Generation Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Rapor Üretimi
            </CardTitle>
            <CardDescription>Aylık rapor oluşturma istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {reportChartData ? (
                <Bar data={reportChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Veri yükleniyor...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Activity Summary */}
      {userActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Kullanıcı Aktivite Özeti
            </CardTitle>
            <CardDescription>Platform kullanım metrikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600">{userActivity.activeToday}</div>
                <div className="text-xs text-muted-foreground mt-1">Bugün Aktif</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-blue-600">{userActivity.activeWeek}</div>
                <div className="text-xs text-muted-foreground mt-1">Bu Hafta Aktif</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-purple-600">{userActivity.activeMonth}</div>
                <div className="text-xs text-muted-foreground mt-1">Bu Ay Aktif</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-orange-600">{userActivity.total}</div>
                <div className="text-xs text-muted-foreground mt-1">Toplam Kullanıcı</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
