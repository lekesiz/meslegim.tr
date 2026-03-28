import { Resend } from 'resend';

// Resend API configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'Meslegim.tr <bilgi@meslegim.tr>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return false;
    }

    console.log(`[Email] Sent to ${options.to}: ${options.subject} (id: ${data?.id})`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export function getApprovalEmailTemplate(name: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Başvurunuz Onaylandı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Harika haber! Meslegim.tr kariyer değerlendirme programına kabul edildiniz.</p>
          <p>Artık platformumuza giriş yaparak kariyer değerlendirme sürecinize başlayabilirsiniz.</p>
          <p><strong>İlk adım:</strong> 1. Etap - Meslek Seçimi Yetkinlik Değerlendirmesi</p>
          <p>Bu etapta temel yetkinlikleriniz, ilgi alanlarınız ve kariyer hedefleriniz değerlendirilecek.</p>
          <a href="${process.env.VITE_OAUTH_PORTAL_URL}" class="button">Platforma Giriş Yap</a>
          <p><strong>Önemli:</strong> Her etap tamamlandıktan sonra belirlenen süre içinde bir sonraki etap otomatik olarak aktif hale gelecektir.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getStageActivationEmailTemplate(name: string, stageName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yeni Etap Aktif!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Kariyer değerlendirme sürecinizde yeni bir etap aktif hale geldi:</p>
          <h2 style="color: #8b5cf6;">${stageName}</h2>
          <p>Bu etabı tamamlamak için platformumuza giriş yapabilirsiniz.</p>
          <a href="${process.env.VITE_OAUTH_PORTAL_URL}" class="button">Etaba Başla</a>
          <p><strong>Hatırlatma:</strong> Her etap tamamlandıktan sonra ara değerlendirme raporu hazırlanacak ve mentor onayına sunulacaktır.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReportReadyEmailTemplate(name: string, stageName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Raporunuz Hazır!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${name}</strong>,</p>
          <p><strong>${stageName}</strong> için ara değerlendirme raporunuz hazırlandı ve mentor onayına sunuldu.</p>
          <p>Mentor onayından sonra raporunuzu platformumuzdan görüntüleyebilir ve indirebilirsiniz.</p>
          <a href="${process.env.VITE_OAUTH_PORTAL_URL}" class="button">Raporumu Görüntüle</a>
          <p><strong>Rapor içeriği:</strong></p>
          <ul>
            <li>Güçlü yönleriniz ve gelişim alanlarınız</li>
            <li>Kariyer uyumu analizi</li>
            <li>Öneriler ve eylem planı</li>
          </ul>
        </div>
        <div class="footer">
          <p>&copy; 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
