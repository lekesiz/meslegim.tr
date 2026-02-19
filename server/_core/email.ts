import nodemailer from 'nodemailer';

// Email configuration
// For production, use environment variables for SMTP credentials
// These should be set via webdev_request_secrets
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"Meslegim.tr" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export function getRegistrationEmailTemplate(name: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Meslegim.tr'ye Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Meslegim.tr kariyer değerlendirme platformuna başvurunuz alındı.</p>
          <p>Mentor onayından sonra e-posta ile bilgilendirileceksiniz ve kariyer değerlendirme süreciniz başlayacak.</p>
          <p><strong>Süreç nasıl işliyor?</strong></p>
          <ul>
            <li>✅ Başvurunuz mentorlarımız tarafından incelenecek</li>
            <li>📧 Onay sonrası e-posta ile bilgilendirileceksiniz</li>
            <li>📝 3 aşamalı değerlendirme sürecine başlayacaksınız</li>
            <li>📊 Her aşama sonunda ara değerlendirme raporu alacaksınız</li>
            <li>🎯 Süreç sonunda kapsamlı kariyer rehberliği raporu hazırlanacak</li>
          </ul>
          <p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
          <h1>🎉 Başvurunuz Onaylandı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Harika haber! Meslegim.tr kariyer değerlendirme programına kabul edildiniz.</p>
          <p>Artık platformumuza giriş yaparak kariyer değerlendirme sürecinize başlayabilirsiniz.</p>
          <p><strong>İlk adım:</strong> 1. Etap - Meslek Seçimi Yetkinlik Değerlendirmesi</p>
          <p>Bu etapta temel yetkinlikleriniz, ilgi alanlarınız ve kariyer hedefleriniz değerlendirilecek.</p>
          <a href="${process.env.VITE_OAUTH_PORTAL_URL}" class="button">Platforma Giriş Yap</a>
          <p><strong>Önemli:</strong> Her etap tamamlandıktan sonra 7 gün içinde bir sonraki etap otomatik olarak aktif hale gelecektir.</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
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
          <h1>📝 Yeni Etap Aktif!</h1>
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
          <p>© 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
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
          <h1>📊 Raporunuz Hazır!</h1>
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
          <p>© 2026 Meslegim.tr - Kariyer Değerlendirme Platformu</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
