import { getDailyKPIValues, get7DayKPIAverage, createKpiAnomaly, getAdminEmails } from '../db';
import { sendEmail } from '../_core/resend-email';

interface KPICheck {
  name: string;
  label: string;
  currentValue: number;
  avgValue: number;
}

const DEVIATION_THRESHOLD = 30; // %30 sapma eşiği
const CRITICAL_THRESHOLD = 50; // %50+ kritik seviye

/**
 * Günlük KPI anomali tespiti
 * Her gün çalışır ve önceki günün KPI'larını 7 günlük ortalama ile karşılaştırır
 */
export async function runDailyAnomalyCheck(): Promise<{
  anomaliesFound: number;
  alertsSent: number;
}> {
  try {
    // Dünün tarihini al
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    console.log(`[AnomalyDetection] Running daily check for ${dateStr}`);
    
    // Günlük KPI değerlerini al
    const dailyKPIs = await getDailyKPIValues(dateStr);
    
    // 7 günlük ortalamayı al
    const avgKPIs = await get7DayKPIAverage(dateStr);
    
    // KPI'ları karşılaştır
    const kpiChecks: KPICheck[] = [
      {
        name: 'daily_registrations',
        label: 'Günlük Kayıt Sayısı',
        currentValue: dailyKPIs.dailyRegistrations,
        avgValue: avgKPIs.avgRegistrations,
      },
      {
        name: 'test_completion_rate',
        label: 'Test Tamamlama Oranı',
        currentValue: dailyKPIs.testCompletionRate,
        avgValue: avgKPIs.avgTestCompletionRate,
      },
      {
        name: 'premium_conversion',
        label: 'Premium Dönüşüm Oranı',
        currentValue: dailyKPIs.premiumConversion,
        avgValue: avgKPIs.avgPremiumConversion,
      },
    ];
    
    let anomaliesFound = 0;
    let alertsSent = 0;
    const anomalyDetails: Array<{
      kpiLabel: string;
      direction: string;
      deviationPercent: number;
      severity: string;
      currentValue: number;
      avgValue: number;
    }> = [];
    
    for (const kpi of kpiChecks) {
      // Ortalama 0 ise ve günlük değer de 0 ise anomali yok
      if (kpi.avgValue === 0 && kpi.currentValue === 0) continue;
      
      // Ortalama 0 ama günlük değer > 0 ise, ilk veri olabilir - atla
      if (kpi.avgValue === 0) continue;
      
      const deviation = Math.abs(((kpi.currentValue - kpi.avgValue) / kpi.avgValue) * 100);
      
      if (deviation >= DEVIATION_THRESHOLD) {
        const direction = kpi.currentValue > kpi.avgValue ? 'up' : 'down';
        const severity = deviation >= CRITICAL_THRESHOLD ? 'critical' : 'warning';
        const deviationPercent = Math.round(deviation * 100); // x100 hassasiyet
        
        // Anomaliyi kaydet
        await createKpiAnomaly({
          date: yesterday,
          kpiName: kpi.name,
          kpiLabel: kpi.label,
          currentValue: kpi.currentValue,
          avgValue: kpi.avgValue,
          deviationPercent,
          direction: direction as 'up' | 'down',
          severity: severity as 'warning' | 'critical',
          alertSent: false,
        });
        
        anomaliesFound++;
        anomalyDetails.push({
          kpiLabel: kpi.label,
          direction,
          deviationPercent: Math.round(deviation),
          severity,
          currentValue: kpi.currentValue,
          avgValue: kpi.avgValue,
        });
        
        console.log(`[AnomalyDetection] ${severity.toUpperCase()} anomaly: ${kpi.label} - ${direction === 'up' ? '↑' : '↓'} ${Math.round(deviation)}% deviation`);
      }
    }
    
    // Anomali varsa email gönder
    if (anomalyDetails.length > 0) {
      const sent = await sendAnomalyAlert(dateStr, anomalyDetails);
      if (sent) alertsSent = 1;
    }
    
    console.log(`[AnomalyDetection] Check complete: ${anomaliesFound} anomalies found, ${alertsSent} alerts sent`);
    
    return { anomaliesFound, alertsSent };
  } catch (error) {
    console.error('[AnomalyDetection] Error during daily check:', error);
    return { anomaliesFound: 0, alertsSent: 0 };
  }
}

/**
 * Anomali alert emaili gönder
 */
async function sendAnomalyAlert(
  dateStr: string,
  anomalies: Array<{
    kpiLabel: string;
    direction: string;
    deviationPercent: number;
    severity: string;
    currentValue: number;
    avgValue: number;
  }>
): Promise<boolean> {
  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) {
      console.warn('[AnomalyDetection] No admin emails found for alert');
      return false;
    }
    
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const warningCount = anomalies.filter(a => a.severity === 'warning').length;
    
    const subject = criticalCount > 0
      ? `🚨 KRİTİK KPI Anomalisi Tespit Edildi - ${dateStr}`
      : `⚠️ KPI Anomalisi Tespit Edildi - ${dateStr}`;
    
    const anomalyRows = anomalies.map(a => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; font-weight: 500;">${a.kpiLabel}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="display: inline-flex; align-items: center; gap: 4px; color: ${a.direction === 'up' ? '#16a34a' : '#dc2626'};">
            ${a.direction === 'up' ? '↑' : '↓'} ${a.deviationPercent}%
          </span>
        </td>
        <td style="padding: 12px; text-align: center;">${a.currentValue}</td>
        <td style="padding: 12px; text-align: center;">${a.avgValue}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; ${
            a.severity === 'critical' 
              ? 'background: #fef2f2; color: #dc2626;' 
              : 'background: #fffbeb; color: #d97706;'
          }">${a.severity === 'critical' ? 'Kritik' : 'Uyarı'}</span>
        </td>
      </tr>
    `).join('');
    
    const html = `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: ${criticalCount > 0 ? '#dc2626' : '#d97706'}; padding: 24px 32px; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">
            ${criticalCount > 0 ? '🚨 Kritik KPI Anomalisi' : '⚠️ KPI Anomalisi Tespit Edildi'}
          </h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">
            ${dateStr} tarihinde ${anomalies.length} anomali tespit edildi
            ${criticalCount > 0 ? ` (${criticalCount} kritik)` : ''}
          </p>
        </div>
        
        <div style="padding: 24px 32px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
            Aşağıdaki KPI'larda son 7 günlük ortalamadan %30'dan fazla sapma tespit edildi:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">KPI</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Sapma</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Günlük</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Ortalama</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Seviye</th>
              </tr>
            </thead>
            <tbody>
              ${anomalyRows}
            </tbody>
          </table>
          
          <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 13px; color: #1e40af;">
              <strong>Not:</strong> Bu anomaliler otomatik olarak tespit edilmiştir. 
              Admin panelindeki Anomali Geçmişi bölümünden detaylı inceleme yapabilir ve onaylayabilirsiniz.
            </p>
          </div>
        </div>
        
        <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
            Meslegim.tr Otomatik KPI İzleme Sistemi
          </p>
        </div>
      </div>
    `;
    
    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject,
        html,
      });
    }
    
    return true;
  } catch (error) {
    console.error('[AnomalyDetection] Failed to send alert email:', error);
    return false;
  }
}
