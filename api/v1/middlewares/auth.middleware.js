const User = require('../models/user.model')

module.exports.requireAuth = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];

            const user = await User.findOne({
                token: token,
                deleted: false
            }).select("-password -deleted");

            if (!user) {
                res.json({
                    code: 400,
                    message: "Token not found",
                })

                return;
            }

            req.user = user

            next()
        } else {
            res.json({
                code: 400,
                message: "Unauthorized",
            })
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Unauthorized",
        })
    }
}