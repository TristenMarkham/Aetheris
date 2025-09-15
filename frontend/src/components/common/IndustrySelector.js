```jsx
import React, { useState } from 'react';

const industries = [
  { value: 'security', label: 'Security Services' },
  { value: 'healthcare', label: 'Healthcare Services' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'construction', label: 'Construction' },
  { value: 'delivery', label: 'Delivery & Logistics' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail Operations' },
  { value: 'manufacturing', label: 'Manufacturing' },
];

const IndustryConfig = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [features, setFeatures] = useState({});
  const [compliance, setCompliance] = useState({});
  const [modules, setModules] = useState({});

  const handleIndustryChange = (e) => {
    setSelectedIndustry(e.target.value);
  };

  const handleFeatureToggle = (feature) => {
    setFeatures({ ...features, [feature]: !features[feature] });
  };

  const handleComplianceChange = (compliance) => {
    setCompliance({ ...compliance, [compliance]: !compliance[compliance] });
  };

  const handleModuleConfig = (module, config) => {
    setModules({ ...modules, [module]: config });
  };

  const handleSave = () => {
    // Save configuration
  };

  return (
    <div className="industry-config">
      <select onChange={handleIndustryChange}>
        {industries.map((industry) => (
          <option key={industry.value} value={industry.value}>
            {industry.label}
          </option>
        ))}
      </select>

      {/* Feature toggles */}
      {/* Compliance selection */}
      {/* Module configuration */}
      {/* Preview of enabled features */}
      {/* Save/apply configuration */}
      {/* Industry-specific branding/theming */}
    </div>
  );
};

export default IndustryConfig;
```

This is a basic setup for the component. The actual implementation of feature toggles, compliance selection, module configuration, preview of enabled features, save/apply configuration, and industry-specific branding/theming would depend on the specific requirements and available data.