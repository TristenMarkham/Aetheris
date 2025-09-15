```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// The Document schema can be adapted to different industries by enabling/disabling industry-specific fields.
// For example, the "securityClearance" field might only be relevant for the security industry, 
// while the "medicalRecord" field might only be relevant for the healthcare industry.
// These fields can be enabled/disabled based on the industry type.
const DocumentSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
    enum: ['security', 'healthcare', 'cleaning', 'construction', 'delivery', 'hospitality', 'retail', 'manufacturing'],
    index: true,
  },
  securityClearance: {
    type: String,
    required: false,
  },
  medicalRecord: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// The User schema is used to track who created and updated documents.
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// The DocumentUser schema is used to establish a many-to-many relationship between documents and users.
// This is useful for industries like security and healthcare where multiple users might need access to a single document.
const DocumentUserSchema = new Schema({
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

mongoose.model('Document', DocumentSchema);
mongoose.model('User', UserSchema);
mongoose.model('DocumentUser', DocumentUserSchema);
```