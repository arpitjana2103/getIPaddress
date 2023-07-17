const express = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));
const {auth} = require('../middleware/auth.middleware');
const {redis} = require('../redis');
const {SearchModel} = require('../model/search.model.js');

const cityRouter = express.Router();

cityRouter.get('/:ipAddress', auth, async function (req, res) {
    const {ipAddress} = req.params;
    let data;
    const exist = await redis.exists(ipAddress);

    // console.log(exist);
    // data = await redis.get(ipAddress);
    // console.log(data);

    if (exist) {
        data = await redis.get(ipAddress);

        // Saving the search in the DB
        const newSearch = new SearchModel({
            userID: req.body.userID,
            ipAddress: ipAddress,
        });

        await newSearch.save();

        return res.status(200).json({
            status: 'ok',
            userName: req.body.userName,
            ipAddress: ipAddress,
            city: data,
        });
    } else {
        const resp = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        data = await resp.json();
        await redis.set(ipAddress, data.city);
        redis.expire(ipAddress, 6 * 60 * 60);

        // Saving the search in the DB
        const newSearch = new SearchModel({
            userID: req.body.userID,
            ipAddress: ipAddress,
        });

        await newSearch.save();

        return res.status(200).json({
            status: 'ok',
            userName: req.body.userName,
            ipAddress: ipAddress,
            city: data.city,
        });
    }
});

module.exports = {cityRouter};
