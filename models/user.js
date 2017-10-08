var mongoose = require('mongoose');
 
module.exports = mongoose.model('User',{
    username: { type: String, lowercase: true},
    password: String,
    name: String,
    lastName: String,
    email: String,
    phone: String,
    gender: String,
    updated: { type: Date, default: Date.now },
    age:     { type: Number, min: 18, max: 65 },
    coins: Number,
    isAdmin: {type: Boolean, default: false},
    avatar: String,
    private: {type: Boolean, default: false},
    isBanned: {type: Boolean, default: false}
});