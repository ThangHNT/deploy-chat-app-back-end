const mongoose = require('../utiles/mongoAtlat');
// const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendList = new Schema({
    friend: { type: Map, default: new Map() },
});

module.exports = mongoose.model('friendList', friendList);
