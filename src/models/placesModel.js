const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema({
    placeTitle: {

        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    city: {
        type: String
    },
    roomsAvailable: {
        type: Number,
        required: true
    },
    availabe: {
        type: Boolean,
        default: true
    },

    images: {
        type: [String],
        required: true
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    reviews: [{
        reviewText: String,
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users" // Assuming you have a User model
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],

})

module.exports = mongoose.model("Places", placeSchema)