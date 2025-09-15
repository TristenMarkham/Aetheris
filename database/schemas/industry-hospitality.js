```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reservation Management Schema
const ReservationSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  status: { type: String, enum: ['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'], required: true }
});
ReservationSchema.index({ guest: 1, room: 1, checkInDate: 1, checkOutDate: 1 });

// Housekeeping Scheduling Schema
const HousekeepingSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true },
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], required: true }
});
HousekeepingSchema.index({ room: 1, date: 1 });

// Guest Services Schema
const GuestServiceSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Requested', 'Completed', 'Cancelled'], required: true }
});
GuestServiceSchema.index({ guest: 1, service: 1, date: 1 });

// Maintenance Tracking Schema
const MaintenanceSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  issue: { type: String, required: true },
  reportedDate: { type: Date, required: true },
  resolvedDate: { type: Date },
  status: { type: String, enum: ['Reported', 'Resolved', 'In-Progress'], required: true }
});
MaintenanceSchema.index({ room: 1, issue: 1, reportedDate: 1 });

// Compliance Requirements
const ComplianceSchema = new Schema({
  type: { type: String, enum: ['Health Permit', 'Safety Inspection', 'Staff Certification'], required: true },
  dateIssued: { type: Date, required: true },
  dateExpires: { type: Date, required: true },
  status: { type: String, enum: ['Valid', 'Expired'], required: true }
});
ComplianceSchema.index({ type: 1, dateIssued: 1, dateExpires: 1 });

mongoose.model('Reservation', ReservationSchema);
mongoose.model('Housekeeping', HousekeepingSchema);
mongoose.model('GuestService', GuestServiceSchema);
mongoose.model('Maintenance', MaintenanceSchema);
mongoose.model('Compliance', ComplianceSchema);
```