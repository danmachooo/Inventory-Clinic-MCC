// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'smtp.gmail.com', 
  port:587,
  secure:false,
  auth: {
    user: "mindorostateuniveristy@gmail.com", 
    pass: "rpwo rtfu rpcj owfk", 
  },
});

module.exports = transporter;
