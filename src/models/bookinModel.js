const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bookingSchema = new Schema({

    place: {
        type: Schema.Types.ObjectId,
        ref: "Places",
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date,
        required: true
    },

    numberOfGuests: {
        type: Number,
        required: true
    },
    roomsNeeded: {
        type: Number,
        required: true
    },

    total: {
        type: Number,
        required: true
    },

    bookingStatus: {
        type: String,
        enum: ["pending", "accept", "reject"],
        default: "pending"
    }
});
module.exports = mongoose.model("Bookings", bookingSchema);
