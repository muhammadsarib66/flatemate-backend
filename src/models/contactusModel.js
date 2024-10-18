const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactusSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    subject: {
        type: String
    }
});
module.exports = mongoose.model("Contactus", contactusSchema)