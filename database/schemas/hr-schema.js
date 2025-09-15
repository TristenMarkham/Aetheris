```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Audit trail schema
const auditTrailSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Employee schema
const employeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  industry: { type: String, required: true },
  position: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  // Industry-specific fields
  securityClearanceLevel: { type: Number, required: function() { return this.industry === 'security'; } },
  medicalLicenseNumber: { type: String, required: function() { return this.industry === 'healthcare'; } },
  constructionCertifications: { type: [String], required: function() { return this.industry === 'construction'; } },
  // Audit trail
  auditTrail: auditTrailSchema
});

// Department schema
const departmentSchema = new Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  employees: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  isDeleted: { type: Boolean, default: false },
  // Audit trail
  auditTrail: auditTrailSchema
});

// Indexes for faster queries
employeeSchema.index({ email: 1, industry: 1 });
departmentSchema.index({ name: 1, industry: 1 });

// Update the updated_at field on save
employeeSchema.pre('save', function(next) {
  this.auditTrail.updated_at = Date.now();
  next();
});

departmentSchema.pre('save', function(next) {
  this.auditTrail.updated_at = Date.now();
  next();
});

// Soft delete functionality
employeeSchema.query.softDelete = function() {
  return this.update({ isDeleted: true });
};

departmentSchema.query.softDelete = function() {
  return this.update({ isDeleted: true });
};

// Create the models
const Employee = mongoose.model('Employee', employeeSchema);
const Department = mongoose.model('Department', departmentSchema);

module.exports = { Employee, Department };

// This schema adapts to different industries by having a field for each industry-specific attribute.
// These fields are only required if the industry of the employee matches the industry for which the field is relevant.
// This allows us to have a flexible schema that can accommodate any number of industries with their own unique data requirements.
```