'user strict';

const passport = require('passport');

module.exports.info = [
    (req, res) => {
        res.json({ id: req.user.id, username: req.user.username, displayName: req.user.displayName, email: req.user.email });
    }
]