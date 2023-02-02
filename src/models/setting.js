const mongoose = require('../utiles/mongoAtlat');
// const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Setting = new Schema({
    chat: {
        theme: { type: Map, default: new Map() },
        backgroundImage: { type: Map, default: new Map() },
    },
    general: {
        darkMode: { type: Boolean, default: false },
        texttingSound: { type: Boolean, default: true },
        sendMessageSound: { type: Boolean, default: true },
        notificationSound: { type: Boolean, default: true },
    },
});

module.exports = mongoose.model('Setting', Setting);
