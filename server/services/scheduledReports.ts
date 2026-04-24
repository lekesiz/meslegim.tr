import { getDashboardKPIs, getAdminEmails, getPlatformSetting, setPlatformSetting } from '../db';
import { sendEmail } from '../_core/resend-email';
import logger from '../utils/logger';

/**
 * KPI Rapor Email Şablonu
 */
function getKPIReportEmailTemplate(
  period: 'weekly' | 'monthly',
  kpis: NonNullable<Awaited<ReturnType<typeof getDashboardKPIs>>>,
  generatedAt: Date
): string {
  const periodLabel = period === 'weekly' ? 'Haftalık' : 'Aylık';
  const dateStr = generatedAt.toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cents / 100);
  };

  const growthBadge = (percent: number) => {
    if (percent > 0) return `<span style="color:#16a34a;font-weight:600;">↑ %${percent}</span>`;
    if (percent < 0) return `<span style="color:#dc2626;font-weight:600;">↓ %${Math.abs(percent)}</span>`;
    return `<span style="color:#6b7280;">→ %0</span>`;
  };

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">📊 ${periodLabel} KPI Raporu</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${dateStr}</p>
    </div>
    
    <!-- KPI Cards -->
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:13px;color:#6b7280;">Toplam Kullanıcı</div>
            <div style="font-size:24px;font-weight:700;color:#1e293b;">${kpis.totalUsers}</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Bu Ay Yeni</div>
            <div style="font-size:24px;font-weight:700;color:#4f46e5;">${kpis.thisMonthNewUsers}</div>
            <div style="font-size:12px;">${growthBadge(kpis.userGrowthPercent)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:13px;color:#6b7280;">Toplam Gelir</div>
            <div style="font-size:24px;font-weight:700;color:#16a34a;">${formatCurrency(kpis.totalRevenue)}</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Bu Ay Gelir</div>
            <div style="font-size:24px;font-weight:700;color:#16a34a;">${formatCurrency(kpis.thisMonthRevenue)}</div>
            <div style="font-size:12px;">${growthBadge(kpis.revenueGrowthPercent)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:13px;color:#6b7280;">Aktif Kullanıcı (7 gün)</div>
            <div style="font-size:24px;font-weight:700;color:#0ea5e9;">${kpis.activeUsersWeek}</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Dönüşüm Oranı</div>
            <div style="font-size:24px;font-weight:700;color:#f59e0b;">%${kpis.conversionRate}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:13px;color:#6b7280;">Tamamlanan Etap</div>
            <div style="font-size:24px;font-weight:700;color:#8b5cf6;">${kpis.totalCompletedStages}</div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Toplam Rapor</div>
            <div style="font-size:24px;font-weight:700;color:#f97316;">${kpis.totalReports}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;">
            <div style="font-size:13px;color:#6b7280;">Bekleyen Rapor</div>
            <div style="font-size:24px;font-weight:700;color:#ef4444;">${kpis.pendingReports}</div>
          </td>
          <td style="padding:12px;text-align:right;">
            <div style="font-size:13px;color:#6b7280;">Toplam Satış</div>
            <div style="font-size:24px;font-weight:700;color:#10b981;">${kpis.totalPurchases}</div>
          </td>
        </tr>
      </table>
      
      <!-- Summary -->
      <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #4f46e5;">
        <p style="margin:0;font-size:14px;color:#475569;">
          <strong>Özet:</strong> Platformda toplam <strong>${kpis.students}</strong> öğrenci ve 
          <strong>${kpis.mentors}</strong> mentor bulunmaktadır. Bu ay <strong>${kpis.thisMonthReports}</strong> yeni rapor oluşturulmuştur.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding:16px 24px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        Bu rapor Meslegim.tr tarafından otomatik olarak oluşturulmuştur.
      </p>
      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">
        Raporlama ayarlarını Admin Paneli &gt; Platform Ayarları bölümünden değiştirebilirsiniz.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Zamanlanmış KPI raporu gönder
 */
export async function sendScheduledKPIReport(period: 'weekly' | 'monthly'): Promise<boolean> {
  try {
    // Raporlama aktif mi kontrol et
    const enabled = await getPlatformSetting(`scheduled_report_${period}`);
    if (enabled === 'false') {
      logger.info(`[ScheduledReport] ${period} report is disabled`);
      return false;
    }

    // KPI verilerini çek
    const kpis = await getDashboardKPIs();
    if (!kpis) {
      logger.error('[ScheduledReport] Failed to get KPI data');
      return false;
    }

    // Admin email listesini al
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) {
      logger.warn('[ScheduledReport] No admin emails found');
      return false;
    }

    const periodLabel = period === 'weekly' ? 'Haftalık' : 'Aylık';
    const now = new Date();
    const html = getKPIReportEmailTemplate(period, kpis, now);

    // Her admin'e email gönder
    let successCount = 0;
    for (const email of adminEmails) {
      try {
        const sent = await sendEmail({
          to: email,
          subject: `📊 ${periodLabel} KPI Raporu - Meslegim.tr (${now.toLocaleDateString('tr-TR')})`,
          html,
        });
        if (sent) successCount++;
      } catch (err) {
        logger.warn(`[ScheduledReport] Failed to send to ${email}:`, err);
      }
    }

    // Son gönderim tarihini kaydet
    await setPlatformSetting(
      `last_${period}_report_sent`,
      now.toISOString(),
      `Son ${periodLabel.toLowerCase()} rapor gönderim tarihi`
    );

    logger.info(`[ScheduledReport] ${periodLabel} report sent to ${successCount}/${adminEmails.length} admins`);
    return successCount > 0;
  } catch (error: any) {
    logger.error('[ScheduledReport] Error:', error?.message || error);
    return false;
  }
}

/**
 * Manuel rapor gönderimi (admin tarafından tetiklenen)
 */
export async function sendManualKPIReport(adminEmail: string): Promise<boolean> {
  try {
    const kpis = await getDashboardKPIs();
    if (!kpis) return false;

    const now = new Date();
    const html = getKPIReportEmailTemplate('weekly', kpis, now);

    return await sendEmail({
      to: adminEmail,
      subject: `📊 KPI Raporu (Manuel) - Meslegim.tr (${now.toLocaleDateString('tr-TR')})`,
      html,
    });
  } catch (error: any) {
    logger.error('[ScheduledReport] Manual report error:', error?.message || error);
    return false;
  }
}
