import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, TrendingUp, DollarSign, BarChart3, Activity, Target, ArrowUpRight, ArrowDownRight, FileText, Award, UserCheck, Download, CalendarIcon, Filter, FileDown } from 'lucide-react';
import { toast } from 'sonner';
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

// CSV Export utility - returns record count and filename for logging
function downloadCSV(data: Record<string, unknown>[], filename: string, headers?: Record<string, string>): { recordCount: number; fileName: string } | null {
  if (!data || data.length === 0) return null;
  
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
  const fullFileName = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.href = url;
  link.download = fullFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { recordCount: data.length, fileName: fullFileName };
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

function PdfExportButton({ datePreset, customRange }: { datePreset: DatePreset; customRange: DateRange | undefined }) {
  const generatePdf = trpc.admin.generateAnalyticsPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.url, '_blank');
      toast.success('PDF raporu oluşturuldu ve yeni sekmede açıldı.');
    },
    onError: (err) => {
      toast.error(`PDF oluşturulamadı: ${err.message}`);
    },
  });

  const handleClick = () => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    if (datePreset === 'custom' && customRange?.from) {
      startDate = customRange.from.toISOString();
      endDate = customRange.to ? customRange.to.toISOString() : new Date().toISOString();
    } else if (datePreset !== 'all') {
      const now = new Date();
      const presetDays: Record<string, number> = { today: 0, '7d': 7, '30d': 30, '90d': 90 };
      const days = presetDays[datePreset] ?? 0;
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      startDate = start.toISOString();
      endDate = now.toISOString();
    }
    generatePdf.mutate({ startDate, endDate });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={generatePdf.isPending}
      className="h-9 gap-2"
    >
      {generatePdf.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      PDF Rapor
    </Button>
  );
}

/**
 * Retention heatmap hücre bileşeni.
 * Yüzdeye göre arka plan rengi değişir (kırmızı → sarı → yeşil).
 */
function RetentionCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-block px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
        —
      </span>
    );
  }

  // Renk hesaplama: 0% = kırmızı, 50% = sarı, 100% = yeşil
  let bgClass: string;
  let textClass: string;
  if (value >= 60) {
    bgClass = 'bg-green-100 dark:bg-green-900/40';
    textClass = 'text-green-800 dark:text-green-300';
  } else if (value >= 40) {
    bgClass = 'bg-emerald-100 dark:bg-emerald-900/40';
    textClass = 'text-emerald-800 dark:text-emerald-300';
  } else if (value >= 25) {
    bgClass = 'bg-yellow-100 dark:bg-yellow-900/40';
    textClass = 'text-yellow-800 dark:text-yellow-300';
  } else if (value >= 10) {
    bgClass = 'bg-orange-100 dark:bg-orange-900/40';
    textClass = 'text-orange-800 dark:text-orange-300';
  } else {
    bgClass = 'bg-red-100 dark:bg-red-900/40';
    textClass = 'text-red-800 dark:text-red-300';
  }

  return (
    <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold ${bgClass} ${textClass}`}>
      %{value}
    </span>
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
  const { data: weeklyRegTrend } = trpc.admin.getWeeklyRegistrationTrend.useQuery({
    weeks: 12,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: ageGroupDist } = trpc.admin.getAgeGroupDistribution.useQuery();
  const { data: questionCatDist } = trpc.admin.getQuestionCategoryDistribution.useQuery();
  const { data: stageCompTrend } = trpc.admin.getStageCompletionTrend.useQuery({
    weeks: 12,
    ...(dateParams.startDate ? { startDate: dateParams.startDate } : {}),
    ...(dateParams.endDate ? { endDate: dateParams.endDate } : {}),
  });
  const { data: cohortData } = trpc.admin.getCohortAnalysis.useQuery({ weeksBack: 12 });
  const { data: funnelData } = trpc.admin.getConversionFunnel.useQuery(
    dateParams.startDate || dateParams.endDate
      ? { startDate: dateParams.startDate, endDate: dateParams.endDate }
      : undefined
  );

  // Segmentasyon analizi
  const [segmentBy, setSegmentBy] = useState<'ageGroup' | 'purchasedPackage' | 'stageName' | 'role'>('ageGroup');
  const { data: segmentData } = trpc.admin.getUserSegmentation.useQuery({
    segmentBy,
    startDate: dateParams.startDate,
    endDate: dateParams.endDate,
  });

  // CSV Export log mutation
  const logExportMutation = trpc.admin.logCsvExport.useMutation();

  // Helper to log export to backend
  const logExport = useCallback((exportType: string, result: { recordCount: number; fileName: string } | null) => {
    if (!result) return;
    logExportMutation.mutate({
      exportType,
      fileName: result.fileName,
      recordCount: result.recordCount,
      dateFilterPreset: datePreset,
      dateFilterStart: dateParams.startDate,
      dateFilterEnd: dateParams.endDate,
    });
  }, [logExportMutation, datePreset, dateParams]);

  // CSV Export handlers
  const handleExportKPIs = useCallback(() => {
    if (!kpis) return;
    const result = downloadCSV([{
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
    logExport('kpi', result);
  }, [kpis, logExport]);

  const handleExportDailyRegistrations = useCallback(() => {
    if (!dailyRegs) return;
    const result = downloadCSV(dailyRegs.map((r: { date: string; count: number; role: string }) => ({
      tarih: r.date,
      rol: r.role,
      kayit_sayisi: r.count,
    })), 'gunluk_kayitlar', {
      tarih: 'Tarih',
      rol: 'Rol',
      kayit_sayisi: 'Kayıt Sayısı',
    });
    logExport('daily_registrations', result);
  }, [dailyRegs, logExport]);

  const handleExportMonthlyRevenue = useCallback(() => {
    if (!monthlyRevenue) return;
    const result = downloadCSV(monthlyRevenue.map((r: { month: string; totalRevenue: number; count: number; completedCount: number }) => ({
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
    logExport('monthly_revenue', result);
  }, [monthlyRevenue, logExport]);

  const handleExportDailyRevenue = useCallback(() => {
    if (!dailyRevenue) return;
    const result = downloadCSV(dailyRevenue.map((r: { date: string; totalRevenue: number; count: number }) => ({
      tarih: r.date,
      gelir_tl: (Number(r.totalRevenue) / 100).toFixed(2),
      satis_sayisi: r.count,
    })), 'gunluk_gelir', {
      tarih: 'Tarih',
      gelir_tl: 'Gelir (₺)',
      satis_sayisi: 'Satış Sayısı',
    });
    logExport('daily_revenue', result);
  }, [dailyRevenue, logExport]);

  const handleExportReportStats = useCallback(() => {
    if (!reportStats) return;
    const result = downloadCSV(reportStats.map((r: { month: string; total: number; approved: number; pending: number }) => ({
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
    logExport('report_stats', result);
  }, [reportStats, logExport]);

  const handleExportUserActivity = useCallback(() => {
    if (!userActivity) return;
    const result = downloadCSV([{
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
    logExport('user_activity', result);
  }, [userActivity, logExport]);

  const handleExportPackageDistribution = useCallback(() => {
    if (!packageDist) return;
    const result = downloadCSV(packageDist.map((r: { productId: string; count: number; totalRevenue: number }) => ({
      urun_id: r.productId,
      satis_sayisi: r.count,
      toplam_gelir_tl: (Number(r.totalRevenue) / 100).toFixed(2),
    })), 'paket_dagilimi', {
      urun_id: 'Ürün ID',
      satis_sayisi: 'Satış Sayısı',
      toplam_gelir_tl: 'Toplam Gelir (₺)',
    });
    logExport('package_distribution', result);
  }, [packageDist, logExport]);

  const handleExportAll = useCallback(() => {
    handleExportKPIs();
    handleExportDailyRegistrations();
    handleExportMonthlyRevenue();
    handleExportDailyRevenue();
    handleExportReportStats();
    handleExportUserActivity();
    handleExportPackageDistribution();
    // Log the bulk export separately
    logExportMutation.mutate({
      exportType: 'all',
      fileName: `toplu_export_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      recordCount: 7,
      dateFilterPreset: datePreset,
      dateFilterStart: dateParams.startDate,
      dateFilterEnd: dateParams.endDate,
    });
  }, [handleExportKPIs, handleExportDailyRegistrations, handleExportMonthlyRevenue, handleExportDailyRevenue, handleExportReportStats, handleExportUserActivity, handleExportPackageDistribution, logExportMutation, datePreset, dateParams]);

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

  // Weekly registration trend chart
  const weeklyRegChartData = useMemo(() => {
    if (!weeklyRegTrend || !Array.isArray(weeklyRegTrend) || weeklyRegTrend.length === 0) return null;
    
    const weekMap = new Map<string, { student: number; mentor: number; other: number }>();
    (weeklyRegTrend as any[]).forEach((r: any) => {
      const existing = weekMap.get(r.weekStart) || { student: 0, mentor: 0, other: 0 };
      if (r.role === 'student') existing.student += Number(r.count);
      else if (r.role === 'mentor') existing.mentor += Number(r.count);
      else existing.other += Number(r.count);
      weekMap.set(r.weekStart, existing);
    });
    
    const weeks = Array.from(weekMap.keys()).sort();
    return {
      labels: weeks.map(w => formatDate(w)),
      datasets: [
        {
          label: 'Öğrenci',
          data: weeks.map(w => weekMap.get(w)?.student || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Mentor',
          data: weeks.map(w => weekMap.get(w)?.mentor || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [weeklyRegTrend]);

  // Age group distribution chart
  const ageGroupChartData = useMemo(() => {
    if (!ageGroupDist || !Array.isArray(ageGroupDist) || ageGroupDist.length === 0) return null;
    
    const AGE_LABELS: Record<string, string> = {
      '14-17': '14-17 Yaş',
      '18-21': '18-21 Yaş',
      '22-24': '22-24 Yaş',
    };
    
    return {
      labels: (ageGroupDist as any[]).map((r: any) => AGE_LABELS[r.ageGroup] || r.ageGroup || 'Belirtilmemiş'),
      datasets: [{
        data: (ageGroupDist as any[]).map((r: any) => Number(r.count)),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      }],
    };
  }, [ageGroupDist]);

  // Question category distribution chart
  const questionCatChartData = useMemo(() => {
    if (!questionCatDist || !Array.isArray(questionCatDist) || questionCatDist.length === 0) return null;
    
    const CATEGORY_COLORS = [
      'rgba(59, 130, 246, 0.7)',
      'rgba(168, 85, 247, 0.7)',
      'rgba(34, 197, 94, 0.7)',
      'rgba(245, 158, 11, 0.7)',
      'rgba(239, 68, 68, 0.7)',
      'rgba(14, 165, 233, 0.7)',
      'rgba(236, 72, 153, 0.7)',
      'rgba(132, 204, 22, 0.7)',
    ];
    
    return {
      labels: (questionCatDist as any[]).map((r: any) => r.category),
      datasets: [{
        label: 'Cevap Sayısı',
        data: (questionCatDist as any[]).map((r: any) => Number(r.answerCount)),
        backgroundColor: (questionCatDist as any[]).map((_: any, i: number) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
        borderWidth: 1,
      }],
    };
  }, [questionCatDist]);

  // Stage completion trend chart
  const stageCompChartData = useMemo(() => {
    if (!stageCompTrend || !Array.isArray(stageCompTrend) || stageCompTrend.length === 0) return null;
    
    const weeks = (stageCompTrend as any[]).sort((a: any, b: any) => a.weekStart.localeCompare(b.weekStart));
    return {
      labels: weeks.map((w: any) => formatDate(w.weekStart)),
      datasets: [{
        label: 'Tamamlanan Etap',
        data: weeks.map((w: any) => Number(w.completedCount)),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    };
  }, [stageCompTrend]);

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
              <PdfExportButton datePreset={datePreset} customRange={customRange} />
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

      {/* Section: Interaction Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Haftalık Kayıt Trendi
            </CardTitle>
            <CardDescription>Son 12 haftalık yeni kullanıcı kayıt trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {weeklyRegChartData ? (
                <Line data={weeklyRegChartData} options={lineOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz yeterli veri yok</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Etap Tamamlama Trendi
            </CardTitle>
            <CardDescription>Son 12 haftalık etap tamamlama sayıları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {stageCompChartData ? (
                <Line data={stageCompChartData} options={lineOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz yeterli veri yok</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Demographics & Categories */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Yaş Grubu Dağılımı
            </CardTitle>
            <CardDescription>Kullanıcıların yaş gruplarına göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {ageGroupChartData ? (
                <Doughnut data={ageGroupChartData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz yeterli veri yok</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Category Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Değerlendirme Kategorisi Dağılımı
            </CardTitle>
            <CardDescription>Soru kategorilerine göre cevap dağılımı (RIASEC, Big Five vb.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {questionCatChartData ? (
                <Bar data={questionCatChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz yeterli veri yok</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kohort Analizi - Retention Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kohort Analizi - Elde Tutma Oranları
          </CardTitle>
          <CardDescription>
            Haftalık kayıt kohortlarına göre kullanıcı elde tutma (retention) oranları. Renkler yüzdeye göre değişir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cohortData && cohortData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Kohort Haftası</th>
                    <th className="text-center py-3 px-3 font-semibold text-muted-foreground">Kullanıcı</th>
                    <th className="text-center py-3 px-3 font-semibold text-muted-foreground">1. Hafta</th>
                    <th className="text-center py-3 px-3 font-semibold text-muted-foreground">2. Hafta</th>
                    <th className="text-center py-3 px-3 font-semibold text-muted-foreground">4. Hafta</th>
                    <th className="text-center py-3 px-3 font-semibold text-muted-foreground">8. Hafta</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2.5 px-3 font-medium">
                        {row.cohortWeek ? format(new Date(row.cohortWeek + 'T00:00:00'), 'd MMM yyyy', { locale: tr }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{row.cohortSize}</td>
                      <td className="py-2.5 px-3 text-center">
                        <RetentionCell value={row.week1} />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RetentionCell value={row.week2} />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RetentionCell value={row.week4} />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RetentionCell value={row.week8} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Henüz yeterli kohort verisi yok</p>
                <p className="text-xs mt-1">Kullanıcılar kaydoldukça kohort verileri oluşacaktır</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dönüşüm Hunisi (Conversion Funnel) */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Dönüşüm Hunisi</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Kayıt &rarr; Test Başlatma &rarr; Test Tamamlama &rarr; Rapor Görüntüleme &rarr; Premium Yükseltme
            </p>
          </div>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {funnelData && funnelData.length > 0 ? (
            <div className="space-y-3">
              {funnelData.map((step, idx) => {
                const maxCount = funnelData[0]?.count || 1;
                const barWidth = Math.max((step.count / maxCount) * 100, 4);
                const colors = [
                  'bg-blue-500',
                  'bg-indigo-500',
                  'bg-violet-500',
                  'bg-purple-500',
                  'bg-fuchsia-500',
                ];
                const bgColors = [
                  'bg-blue-50 dark:bg-blue-950/30',
                  'bg-indigo-50 dark:bg-indigo-950/30',
                  'bg-violet-50 dark:bg-violet-950/30',
                  'bg-purple-50 dark:bg-purple-950/30',
                  'bg-fuchsia-50 dark:bg-fuchsia-950/30',
                ];

                return (
                  <div key={step.step} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${colors[idx]}`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{step.count.toLocaleString('tr-TR')}</span>
                        <span className="text-xs text-muted-foreground">(%{step.percentage})</span>
                        {idx > 0 && step.dropoff > 0 && (
                          <span className="text-xs font-medium text-red-500 flex items-center gap-0.5">
                            <ArrowDownRight className="h-3 w-3" />
                            %{step.dropoff} düşüş
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`relative h-8 rounded-lg overflow-hidden ${bgColors[idx]}`}>
                      <div
                        className={`absolute inset-y-0 left-0 rounded-lg ${colors[idx]} transition-all duration-700 ease-out`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className={`text-xs font-semibold ${barWidth > 20 ? 'text-white' : 'text-foreground ml-[calc(var(--bar-w)+8px)]'}`}>
                          {step.count > 0 ? `${step.count.toLocaleString('tr-TR')} kullanıcı` : 'Henüz veri yok'}
                        </span>
                      </div>
                    </div>
                    {idx < funnelData.length - 1 && (
                      <div className="flex justify-center my-1">
                        <div className="w-px h-3 bg-border" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Özet Kartları */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Toplam Kayıt</p>
                  <p className="text-lg font-bold">{funnelData[0]?.count.toLocaleString('tr-TR') || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Test Başlatma Oranı</p>
                  <p className="text-lg font-bold">%{funnelData[1]?.percentage || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Tamamlama Oranı</p>
                  <p className="text-lg font-bold">%{funnelData[2]?.percentage || 0}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Premium Dönüşüm</p>
                  <p className="text-lg font-bold">%{funnelData[4]?.percentage || 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Henüz dönüşüm verisi yok</p>
                <p className="text-xs mt-1">Kullanıcılar kaydoldukça huni verileri oluşacaktır</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== Kullanıcı Segmentasyon Analizi ==================== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-500" />
                Kullanıcı Segmentasyon Analizi
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kullanıcıları farklı kriterlere göre segmentlere ayırarak karşılaştırmalı analiz
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={segmentBy} onValueChange={(v) => setSegmentBy(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ageGroup">Yaş Grubu</SelectItem>
                  <SelectItem value="purchasedPackage">Paket Türü</SelectItem>
                  <SelectItem value="stageName">Etap İlerlemesi</SelectItem>
                  <SelectItem value="role">Kullanıcı Rolü</SelectItem>
                </SelectContent>
              </Select>
              <ExportButton
                onClick={() => {
                  if (!segmentData || segmentData.length === 0) return;
                  const csvData = segmentData.map(s => ({
                    segment: s.segment,
                    userCount: s.userCount,
                    avgCompletionRate: s.avgCompletionRate,
                    avgStagesCompleted: s.avgStagesCompleted,
                    premiumRate: s.premiumRate,
                    avgDaysOnPlatform: s.avgDaysOnPlatform,
                  }));
                  const result = downloadCSV(
                    csvData,
                    `segmentasyon_${segmentBy}`,
                    {
                      segment: 'Segment',
                      userCount: 'Kullanıcı Sayısı',
                      avgCompletionRate: 'Ort. Tamamlama Oranı (%)',
                      avgStagesCompleted: 'Ort. Tamamlanan Etap',
                      premiumRate: 'Premium Oranı (%)',
                      avgDaysOnPlatform: 'Ort. Platform Süresi (Gün)',
                    }
                  );
                  logExport('segmentasyon', result);
                }}
                label="CSV"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {segmentData && segmentData.length > 0 ? (
            <div className="space-y-6">
              {/* Segmentasyon Tablosu */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Segment</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Kullanıcı</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Tamamlama %</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Ort. Etap</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Premium %</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Ort. Süre (Gün)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentData.map((seg, idx) => {
                      const maxUsers = Math.max(...segmentData.map(s => s.userCount));
                      const barWidth = maxUsers > 0 ? (seg.userCount / maxUsers) * 100 : 0;
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)` }} />
                              <span className="font-medium">{seg.segment}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${barWidth}%` }} />
                              </div>
                              <span className="font-mono text-xs w-8 text-right">{seg.userCount}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                              seg.avgCompletionRate >= 70 ? 'bg-emerald-500/10 text-emerald-600' :
                              seg.avgCompletionRate >= 40 ? 'bg-amber-500/10 text-amber-600' :
                              'bg-red-500/10 text-red-600'
                            }`}>
                              %{seg.avgCompletionRate}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-mono text-xs">{seg.avgStagesCompleted}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                              seg.premiumRate >= 50 ? 'bg-violet-500/10 text-violet-600' :
                              seg.premiumRate >= 20 ? 'bg-blue-500/10 text-blue-600' :
                              'bg-gray-500/10 text-gray-600'
                            }`}>
                              %{seg.premiumRate}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-mono text-xs">{seg.avgDaysOnPlatform}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Segment Karşılaştırma Grafikleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tamamlama Oranı Karşılaştırması */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Tamamlama Oranı Karşılaştırması</h4>
                  <div className="space-y-2">
                    {segmentData.map((seg, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs w-28 truncate" title={seg.segment}>{seg.segment}</span>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${seg.avgCompletionRate}%`,
                              backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right">%{seg.avgCompletionRate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Oranı Karşılaştırması */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Premium Dönüşüm Oranı</h4>
                  <div className="space-y-2">
                    {segmentData.map((seg, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs w-28 truncate" title={seg.segment}>{seg.segment}</span>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${seg.premiumRate}%`,
                              backgroundColor: `hsl(${(idx * 60 + 180) % 360}, 70%, 50%)`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right">%{seg.premiumRate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Özet Kartları */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-violet-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Toplam Segment</p>
                  <p className="text-lg font-bold">{segmentData.length}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">En Yüksek Tamamlama</p>
                  <p className="text-lg font-bold">%{Math.max(...segmentData.map(s => s.avgCompletionRate))}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">En Yüksek Premium</p>
                  <p className="text-lg font-bold">%{Math.max(...segmentData.map(s => s.premiumRate))}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Ort. Platform Süresi</p>
                  <p className="text-lg font-bold">{Math.round(segmentData.reduce((sum, s) => sum + s.avgDaysOnPlatform * s.userCount, 0) / Math.max(segmentData.reduce((sum, s) => sum + s.userCount, 0), 1))} gün</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Henüz segmentasyon verisi yok</p>
                <p className="text-xs mt-1">Kullanıcılar kaydoldukça segmentasyon verileri oluşacaktır</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
