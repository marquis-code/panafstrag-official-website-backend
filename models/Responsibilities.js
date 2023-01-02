const mongoose = require('mongoose');
let ResponsibilitiesSchema = new mongoose.Schema ({
    description:{ 
        type: String, 
    }
},{
    timestamps: true
});

const Responsibilities = mongoose.model('Responsibility',ResponsibilitiesSchema);

module.exports = Responsibilities;