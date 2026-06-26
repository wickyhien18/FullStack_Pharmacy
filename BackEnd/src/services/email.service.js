// ================================================================
// email.service.js — Gửi email dùng Resend
// Cài: npm install resend
// Thêm vào .env: RESEND_API_KEY=re_xxx
// ================================================================
import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

export const sendOTPEmail = async (toEmail, otp) => {
  const { error } = await resend.emails.send({
    from:    'Nhà Thuốc Wicky Hien <noreply@yourdomain.com>', // đổi thành domain của bạn
    to:      toEmail,
    subject: 'Xác nhận đổi email — Mã OTP của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px;">💊</span>
          <h1 style="color: #1250dc; font-size: 20px; margin: 8px 0;">Nhà Thuốc Wicky Hien</h1>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Xác nhận địa chỉ email mới</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Bạn vừa yêu cầu đổi email. Nhập mã OTP bên dưới để xác nhận.
            Mã có hiệu lực trong <strong>10 phút</strong>.
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1250dc;">
              ${otp}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Nếu bạn không yêu cầu đổi email, hãy bỏ qua email này.
            Tài khoản của bạn vẫn an toàn.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          © 2026 Nhà Thuốc Wicky Hien. Không trả lời email này.
        </p>
      </div>
    `,
  });

  if (error) throw { status: 500, message: `Gửi email thất bại: ${error.message}` };
};
