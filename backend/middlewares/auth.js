const User = require('../models/User');

export default async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    const user = await User.findOne({ token });
    if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach user to request object   
    next();
}

