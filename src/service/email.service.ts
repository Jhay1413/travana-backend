

import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
export const send_registration_email_service = async (url:string,name:string,email:string) => {

    await resend.emails.send({
        from: 'noreply@confirm.travana.app',
        to: email,
        subject: 'Registration Confirmation',
        html: createRegistrationEmailTemplate(name, url),
    });

}

const createRegistrationEmailTemplate = (userName: string, verificationUrl: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Confirmation</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Arial', sans-serif;
                  background-color: #f4f4f4;
                  color: #333333;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 40px 30px;
                  text-align: center;
                  color: white;
              }
              .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 600;
              }
              .content {
                  padding: 40px 30px;
                  text-align: center;
              }
              .congratulations {
                  font-size: 24px;
                  color: #2d3748;
                  margin-bottom: 20px;
                  font-weight: 600;
              }
              .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #4a5568;
                  margin-bottom: 30px;
              }
              .verify-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-decoration: none;
                  padding: 15px 35px;
                  border-radius: 50px;
                  font-size: 16px;
                  font-weight: 600;
                  margin: 20px 0;
                  transition: transform 0.2s ease;
              }
              .verify-button:hover {
                  transform: translateY(-2px);
              }
              .alternative-link {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #f7fafc;
                  border-radius: 8px;
                  border-left: 4px solid #667eea;
              }
              .alternative-link p {
                  margin: 0;
                  font-size: 14px;
                  color: #718096;
              }
              .alternative-link a {
                  color: #667eea;
                  word-break: break-all;
              }
              .footer {
                  background-color: #edf2f7;
                  padding: 30px;
                  text-align: center;
                  border-top: 1px solid #e2e8f0;
              }
              .footer p {
                  margin: 0;
                  font-size: 14px;
                  color: #718096;
                  line-height: 1.5;
              }
              .icon {
                  width: 60px;
                  height: 60px;
                  background-color: rgba(255, 255, 255, 0.2);
                  border-radius: 50%;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 20px;
                  font-size: 30px;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <div class="icon">🎉</div>
                  <h1>Welcome Aboard!</h1>
              </div>
              
              <div class="content">
                  <h2 class="congratulations">Congratulations, ${userName}!</h2>
                  
                  <p class="message">
                      Your registration request has been <strong>approved</strong>! We're excited to have you join our community.
                      <br><br>
                      To complete your registration and start using your account, please verify your email address by clicking the button below.
                  </p>
                  
                  <a href="${verificationUrl}" class="verify-button">
                      Verify Email Address
                  </a>
                  
                  <div class="alternative-link">
                      <p><strong>Can't click the button?</strong></p>
                      <p>Copy and paste this link into your browser:</p>
                      <a href="${verificationUrl}">${verificationUrl}</a>
                  </div>
              </div>
              
              <div class="footer">
                  <p>
                      If you didn't create an account with us, please ignore this email.
                      <br><br>
                      This verification link will expire in 24 hours for security purposes.
                      <br><br>
                      Need help? Contact our support team.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  };