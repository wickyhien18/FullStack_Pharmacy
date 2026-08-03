import { Resend } from "resend";
import { env } from "../config/env.config.js";

const resend = new Resend(env.RESEND_API_KEY);
const FROM = env.RESEND_FROM_EMAIL;

export const sendOTPEmail = async (toEmail, otp) => {
  const { error } = await resend.emails.send({
    from: `Wicky Hien Pharmacy <${FROM}>`,
    to: toEmail,
    subject: "Confirm email change - Your OTP code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px;">💊</span>
          <h1 style="color: #1250dc; font-size: 20px; margin: 8px 0;">Wicky Hien Pharmacy</h1>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Confirm your new email address</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            You requested an email change. Enter the OTP code below to confirm.
            This code is valid for <strong>10 minutes</strong>.
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1250dc;">
              ${otp}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            If you did not request an email change, please ignore this email.
            Your account remains secure.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          © 2026 Wicky Hien Pharmacy. Please do not reply to this email.
        </p>
      </div>
    `,
  });

  if (error)
    throw { status: 500, message: `Failed to send email: ${error.message}` };
};

export const sendResetPasswordEmail = async (toEmail, fullName, otp) => {
  const { error } = await resend.emails.send({
    from: `Wicky Hien Pharmacy <${FROM}>`,
    to: toEmail,
    subject: "Reset password - Your OTP code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px;">💊</span>
          <h1 style="color: #1250dc; font-size: 20px; margin: 8px 0;">Wicky Hien Pharmacy</h1>
        </div>
 
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Reset password</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Hello <strong>${fullName}</strong>,
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            We received a request to reset the password for your account.
            Enter the OTP code below to continue. This code is valid for <strong>10 minutes</strong>.
          </p>
 
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #d97706;">
              ${otp}
            </span>
          </div>
 
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            If you did not request a password reset, please ignore this email.
            Your password will not be changed.
          </p>
        </div>
 
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          © 2026 Wicky Hien Pharmacy. Please do not reply to this email.
        </p>
      </div>
    `,
  });

  if (error)
    throw { status: 500, message: `Failed to send email: ${error.message}` };
};

export const sendOrderStatusEmail = async (
  toEmail,
  fullName,
  orderCode,
  statusMessage,
) => {
  const { error } = await resend.emails.send({
    from: `Wicky Hien Pharmacy <${FROM}>`,
    to: toEmail,
    subject: `Order update #${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px;">💊</span>
          <h1 style="color: #1250dc; font-size: 20px; margin: 8px 0;">Wicky Hien Pharmacy</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Order #${orderCode}</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Hello <strong>${fullName || "there"}</strong>,
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            ${statusMessage}.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          © 2026 Wicky Hien Pharmacy. Please do not reply to this email.
        </p>
      </div>
    `,
  });
  if (error)
    throw { status: 500, message: `Failed to send email: ${error.message}` };
};
