import { getDashboardKPIs, getDailyRegistrations, getMonthlyRevenue, getStageCompletionStats, getReportGenerationStats, getPackageDistribution } from '../db';
import { storagePut } from '../storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

interface AnalyticsPdfOptions {
  startDate?: Date;
  endDate?: Date;
  generatedBy: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cents / 100);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function growthIndicator(percent: number): string {
  if (percent > 0) return `<span style="color:#16a34a;">↑ %${percent}</span>`;
  if (percent < 0) return `<span style="color:#dc2626;">↓ %${Math.abs(percent)}</span>`;
  return `<span style="color:#6b7280;">→ %0</span>`;
}

/**
 * Dashboard analitik verilerinden PDF rapor oluştur
 */
export async function generateAnalyticsPDF(options: AnalyticsPdfOptions): Promise<string> {
  const tempId = randomBytes(8).toString('hex');
  const htmlPath = path.join('/tmp', `analytics-${tempId}.html`);
  const pdfPath = path.join('/tmp', `analytics-${tempId}.pdf`);

  try {
    // Verileri çek
    const kpis = await getDashboardKPIs(options.startDate, options.endDate);
    if (!kpis) throw new Error('KPI verileri alınamadı');

    const dailyRegs = await getDailyRegistrations(30, options.startDate, options.endDate);
    const monthlyRev = await getMonthlyRevenue(12, options.startDate, options.endDate);
    const stageStats = await getStageCompletionStats();
    const reportDist = await getReportGenerationStats(6, options.startDate, options.endDate);
    const packageDist = await getPackageDistribution();

    const now = new Date();
    const dateRange = options.startDate && options.endDate
      ? `${formatDate(options.startDate)} - ${formatDate(options.endDate)}`
      : 'Tüm Zamanlar';

    // Kayıt trendi tablosu
    const recentRegs = (dailyRegs || []).slice(-14);
    const regTableRows = recentRegs.map((r: any) => 
      `<tr><td>${r.date}</td><td style="text-align:right;font-weight:600;">${r.count}</td></tr>`
    ).join('');

    // Aylık gelir tablosu
    const recentRevenue = (monthlyRev || []).slice(-6);
    const revTableRows = recentRevenue.map((r: any) =>
      `<tr><td>${r.month}</td><td style="text-align:right;font-weight:600;">${formatCurrency(r.revenue || 0)}</td></tr>`
    ).join('');

    // Etap istatistikleri tablosu
    const stageRows = (stageStats || []).map((s: any) =>
      `<tr><td>${s.name || s.stageName || '-'}</td><td style="text-align:right;">${s.completed || 0}</td><td style="text-align:right;">${s.active || 0}</td><td style="text-align:right;">${s.locked || 0}</td></tr>`
    ).join('');

    // Rapor dağılımı tablosu
    const reportRows = (reportDist || []).map((r: any) =>
      `<tr><td>${r.status === 'approved' ? 'Onaylandı' : r.status === 'pending' ? 'Bekliyor' : r.status === 'rejected' ? 'Reddedildi' : r.status}</td><td style="text-align:right;font-weight:600;">${r.count}</td></tr>`
    ).join('');

    // Paket dağılımı tablosu
    const packageNames: Record<string, string> = {
      free: 'Ücretsiz', basic_package: 'Temel', professional_package: 'Profesyonel', enterprise_package: 'Kurumsal'
    };
    const packageRows = (packageDist || []).map((p: any) =>
      `<tr><td>${packageNames[p.package || p.purchasedPackage] || p.package || p.purchasedPackage || '-'}</td><td style="text-align:right;font-weight:600;">${p.count}</td></tr>`
    ).join('');

    const fullHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Analitik Raporu - Meslegim.tr</title>
  <style>
    @page { size: A4; margin: 1.5cm 2cm; }
    body { font-family: 'Arial', 'Helvetica', sans-serif; line-height: 1.5; color: #1e293b; font-size: 10pt; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #4f46e5; }
    .header h1 { color: #4f46e5; font-size: 22pt; margin: 0 0 4px; }
    .header .subtitle { color: #64748b; font-size: 11pt; margin: 4px 0; }
    .header .meta { color: #94a3b8; font-size: 9pt; margin-top: 8px; }
    
    .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-card .label { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card .value { font-size: 20pt; font-weight: 700; color: #1e293b; margin: 4px 0; }
    .kpi-card .change { font-size: 9pt; }
    
    h2 { color: #4f46e5; font-size: 14pt; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; }
    th { background: #f1f5f9; color: #475569; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    td { padding: 6px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #fafbfc; }
    
    .summary-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .summary-box p { margin: 4px 0; font-size: 10pt; }
    
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    
    .footer { margin-top: 32px; padding-top: 12px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 8pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Meslegim.tr Analitik Raporu</h1>
    <div class="subtitle">Kariyer Değerlendirme Platformu - KPI Özeti</div>
    <div class="meta">
      Dönem: ${dateRange} | Oluşturma: ${formatDate(now)} | Oluşturan: ${options.generatedBy}
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="label">Toplam Kullanıcı</div>
      <div class="value">${kpis.totalUsers}</div>
      <div class="change">Bu ay: +${kpis.thisMonthNewUsers} ${growthIndicator(kpis.userGrowthPercent)}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Toplam Gelir</div>
      <div class="value" style="color:#16a34a;">${formatCurrency(kpis.totalRevenue)}</div>
      <div class="change">Bu ay: ${formatCurrency(kpis.thisMonthRevenue)} ${growthIndicator(kpis.revenueGrowthPercent)}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Dönüşüm Oranı</div>
      <div class="value" style="color:#f59e0b;">%${kpis.conversionRate}</div>
      <div class="change">Aktif (7g): ${kpis.activeUsersWeek}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="label">Tamamlanan Etap</div>
      <div class="value" style="color:#8b5cf6;">${kpis.totalCompletedStages}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Toplam Rapor</div>
      <div class="value" style="color:#f97316;">${kpis.totalReports}</div>
      <div class="change">Bekleyen: ${kpis.pendingReports}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Toplam Satış</div>
      <div class="value" style="color:#10b981;">${kpis.totalPurchases}</div>
      <div class="change">Öğrenci: ${kpis.students} | Mentor: ${kpis.mentors}</div>
    </div>
  </div>

  <!-- Özet -->
  <div class="summary-box">
    <p><strong>Özet:</strong> Platformda toplam <strong>${kpis.totalUsers}</strong> kullanıcı bulunmaktadır. 
    Bu ay <strong>${kpis.thisMonthNewUsers}</strong> yeni kullanıcı kaydolmuş, 
    <strong>${formatCurrency(kpis.thisMonthRevenue)}</strong> gelir elde edilmiştir.
    <strong>${kpis.pendingReports}</strong> rapor onay beklemektedir.</p>
  </div>

  <!-- Detay Tabloları -->
  <div class="two-col">
    <div>
      <h2>📈 Günlük Kayıt Trendi (Son 14 Gün)</h2>
      <table>
        <thead><tr><th>Tarih</th><th style="text-align:right;">Kayıt</th></tr></thead>
        <tbody>${regTableRows || '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Veri yok</td></tr>'}</tbody>
      </table>
    </div>
    <div>
      <h2>💰 Aylık Gelir (Son 6 Ay)</h2>
      <table>
        <thead><tr><th>Ay</th><th style="text-align:right;">Gelir</th></tr></thead>
        <tbody>${revTableRows || '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Veri yok</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <h2>🎯 Etap İstatistikleri</h2>
  <table>
    <thead><tr><th>Etap</th><th style="text-align:right;">Tamamlanan</th><th style="text-align:right;">Aktif</th><th style="text-align:right;">Kilitli</th></tr></thead>
    <tbody>${stageRows || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Veri yok</td></tr>'}</tbody>
  </table>

  <div class="two-col">
    <div>
      <h2>📋 Rapor Durumu Dağılımı</h2>
      <table>
        <thead><tr><th>Durum</th><th style="text-align:right;">Sayı</th></tr></thead>
        <tbody>${reportRows || '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Veri yok</td></tr>'}</tbody>
      </table>
    </div>
    <div>
      <h2>📦 Paket Dağılımı</h2>
      <table>
        <thead><tr><th>Paket</th><th style="text-align:right;">Kullanıcı</th></tr></thead>
        <tbody>${packageRows || '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Veri yok</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <div class="footer">
    <p>© 2026 Meslegim.tr - Kariyer Değerlendirme Platformu | Bu rapor otomatik olarak oluşturulmuştur.</p>
    <p>Gizlilik: Bu rapor yalnızca yetkili personel tarafından görüntülenmelidir.</p>
  </div>
</body>
</html>`;

    await writeFile(htmlPath, fullHtml, 'utf-8');

    await execAsync(
      `chromium-browser --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
      { timeout: 30000 }
    );

    const pdfBuffer = await readFile(pdfPath);

    const fileKey = `analytics/analytics-report-${tempId}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');

    try {
      await unlink(htmlPath);
      await unlink(pdfPath);
    } catch {}

    return url;
  } catch (error) {
    try {
      await unlink(htmlPath);
      await unlink(pdfPath);
    } catch {}
    console.error('Analytics PDF generation error:', error);
    throw new Error('Analitik PDF raporu oluşturulamadı. Lütfen tekrar deneyin.');
  }
}
