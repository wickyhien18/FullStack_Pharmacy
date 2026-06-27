// ================================================================
// email.service.js — Gửi email dùng Resend
// Cài: npm install resend
// Thêm vào .env: RESEND_API_KEY=re_xxx
// ================================================================
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Tạo transporter — kết nối đến Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER, // email Gmail của bạn
    pass: env.GMAIL_APP_PASS, // App Password 16 ký tự
  },
});

// Verify kết nối khi server khởi động
export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("[Mailer] Gmail SMTP connected");
  } catch (err) {
    console.error("[Mailer] Gmail SMTP failed:", err.message);
  }
};

export const sendOTPEmail = async (toEmail, otp) => {
  const { error } = await transporter.sendMail({
    from: '"Nhà Thuốc Wicky Hien" <${env.GMAIL_USER}>', // đổi thành domain của bạn
    to: toEmail,
    subject: "Xác nhận đổi email — Mã OTP của bạn",
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

  if (error)
    throw { status: 500, message: `Gửi email thất bại: ${error.message}` };
};

export const sendResetPasswordEmail = async (toEmail, fullName, otp) => {
  const { error } = await transporter.sendMail({
    from: '"Nhà Thuốc Wicky Hien" <${env.GMAIL_USER}>',
    to: toEmail,
    subject: "Đặt lại mật khẩu — Mã OTP của bạn",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px;">💊</span>
          <h1 style="color: #1250dc; font-size: 20px; margin: 8px 0;">Nhà Thuốc Wicky Hien</h1>
        </div>
 
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Đặt lại mật khẩu</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Xin chào <strong>${fullName}</strong>,
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            Nhập mã OTP bên dưới để tiếp tục. Mã có hiệu lực trong <strong>10 phút</strong>.
          </p>
 
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #d97706;">
              ${otp}
            </span>
          </div>
 
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
            Mật khẩu của bạn sẽ không thay đổi.
          </p>
        </div>
 
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          © 2026 Nhà Thuốc Wicky Hien. Không trả lời email này.
        </p>
      </div>
    `,
  });

  if (error)
    throw { status: 500, message: `Gửi email thất bại: ${error.message}` };
};
