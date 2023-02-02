const mongoose = require('../utiles/mongoAtlat');
// const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        receiver: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, maxLength: 1000 },
        type: { type: String, required: true, default: 'text' },
        img: { type: String },
        file: {
            content: { type: String },
            filename: { type: String },
            size: { type: String },
        },
        reactionIcon: { type: String, default: '' },
        userDeletedMessage: { type: Map, default: new Map() },
        time: { type: String, default: new Date() },
    },
    {
        timestamps: true,
    },
);

// plugin soft delete
// Message.plugin(mongoose_delete);

module.exports = mongoose.model('Message', Message);
