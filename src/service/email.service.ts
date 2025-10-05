

import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
export const send_registration_email_service = async (url:string,name:string,email:string) => {
    console.log(email,"from email service")
    await resend.emails.send({
        from: 'noreply@confirm.travana.app',
        to: email,
        subject: 'Registration Confirmation',
        html: createRegistrationEmailTemplate(name, url),
    });

}

export const send_referrer_invitation_email_service = async (invitationUrl: string, inviteeName: string, inviterName: string, organizationName: string, email: string) => {
    console.log(email, "from referrer invitation email service")
    await resend.emails.send({
        from: 'noreply@confirm.travana.app',
        to: email,
        subject: `You're Invited to Join ${organizationName} as a Referrer`,
        html: createReferrerInvitationEmailTemplate(inviteeName, inviterName, organizationName, invitationUrl),
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

const createReferrerInvitationEmailTemplate = (inviteeName: string, inviterName: string, organizationName: string, invitationUrl: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Referrer Invitation</title>
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
                  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
              .invitation-title {
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
                  text-align: left;
              }
              .organization-highlight {
                  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  font-weight: 600;
                  font-size: 18px;
              }
              .benefits-list {
                  text-align: left;
                  margin: 30px 0;
                  padding: 20px;
                  background-color: #f8fafc;
                  border-radius: 8px;
                  border-left: 4px solid #4f46e5;
              }
              .benefits-list h3 {
                  margin: 0 0 15px 0;
                  color: #2d3748;
                  font-size: 18px;
              }
              .benefits-list ul {
                  margin: 0;
                  padding-left: 20px;
                  color: #4a5568;
              }
              .benefits-list li {
                  margin-bottom: 8px;
                  line-height: 1.5;
              }
              .accept-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                  color: white;
                  text-decoration: none;
                  padding: 15px 35px;
                  border-radius: 50px;
                  font-size: 16px;
                  font-weight: 600;
                  margin: 20px 0;
                  transition: transform 0.2s ease;
              }
              .accept-button:hover {
                  transform: translateY(-2px);
              }
              .alternative-link {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #f7fafc;
                  border-radius: 8px;
                  border-left: 4px solid #4f46e5;
              }
              .alternative-link p {
                  margin: 0;
                  font-size: 14px;
                  color: #718096;
              }
              .alternative-link a {
                  color: #4f46e5;
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
              .inviter-info {
                  background-color: #f8fafc;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #4f46e5;
              }
              .inviter-info p {
                  margin: 0;
                  color: #4a5568;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <div class="icon">🤝</div>
                  <h1>Referrer Invitation</h1>
              </div>
              
              <div class="content">
                  <h2 class="invitation-title">You're Invited to Join as a Referrer!</h2>
                  
                  <p class="message">
                      Hello <strong>${inviteeName}</strong>,
                      <br><br>
                      <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a referrer. This is an exciting opportunity to be part of our referral network and earn rewards for bringing in new clients.
                  </p>

                  <div class="organization-highlight">
                      🏢 Joining: ${organizationName}
                  </div>

                  <div class="benefits-list">
                      <h3>🎯 What You'll Get as a Referrer:</h3>
                      <ul>
                          <li><strong>Commission Rewards:</strong> Earn money for every successful referral you bring in</li>
                          <li><strong>Exclusive Access:</strong> Get early access to new features and opportunities</li>
                          <li><strong>Marketing Support:</strong> Access to promotional materials and tools</li>
                          <li><strong>Performance Tracking:</strong> Real-time dashboard to track your referrals and earnings</li>
                          <li><strong>Community:</strong> Join our network of successful referrers</li>
                      </ul>
                  </div>

                  <div class="inviter-info">
                      <p><strong>Invited by:</strong> ${inviterName}</p>
                      <p><strong>Organization:</strong> ${organizationName}</p>
                  </div>
                  
                  <a href="${invitationUrl}" class="accept-button">
                      Accept Invitation
                  </a>
                  
                  <div class="alternative-link">
                      <p><strong>Can't click the button?</strong></p>
                      <p>Copy and paste this link into your browser:</p>
                      <a href="${invitationUrl}">${invitationUrl}</a>
                  </div>
              </div>
              
              <div class="footer">
                  <p>
                      This invitation was sent by ${inviterName} from ${organizationName}.
                      <br><br>
                      If you don't want to join as a referrer, you can safely ignore this email.
                      <br><br>
                      This invitation link will expire in 7 days for security purposes.
                      <br><br>
                      Questions? Contact our support team or reach out to ${inviterName} directly.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  };