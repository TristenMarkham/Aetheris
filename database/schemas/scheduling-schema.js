```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  role: { type: String, required: true },
  industry: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Task Schema
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date, required: true },
  status: { type: String, required: true },
  industrySpecificFields: { type: Schema.Types.Mixed }, // This field can be used to store industry-specific data
  deleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Audit Schema
const AuditSchema = new Schema({
  action: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
});

// Indexing
UserSchema.index({ username: 1 });
TaskSchema.index({ title: 1, assignedTo: 1, status: 1 });

// Model
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);
const Audit = mongoose.model('Audit', AuditSchema);

module.exports = { User, Task, Audit };

// This schema is designed to be flexible and adaptable to different industries. 
// The "industry" field in the User schema can be used to differentiate users from different industries. 
// The "industrySpecificFields" field in the Task schema is a Mixed type, which means it can store any type of data. 
// This can be used to store any industry-specific data that needs to be associated with a task.
```
