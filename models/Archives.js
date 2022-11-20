const mongoose = require('mongoose');
let ArchiveSchema = new mongoose.Schema ({
    title:{ 
        type: String, 
        lowercase: true
    },
    publicationDate:{ 
        type: String, 
        lowercase: true
    },  
    description:{ 
        type: String, 
        lowercase: true
    },  
    uploadedDocumentFiles:{ 
        type: [String], 
        lowercase: true
    }
},{
    timestamps: true
});

const Archives = mongoose.model('Archive',ArchiveSchema);

module.exports = Archives;