```javascript
const config = {
  industry: "Security Services",
  specializations: ["guard-management", "patrol-routing", "incident-response", "client-sites"],
  compliance: ["licensing", "background-checks", "security-certifications"],
  modules: {
    guardManagement: {
      enabled: true,
      features: ["schedule", "attendance", "performance"]
    },
    patrolRouting: {
      enabled: true,
      features: ["route-optimization", "real-time-tracking"]
    },
    incidentResponse: {
      enabled: true,
      features: ["incident-reporting", "emergency-communication"]
    },
    clientSites: {
      enabled: true,
      features: ["site-management", "client-communication"]
    }
  },
  fields: {
    guard: {
      name: "string",
      license: "string",
      backgroundCheck: "boolean",
      certifications: "array"
    },
    incident: {
      type: "string",
      location: "string",
      time: "date",
      response: "string"
    },
    client: {
      name: "string",
      sites: "array",
      contact: "string"
    }
  },
  complianceRules: {
    licenseCheck: {
      type: "guard",
      field: "license",
      rule: "required"
    },
    backgroundCheck: {
      type: "guard",
      field: "backgroundCheck",
      rule: "required"
    },
    certificationCheck: {
      type: "guard",
      field: "certifications",
      rule: "atLeastOne"
    }
  },
  workflows: {
    incidentResponse: {
      steps: ["report", "assign", "respond", "resolve"]
    },
    guardOnboarding: {
      steps: ["apply", "backgroundCheck", "training", "certification", "onboard"]
    }
  },
  defaults: {
    guardShift: "8 hours",
    patrolRoute: "optimized",
    incidentPriority: "medium"
  },
  integrations: {
    payroll: {
      provider: "payrollProvider",
      config: {}
    },
    gps: {
      provider: "gpsProvider",
      config: {}
    }
  },
  reports: {
    dailyActivity: {
      template: "dailyActivityTemplate",
      schedule: "daily"
    },
    incidentSummary: {
      template: "incidentSummaryTemplate",
      schedule: "weekly"
    }
  },
  mobileApp: {
    enabled: true,
    features: ["check-in", "incident-reporting", "route-navigation"]
  }
};

module.exports = config;
```