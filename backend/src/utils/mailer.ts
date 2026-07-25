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
): Promise<{ success: boolean; error?: string }> => {
  const transporter = getTransporter();
  if (!transporter) {
    const errorMsg =
      'Email transporter not configured. EMAIL_USER or EMAIL_PASS environment variables are not set.';
    console.error(`${errorMsg} Cannot send email to:`, toEmail);
    return { success: false, error: errorMsg };
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
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending email to ${toEmail}:`, error);
    return { success: false, error: error?.message || String(error) };
  }
};

export const sendAlumniIncompleteReminder = async (
  toEmail: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> => {
  const transporter = getTransporter();
  if (!transporter) {
    const errorMsg =
      'Email transporter not configured. EMAIL_USER or EMAIL_PASS environment variables are not set.';
    console.error(`${errorMsg} Cannot send email to:`, toEmail);
    return { success: false, error: errorMsg };
  }

  const frontendUrl = 'https://tracerstudy-smanta.vercel.app/';
  const loginUrl = `${frontendUrl}/login`;

  const mailOptions = {
    from: `"Tracer Study SMA Negeri 1 Tawangsari" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'PENTING: Pengisian Data Tracer Study SMA Negeri 1 Tawangsari',
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100%;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
          
          <!-- HEADER -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">TRACER STUDY SMA NEGERI 1 TAWANGSARI</h1>
              <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">Tracer Study & Manajemen Data Alumni</p>
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="padding: 40px 30px; color: #374151; line-height: 1.6;">
              <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 700;">Halo, ${fullName}! 👋</h2>
              <p style="margin-bottom: 20px; font-size: 15px;">Kami harap kabar Anda baik dan selalu sukses dalam menjalankan aktivitas sehari-hari.</p>
              
              <p style="margin-bottom: 20px; font-size: 15px;">Berdasarkan data sistem Tracer Study SMA Negeri 1 Tawangsari, kami melihat bahwa profil alumni Anda saat ini <strong>belum terisi secara lengkap</strong> (kuesioner/informasi universitas/pekerjaan masih kosong atau kurang lengkap).</p>
              
              <!-- LANGKAH-LANGKAH -->
              <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: #b45309; font-size: 16px; font-weight: 600;">Langkah Mudah Melengkapi Data Alumni:</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #4b5563;">
                  <li style="margin-bottom: 10px;"><strong>Login ke Akun Alumni</strong>: Masuk ke dashboard Tracer Study dengan menggunakan akun alumni Anda.</li>
                  <li style="margin-bottom: 10px;"><strong>Isi Kuesioner & Profil</strong>: Pilih menu Kuesioner atau Profil, lalu lengkapi data perguruan tinggi, riwayat pekerjaan, dan media sosial Anda secara lengkap.</li>
                  <li style="margin-bottom: 0;"><strong>Simpan Perubahan</strong>: Pastikan Anda menekan tombol simpan agar status data Anda terverifikasi sebagai <strong>Lengkap</strong>.</li>
                </ol>
              </div>

              <!-- BUTTON CTA -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; letter-spacing: 0.5px;">
                      Lengkapi Data Sekarang &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280; text-align: center; font-style: italic;">
                *Partisipasi Anda dalam mengisi Tracer Study sangat berharga untuk peningkatan mutu kurikulum, akreditasi sekolah, serta jaringan alumni SMAN 1 Tawangsari.
              </p>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 5px 0; font-weight: 500; color: #6b7280;">Sistem Informasi Tracer Study SMAN 1 Tawangsari</p>
              <p style="margin: 0;">Email ini dikirim secara otomatis oleh sistem. Jika Anda sudah melengkapi data Tracer Study Anda, mohon abaikan email ini.</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email reminder sent to alumni ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending email to alumni ${toEmail}:`, error);
    return { success: false, error: error?.message || String(error) };
  }
};

export const sendStudentIncompleteReminder = async (
  toEmail: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> => {
  const transporter = getTransporter();
  if (!transporter) {
    const errorMsg =
      'Email transporter not configured. EMAIL_USER or EMAIL_PASS environment variables are not set.';
    console.error(`${errorMsg} Cannot send email to:`, toEmail);
    return { success: false, error: errorMsg };
  }

  const frontendUrl = 'https://tracerstudy-smanta.vercel.app/';
  const loginUrl = `${frontendUrl}/login`;

  const mailOptions = {
    from: `"Tracer Study SMA Negeri 1 Tawangsari" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'PENTING: Lengkapi Data Akun Siswa SMA Negeri 1 Tawangsari',
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100%;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
          
          <!-- HEADER -->
          <tr>
            <td style="background-color: #0f766e; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">SMA NEGERI 1 TAWANGSARI</h1>
              <p style="color: #99f6e4; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">Tracer Study & Manajemen Data Alumni</p>
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="padding: 40px 30px; color: #374151; line-height: 1.6;">
              <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 700;">Halo, ${fullName}! 👋</h2>
              <p style="margin-bottom: 20px; font-size: 15px;">Kami harap Anda dalam keadaan sehat dan bersemangat.</p>
              
              <p style="margin-bottom: 20px; font-size: 15px;">Berdasarkan pemantauan sistem kami, profil akun siswa Anda saat ini <strong>belum terisi secara lengkap</strong>. Agar sistem dapat mencatat data angkatan Anda secara akurat, mohon segera melengkapi informasi profil Anda.</p>
              
              <!-- LANGKAH-LANGKAH -->
              <div style="background-color: #f9fafb; border-left: 4px solid #0d9488; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f766e; font-size: 16px; font-weight: 600;">Data Wajib yang Harus Dilengkapi:</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #4b5563;">
                  <li style="margin-bottom: 10px;"><strong>Nama Lengkap</strong>: Isi nama lengkap Anda sesuai ijazah/rapor.</li>
                  <li style="margin-bottom: 10px;"><strong>Tahun Masuk</strong>: Isi tahun pertama Anda masuk sekolah (contoh: 2020).</li>
                  <li style="margin-bottom: 0;"><strong>Tahun Lulus</strong>: Isi perkiraan tahun kelulusan Anda (contoh: 2023).</li>
                </ol>
              </div>

              <!-- BUTTON CTA -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #0d9488; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.2);">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; letter-spacing: 0.5px;">
                      Lengkapi Profil Sekarang &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280; text-align: center; font-style: italic;">
                *Pembaruan data profil ini penting demi keakuratan basis data sekolah dan persiapan pelacakan alumni mendatang.
              </p>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 5px 0; font-weight: 500; color: #6b7280;">Sistem Informasi Tracer Study SMAN 1 Tawangsari</p>
              <p style="margin: 0;">Email ini dikirim secara otomatis oleh sistem. Jika Anda sudah melengkapi profil Anda, mohon abaikan email ini.</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email reminder sent to student ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending email to student ${toEmail}:`, error);
    return { success: false, error: error?.message || String(error) };
  }
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  resetToken: string,
  userName?: string,
): Promise<{ success: boolean; error?: string }> => {
  const transporter = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  if (!transporter) {
    const errorMsg =
      'Email transporter tidak terkonfigurasi. Variabel EMAIL_USER dan EMAIL_PASS belum diisi di backend/.env.';
    console.warn(`${errorMsg} Dev Mode reset link for ${toEmail}: ${resetUrl}`);
    return { success: false, error: errorMsg };
  }

  const mailOptions = {
    from: `"Tracer Study SMAN 1 Tawangsari" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Password Akun Tracer Study SMAN 1 Tawangsari',
    html: `
      <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100%;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">TRACER STUDY SMA NEGERI 1 TAWANGSARI</h1>
              <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 13px; font-weight: 600;">Permintaan Reset Password Akun</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; color: #334155; line-height: 1.6;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Halo, ${userName || 'Pengguna'}! 👋</h2>
              <p style="margin-bottom: 20px; font-size: 14.5px;">Kami menerima permintaan untuk memperbarui password akun Tracer Study SMAN 1 Tawangsari Anda.</p>
              
              <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 18px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #334155;">Silakan klik tombol di bawah ini untuk mengatur password baru Anda. Tautan ini berlaku selama <strong>1 jam</strong>.</p>
              </div>

              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 12px; letter-spacing: 0.5px;">
                      RESET PASSWORD SAYA
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin-top: 25px; font-size: 13px; color: #64748b; text-align: center;">
                Jika Anda tidak merasa meminta reset password, mohon abaikan email ini. Password Anda akan tetap aman.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">Sistem Informasi Tracer Study SMAN 1 Tawangsari</p>
              <p style="margin: 0;">Email otomatis ini dikirim secara aman ke ${toEmail}</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending reset email to ${toEmail}:`, error);
    return { success: false, error: error?.message || String(error) };
  }
};
