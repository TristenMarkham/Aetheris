```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditTrailSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const timeTrackingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  industry: { type: String, required: true, enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  industrySpecificFields: { type: Schema.Types.Mixed },
  auditTrail: auditTrailSchema,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

timeTrackingSchema.index({ user: 1, industry: 1, startTime: 1, endTime: 1 });

// This schema can be adapted to different industries by using the "industry" field to determine the industry type,
// and the "industrySpecificFields" field to store any additional data that is specific to that industry.
// The "isDeleted" field is used for soft deletes, where the record is not actually removed from the database but is instead marked as deleted.

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  auditTrail: auditTrailSchema,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.index({ email: 1 });

const TimeTracking = mongoose.model('TimeTracking', timeTrackingSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { TimeTracking, User };
```