```javascript
const config = {
  industry: "Cleaning Services",
  specializations: [
    "route-optimization",
    "supply-tracking",
    "quality-checklists",
    "client-feedback"
  ],
  compliance: [
    "safety-protocols",
    "chemical-handling",
    "insurance-tracking"
  ],
  modules: {
    routeOptimization: {
      enabled: true,
      settings: {
        optimizationAlgorithm: "shortestPath",
        defaultStartingPoint: "HQ"
      }
    },
    supplyTracking: {
      enabled: true,
      settings: {
        defaultSupplier: "Main Supplier",
        reorderThreshold: 10
      }
    },
    qualityChecklists: {
      enabled: true,
      templates: {
        defaultChecklist: ["Task 1", "Task 2", "Task 3"]
      }
    },
    clientFeedback: {
      enabled: true,
      settings: {
        feedbackForm: "defaultForm"
      }
    }
  },
  complianceRules: {
    safetyProtocols: {
      enabled: true,
      rules: ["Rule 1", "Rule 2", "Rule 3"]
    },
    chemicalHandling: {
      enabled: true,
      rules: ["Rule 1", "Rule 2", "Rule 3"]
    },
    insuranceTracking: {
      enabled: true,
      settings: {
        insuranceProvider: "Main Provider"
      }
    }
  },
  workflowDefinitions: {
    cleaningService: {
      steps: ["Step 1", "Step 2", "Step 3"]
    }
  },
  defaultSettings: {
    language: "en",
    timezone: "GMT"
  },
  integrations: {
    googleMaps: {
      enabled: true,
      apiKey: "YOUR_API_KEY"
    }
  },
  reportingTemplates: {
    dailyReport: {
      enabled: true,
      fields: ["Field 1", "Field 2", "Field 3"]
    }
  },
  mobileApp: {
    enabled: true,
    settings: {
      defaultView: "Dashboard"
    }
  }
};

module.exports = config;
```