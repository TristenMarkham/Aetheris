```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  industry: {
    type: String,
    enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
    required: true,
    index: true
  },
  industrySpecificFields: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Enable soft delete
ReportSchema.pre('find', function() {
  this.where({ deletedAt: { $exists: false } });
});

// Enable industry-specific fields
ReportSchema.pre('save', function(next) {
  if (this.isNew) {
    this.industrySpecificFields = getIndustrySpecificFields(this.industry);
  }
  next();
});

// Add relationships
const UserSchema = new Schema({
  // ... your user schema fields here ...
  reports: [{
    type: Schema.Types.ObjectId,
    ref: 'Report'
  }]
});

// Add proper error handling and validation
ReportSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next(error);
  }
});

const Report = mongoose.model('Report', ReportSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Report, User };

// This schema can adapt to different industries by using the 'industry' field to determine the industry type,
// and the 'industrySpecificFields' field to store any fields that are specific to that industry.
// The 'industrySpecificFields' field is a mixed type, which means it can store any type of data.
// This allows for great flexibility in what can be stored in this field, making it easy to adapt to different industries.
```
