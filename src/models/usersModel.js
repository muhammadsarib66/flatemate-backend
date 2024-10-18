const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    // bookings: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "Booking"
    // 
    role: {
        type: String,
        default: "user",
        enum: ["admin", "user"]
    }


});

module.exports = mongoose.model("Users", userSchema);