```javascript
const config = {
    industry: "Hospitality",
    specializations: [
        "reservation-management",
        "housekeeping-scheduling",
        "guest-services",
        "maintenance-tracking"
    ],
    compliance: [
        "health-permits",
        "safety-inspections",
        "staff-certifications"
    ],
    modules: {
        reservationManagement: {
            enabled: true,
            fields: {
                reservationId: 'string',
                guestName: 'string',
                checkInDate: 'date',
                checkOutDate: 'date',
                roomNumber: 'number'
            }
        },
        housekeepingScheduling: {
            enabled: true,
            fields: {
                scheduleId: 'string',
                roomNumber: 'number',
                housekeeperName: 'string',
                scheduledTime: 'date'
            }
        },
        guestServices: {
            enabled: true,
            fields: {
                serviceId: 'string',
                guestName: 'string',
                serviceType: 'string',
                serviceTime: 'date'
            }
        },
        maintenanceTracking: {
            enabled: true,
            fields: {
                maintenanceId: 'string',
                roomNumber: 'number',
                issueDescription: 'string',
                reportedTime: 'date',
                resolvedTime: 'date'
            }
        }
    },
    complianceRules: {
        healthPermits: {
            required: true,
            fields: {
                permitId: 'string',
                issueDate: 'date',
                expiryDate: 'date'
            }
        },
        safetyInspections: {
            required: true,
            fields: {
                inspectionId: 'string',
                inspectionDate: 'date',
                result: 'string'
            }
        },
        staffCertifications: {
            required: true,
            fields: {
                certificationId: 'string',
                staffName: 'string',
                certificationType: 'string',
                issueDate: 'date',
                expiryDate: 'date'
            }
        }
    },
    workflowDefinitions: {
        checkIn: ['reservationManagement', 'guestServices'],
        checkOut: ['reservationManagement', 'housekeepingScheduling', 'maintenanceTracking']
    },
    defaultSettings: {
        reservationManagement: {
            autoConfirm: true
        },
        housekeepingScheduling: {
            autoAssign: true
        }
    },
    integrationConfigurations: {
        paymentGateway: {
            provider: 'stripe',
            apiKey: 'your-api-key'
        },
        emailService: {
            provider: 'sendgrid',
            apiKey: 'your-api-key'
        }
    },
    reportingTemplates: {
        dailyOccupancy: 'dailyOccupancyTemplate',
        monthlyRevenue: 'monthlyRevenueTemplate'
    },
    mobileAppConfigurations: {
        pushNotifications: true,
        locationServices: true
    }
};

module.exports = config;
```