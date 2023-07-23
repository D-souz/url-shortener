const mongoose = require('mongoose');

// creating a url schema/model
const urlSchema = new mongoose.Schema({
    originalUrl: {
        type:"string",
        required: true
    },
    shortenUrl: {type: String}
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;