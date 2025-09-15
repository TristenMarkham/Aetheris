```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Route Optimization Schema
const RouteSchema = new Schema({
  routeId: { type: Number, required: true, unique: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  stops: { type: [String], required: true },
  optimizedRoute: { type: [String], required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
});

// Package Tracking Schema
const PackageSchema = new Schema({
  packageId: { type: Number, required: true, unique: true },
  currentLocation: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, required: true, enum: ['In Transit', 'Delivered', 'Delayed', 'Lost'] },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
});

// Driver Management Schema
const DriverSchema = new Schema({
  driverId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseExpiry: { type: Date, required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
});

// Vehicle Maintenance Schema
const VehicleSchema = new Schema({
  vehicleId: { type: Number, required: true, unique: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  lastInspectionDate: { type: Date, required: true },
  nextInspectionDate: { type: Date, required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
});

// Indexes for optimization
RouteSchema.index({ routeId: 1, driverId: 1 });
PackageSchema.index({ packageId: 1, routeId: 1 });
DriverSchema.index({ driverId: 1, licenseNumber: 1, vehicleId: 1 });
VehicleSchema.index({ vehicleId: 1, driverId: 1 });

// Models
const Route = mongoose.model('Route', RouteSchema);
const Package = mongoose.model('Package', PackageSchema);
const Driver = mongoose.model('Driver', DriverSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = { Route, Package, Driver, Vehicle };
```