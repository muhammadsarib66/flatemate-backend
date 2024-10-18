const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const user = require('../models/usersModel.js');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {

        if (err) return res.status(403).json({ message: 'JWT Token Not Valid' });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
