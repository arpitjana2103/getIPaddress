const mongoose = require('mongoose');

const SearchSchema = mongoose.Schema(
    {
        userID: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    }
);

const SearchModel = mongoose.model('search', SearchSchema);
module.exports = {SearchModel};
