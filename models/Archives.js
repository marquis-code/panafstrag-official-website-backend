const mongoose = require('mongoose');
let ArchiveSchema = new mongoose.Schema ({
    title:{ 
        type: String, 
    },
    publicationDate:{ 
        type: String, 
    },  
    description:{ 
        type: String, 
    },  
    uploadedVideoUrl: { 
        type: String, 
    }
},{
    timestamps: true
});

const Archives = mongoose.model('Archive',ArchiveSchema);

module.exports = Archives;