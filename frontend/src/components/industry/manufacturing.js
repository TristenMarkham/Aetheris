Sure, here are some basic examples of React components for the manufacturing industry. Please note that these are very basic components and you would need to expand them according to your needs.

```jsx
// ProductionScheduling.js
import React from 'react';

export const ProductionScheduling = () => {
    return (
        <div>
            <h1>Production Scheduling</h1>
            {/* Add your production scheduling logic here */}
        </div>
    );
};

// QualityControl.js
import React from 'react';

export const QualityControl = () => {
    return (
        <div>
            <h1>Quality Control</h1>
            {/* Add your quality control logic here */}
        </div>
    );
};

// EquipmentMaintenance.js
import React from 'react';

export const EquipmentMaintenance = () => {
    return (
        <div>
            <h1>Equipment Maintenance</h1>
            {/* Add your equipment maintenance logic here */}
        </div>
    );
};

// SafetyMonitoring.js
import React from 'react';

export const SafetyMonitoring = () => {
    return (
        <div>
            <h1>Safety Monitoring</h1>
            {/* Add your safety monitoring logic here */}
        </div>
    );
};
```

These components can be imported and used in your main application like so:

```jsx
import React from 'react';
import { ProductionScheduling, QualityControl, EquipmentMaintenance, SafetyMonitoring } from './YourComponentDirectory';

const App = () => {
    return (
        <div>
            <ProductionScheduling />
            <QualityControl />
            <EquipmentMaintenance />
            <SafetyMonitoring />
        </div>
    );
};

export default App;
```

Please note that these components are just placeholders and you would need to add your own logic and UI elements to these components to make them functional. Also, you would need to replace 'YourComponentDirectory' with the actual path where you store these components.