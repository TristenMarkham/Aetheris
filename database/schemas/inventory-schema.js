```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Audit trail schema
const auditTrailSchema = new Schema({
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

// Inventory schema
const inventorySchema = new Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    industry: { type: String, required: true, enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'], index: true },
    industry_specific_fields: { type: Schema.Types.Mixed }, // This field can store any industry-specific data. The application should handle enabling/disabling these fields based on the industry.
    audit_trail: auditTrailSchema,
    is_deleted: { type: Boolean, default: false },
});

// Add a hook to update the updated_at field automatically
inventorySchema.pre('save', function (next) {
    this.audit_trail.updated_at = new Date();
    next();
});

// Add a method to perform soft delete
inventorySchema.methods.softDelete = function () {
    this.is_deleted = true;
    return this.save();
};

// The Inventory model can be used across multiple industries by changing the industry field. 
// The industry_specific_fields can store any additional data required for a particular industry. 
// The application should handle the logic of what fields to enable/disable based on the industry.

module.exports = mongoose.model('Inventory', inventorySchema);
```
This schema is designed to be flexible and adapt to different industries. The 'industry' field determines the industry the inventory item belongs to. The 'industry_specific_fields' is a Mixed type field that can store any additional data required for a particular industry. This allows the schema to be used across multiple industries with different requirements. The application should handle the logic of what fields to enable/disable based on the industry. The schema also includes audit trails and soft deletes capability, making it suitable for a production environment.