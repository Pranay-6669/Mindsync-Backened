// nodemailer.js
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const sendWelcomeMail = async (email, username) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email: email, name: username }],
      sender: {
        name: 'MindSync Team',
        email: process.env.SENDER_EMAIL,
      },
      subject: 'Welcome to MindSync! Your New Journey Starts Here!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background-color:rgb(188, 240, 91); padding: 20px; text-align: center; color: white;">
            <h1>Welcome to MindSync, ${username}!</h1>
            <p>We’re thrilled to have you with us. Let’s embark on this exciting journey to share and communicate your thoughts!</p>
          </div>

          <div style="padding: 20px;">
            <h2>Here’s what you can do:</h2>
            <ul>
              <li><strong>Share your thoughts:</strong> Express yourself freely with personalized messages and communicate your daily experiences.</li>
              <li><strong>Track your mood:</strong> Let our mood detection system help you reflect on your emotions and thoughts.</li>
              <li><strong>Play music that matches your mood:</strong> Our face recognition technology will select songs that fit how you feel at the moment.</li>
              <li><strong>Chat with AI:</strong> Our friendly AI is always available to talk and share meaningful conversations.</li>
            </ul>

            <p style="font-size: 14px; color:rgb(232, 12, 111);">This is only the beginning! We have more features on the way to help you express yourself and connect better. Keep an eye out for new updates and improvements!</p>

            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <h3 style="color: #2c3e50;">How to get started:</h3>
              <ul>
                <li>Complete your profile to unlock personalized experiences.</li>
                <li>Start by recording your first entry or reflect on your mood.</li>
                <li>Explore the app and try out the different features!</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #7f8c8d;">Thank you for joining the MindSync community! We can’t wait for you to explore all that MindSync has to offer.</p>

            <div style="margin-top: 30px; padding: 15px; background-color: #2c3e50; color: white; text-align: center;">
              <p>Need help? <a href="mailto:pranaybandanakanti@gmail.com" style="color: #ecf0f1; text-decoration: none;">Contact Support</a></p>
            </div>
          </div>
        </div>
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', response.messageId || response);
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.body || error);
  }
};

module.exports = sendWelcomeMail;




















