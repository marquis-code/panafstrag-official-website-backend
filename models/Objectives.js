const mongoose = require('mongoose');
let ObjectiveSchema = new mongoose.Schema ({
    description:{ 
        type: String, 
    }
},{
    timestamps: true
});

const Objectives = mongoose.model('Objective',ObjectiveSchema);

module.exports = Objectives;