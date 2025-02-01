
    const mongoose = require('mongoose');
    
    const deviceSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['ON', 'OFF'],
            default: 'OFF',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    });
    
    const Device = mongoose.model('Device', deviceSchema);
    module.exports = Device;
    