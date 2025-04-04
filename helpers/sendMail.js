const nodemailer = require("nodemailer");

module.exports.sendMail = (email, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'ree6i6x@gmail.com',
        to: email,
        subject: subject,
        html: html,
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });

};