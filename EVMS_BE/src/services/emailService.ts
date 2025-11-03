import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Create a transporter object
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP
  port: 465, // Port 465 cho SSL
  secure: true, // Bật SSL
  auth: {
    user: "doantrinh489@gmail.com",
    // user: "maitanthepmrthep@gmail.com", // Có thể đổi email khác nếu cần
    pass: process.env.MAIL_PASSWORD, // Mật khẩu ứng dụng Gmail
  },
});

// Send forgot password email
export const sendForgotPasswordEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  try {
    const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"EVMS Support" <doantrinh489@gmail.com>`,
      to: email,
      subject: 'Đặt lại mật khẩu - EVMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EVMS</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Electric Vehicle Maintenance System</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Đặt lại mật khẩu</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Nhấn vào nút bên dưới để đặt lại mật khẩu:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Hoặc copy và paste link sau vào trình duyệt:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; line-height: 1.6;">
                ⚠️ Link này sẽ hết hạn sau 15 phút vì lý do bảo mật.
              </p>
              <p style="color: #999; font-size: 12px; line-height: 1.6;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 EVMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset password email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send reset password email');
  }
};

// Send verification email with OTP
export const sendVerificationEmail = async (
  email: string,
  userName: string,
  verificationToken: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"EVMS Support" <hanhnthse181585@fpt.edu.vn>`,
      to: email,
      subject: 'Xác thực Email của bạn - EVMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EVMS</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Electric Vehicle Maintenance System</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Xác thực Email</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại EVMS. Vui lòng sử dụng mã OTP sau để xác thực email của bạn:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 20px 30px; 
                          border-radius: 10px; 
                          font-size: 32px; 
                          font-weight: bold; 
                          letter-spacing: 8px;
                          display: inline-block;
                          font-family: 'Courier New', monospace;">
                ${verificationToken}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
              ⏰ Mã xác thực này sẽ hết hạn sau <strong>10 phút</strong>.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; line-height: 1.6;">
                ⚠️ Nếu bạn không yêu cầu đăng ký tài khoản này, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 EVMS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Test email connection
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};
