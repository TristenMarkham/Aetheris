```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Route Optimization Schema
const RouteSchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  location: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});
mongoose.model('Route', RouteSchema);

// Supply Tracking Schema
const SupplySchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  supplyName: { type: String, required: true },
  quantity: { type: Number, required: true },
});
mongoose.model('Supply', SupplySchema);

// Quality Checklist Schema
const QualityChecklistSchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  checklist: { type: [String], required: true },
  completed: { type: Boolean, default: false },
});
mongoose.model('QualityChecklist', QualityChecklistSchema);

// Client Feedback Schema
const FeedbackSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
});
mongoose.model('Feedback', FeedbackSchema);

// Safety Protocols Schema
const SafetyProtocolSchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  protocolName: { type: String, required: true },
  description: { type: String, required: true },
  isFollowed: { type: Boolean, default: false },
});
mongoose.model('SafetyProtocol', SafetyProtocolSchema);

// Chemical Handling Schema
const ChemicalHandlingSchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  chemicalName: { type: String, required: true },
  safetyMeasures: { type: String, required: true },
});
mongoose.model('ChemicalHandling', ChemicalHandlingSchema);

// Insurance Tracking Schema
const InsuranceSchema = new Schema({
  cleanerId: { type: Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  insuranceProvider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});
mongoose.model('Insurance', InsuranceSchema);
```