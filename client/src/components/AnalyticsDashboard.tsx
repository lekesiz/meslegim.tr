import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, TrendingUp, DollarSign, BarChart3, Activity, Target, ArrowUpRight, ArrowDownRight, FileText, Award, UserCheck, Download, CalendarIcon, Filter } from 'lucide-react';
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
import { useMemo, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

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

// Date range presets
type DatePreset = 'today' | 'last7' | 'last30' | 'last90' | 'all' | 'custom';

function getDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  if (preset === 'all') return {};
  
  const now = new Date();
  const end = now.toISOString();
  
  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: start.toISOString(), endDate: end };
    }
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { startDate: start.toISOString(), endDate: end };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { startDate: start.toISOString(), endDate: end };
    }
    case 'last90': {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { startDate: start.toISOString(), endDate: end };
    }
    default:
      return {};
  }
}

const PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Bugün',
  last7: 'Son 7 Gün',
  last30: 'Son 30 Gün',
  last90: 'Son 3 Ay',
  all: 'Tüm Zamanlar',
  custom: 'Özel Aralık',
};

// CSV Export utility
function downloadCSV(data: Record<string, unknown>[], filename: string, headers?: Record<string, string>) {
  if (!data || data.length === 0) return;
  
  const keys = Object.keys(data[0]);
  const headerRow = keys.map(k => headers?.[k] || k).join(',');
  const rows = data.map(row => 
    keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape commas and quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  // Add BOM for Turkish characters in Excel
  const bom = '\uFEFF';
  const csv = bom + [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// KPI Card with trend indicator
function KPICard({ title, value, subtitle, trend, trendLabel, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
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

// Date Range Filter Component
function DateRangeFilter({ 
  preset, 
  onPresetChange, 
  customRange, 
  onCustomRangeChange 
}: {
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  customRange: DateRange | undefined;
  onCustomRangeChange: (range: DateRange | undefined) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Tarih Filtresi:</span>
      </div>
      
      <Select value={preset} onValueChange={(val) => onPresetChange(val as DatePreset)}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Tarih aralığı seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Bugün</SelectItem>
          <SelectItem value="last7">Son 7 Gün</SelectItem>
          <SelectItem value="last30">Son 30 Gün</SelectItem>
          <SelectItem value="last90">Son 3 Ay</SelectItem>
          <SelectItem value="all">Tüm Zamanlar</SelectItem>
          <SelectItem value="custom">Özel Aralık</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {customRange?.from ? (
                customRange.to ? (
                  <span>
                    {format(customRange.from, 'd MMM', { locale: tr })} - {format(customRange.to, 'd MMM yyyy', { locale: tr })}
                  </span>
                ) : (
                  <span>{format(customRange.from, 'd MMM yyyy', { locale: tr })}</span>
                )
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={(range) => {
                onCustomRangeChange(range);
                if (range?.from && range?.to) {
                  setCalendarOpen(false);
                }
              }}
              locale={tr}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {preset !== 'all' && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {preset === 'custom' && customRange?.from && customRange?.to
            ? `${format(customRange.from, 'd MMM yyyy', { locale: tr })} - ${format(customRange.to, 'd MMM yyyy', { locale: tr })}`
            : PRESET_LABELS[preset]
          }
        </span>
      )}
    </div>
  );
}

// CSV Export Button Component
function ExportButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick} 
      disabled={disabled}
      className="h-8 gap-1.5 text-xs"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

export function AnalyticsDashboard() {
  // Date filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  // Compute date range based on preset or custom
  const dateParams = useMemo(() => {
    if (datePreset === 'custom' && customRange?.from) {
      const startDate = customRange.from.toISOString();
      const endDate = customRange.to ? customRange.to.toISOString() : new Date().toISOString();
      return { startDate, endDate };
    }
    return getDateRange(datePreset);
  }, [datePreset, customRange]);

  // Queries with date filter
  const { data: kpis, isLoading: kpisLoading } = trpc.admin.getDashboardKPIs.useQuery(
    dateParams.startDate || dateParams.endDate 
      ? { startDate: dateParams.startDate, endDate: dateParams.endDate }
      : undefined
  );
  const { data: dailyRegs } = trpc.admin.getDailyRegistrations.useQuery({ 
    days: 30,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: monthlyRevenue } = trpc.admin.getMonthlyRevenue.useQuery({ 
    months: 12,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: dailyRevenue } = trpc.admin.getDailyRevenue.useQuery({ 
    days: 30,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: userActivity } = trpc.admin.getUserActivitySummary.useQuery();
  const { data: reportStats } = trpc.admin.getReportGenerationStats.useQuery({ 
    months: 6,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: packageDist } = trpc.admin.getPackageDistribution.useQuery(
    dateParams.startDate || dateParams.endDate 
      ? { startDate: dateParams.startDate, endDate: dateParams.endDate }
      : undefined
  );

  // CSV Export handlers
  const handleExportKPIs = useCallback(() => {
    if (!kpis) return;
    downloadCSV([{
      toplam_kullanici: kpis.totalUsers,
      bu_ay_yeni_kayit: kpis.thisMonthNewUsers,
      gecen_ay_yeni_kayit: kpis.lastMonthNewUsers,
      kullanici_buyume_yuzde: kpis.userGrowthPercent,
      toplam_gelir_kurus: kpis.totalRevenue,
      bu_ay_gelir_kurus: kpis.thisMonthRevenue,
      gecen_ay_gelir_kurus: kpis.lastMonthRevenue,
      gelir_buyume_yuzde: kpis.revenueGrowthPercent,
      tamamlanan_etap: kpis.totalCompletedStages,
      toplam_rapor: kpis.totalReports,
      bekleyen_rapor: kpis.pendingReports,
      aktif_kullanici_7gun: kpis.activeUsersWeek,
      donusum_orani: kpis.conversionRate,
      toplam_satis: kpis.totalPurchases,
      ogrenci_sayisi: kpis.students,
      mentor_sayisi: kpis.mentors,
    }], 'kpi_ozet', {
      toplam_kullanici: 'Toplam Kullanıcı',
      bu_ay_yeni_kayit: 'Bu Ay Yeni Kayıt',
      gecen_ay_yeni_kayit: 'Geçen Ay Yeni Kayıt',
      kullanici_buyume_yuzde: 'Kullanıcı Büyüme %',
      toplam_gelir_kurus: 'Toplam Gelir (kuruş)',
      bu_ay_gelir_kurus: 'Bu Ay Gelir (kuruş)',
      gecen_ay_gelir_kurus: 'Geçen Ay Gelir (kuruş)',
      gelir_buyume_yuzde: 'Gelir Büyüme %',
      tamamlanan_etap: 'Tamamlanan Etap',
      toplam_rapor: 'Toplam Rapor',
      bekleyen_rapor: 'Bekleyen Rapor',
      aktif_kullanici_7gun: 'Aktif Kullanıcı (7 gün)',
      donusum_orani: 'Dönüşüm Oranı %',
      toplam_satis: 'Toplam Satış',
      ogrenci_sayisi: 'Öğrenci Sayısı',
      mentor_sayisi: 'Mentor Sayısı',
    });
  }, [kpis]);

  const handleExportDailyRegistrations = useCallback(() => {
    if (!dailyRegs) return;
    downloadCSV(dailyRegs.map((r: { date: string; count: number; role: string }) => ({
      tarih: r.date,
      rol: r.role,
      kayit_sayisi: r.count,
    })), 'gunluk_kayitlar', {
      tarih: 'Tarih',
      rol: 'Rol',
      kayit_sayisi: 'Kayıt Sayısı',
    });
  }, [dailyRegs]);

  const handleExportMonthlyRevenue = useCallback(() => {
    if (!monthlyRevenue) return;
    downloadCSV(monthlyRevenue.map((r: { month: string; totalRevenue: number; count: number; completedCount: number }) => ({
      ay: r.month,
      toplam_gelir_tl: (Number(r.totalRevenue) / 100).toFixed(2),
      satis_sayisi: r.count,
      tamamlanan_satis: r.completedCount,
    })), 'aylik_gelir', {
      ay: 'Ay',
      toplam_gelir_tl: 'Toplam Gelir (₺)',
      satis_sayisi: 'Satış Sayısı',
      tamamlanan_satis: 'Tamamlanan Satış',
    });
  }, [monthlyRevenue]);

  const handleExportDailyRevenue = useCallback(() => {
    if (!dailyRevenue) return;
    downloadCSV(dailyRevenue.map((r: { date: string; totalRevenue: number; count: number }) => ({
      tarih: r.date,
      gelir_tl: (Number(r.totalRevenue) / 100).toFixed(2),
      satis_sayisi: r.count,
    })), 'gunluk_gelir', {
      tarih: 'Tarih',
      gelir_tl: 'Gelir (₺)',
      satis_sayisi: 'Satış Sayısı',
    });
  }, [dailyRevenue]);

  const handleExportReportStats = useCallback(() => {
    if (!reportStats) return;
    downloadCSV(reportStats.map((r: { month: string; total: number; approved: number; pending: number }) => ({
      ay: r.month,
      toplam: r.total,
      onaylanan: r.approved,
      bekleyen: r.pending,
    })), 'rapor_istatistikleri', {
      ay: 'Ay',
      toplam: 'Toplam',
      onaylanan: 'Onaylanan',
      bekleyen: 'Bekleyen',
    });
  }, [reportStats]);

  const handleExportUserActivity = useCallback(() => {
    if (!userActivity) return;
    downloadCSV([{
      toplam: userActivity.total,
      bugun_aktif: userActivity.activeToday,
      hafta_aktif: userActivity.activeWeek,
      ay_aktif: userActivity.activeMonth,
      ogrenci: userActivity.byRole.student,
      mentor: userActivity.byRole.mentor,
      admin: userActivity.byRole.admin,
      okul_yoneticisi: userActivity.byRole.school_admin,
      aktif_durum: userActivity.byStatus.active,
      beklemede_durum: userActivity.byStatus.pending,
      inaktif_durum: userActivity.byStatus.inactive,
      ucretsiz_paket: userActivity.byPackage.free,
      temel_paket: userActivity.byPackage.basic,
      premium_paket: userActivity.byPackage.premium,
      okul_paketi: userActivity.byPackage.school,
    }], 'kullanici_aktivite', {
      toplam: 'Toplam',
      bugun_aktif: 'Bugün Aktif',
      hafta_aktif: 'Bu Hafta Aktif',
      ay_aktif: 'Bu Ay Aktif',
      ogrenci: 'Öğrenci',
      mentor: 'Mentor',
      admin: 'Admin',
      okul_yoneticisi: 'Okul Yöneticisi',
      aktif_durum: 'Aktif',
      beklemede_durum: 'Beklemede',
      inaktif_durum: 'İnaktif',
      ucretsiz_paket: 'Ücretsiz Paket',
      temel_paket: 'Temel Paket',
      premium_paket: 'Premium Paket',
      okul_paketi: 'Okul Paketi',
    });
  }, [userActivity]);

  const handleExportPackageDistribution = useCallback(() => {
    if (!packageDist) return;
    downloadCSV(packageDist.map((r: { productId: string; count: number; totalRevenue: number }) => ({
      urun_id: r.productId,
      satis_sayisi: r.count,
      toplam_gelir_tl: (Number(r.totalRevenue) / 100).toFixed(2),
    })), 'paket_dagilimi', {
      urun_id: 'Ürün ID',
      satis_sayisi: 'Satış Sayısı',
      toplam_gelir_tl: 'Toplam Gelir (₺)',
    });
  }, [packageDist]);

  const handleExportAll = useCallback(() => {
    handleExportKPIs();
    handleExportDailyRegistrations();
    handleExportMonthlyRevenue();
    handleExportDailyRevenue();
    handleExportReportStats();
    handleExportUserActivity();
    handleExportPackageDistribution();
  }, [handleExportKPIs, handleExportDailyRegistrations, handleExportMonthlyRevenue, handleExportDailyRevenue, handleExportReportStats, handleExportUserActivity, handleExportPackageDistribution]);

  // Process daily registrations for chart
  const registrationChartData = useMemo(() => {
    if (!dailyRegs) return null;
    
    // Group by date
    const dateMap = new Map<string, { student: number; mentor: number; other: number }>();
    dailyRegs.forEach((r: { date: string; count: number; role: string }) => {
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
      labels: monthlyRevenue.map((r: { month: string }) => formatMonth(r.month)),
      datasets: [
        {
          label: 'Gelir (₺)',
          data: monthlyRevenue.map((r: { totalRevenue: number }) => Number(r.totalRevenue) / 100),
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
      labels: dailyRevenue.map((r: { date: string }) => formatDate(r.date)),
      datasets: [
        {
          label: 'Günlük Gelir (₺)',
          data: dailyRevenue.map((r: { totalRevenue: number }) => Number(r.totalRevenue) / 100),
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
      labels: reportStats.map((r: { month: string }) => formatMonth(r.month)),
      datasets: [
        {
          label: 'Onaylanan',
          data: reportStats.map((r: { approved: number }) => Number(r.approved)),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
        },
        {
          label: 'Bekleyen',
          data: reportStats.map((r: { pending: number }) => Number(r.pending)),
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
      {/* Date Filter & Export Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <DateRangeFilter
              preset={datePreset}
              onPresetChange={setDatePreset}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleExportAll}
                className="h-9 gap-2"
              >
                <Download className="h-4 w-4" />
                Tümünü Dışa Aktar (CSV)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Temel Göstergeler (KPI)</h3>
          <ExportButton onClick={handleExportKPIs} label="KPI CSV" disabled={!kpis} />
        </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Aylık Gelir Trendi
                </CardTitle>
                <CardDescription>Son 12 aylık gelir grafiği</CardDescription>
              </div>
              <ExportButton onClick={handleExportMonthlyRevenue} label="CSV" disabled={!monthlyRevenue} />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Günlük Gelir
                </CardTitle>
                <CardDescription>Son 30 günlük gelir dağılımı</CardDescription>
              </div>
              <ExportButton onClick={handleExportDailyRevenue} label="CSV" disabled={!dailyRevenue} />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Günlük Kayıtlar
                </CardTitle>
                <CardDescription>Son 30 günlük yeni kullanıcı kayıtları</CardDescription>
              </div>
              <ExportButton onClick={handleExportDailyRegistrations} label="CSV" disabled={!dailyRegs} />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Paket Dağılımı
                </CardTitle>
                <CardDescription>Kullanıcıların paket tercihleri</CardDescription>
              </div>
              <ExportButton onClick={handleExportPackageDistribution} label="CSV" disabled={!packageDist} />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Rapor Üretimi
                </CardTitle>
                <CardDescription>Aylık rapor oluşturma istatistikleri</CardDescription>
              </div>
              <ExportButton onClick={handleExportReportStats} label="CSV" disabled={!reportStats} />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Kullanıcı Aktivite Özeti
                </CardTitle>
                <CardDescription>Platform kullanım metrikleri</CardDescription>
              </div>
              <ExportButton onClick={handleExportUserActivity} label="CSV" disabled={!userActivity} />
            </div>
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
