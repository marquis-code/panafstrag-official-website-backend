const mongoose = require('mongoose');
let ObjectiveSchema = new mongoose.Schema ({
    description:{ 
        type: String, 
        lowercase: true
    }
},{
    timestamps: true
});

const Objectives = mongoose.model('Objective',ObjectiveSchema);

module.exports = Objectives;