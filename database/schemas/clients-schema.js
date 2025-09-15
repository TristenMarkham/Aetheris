```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Client Schema
const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true,
        enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
        index: true
    },
    industrySpecificFields: {
        type: Schema.Types.Mixed // This field can store any type of data, so it can be adapted for any industry
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // This will automatically add createdAt and updatedAt fields
});

// Before saving the client, check if the industry specific fields are valid for the given industry
ClientSchema.pre('save', function(next) {
    // Add your own validation logic here
    // If the validation fails, call next with an error
    // If the validation succeeds, call next with no arguments
    next();
});

// Add a method to soft delete the client
ClientSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

// Export the Client model
module.exports = mongoose.model('Client', ClientSchema);
```

This schema can be adapted to different industries by using the `industry` field to store the industry of the client, and the `industrySpecificFields` field to store any data that is specific to that industry. The `industrySpecificFields` field is of type `Mixed`, which means it can store any type of data. This makes it flexible enough to handle the different requirements of different industries. The `pre('save')` middleware can be used to add custom validation logic for the `industrySpecificFields` based on the `industry`.