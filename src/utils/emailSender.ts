import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `Shangarh Stays <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;