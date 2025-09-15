```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// This schema can be adapted to different industries by enabling/disabling the industry-specific fields.
// The 'industry' field can be used to determine which fields are relevant for a particular document.

const FieldOperationsSchema = new Schema({
    industry: {
        type: String,
        enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
        required: true,
        index: true
    },
    operationName: {
        type: String,
        required: true
    },
    operationDetails: {
        type: String,
        required: true
    },
    // Industry-specific fields
    securityDetails: {
        type: String,
        required: false
    },
    healthcareDetails: {
        type: String,
        required: false
    },
    cleaningDetails: {
        type: String,
        required: false
    },
    constructionDetails: {
        type: String,
        required: false
    },
    deliveryDetails: {
        type: String,
        required: false
    },
    hospitalityDetails: {
        type: String,
        required: false
    },
    retailDetails: {
        type: String,
        required: false
    },
    manufacturingDetails: {
        type: String,
        required: false
    },
    // Audit trails
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Soft deletes
    deleted: {
        type: Boolean,
        default: false
    }
});

// Update the 'updated_at' field whenever the document is updated
FieldOperationsSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Handle errors
FieldOperationsSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('There was a duplicate key error'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model('FieldOperation', FieldOperationsSchema);
```