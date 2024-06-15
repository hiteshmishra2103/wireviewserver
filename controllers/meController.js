const User = require('../models/Users');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUserProfile,
};
