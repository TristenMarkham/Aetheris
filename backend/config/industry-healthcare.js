```javascript
const config = {
    industry: "Healthcare Services",
    specializations: ["patient-care", "medical-scheduling", "hipaa-compliance", "equipment-tracking"],
    compliance: ["hipaa", "medical-licensing", "safety-protocols"],
    modules: {
        patientCare: {
            enabled: true,
            fields: ["patientId", "patientName", "patientHistory", "currentMedication", "allergies"],
        },
        medicalScheduling: {
            enabled: true,
            fields: ["appointmentId", "patientId", "doctorId", "appointmentDate", "appointmentTime"],
        },
        hipaaCompliance: {
            enabled: true,
            rules: ["encryptPHI", "limitAccess", "auditLog", "backup"],
        },
        equipmentTracking: {
            enabled: true,
            fields: ["equipmentId", "equipmentName", "location", "status"],
        },
    },
    workflow: {
        patientAdmission: {
            steps: ["registration", "medicalHistory", "physicalExamination", "diagnosis", "treatmentPlan"],
        },
        appointmentScheduling: {
            steps: ["patientIdentification", "appointmentRequest", "scheduleAppointment", "appointmentConfirmation"],
        },
    },
    defaultSettings: {
        timezone: "America/New_York",
        currency: "USD",
        language: "en-US",
    },
    integrations: {
        billing: {
            enabled: true,
            apiEndpoint: "https://api.billing.example.com",
        },
        lab: {
            enabled: true,
            apiEndpoint: "https://api.lab.example.com",
        },
    },
    reporting: {
        templates: ["patientReport", "appointmentReport", "equipmentReport", "complianceReport"],
    },
    mobileApp: {
        enabled: true,
        features: ["appointmentScheduling", "patientRecords", "notifications"],
    },
};

module.exports = config;
```