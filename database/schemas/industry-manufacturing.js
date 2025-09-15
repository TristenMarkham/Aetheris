```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Production Scheduling Schema
const ProductionSchedulingSchema = new Schema({
  productionId: {
    type: Schema.Types.ObjectId,
    ref: 'Production',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    required: true
  }
});
mongoose.model('ProductionScheduling', ProductionSchedulingSchema);

// Quality Control Schema
const QualityControlSchema = new Schema({
  productionId: {
    type: Schema.Types.ObjectId,
    ref: 'Production',
    required: true
  },
  qualityStandards: {
    type: String,
    required: true
  },
  qualityCheckDate: {
    type: Date,
    required: true
  },
  qualityStatus: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  }
});
mongoose.model('QualityControl', QualityControlSchema);

// Equipment Maintenance Schema
const EquipmentMaintenanceSchema = new Schema({
  equipmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  maintenanceDate: {
    type: Date,
    required: true
  },
  maintenanceStatus: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    required: true
  }
});
mongoose.model('EquipmentMaintenance', EquipmentMaintenanceSchema);

// Safety Monitoring Schema
const SafetyMonitoringSchema = new Schema({
  areaId: {
    type: Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  safetyCheckDate: {
    type: Date,
    required: true
  },
  oshaSafetyStatus: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  },
  environmentalRegulationsStatus: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  }
});
mongoose.model('SafetyMonitoring', SafetyMonitoringSchema);
```