// user routes
const express = require("express");
const router = express.Router();
const { signup, login, confirmEmail,
    resendConfirmationLink, forgetPassword, confirmOtp, resetPassword, getAllContacts, contactUs } = require("../controllers/usersController");
const authenticateToken = require("../config/auth");



router.post("/signup", signup);
router.get("/confirm/:token", confirmEmail);
router.post("/resend-confirmation-link", resendConfirmationLink);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/confirm-otp", confirmOtp);
router.post("/reset-password", resetPassword);
router.post("/contact-us", authenticateToken, contactUs);
router.get("/get-all-contactsus", getAllContacts);


module.exports = router