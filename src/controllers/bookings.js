const placeSchema = require("../models/placesModel");
const bookingSchema = require("../models/bookinModel");
const { default: mongoose } = require("mongoose");
const userSchema = require("../models/usersModel");


// add places 

exports.createPlace = async (req, res) => {

    try {
        const { placeTitle, description, address, pricePerNight, location, city, roomsAvailable } = req.body;
        if (!placeTitle || !description || !address || !pricePerNight || !location || !city || !roomsAvailable) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: "Images are required"
            });
        }

        const images = req.files.map(file => file.path);

        const newPlace = new placeSchema({
            placeTitle,
            roomsAvailable,
            description,
            address,
            pricePerNight,
            images,
            creator: req.user._id,
            location,
            city

        });
        await newPlace.save();

        res.status(200).json({
            success: true,
            message: "Place created successfully",
            place: newPlace
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

}


// get all places 


exports.getAllPlaces = async (req, res) => {
    try {
        const places = await placeSchema.find()
            .populate("creator", "firstName email") // Populating creator's firstName and email
            .populate({
                path: 'reviews', // Populating the reviews array
                populate: {
                    path: 'reviewer', // Populating the reviewer field within each review
                    select: 'firstName lastName email' // Selecting specific fields from the reviewer
                }
            });

        res.status(200).json({
            success: true,
            places
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// update places


exports.updatePlace = async (req, res) => {
    try {
        const { placeTitle, description, address, pricePerNight, location, city, roomsAvailable } = req.body;
        if (!placeTitle || !description || !address || !pricePerNight || !location || !city || !roomsAvailable) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }
        const place = await placeSchema.findById(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Place id not found"
            });
        }

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }
        place.placeTitle = placeTitle || place.placeTitle
        place.description = description || place.description
        place.address = address || place.address
        place.roomsAvailable = roomsAvailable || place.roomsAvailable
        place.pricePerNight = pricePerNight || place.pricePerNight
        place.location = location || place.location
        place.city = city || place.city
        await place.save();
        res.status(200).json({
            success: true,
            message: "Place updated successfully",
            place
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// delete places


exports.deletePlace = async (req, res) => {
    try {
        const place = await placeSchema.findByIdAndDelete(req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Place id not found"
            });
        }

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Place deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.bookPlace = async (req, res) => {
    try {
        const { placeId, checkIn, checkOut, numberOfGuests, roomsNeeded } = req.body;
        const userId = req.user._id;



        // Validate the place exists
        const place = await placeSchema.findById(placeId);
        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }

        // Calculate the number of days between checkIn and checkOut
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Calculate the total cost
        const total = numberOfDays * place.pricePerNight;
        const grandtotal = total * roomsNeeded;

        // Create new booking
        const newBooking = new bookingSchema({
            place: placeId,
            roomsNeeded,
            user: userId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            numberOfGuests,
            total: grandtotal,
            bookingStatus: "pending"
        });

        // Save the booking
        await newBooking.save();

        return res.status(201).json({
            success: true,
            message: "Booking request submitted successfully",
            booking: newBooking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// get user bookings

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await bookingSchema.find({ user: req.user._id }).populate("place", "placeTitle pricePerNight location city images").populate("user", "firstName");
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//get all bookings


exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingSchema.find().populate("place", "placeTitle pricePerNight location city images").populate("user", "firstName lastName email phone");
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//delete booking

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await bookingSchema.findByIdAndDelete(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Booking id not found"
            });
        }
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        // make rooms available
        const place = await placeSchema.findById(booking.place);
        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }
        place.roomsAvailable += booking.roomsNeeded;
        await place.save();

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// get all users


exports.getAllUsers = async (req, res) => {
    try {
        const users = await userSchema.find()
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// delete user


exports.deleteUser = async (req, res) => {
    try {
        const user = await userSchema.findByIdAndDelete(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "User id not found"
            });
        }
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//respond to booking request


exports.respondToBookingRequest = async (req, res) => {
    try {
        const { bookingId, response } = req.body;
        const booking = await bookingSchema.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Booking request has already been responded to"
            });
        }
        if (response !== "accept" && response !== "reject") {
            return res.status(400).json({
                success: false,
                message: "Invalid response"
            });
        }
        booking.bookingStatus = response;
        await booking.save();
        const place = await placeSchema.findById(booking.place);
        if (response === "accept") {
            place.roomsAvailable -= booking.roomsNeeded;
            await place.save();
        }
        if (place.roomsAvailable <= 0) {
            place.roomsAvailable = 0;
            place.availabe = false;
            await place.save();
        }


        res.status(200).json({
            success: true,
            message: "Booking request responded successfully",
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//user add reveiws to places


exports.addReview = async (req, res) => {
    try {
        const { placeId, reviewText, rating } = req.body;
        const reviewerId = req.user._id; // Assuming user authentication

        // Validate input
        if (!placeId || !reviewText || !rating) {
            return res.status(400).json({
                success: false,
                message: "Place ID, review text, and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Find the place by ID
        const place = await placeSchema.findById(placeId);
        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }

        // Add the new review to the reviews array
        const newReview = {
            reviewText,
            reviewer: reviewerId,
            rating
        };

        place.reviews.push(newReview);

        // Save the updated place
        await place.save();

        return res.status(200).json({
            success: true,
            message: "Review added successfully",
            place
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// delete a reveiw 

exports.deleteReview = async (req, res) => {
    try {
        const { reveiwID } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reveiwID)) {
            return res.status(404).json({
                success: false,
                message: "Invalid reveiw ID"
            });
        }

        // Find reveiw by ID
        const review = await reviewSchema.findById(reveiwID);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Reveiw not found"
            });
        }

        // Delete reveiw
        await review.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Reveiw deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}