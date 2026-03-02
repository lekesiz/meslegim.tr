import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using configured SMTP
 */
export async function sendEmail(options: EmailTemplate): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Meslegim.tr" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

/**
 * Welcome email template (sent when student is activated by mentor)
 */
export function getWelcomeEmailTemplate(studentName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p>Meslegim.tr platformuna hoş geldiniz! Hesabınız mentorunuz tarafından onaylandı ve artık kariyer değerlendirme sürecinize başlayabilirsiniz.</p>
          
          <h3>📋 Süreç Nasıl İşler?</h3>
          <ul>
            <li><strong>3 Etap:</strong> Yaş grubunuza özel 3 aşamalı değerlendirme</li>
            <li><strong>Her Etap:</strong> Yaklaşık 15-20 dakika sürer</li>
            <li><strong>Raporlar:</strong> Her etap sonrası AI destekli rapor alırsınız</li>
            <li><strong>Mentor Desteği:</strong> Süreç boyunca mentorunuz size rehberlik edecek</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}/dashboard/student" class="button">
              Değerlendirmeye Başla
            </a>
          </p>
          
          <p><strong>İlk etabınız şu an aktif!</strong> Giriş yaparak hemen başlayabilirsiniz.</p>
          
          <p>Başarılar dileriz! 🚀</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
          <p><a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}">meslegim.tr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Stage completion email template (sent when student completes a stage)
 */
export function getStageCompletionEmailTemplate(studentName: string, stageTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Etap Tamamlandı!</h1>
        </div>
        <div class="content">
          <p>Tebrikler <strong>${studentName}</strong>,</p>
          
          <p><span class="badge">${stageTitle}</span> başarıyla tamamlandı!</p>
          
          <h3>📊 Raporunuz Hazırlanıyor</h3>
          <p>Yapay zeka destekli raporunuz şu anda oluşturuluyor. Mentorunuz raporu inceleyip onayladıktan sonra size e-posta ile bildirim gönderilecektir.</p>
          
          <h3>⏰ Sonraki Etap</h3>
          <p>Bir sonraki etap <strong>7 gün sonra</strong> otomatik olarak açılacaktır. Bu sürede mevcut raporunuzu inceleyebilir ve mentorunuzla görüşebilirsiniz.</p>
          
          <p>Devam ettiğiniz için teşekkür ederiz! 🎯</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Report ready email template (sent when mentor approves report)
 */
export function getReportReadyEmailTemplate(studentName: string, reportType: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Raporunuz Hazır!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p><strong>${reportType}</strong> raporunuz mentorunuz tarafından onaylandı ve artık görüntüleyebilirsiniz!</p>
          
          <h3>📊 Raporda Neler Var?</h3>
          <ul>
            <li>Yetenek analizi ve güçlü yönleriniz</li>
            <li>Kişilik özellikleri değerlendirmesi</li>
            <li>Size uygun kariyer önerileri</li>
            <li>Gelişim alanları ve öneriler</li>
            <li>Mentorunuzun yorumları</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}/dashboard/student" class="button">
              Raporu Görüntüle
            </a>
          </p>
          
          <p><em>Raporunuzu dikkatlice okuyun ve mentorunuzla görüşerek sorularınızı sorun.</em></p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * New stage activated email template (sent when next stage is unlocked after 7 days)
 */
export function getNewStageActivatedEmailTemplate(studentName: string, stageTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔓 Yeni Etap Açıldı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p>Harika haber! <strong>${stageTitle}</strong> artık aktif ve sizi bekliyor.</p>
          
          <h3>⏰ Şimdi Ne Yapmalısınız?</h3>
          <ol>
            <li>Önceki raporunuzu tekrar gözden geçirin</li>
            <li>Mentorunuzla varsa sorularınızı görüşün</li>
            <li>Yeni etabı tamamlamak için 15-20 dakika ayırın</li>
          </ol>
          
          <p style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}/dashboard/student" class="button">
              Etaba Başla
            </a>
          </p>
          
          <p><em>Not: Her etap bir öncekinden farklı sorular içerir ve daha derinlemesine değerlendirme yapar.</em></p>
          
          <p>Başarılar! 💪</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Stage reminder email template
 * Sent X days before a locked stage is scheduled to open
 */
export function getStageReminderEmailTemplate(
  studentName: string,
  stageTitle: string,
  daysUntilOpen: number,
  openDate: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .countdown { background: #eef2ff; border: 2px solid #6366f1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .countdown-number { font-size: 48px; font-weight: bold; color: #4f46e5; }
        .countdown-label { font-size: 14px; color: #6366f1; margin-top: 4px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏳ Yeni Etabınız Yakında Açılıyor!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p><strong>${stageTitle}</strong> etabınız çok yakında açılacak. Hazır olun!</p>
          
          <div class="countdown">
            <div class="countdown-number">${daysUntilOpen}</div>
            <div class="countdown-label">GÜN KALDI</div>
            <p style="margin: 8px 0 0; font-size: 14px; color: #4f46e5;">
              Açılış tarihi: <strong>${openDate}</strong>
            </p>
          </div>
          
          <h3>📋 Hazırlık Önerileri</h3>
          <ul>
            <li>Önceki etap raporunuzu tekrar okuyun</li>
            <li>Kariyer hedeflerinizi gözden geçirin</li>
            <li>Mentorunuzla bir görüşme planlayın</li>
            <li>15-20 dakika ayırabileceğiniz sakin bir ortam hazırlayın</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}/dashboard/student" class="button">
              İlerlememizi Görüntüle
            </a>
          </p>
          
          <p><em>Bu e-posta, etabınızın açılmasına ${daysUntilOpen} gün kaldığı için otomatik olarak gönderilmiştir.</em></p>
          
          <p>Görüşmek üzere! 🚀</p>
        </div>
        <div class="footer">
          <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
          <p><a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://meslegim.tr'}">meslegim.tr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
