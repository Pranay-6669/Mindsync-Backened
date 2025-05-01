const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendSupportEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Check environment variables
  if (!process.env.SENDINBLUE_API_KEY) {
    console.error("❌ Missing SENDINBLUE_API_KEY in environment variables");
    return res.status(500).json({ error: "Server configuration error. Please contact administrator." });
  }

  if (!process.env.SENDER_EMAIL) {
    console.error("❌ Missing SENDER_EMAIL in environment variables");
    return res.status(500).json({ error: "Server configuration error. Please contact administrator." });
  }

  try {
    console.log('Starting email send process...');
    console.log('Environment check:', {
      hasApiKey: !!process.env.SENDINBLUE_API_KEY,
      senderEmail: process.env.SENDER_EMAIL,
      apiKeyLength: process.env.SENDINBLUE_API_KEY.length
    });

    // Configure Sendinblue API
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{
        email: process.env.SENDER_EMAIL,
        name: 'MindSync Support'
      }],
      sender: {
        name: name,
        email: email
      },
      subject: `Support Query from ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Support Query</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message}
          </div>
        </div>
      `
    };

    console.log('Email configuration:', {
      to: sendSmtpEmail.to[0].email,
      from: sendSmtpEmail.sender.email,
      subject: sendSmtpEmail.subject,
      hasHtmlContent: !!sendSmtpEmail.htmlContent
    });

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Sendinblue API Response:', {
      messageId: response.messageId,
      status: 'success'
    });

    res.status(200).json({ 
      message: "Your query has been sent successfully!",
      details: {
        messageId: response.messageId,
        to: process.env.SENDER_EMAIL
      }
    });
  } catch (error) {
    console.error("Email Error Details:", {
      message: error.message,
      response: error.response?.body,
      status: error.status,
      stack: error.stack
    });

    // Handle specific Sendinblue errors
    if (error.response?.body) {
      const errorBody = error.response.body;
      console.error("Sendinblue Error Response:", errorBody);
      
      if (errorBody.code === 'unauthorized') {
        return res.status(401).json({ 
          error: "Email service authentication failed",
          details: "Please check your Sendinblue API key"
        });
      }
      
      if (errorBody.code === 'invalid_parameter') {
        return res.status(400).json({ 
          error: "Invalid email parameters",
          details: errorBody.message
        });
      }
    }

    res.status(500).json({ 
      error: "Failed to send email. Try again later.",
      details: error.message 
    });
  }
};

module.exports = { sendSupportEmail };
