const express = require("express");
const router = express.Router();
const authenticateToken = require("../config/auth.js")
const { createPlace, getAllPlaces, deletePlace, updatePlace,
    getAllBookings, getUserBookings, getAllUsers, deleteBooking, respondToBookingRequest, deleteUser, deleteReview, addReview, bookPlace } = require("../controllers/bookings.js")
const upload = require("../middleware/multer.js")
const isAdmin = require("../middleware/isAdmin.js")

router.post("/create-place", upload.array("images", 5), authenticateToken, isAdmin, createPlace);
router.get("/get-all-places", authenticateToken, getAllPlaces);
router.delete("/delete-place/:id", authenticateToken, isAdmin, deletePlace);
router.put("/update-place/:id", authenticateToken, isAdmin, updatePlace);
router.post("/book-place", authenticateToken, bookPlace);
router.get("/get-user-bookings", authenticateToken, getUserBookings);
router.get("/get-all-bookings", authenticateToken, isAdmin, getAllBookings);
router.get("/get-all-users", authenticateToken, isAdmin, getAllUsers);
router.delete("/delete-booking/:id", authenticateToken, isAdmin, deleteBooking);
router.delete("/delete-user/:id", authenticateToken, isAdmin, deleteUser);
router.post("/respond-to-booking-request", authenticateToken, isAdmin, respondToBookingRequest);
router.post("/add-review", authenticateToken, addReview);
router.post("/delete-review", authenticateToken, deleteReview);

module.exports = router