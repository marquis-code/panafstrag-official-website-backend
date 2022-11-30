const mongoose = require('mongoose');
let SubscriptionSchema = new mongoose.Schema ({
    email:{ 
        type: String, 
        lowercase: true
    }
},{
    timestamps: true
});

const Subscription = mongoose.model('Subscription',SubscriptionSchema);

module.exports = Subscription;