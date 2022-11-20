const mongoose = require('mongoose');
let ReportSchema = new mongoose.Schema ({
    title:{ 
        type: String
    },
    publicationDate:{ 
        type: String
    },  
    uploadedDocumentFiles:{ 
        type: [String]
    }
},{
    timestamps: true
});

const Reports = mongoose.model('Report',ReportSchema);

module.exports = Reports;