Here is a JavaScript configuration object for the "Retail Operations" industry adaptation:

```javascript
const retailOperationsConfig = {
    industry: "Retail Operations",
    specializations: ["store-operations", "inventory-management", "staff-scheduling", "loss-prevention"],
    compliance: ["retail-regulations", "safety-compliance", "employment-law"],
    modules: {
        storeOperations: {
            enabled: true,
            features: ["inventory-tracking", "sales-reporting", "customer-service"]
        },
        inventoryManagement: {
            enabled: true,
            features: ["stock-control", "supplier-management", "product-catalog"]
        },
        staffScheduling: {
            enabled: true,
            features: ["shift-planning", "time-tracking", "payroll-integration"]
        },
        lossPrevention: {
            enabled: true,
            features: ["security-monitoring", "fraud-detection", "incident-reporting"]
        }
    },
    fields: {
        product: {
            sku: "string",
            name: "string",
            category: "string",
            price: "number",
            stockLevel: "number"
        },
        employee: {
            id: "string",
            name: "string",
            role: "string",
            schedule: "object"
        }
    },
    complianceRules: {
        retailRegulations: {
            returnPolicy: "string",
            priceTagging: "boolean",
            productSafety: "boolean"
        },
        safetyCompliance: {
            emergencyProcedures: "boolean",
            equipmentInspections: "boolean"
        },
        employmentLaw: {
            minimumWage: "number",
            overtimeRules: "string"
        }
    },
    workflows: {
        orderProcessing: ["order-received", "inventory-check", "payment-processing", "shipment"],
        customerService: ["inquiry-received", "issue-identification", "resolution", "follow-up"]
    },
    defaultSettings: {
        storeHours: "9am-9pm",
        returnPolicy: "30 days",
        employeeDiscount: "10%"
    },
    integrations: {
        paymentGateway: "stripe",
        payrollSystem: "paychex",
        inventorySystem: "zoho"
    },
    reportingTemplates: ["sales-report", "inventory-report", "employee-performance-report"],
    mobileApp: {
        enabled: true,
        features: ["barcode-scanning", "mobile-checkout", "employee-communication"]
    }
};
```

This configuration object includes all the requested settings and configurations for the "Retail Operations" industry adaptation. It can be easily modified to fit the specific needs of your organization.