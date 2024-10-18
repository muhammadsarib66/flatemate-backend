const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    identify: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },

    otpExpiry: {
        type: Date,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },

});
module.exports = mongoose.model("Otp", otpSchema)