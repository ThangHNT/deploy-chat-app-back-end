const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://thanghoang:hnt12345@cluster0.p4suv.mongodb.net/chat-app');

module.exports = mongoose;
