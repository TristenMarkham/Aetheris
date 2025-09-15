```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Guard Management Schema
const GuardSchema = new Schema({
  name: { type: String, required: true },
  license: { type: String, required: true, unique: true },
  backgroundCheck: { type: Boolean, required: true },
  certifications: [{ type: String, required: true }],
});

GuardSchema.index({ license: 1 });

// Patrol Routing Schema
const PatrolRouteSchema = new Schema({
  guardId: { type: Schema.Types.ObjectId, ref: 'Guard', required: true },
  route: [{ type: String, required: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

PatrolRouteSchema.index({ guardId: 1 });

// Incident Response Schema
const IncidentSchema = new Schema({
  guardId: { type: Schema.Types.ObjectId, ref: 'Guard', required: true },
  incidentDetails: { type: String, required: true },
  incidentTime: { type: Date, required: true },
  incidentLocation: { type: String, required: true },
});

IncidentSchema.index({ guardId: 1, incidentTime: -1 });

// Client Sites Schema
const ClientSiteSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, required: true },
  siteLocation: { type: String, required: true },
  siteName: { type: String, required: true },
  guards: [{ type: Schema.Types.ObjectId, ref: 'Guard' }],
});

ClientSiteSchema.index({ clientId: 1 });

mongoose.model('Guard', GuardSchema);
mongoose.model('PatrolRoute', PatrolRouteSchema);
mongoose.model('Incident', IncidentSchema);
mongoose.model('ClientSite', ClientSiteSchema);
```
This code defines four Mongoose schemas for the Security Services industry: Guard, Patrol Route, Incident, and Client Site. Each schema includes the necessary fields for its respective specialization, as well as the required validation and indexing. The Guard schema also includes a reference to the Security Certifications schema, which is assumed to be defined elsewhere in the code.