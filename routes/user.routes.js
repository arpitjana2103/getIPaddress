const express = require('express');
const {UserModel} = require('../model/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {redis} = require('../redis.js');

const userRouter = express.Router();

userRouter.post('/register', registerLogic);
userRouter.post('/login', loginLogic);
userRouter.get('/logout', logoutLogic);

async function registerLogic(req, res) {
    const {name, email, pass} = req.body;

    try {
        bcrypt.hash(pass, 5, async function (err, hash) {
            if (err) throw new Error(err.message);
            const newUser = new UserModel({name, email, pass: hash});
            await newUser.save();
            return res.status(200).json({
                status: 'ok',
                message: 'Registration Successful',
                user: req.body,
            });
        });
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error.message,
        });
    }
}

async function loginLogic(req, res) {
    const {email, pass} = req.body;

    try {
        const user = await UserModel.findOne({email});
        if (!user) throw new Error('Use Not Found');

        bcrypt.compare(pass, user.pass, async function (err, result) {
            if (err) throw new Error(err.message);
            if (!result) throw new Error('Wrong Password');
            if (result) {
                const aToken = jwt.sign(
                    {userID: user._id, userName: user.name},
                    'masaiA'
                );

                res.status(200).json({
                    status: 'ok',
                    message: 'Login Successfull',
                    aToken: aToken,
                });
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error.message,
        });
    }
}

async function logoutLogic(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('Token not found');
        await redis.set(token, 'true');

        return res.status(400).json({
            status: 'ok',
            message: 'Log Out Successful',
        });
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error.message,
        });
    }
}

module.exports = {userRouter};
