const isAdmin = (req, res, next) => {
    console.log(req.user, req.user.role);

    if (req.user && req.user.role === "admin") {

        next();
    } else {
        res.status(401).json({
            success: false,
            message: "User is not admin or not authenticated"
        });
    }
};

module.exports = isAdmin;
