```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Audit trail schema
const auditTrailSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Soft delete schema
const softDeleteSchema = new Schema({
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date },
  deleted_by: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Billing schema
const billingSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoice_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
  total_amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paid_date: { type: Date },
  industry: {
    type: String,
    enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
    required: true,
  },
  industry_specific_fields: { type: Schema.Types.Mixed },
  audit_trail: auditTrailSchema,
  soft_delete: softDeleteSchema,
});

// Indexing
billingSchema.index({ customer: 1, invoice_date: -1 });

// Pre-save hook to update timestamps
billingSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.audit_trail.updated_at = new Date();
  }
  next();
});

// Soft delete method
billingSchema.methods.softDelete = function (userId) {
  this.soft_delete.is_deleted = true;
  this.soft_delete.deleted_at = new Date();
  this.soft_delete.deleted_by = userId;
};

// This schema can be adapted to different industries by changing the 'industry' field and adding industry-specific fields to 'industry_specific_fields'.
// The 'industry_specific_fields' field is a mixed type, which can store any valid BSON data type.

module.exports = mongoose.model('Billing', billingSchema);
```
This schema includes all the necessary fields for a billing module and can be easily adapted to different industries. The 'industry' field is used to specify the industry, and industry-specific fields can be added to the 'industry_specific_fields' field. The schema also includes audit trails and soft delete functionality. The 'audit_trail' field tracks when the document was created and last updated, and by whom. The 'soft_delete' field is used to mark a document as deleted without actually removing it from the database.