```jsx
import React from 'react';

// Guard Management Component
export class GuardManagement extends React.Component {
  render() {
    return (
      <div>
        <h2>Guard Management</h2>
        {/* Insert your guard management related code here */}
      </div>
    );
  }
}

// Patrol Routing Component
export class PatrolRouting extends React.Component {
  render() {
    return (
      <div>
        <h2>Patrol Routing</h2>
        {/* Insert your patrol routing related code here */}
      </div>
    );
  }
}

// Incident Response Component
export class IncidentResponse extends React.Component {
  render() {
    return (
      <div>
        <h2>Incident Response</h2>
        {/* Insert your incident response related code here */}
      </div>
    );
  }
}

// Client Sites Component
export class ClientSites extends React.Component {
  render() {
    return (
      <div>
        <h2>Client Sites</h2>
        {/* Insert your client sites related code here */}
      </div>
    );
  }
}
```

This is a basic structure for the components. You would need to add your own logic and UI elements to these components to make them functional. Also, don't forget to import these components wherever you want to use them.

Note: This code assumes that you are using a version of React that supports ES6 class components. If you're using a version of React that only supports functional components, you'll need to rewrite these components as functions.