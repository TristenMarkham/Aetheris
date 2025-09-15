```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  industry: { type: String, required: true, enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const IndustrySchema = new Schema({
  industry: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const MobileAppSchema = new Schema({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  industry: { type: Schema.Types.ObjectId, ref: 'Industry', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// This schema can be adapted to different industries by enabling/disabling industry-specific fields.
// For example, a field can be added to the UserSchema or MobileAppSchema that is specific to the 'healthcare' industry.
// This field can be enabled/disabled based on the 'industry' field of the User or MobileApp document.

UserSchema.index({ username: 1, industry: 1 }, { unique: true });
IndustrySchema.index({ industry: 1 }, { unique: true });
MobileAppSchema.index({ name: 1, user: 1, industry: 1 }, { unique: true });

mongoose.model('User', UserSchema);
mongoose.model('Industry', IndustrySchema);
mongoose.model('MobileApp', MobileAppSchema);
```