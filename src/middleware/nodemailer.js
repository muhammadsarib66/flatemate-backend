const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    auth: {
        user: "flatemate0@gmail.com",
        pass: "evyy owpa ouxh sgkg",
    }
    // auth: {
    //     user: "saribnoor0310@gmail.com",
    //     pass: "amae lgju jkwb rlcf",
    // }
});

module.exports = transporter