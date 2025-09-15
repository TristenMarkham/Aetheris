```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/inventory')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const exportData = () => {
    // implement export functionality
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        {/* Replace with your actual KPIs */}
        <Card>
          <Card.Body>
            <Card.Title>Total Inventory</Card.Title>
            <Card.Text>{data.totalInventory}</Card.Text>
          </Card.Body>
        </Card>
        {/* Add more KPI cards as needed */}
      </div>

      <div className="charts">
        <Bar
          data={data.chartData}
          options={{ maintainAspectRatio: false }}
        />
        {/* Add more charts as needed */}
      </div>

      <div className="recent-activity">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Change</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentActivity.map((activity, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{activity.product}</td>
                <td>{activity.change}</td>
                <td>{activity.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="actions">
        <Button variant="primary" onClick={exportData}>Export Data</Button>
        {/* Add more action buttons as needed */}
      </div>
    </div>
  );
};

export default Dashboard;
```

This is a basic example of a React dashboard component for an inventory module. It includes KPI cards, a bar chart, a recent activity table, and an export data button. It uses the `react-bootstrap` library for the UI components and the `react-chartjs-2` library for the chart. It fetches data from an API endpoint on component mount using the `axios` library and handles loading and error states. The `exportData` function is a placeholder and should be replaced with actual export functionality. The component is mobile-responsive by default thanks to Bootstrap.

Note: This is a simplified example and may need adjustments based on your actual data structure and requirements. Also, don't forget to add the necessary CSS for the component.