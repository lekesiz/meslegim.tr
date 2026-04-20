import { Resend } from 'resend';

// Resend API configuration - lazy initialization to avoid CI failures
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_init');
  }
  return _resend;
}

// Email from address - use verified domain or fallback to Resend test
const FROM_EMAIL = process.env.EMAIL_FROM || 'Meslegim.tr <bilgi@meslegim.tr>';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail(options: EmailTemplate): Promise<boolean> {
  try {
    const { data, error } = await getResend().emails.send({
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

// Base URL for links in emails
const BASE_URL = 'https://meslegim.tr';

// Shared email styles
const emailStyles = `
  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f4ff; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .button { display: inline-block; background: #4338ca; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
  .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px; padding: 16px; }
  .footer a { color: #6366f1; text-decoration: none; }
  .badge { display: inline-block; background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .info-box { background: #f0f4ff; border-left: 4px solid #4338ca; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
`;

const emailFooter = `
  <div class="footer">
    <p>© 2026 Meslegim.tr - Tüm hakları saklıdır</p>
    <p><a href="${BASE_URL}">meslegim.tr</a> | <a href="mailto:destek@meslegim.tr">destek@meslegim.tr</a></p>
    <p style="font-size: 11px; color: #cbd5e1;">Bu e-posta Meslegim.tr platformu tarafından otomatik olarak gönderilmiştir.</p>
  </div>
`;

/**
 * Welcome email template (sent when student is activated by mentor)
 */
export function getWelcomeEmailTemplate(studentName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p>Meslegim.tr platformuna hoş geldiniz! Hesabınız mentorunuz tarafından onaylandı ve artık kariyer değerlendirme sürecinize başlayabilirsiniz.</p>
          
          <div class="info-box">
            <strong>Süreç Nasıl İşler?</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li><strong>3 Etap:</strong> Yaş grubunuza özel 3 aşamalı değerlendirme</li>
              <li><strong>Her Etap:</strong> Yaklaşık 15-20 dakika sürer</li>
              <li><strong>Raporlar:</strong> Her etap sonrası AI destekli rapor alırsınız</li>
              <li><strong>Mentor Desteği:</strong> Süreç boyunca mentorunuz size rehberlik edecek</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard/student" class="button">
              Değerlendirmeye Başla
            </a>
          </p>
          
          <p><strong>İlk etabınız şu an aktif!</strong> Giriş yaparak hemen başlayabilirsiniz.</p>
          
          <p>Başarılar dileriz!</p>
        </div>
        ${emailFooter}
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
      <style>${emailStyles}
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Etap Tamamlandı!</h1>
        </div>
        <div class="content">
          <p>Tebrikler <strong>${studentName}</strong>,</p>
          
          <p><span class="badge">${stageTitle}</span> başarıyla tamamlandı!</p>
          
          <div class="info-box">
            <strong>Raporunuz Hazırlanıyor</strong>
            <p style="margin: 8px 0 0;">Yapay zeka destekli raporunuz şu anda oluşturuluyor. Mentorunuz raporu inceleyip onayladıktan sonra size e-posta ile bildirim gönderilecektir.</p>
          </div>
          
          <div class="info-box">
            <strong>Sonraki Etap</strong>
            <p style="margin: 8px 0 0;">Bir sonraki etap belirlenen süre sonunda otomatik olarak açılacaktır. Bu sürede mevcut raporunuzu inceleyebilir ve mentorunuzla görüşebilirsiniz.</p>
          </div>
          
          <p>Devam ettiğiniz için teşekkür ederiz!</p>
        </div>
        ${emailFooter}
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
      <style>${emailStyles}
        .header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Raporunuz Hazır!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p><strong>${reportType}</strong> raporunuz mentorunuz tarafından onaylandı ve artık görüntüleyebilirsiniz!</p>
          
          <div class="info-box">
            <strong>Raporda Neler Var?</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>Yetenek analizi ve güçlü yönleriniz</li>
              <li>Kişilik özellikleri değerlendirmesi</li>
              <li>Size uygun kariyer önerileri</li>
              <li>Gelişim alanları ve öneriler</li>
              <li>Mentorunuzun yorumları</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard/student" class="button">
              Raporu Görüntüle
            </a>
          </p>
          
          <p><em>Raporunuzu dikkatlice okuyun ve mentorunuzla görüşerek sorularınızı sorun.</em></p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `;
}

/**
 * New stage activated email template (sent when next stage is unlocked)
 */
export function getNewStageActivatedEmailTemplate(studentName: string, stageTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${emailStyles}
        .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yeni Etap Açıldı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p>Harika haber! <strong>${stageTitle}</strong> artık aktif ve sizi bekliyor.</p>
          
          <div class="info-box">
            <strong>Şimdi Ne Yapmalısınız?</strong>
            <ol style="margin: 8px 0 0; padding-left: 20px;">
              <li>Önceki raporunuzu tekrar gözden geçirin</li>
              <li>Mentorunuzla varsa sorularınızı görüşün</li>
              <li>Yeni etabı tamamlamak için 15-20 dakika ayırın</li>
            </ol>
          </div>
          
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard/student" class="button">
              Etaba Başla
            </a>
          </p>
          
          <p><em>Not: Her etap bir öncekinden farklı sorular içerir ve daha derinlemesine değerlendirme yapar.</em></p>
        </div>
        ${emailFooter}
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
      <style>${emailStyles}
        .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }
        .countdown { background: #f0f4ff; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .countdown-number { font-size: 48px; font-weight: bold; color: #4338ca; }
        .countdown-label { font-size: 14px; color: #6366f1; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yeni Etabınız Yakında Açılıyor!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${studentName}</strong>,</p>
          
          <p><strong>${stageTitle}</strong> etabınız çok yakında açılacak. Hazır olun!</p>
          
          <div class="countdown">
            <div class="countdown-number">${daysUntilOpen}</div>
            <div class="countdown-label">Gün Kaldı</div>
            <p style="margin: 8px 0 0; font-size: 14px; color: #4338ca;">
              Açılış tarihi: <strong>${openDate}</strong>
            </p>
          </div>
          
          <div class="info-box">
            <strong>Hazırlık Önerileri</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>Önceki etap raporunuzu tekrar okuyun</li>
              <li>Kariyer hedeflerinizi gözden geçirin</li>
              <li>Mentorunuzla bir görüşme planlayın</li>
              <li>15-20 dakika ayırabileceğiniz sakin bir ortam hazırlayın</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard/student" class="button">
              İlerlememizi Görüntüle
            </a>
          </p>
          
          <p style="font-size: 13px; color: #94a3b8;"><em>Bu e-posta, etabınızın açılmasına ${daysUntilOpen} gün kaldığı için otomatik olarak gönderilmiştir.</em></p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `;
}

/**
 * Email verification template
 */
export function getEmailVerificationTemplate(userName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>E-posta Doğrulama</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Meslegim.tr hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
          
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">
              E-postamı Doğrula
            </a>
          </p>
          
          <p style="font-size: 13px; color: #94a3b8;">Bu link 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `;
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(userName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${emailStyles}
        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">
              Şifremi Sıfırla
            </a>
          </p>
          
          <p style="font-size: 13px; color: #94a3b8;">Bu link 1 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `;
}

