const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logoPath = path.resolve(__dirname, '../../../frontend/public/logo.png');

let transporter;
function client() {
  if (!env.smtp.email || !env.smtp.password) throw Object.assign(new Error('Password reset email is not configured.'), { statusCode: 503 });
  if (!transporter) transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.email, pass: env.smtp.password },
  });
  return transporter;
}

function resetOtpTemplate(name, otp, logoSource) {
  const safeName = String(name || 'Student').replace(/[<>&"']/g, '');
  return `<!doctype html><html><body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden"><tr><td style="height:6px;background:#1267b1"></td></tr><tr><td style="padding:32px"><img src="${logoSource}" width="190" alt="Chandrabhaga Academy" style="display:block;width:190px;max-width:100%;height:auto;border:0"><h1 style="margin:28px 0 10px;font-size:25px">Reset your password</h1><p style="margin:0;color:#475569;line-height:1.7">Hello ${safeName}, use the verification code below to reset your password.</p><div style="margin:26px 0;padding:20px;border-radius:14px;background:#eff6ff;text-align:center"><div style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#64748b">VERIFICATION CODE</div><div style="margin-top:8px;font-size:36px;font-weight:800;letter-spacing:10px;color:#1267b1">${otp}</div></div><p style="margin:0;color:#475569;line-height:1.7">This code expires in <strong>10 minutes</strong>. Never share it with anyone. If you did not request this reset, you can safely ignore this email.</p></td></tr><tr><td style="padding:18px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center">© Chandrabhaga Academy · Prepare smarter, score higher.</td></tr></table></td></tr></table></body></html>`;
}

async function sendPasswordResetOtp(user, otp) {
  const hasInlineLogo = fs.existsSync(logoPath);
  await client().sendMail({
    from: `"${env.smtp.fromName.replace(/["\r\n]/g, '')}" <${env.smtp.fromEmail}>`,
    replyTo: env.smtp.replyTo,
    to: user.email,
    subject: 'Your password reset verification code',
    text: `Hello ${user.name}, your password reset OTP is ${otp}. It expires in 10 minutes. Do not share this code.`,
    html: resetOtpTemplate(user.name, otp, hasInlineLogo ? 'cid:chandrabhaga-academy-logo' : `${env.publicWebUrl}/logo.png`),
    attachments: hasInlineLogo ? [{ filename: 'chandrabhaga-academy-logo.png', path: logoPath, cid: 'chandrabhaga-academy-logo' }] : [],
  });
}

module.exports = { sendPasswordResetOtp };
