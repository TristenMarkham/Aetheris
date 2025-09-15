```javascript
const config = {
  industry: "Construction",
  specializations: ["project-management", "equipment-tracking", "safety-compliance", "material-ordering"],
  compliance: ["osha-safety", "contractor-licensing", "equipment-certifications"],
  modules: {
    projectManagement: {
      enabled: true,
      fields: {
        projectTitle: 'string',
        projectDescription: 'string',
        startDate: 'date',
        endDate: 'date',
        budget: 'number',
        contractors: 'array',
        materials: 'array'
      }
    },
    equipmentTracking: {
      enabled: true,
      fields: {
        equipmentName: 'string',
        equipmentId: 'string',
        location: 'string',
        status: 'string',
        lastMaintenanceDate: 'date',
        nextMaintenanceDate: 'date'
      }
    },
    safetyCompliance: {
      enabled: true,
      rules: {
        oshaSafety: {
          enabled: true,
          complianceCheckFrequency: 'weekly'
        },
        contractorLicensing: {
          enabled: true,
          licenseVerificationFrequency: 'monthly'
        },
        equipmentCertifications: {
          enabled: true,
          certificationVerificationFrequency: 'annually'
        }
      }
    },
    materialOrdering: {
      enabled: true,
      fields: {
        materialName: 'string',
        materialId: 'string',
        quantity: 'number',
        orderDate: 'date',
        deliveryDate: 'date'
      }
    }
  },
  workflow: {
    stages: ['planning', 'execution', 'monitoring', 'closing'],
    defaultStage: 'planning'
  },
  settings: {
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en'
  },
  templates: {
    projectReport: {
      title: 'Project Report',
      fields: ['projectTitle', 'startDate', 'endDate', 'budget', 'status']
    },
    equipmentReport: {
      title: 'Equipment Report',
      fields: ['equipmentName', 'location', 'status', 'lastMaintenanceDate', 'nextMaintenanceDate']
    }
  },
  integrations: {
    googleMaps: {
      enabled: true,
      apiKey: 'YOUR_API_KEY'
    },
    quickBooks: {
      enabled: true,
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET'
    }
  },
  mobileApp: {
    enabled: true,
    pushNotifications: true,
    locationTracking: true
  }
};

module.exports = config;
```