```javascript
const mongoose = require('mongoose');

// Store Operations Schema
const StoreOperationsSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Store'
  },
  operationName: {
    type: String,
    required: true
  },
  operationDescription: {
    type: String,
    required: true
  },
  operationDate: {
    type: Date,
    default: Date.now
  }
});

// Inventory Management Schema
const InventoryManagementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Staff Scheduling Schema
const StaffSchedulingSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Staff'
  },
  shiftStart: {
    type: Date,
    required: true
  },
  shiftEnd: {
    type: Date,
    required: true
  },
  shiftDate: {
    type: Date,
    required: true
  }
});

// Loss Prevention Schema
const LossPreventionSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Incident'
  },
  incidentDescription: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date,
    default: Date.now
  }
});

// Export the schemas
module.exports = {
  StoreOperations: mongoose.model('StoreOperations', StoreOperationsSchema),
  InventoryManagement: mongoose.model('InventoryManagement', InventoryManagementSchema),
  StaffScheduling: mongoose.model('StaffScheduling', StaffSchedulingSchema),
  LossPrevention: mongoose.model('LossPrevention', LossPreventionSchema)
};
```