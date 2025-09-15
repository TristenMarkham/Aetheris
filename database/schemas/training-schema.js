```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Define the Training Schema
const TrainingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    // Industry-specific fields
    security: { type: Boolean, default: false },
    healthcare: { type: Boolean, default: false },
    cleaning: { type: Boolean, default: false },
    construction: { type: Boolean, default: false },
    delivery: { type: Boolean, default: false },
    hospitality: { type: Boolean, default: false },
    retail: { type: Boolean, default: false },
    manufacturing: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Add indexing
TrainingSchema.index({ title: 1, industry: 1 });

// Soft delete function
TrainingSchema.methods.softdelete = function(callback) {
    this.isDeleted = true;
    this.save(callback);
};

// Define the Training User Schema
const TrainingUserSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    training: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Export the Schemas
module.exports = {
    User: mongoose.model('User', UserSchema),
    Training: mongoose.model('Training', TrainingSchema),
    TrainingUser: mongoose.model('TrainingUser', TrainingUserSchema)
};

/* 
This schema can adapt to different industries by enabling/disabling the industry-specific fields in the Training schema. 
For example, if a training is specific to the healthcare industry, the 'healthcare' field would be set to true, and all other industry fields would be set to false. 
This allows for flexibility and customization based on the specific needs of each industry.
*/
```