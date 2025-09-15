```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Audit trail schema
const AuditTrailSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Communication schema
const CommunicationSchema = new Schema({
  industry: { type: String, required: true, enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'] },
  message: { type: String, required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  is_deleted: { type: Boolean, default: false },
  audit_trail: AuditTrailSchema,
  industry_specific_fields: Schema.Types.Mixed, // This field can store any type of data, so it can be adapted to any industry
}, {
  timestamps: true, // This will automatically add createdAt and updatedAt fields
});

// Indexing
CommunicationSchema.index({ industry: 1, receiver: 1, sender: 1 });

// Before save hook to update the updatedAt field
CommunicationSchema.pre('save', function (next) {
  this.audit_trail.updated_at = Date.now();
  next();
});

// Soft delete function
CommunicationSchema.methods.softDelete = function () {
  this.is_deleted = true;
  return this.save();
};

// This model can be used across multiple industries by changing the 'industry' field.
// The 'industry_specific_fields' field can store any type of data, so it can be adapted to any industry.
// The 'audit_trail' field stores information about when and by whom the document was created or updated.
// The 'is_deleted' field is used for soft deletes.

module.exports = mongoose.model('Communication', CommunicationSchema);
```