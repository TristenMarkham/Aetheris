```javascript
const config = {
    industry: "Manufacturing",
    specializations: ["production-scheduling", "quality-control", "equipment-maintenance", "safety-monitoring"],
    compliance: ["osha-safety", "quality-standards", "environmental-regulations"],
    modules: {
        productionScheduling: {
            enabled: true,
            defaultSettings: {
                // Default settings for production scheduling module
            }
        },
        qualityControl: {
            enabled: true,
            defaultSettings: {
                // Default settings for quality control module
            }
        },
        equipmentMaintenance: {
            enabled: true,
            defaultSettings: {
                // Default settings for equipment maintenance module
            }
        },
        safetyMonitoring: {
            enabled: true,
            defaultSettings: {
                // Default settings for safety monitoring module
            }
        }
    },
    fieldDefinitions: {
        // Industry-specific field definitions
    },
    complianceRules: {
        oshaSafety: {
            // Compliance rule configurations for OSHA safety
        },
        qualityStandards: {
            // Compliance rule configurations for quality standards
        },
        environmentalRegulations: {
            // Compliance rule configurations for environmental regulations
        }
    },
    workflowDefinitions: {
        // Workflow definitions
    },
    defaultSettings: {
        // Default settings
    },
    templates: {
        // Default templates
    },
    integrations: {
        // Integration configurations
    },
    reportingTemplates: {
        // Reporting templates
    },
    mobileApp: {
        // Mobile app configurations
    }
};

module.exports = config;
```