const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

//Email connection details to send OTP to verify email
const transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        auth: {
            user: process.env.GOOGLE_USER,
            pass: process.env.GOOGLE_PASSWORD,
        }
    }
);

capitalizeFirstLetter = (word) => {
    let capitalizedFirstLetterWord = '';
    for (let i = 0; i < word.length; i++) {
    
    if (i == 0) {
        capitalizedFirstLetterWord += word[i].toUpperCase();

    } else {
        capitalizedFirstLetterWord += word[i].toLowerCase();
    }
}
    return capitalizedFirstLetterWord;
}

//Function to send otp to email
const sendOtp = (email, firstName, otp, subject, purpose) => {
    
    const mailOptions = {
  from: `"Roadsphere" <${process.env.GOOGLE_USER}>`, // Display name + email
  to: email,
  subject: subject,
  html: `
    <html>
      <h2>Hello ${capitalizeFirstLetter(firstName)},</h2>
      <p>Your ${purpose} OTP is <b>${otp}</b></p>
      <p>This code will expire in 10 minutes</p>
    </html>
  `
}

    return transporter.sendMail(mailOptions);
}

module.exports = { sendOtp };