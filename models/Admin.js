const mongoose = require('mongoose');
let AdminSchema = new mongoose.Schema ({
    firstName:{ 
        type: String, 
        lowercase: true
    },
    lastName:{ 
        type: String, 
        lowercase: true
    },
    email:{ 
        type: String, 
        lowercase: true
    },
    password:{ 
        type: String, 
        lowercase: true
    },
},{
    timestamps: true
});

const Admins = mongoose.model('Admin',AdminSchema);

module.exports = Admins;