const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1 create a transporter
  // eslint-disable-next-line max-len
  console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
  });

  // 2 Define the email options

  const mailOptions = {
    from: 'SNTI <no-reply@snti.pl>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    secure: false,
    // html: options.message,
  };

  // 3 Send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
