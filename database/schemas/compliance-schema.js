```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// This schema can be adapted to different industries by enabling/disabling the industry-specific fields.
// The 'industry' field determines which industry the compliance document belongs to.
// The industry-specific fields are 'security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'.
// Each of these fields is an object that can contain any number of industry-specific subfields.

const ComplianceSchema = new Schema({
  industry: {
    type: String,
    required: true,
    enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
    index: true
  },
  security: {
    type: Schema.Types.Mixed,
    default: null
  },
  healthcare: {
    type: Schema.Types.Mixed,
    default: null
  },
  cleaning: {
    type: Schema.Types.Mixed,
    default: null
  },
  construction: {
    type: Schema.Types.Mixed,
    default: null
  },
  delivery: {
    type: Schema.Types.Mixed,
    default: null
  },
  hospitality: {
    type: Schema.Types.Mixed,
    default: null
  },
  retail: {
    type: Schema.Types.Mixed,
    default: null
  },
  manufacturing: {
    type: Schema.Types.Mixed,
    default: null
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
    ref: 'User',
    required: true
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Compliance', ComplianceSchema);
```

This schema is designed to be flexible and adaptable to different industries. The industry-specific fields are represented as `Schema.Types.Mixed`, which allows for any type of data. This means that you can customize the data structure for each industry as needed. The `isDeleted` field allows for soft deletes, and the `createdBy` and `updatedBy` fields provide an audit trail. The `timestamps` option automatically adds `created_at` and `updated_at` fields.