import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      'WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set. Emails will not be sent.',
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export const sendAlumniUpgradeReminder = async (
  toEmail: string,
  fullName: string,
): Promise<boolean> => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error(
      'Email transporter not configured. Cannot send email to:',
      toEmail,
    );
    return false;
  }

  const frontendUrl = 'https://tracerstudy-smanta.vercel.app/';
  const loginUrl = `${frontendUrl}/login`;

  const mailOptions = {
    from: `"Tracer Study SMA Negeri 1 Tawangsari" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject:
      'PENTING: Pembaruan Status Akun & Pengisian Tracer Study SMA Negeri 1 Tawangsari',
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100%;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
          
          <!-- HEADER -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">SMA NEGERI 1 TAWANGSARI</h1>
              <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">Tracer Study & Manajemen Data Alumni</p>
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="padding: 40px 30px; color: #374151; line-height: 1.6;">
              <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 700;">Halo, ${fullName}! 👋</h2>
              <p style="margin-bottom: 20px; font-size: 15px;">Kami harap kabar Anda baik dan sukses dalam menempuh jenjang karir atau pendidikan pasca kelulusan dari SMA Negeri 1 Tawangsari.</p>
              
              <p style="margin-bottom: 20px; font-size: 15px;">Berdasarkan data sistem kami, akun Anda saat ini masih terdaftar dengan status <strong>Siswa (Siswa Aktif/Belum Lulus)</strong>. Agar data Tracer Study kami akurat, mohon kerjasamanya untuk memperbarui status akun Anda menjadi <strong>Alumni</strong>.</p>
              
              <!-- LANGKAH-LANGKAH -->
              <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: #1e3a8a; font-size: 16px; font-weight: 600;">Langkah Mudah Upgrade Status Akun:</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #4b5563;">
                  <li style="margin-bottom: 10px;"><strong>Login ke Akun Siswa</strong>: Masuk ke dashboard web dengan menggunakan akun siswa Anda.</li>
                  <li style="margin-bottom: 10px;"><strong>Lengkapi Profil</strong>: Masuk ke menu profil Anda, isi <strong>Tahun Kelulusan</strong> jika belum terisi, kemudian klik <strong>Simpan</strong>.</li>
                  <li style="margin-bottom: 10px;"><strong>Upgrade Status</strong>: Klik tombol <strong>"Upgrade ke Alumni"</strong> atau <strong>"Lulus"</strong> pada halaman utama profil Anda untuk mengonversi status akun Anda.</li>
                  <li style="margin-bottom: 0;"><strong>Isi Tracer Study</strong>: Setelah status akun berubah menjadi Alumni, menu kuesioner akan otomatis terbuka. Silakan isi kuesioner Tracer Study secara lengkap.</li>
                </ol>
              </div>

              <!-- BUTTON CTA -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; letter-spacing: 0.5px;">
                      Masuk ke Tracer Study &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280; text-align: center; font-style: italic;">
                *Pengisian kuesioner ini sangat penting guna membantu akreditasi dan pengembangan mutu sekolah. Proses ini hanya memakan waktu sekitar 5-10 menit.
              </p>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 5px 0; font-weight: 500; color: #6b7280;">Sistem Informasi Tracer Study SMAN 1 Tawangsari</p>
              <p style="margin: 0;">Email ini dikirim secara otomatis oleh sistem. Jika Anda sudah melakukan pembaruan status dan pengisian kuesioner, mohon abaikan email ini.</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email reminder sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    return false;
  }
};
