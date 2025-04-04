const md5 = require('md5');
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");
const generateHelper = require("../../../helpers/generate");
const sendMailHelper = require("../../../helpers/sendMail");

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {

    req.body.password = md5(req.body.password);

    try {
        const existEmail = await User.findOne({
            email: req.body.email,
            deleted: false
        });

        if (existEmail) {
            res.json({
                code: 400,
                message: "Email already exists",
            })
        } else {
            const user = new User({
                fullName: req.body.fullName,
                email: req.body.email,
                password: req.body.password,
            });

            await user.save();

            const token = user.token;

            res.cookie("token", token);

            res.json({
                code: 200,
                message: "Register success"
            })
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Register failed",
        })
    }
}

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({
            email: email,
            deleted: false
        })

        if (!user) {
            res.json({
                code: 400,
                message: "Email not found",
            })

            return;
        }

        if (md5(password) !== user.password) {
            res.json({
                code: 400,
                message: "Password is incorrect",
            })

            return;
        }

        const token = user.token;
        res.cookie("token", token);

        res.json({
            code: 200,
            message: "Login success",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Login failed",
        })
    }
}

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({
            email: email,
            deleted: false
        })

        if (!user) {
            res.json({
                code: 400,
                message: "Email not found",
            })

            return;
        }

        // Save data to forgot-password collection
        const otp = generateHelper.generateRandomNumber(8)
        const objectForgotPassword = {
            email: email,
            otp: otp,
            expireAt: new Date(Date.now() + 180 * 1000)
        }

        const forgotPassword = new ForgotPassword(objectForgotPassword)

        await forgotPassword.save();

        // Send otp -> email
        const subject = "OTP for forgot password"
        const html = `
            <h2>OTP for forgot password</h2>
            <p>Your OTP is: ${otp}</p>
            <p>This OTP will expire in 3 minutes</p>
        `
        sendMailHelper.sendMail(email, subject, html)

        res.json({
            code: 200,
            message: "Send OTP email success",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Send OTP email failed",
        })
    }
}

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    try {
        const result = await ForgotPassword.findOne({
            email: email,
            otp: otp,
        })

        if (!result) {
            res.json({
                code: 400,
                message: "OTP is incorrect",
            })

            return;
        }

        const user = await User.findOne({
            email: email,
        })

        const token = user.token;

        res.cookie("token", token);

        res.json({
            code: 200,
            message: "OTP is correct",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "OTP is incorrect",
        })
    }
}

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;


    try {
        const user = await User.findOne({
            token: token,
        })

        if(md5(password) === user.password) {
            res.json({
                code: 400,
                message: "New password is same as old password",
            })

            return;
        }

        await User.updateOne({
            token: token,
        }, {
            password: md5(password)
        })

        res.json({
            code: 200,
            message: "Reset password success",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Reset password failed",
        })
    }
}

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
    const token = req.cookies.token;

    try {
        const user = await User.findOne({
            token: token,
            deleted: false
        }).select("-password -token -deleted")

        if (!user) {
            res.json({
                code: 400,
                message: "User not found",
            })

            return;
        }

        res.json({
            code: 200,
            message: "Get user detail success",
            info: user
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Get user detail failed",
        })
    }
}