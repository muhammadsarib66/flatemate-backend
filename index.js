const express = require("express");
const connectDB = require("./src/config/dbConnection");
require("dotenv").config()
const path = require("path")
const cors = require("cors");

const userRoutes = require("./src/routes/usersRoutes")
const bookingRoutes = require("./src/routes/bookingRoutes")

//MIDDLEWARE

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB CONNECTIONS

connectDB();

// ROUTES

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/bookings", bookingRoutes)
app.get("/", (req, res) => {
    res.send("<h1>Welcome to the flatemate backend</h1>")
})

// SERVER

PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
