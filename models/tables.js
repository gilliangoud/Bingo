var mongoose = require('mongoose');
 
module.exports = mongoose.model('tables',{
    tableName: String,
    room: String,
    state: String,
    playerLimit: String,
    openHour: { type: Number, min: 0, max: 23, default: 0 },
    closeHour: { type: Number, min: 0, max: 23, default: 0 },
    dayOpen: {
    	monday: { type: Boolean, default: true},
    	tuesday: { type: Boolean, default: true},
    	wednesday: { type: Boolean, default: true},
    	thursday: { type: Boolean, default: true},
    	friday: { type: Boolean, default: true},
    	saturday: { type: Boolean, default: true},
    	sunday: { type: Boolean, default: true},
    }
});