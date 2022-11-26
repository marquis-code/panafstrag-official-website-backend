const mongoose = require('mongoose');
let ResponsibilitiesSchema = new mongoose.Schema ({
    description:{ 
        type: String, 
        lowercase: true
    }
},{
    timestamps: true
});

const Responsibilities = mongoose.model('Responsibility',ResponsibilitiesSchema);

module.exports = Responsibilities;