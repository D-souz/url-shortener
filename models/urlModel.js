const mongoose = require('mongoose');

// creating a url schema/model
const urlSchema = new mongoose.Schema({
    original_url: {
        type:"string",
        required: true
    },
    shorten_url: {type: Number}
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;