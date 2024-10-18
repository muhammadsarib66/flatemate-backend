const userSchema = require("../models/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../utils/email");
const checkStrongPassword = require("../utils/password");
const transporter = require("../middleware/nodemailer")
const contactusSchema = require("../models/contactusModel")
const otpSchema = require("../models/otpModel");
const isAdmin = require("../middleware/isAdmin");


// signup and send confirmation link

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: validateEmail(email).errors
            });
        }
        if (!checkStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: checkStrongPassword(password).errors
            });
        }
        if (!firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "First name and last name are required"
            });
        }
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "phone number are required"
            });
        }
        const user = await userSchema.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userSchema({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone
        });
        await newUser.save();

        const confirmationtoken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        const url = `http://localhost:7000/api/v1/users/confirm/${confirmationtoken}`;

        const mailOptions = {
            from: "flatemate0@gmail.com",
            to: email,
            subject: "Confirm your account",
            html: `
            <html>
            <body>
                <h1>Hello!</h1>
                <p>Thank you for registering. Please click the link below to confirm your account:</p>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Confirm Account</a>
                <p>If you did not register for an account, please ignore this email.</p>
            </body>
            </html>
        `
            // text: `Please click on the following link to confirm your account: ${url}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }

        })

        res.status(200).json({
            success: true,
            message: "User created successfully", url
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//confirmation link to activate account

exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userSchema.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.isConfirmed) {
            return res.status(400).json({
                success: false,
                message: "User already confirmed"
            });
        }
        user.isConfirmed = true;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User confirmed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// send confirmation link again if not confirmed


exports.resendConfirmationLink = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.isConfirmed) {
            return res.status(400).json({
                success: false,
                message: "User already confirmed"
            });
        }
        const confirmationtoken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        const url = `http://localhost:7000/api/v1/users/confirm/${confirmationtoken}`;
        const mailOptions = {
            from: "flatemate0@gmail.com",
            to: email,
            subject: "Confirm your account",
            html: `
            <html>
            <body>
                <h1>Hello!</h1>
                <p>Thank you for registering. Please click the link below to confirm your account:</p>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Confirm Account</a>
                <p>If you did not register for an account, please ignore this email.</p>
            </body>
            </html>
        `
            // text: `Please click on the following link to confirm your account: ${url}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        })
        res.status(200).json({
            success: true,
            message: "Confirmation link sent to your email", url
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// admin signup


// login if account is confirmed

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // send confirmation link again if not confirmed
        if (!user.isConfirmed) {
            res.status(400).json({
                success: false,
                message: "Please confirm your email first"
            })
            nodemailer.sendConfirmationEmail(email, confirmationtoken);
            return res.status(400).json({
                success: false,
                message: "Please confirm your email first"

            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,

                message: "Incorrect password"
            });
        }
        const token = jwt.sign({
            _id: user._id,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.status(200).json({
            success: true,
            message: "User logged in successfully", user,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// forget password send otp

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate a 4-digit OTP
        const newotp = Math.floor(1000 + Math.random() * 9000);
        const newotpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        let otpdata = await otpSchema.findOne({ identify: email });
        console.log(otpdata);
        if (otpdata) {
            otpdata.otp = newotp;
            otpdata.otpExpiry = newotpExpiry;
        } else {
            // Save OTP in the database
            otpdata = new otpSchema({
                identify: email,
                otp: newotp,
                otpExpiry: newotpExpiry
            });
        }

        await otpdata.save();

        // Send OTP via email
        const mailOptions = {
            from: "flatemate0@gmail.com", // Replace with your actual email
            to: email,
            subject: "Your Password Reset OTP",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    margin: 0 0 20px;
                }
                .otp {
                    display: inline-block;
                    padding: 10px 15px;
                    font-size: 18px;
                    color: #fff;
                    background-color: #007bff;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: bold;
                }
                .footer {
                    font-size: 14px;
                    color: #777;
                    text-align: center;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Password Reset Request</h1>
                <p>Your OTP for password reset is: <span class="otp">${newotp}</span></p>
                <p>It will expire in 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <div class="footer">
                    <p>&copy; 2024 FlateMate. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
            // text: `Your OTP for password reset is: ${newotp}. It will expire in 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    success: false,
                    message: "Error sending OTP email"
                });
            }
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            newotp,
            email: otpdata?.identify

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// confirm otp

exports.confirmOtp = async (req, res) => {
    try {
        const { identify, otp } = req.body;
        const otpdata = await otpSchema.findOne({ identify });
        if (!otpdata) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        if (otpdata.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        if (otpdata.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }
        otpdata.isVerified = true;
        await otpdata.save();
        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// reset password

exports.resetPassword = async (req, res) => {
    try {
        const { identify, password } = req.body;
        const user = await userSchema.findOne({ email: identify });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset failed. otp not found"
            });
        }
        const otpdata = await otpSchema.findOne({ identify });

        if (!otpdata.isVerified) {
            console.log(otpdata.isVerified);

            return res.status(400).json({
                success: false,
                message: "otp is not verified"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        await otpSchema.findOneAndDelete({ identify });

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });




    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// contact us

exports.contactUs = async (req, res) => {
    try {
        const { firstname, lastname, email, message, subject, phone } = req.body;
        if (!firstname || !lastname || !email || !message || !subject) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const contact = new contactusSchema({
            firstname,
            lastname,
            email,
            message,
            subject,
            phone
        });
        await contact.save();
        res.status(200).json({
            success: true,
            message: "Message sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// get all contact us


exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await contactusSchema.find();
        res.status(200).json({
            success: true,
            contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}