import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Meslegim.tr <noreply@meslegim.tr>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent:', data?.id);
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
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0 0 5px 0;">Meslegim.tr</h1>
          <p style="margin: 0; opacity: 0.9;">Kariyer Değerlendirme Platformu</p>
        </div>
        <div class="content">
          <h2>Hoş Geldiniz, ${name}!</h2>
          <p>Meslegim.tr kariyer değerlendirme platformuna başvurunuz başarıyla alınmıştır.</p>
          <p><strong>Kayıt Bilgileriniz:</strong></p>
          <ul>
            <li>Ad Soyad: ${name}</li>
            <li>E-posta: ${email}</li>
          </ul>
          <p>Başvurunuz mentor tarafından incelenecek ve onaylandığında size e-posta ile bilgi verilecektir.</p>
          <p>Onay sürecinden sonra kariyer değerlendirme etaplarınıza başlayabileceksiniz.</p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getApprovalEmailTemplate(name: string, loginUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">🎉 Başvurunuz Onaylandı!</h1>
        </div>
        <div class="content">
          <h2>Tebrikler, ${name}!</h2>
          <p>Meslegim.tr kariyer değerlendirme platformuna başvurunuz mentor tarafından onaylanmıştır.</p>
          <p>Artık platformumuza giriş yaparak kariyer değerlendirme etaplarınıza başlayabilirsiniz.</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Giriş Yap</a>
          </p>
          <p><strong>Değerlendirme Süreci:</strong></p>
          <ul>
            <li>9 aşamalı kapsamlı kariyer değerlendirmesi</li>
            <li>Her etap sonrası detaylı geri bildirim</li>
            <li>AI destekli kişiselleştirilmiş raporlar</li>
            <li>7 gün içinde yeni etapların otomatik aktivasyonu</li>
          </ul>
          <p>Başarılar dileriz!</p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getStageActivationEmailTemplate(name: string, stageName: string, stageDescription: string, dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">🚀 Yeni Etap Aktif!</h1>
        </div>
        <div class="content">
          <h2>Merhaba, ${name}!</h2>
          <p>Kariyer değerlendirme sürecinizde yeni bir etap sizin için aktif hale getirildi.</p>
          <p><strong>Aktif Etap:</strong></p>
          <h3>${stageName}</h3>
          <p>${stageDescription}</p>
          <p>Bu etabı tamamlamak için dashboard'unuza giriş yapabilirsiniz.</p>
          <p style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Etabı Başlat</a>
          </p>
          <p><em>Not: Her etabı tamamladıktan sonra 7 gün içinde bir sonraki etap otomatik olarak aktif hale gelecektir.</em></p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReportReadyEmailTemplate(name: string, stageName: string, reportUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">📊 Raporunuz Hazır!</h1>
        </div>
        <div class="content">
          <h2>Merhaba, ${name}!</h2>
          <p><strong>${stageName}</strong> etabınız için değerlendirme raporunuz hazırlandı ve mentor onayına sunuldu.</p>
          <p>Mentor onayından sonra raporunuzu görüntüleyebileceksiniz.</p>
          <p>Rapor, AI destekli analiz ile hazırlanmış olup, kariyer gelişiminiz için önemli içgörüler içermektedir.</p>
          <p style="text-align: center;">
            <a href="${reportUrl}" class="button">Dashboard'a Git</a>
          </p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReportRejectedEmailTemplate(name: string, stageName: string, feedback: string, reportUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .feedback { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">⚠️ Raporunuz İnceleme Bekliyor</h1>
        </div>
        <div class="content">
          <h2>Merhaba, ${name}!</h2>
          <p><strong>${stageName}</strong> etabınız için hazırlanan değerlendirme raporunuz mentor tarafından incelenmiştir.</p>
          <p>Mentor, raporunuzla ilgili bazı düzeltme ve iyileştirme önerileri sunmuştur:</p>
          <div class="feedback">
            <strong>Mentor Geri Bildirimi:</strong>
            <p>${feedback}</p>
          </div>
          <p>Lütfen geri bildirimleri dikkate alarak etap sorularını gözden geçirin. Gerekirse yanıtlarınızı güncelleyebilirsiniz.</p>
          <p style="text-align: center;">
            <a href="${reportUrl}" class="button">Raporu Görüntüle</a>
          </p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReportApprovedEmailTemplate(name: string, stageName: string, reportUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">✅ Raporunuz Onaylandı!</h1>
        </div>
        <div class="content">
          <h2>Merhaba, ${name}!</h2>
          <p><strong>${stageName}</strong> etabınız için hazırlanan değerlendirme raporunuz mentor tarafından onaylanmıştır.</p>
          <p>Artık raporunuzu görüntüleyebilir ve indirebilirsiniz.</p>
          <p>Rapor, kariyer gelişiminiz için önemli içgörüler ve öneriler içermektedir. Lütfen dikkatlice inceleyiniz.</p>
          <p style="text-align: center;">
            <a href="${reportUrl}" class="button">Raporu Görüntüle</a>
          </p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getCertificateReadyEmailTemplate(name: string, certificateUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #fbbf24; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">🎓 Sertifikanız Hazır!</h1>
        </div>
        <div class="content">
          <h2>Tebrikler, ${name}!</h2>
          <p>Tüm kariyer değerlendirme etaplarını başarıyla tamamladınız!</p>
          <p>Meslegim.tr Kariyer Değerlendirme Sertifikanız hazırlanmıştır ve artık görüntüleyebilir, indirebilirsiniz.</p>
          <p><strong>Sertifikanızda:</strong></p>
          <ul>
            <li>Tamamlanan tüm etaplar</li>
            <li>Benzersiz sertifika numarası</li>
            <li>Doğrulama QR kodu</li>
            <li>Resmi onay damgası</li>
          </ul>
          <p style="text-align: center;">
            <a href="${certificateUrl}" class="button">Sertifikayı Görüntüle</a>
          </p>
          <p><em>Bu sertifika, kariyer gelişim sürecinizi ve yeteneklerinizi belgeleyen resmi bir dokümandır.</em></p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
