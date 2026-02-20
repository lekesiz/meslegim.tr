import { Resend } from 'resend';

const resend = new Resend('re_j299ogpf_EEAKZAoLJArch69r5tXmjVPs');

try {
  const { data, error } = await resend.emails.send({
    from: 'Meslegim.tr <noreply@meslegim.tr>',
    to: 'mikaillekesiz@gmail.com',
    subject: 'Test Email - Domain Doğrulama Testi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .success { background: #10b981; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Domain Doğrulama Başarılı!</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ meslegim.tr domain'i aktif!</strong>
            </div>
            <h2>Test Email</h2>
            <p>Bu email, <strong>noreply@meslegim.tr</strong> adresinden gönderilmiştir.</p>
            <p><strong>Test Detayları:</strong></p>
            <ul>
              <li>Gönderen: noreply@meslegim.tr</li>
              <li>Alıcı: mikaillekesiz@gmail.com</li>
              <li>Tarih: ${new Date().toLocaleString('tr-TR')}</li>
            </ul>
            <p>Domain doğrulaması başarılı! Artık tüm kullanıcılara email gönderebilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  if (error) {
    console.error('❌ Email Error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('✅ Email sent successfully!');
  console.log('Email ID:', data.id);
  console.log('From: noreply@meslegim.tr');
  console.log('To: mikaillekesiz@gmail.com');
} catch (err) {
  console.error('❌ Exception:', err.message);
  process.exit(1);
}
