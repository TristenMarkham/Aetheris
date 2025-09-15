```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const BillingDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/billing')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching data');
        setLoading(false);
      });
  }, []);

  const exportData = () => {
    // Implement export functionality here
  };

  const handleSearch = (event) => {
    // Implement search functionality here
  };

  const handleFilter = (event) => {
    // Implement filter functionality here
  };

  return (
    <div className="billing-dashboard">
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className="kpi-cards">
            {/* Replace with your own KPIs */}
            <Card>
              <Card.Body>
                <Card.Title>Total Revenue</Card.Title>
                <Card.Text>{data.totalRevenue}</Card.Text>
              </Card.Body>
            </Card>
            {/* More KPI cards... */}
          </div>

          <div className="charts">
            <Bar data={data.chartData} />
            {/* More charts... */}
          </div>

          <div className="recent-activity">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.map((activity, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{activity.date}</td>
                    <td>{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="actions">
            <Button onClick={handleFilter}>Filter</Button>
            <Button onClick={handleSearch}>Search</Button>
            <Button onClick={exportData}>Export</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingDashboard;
```

This is a basic example and doesn't include all the features you requested. For example, real-time data updates could be implemented using WebSockets or Server-Sent Events, but that would require a backend that supports it. Similarly, the filter, search, and export functionality would also depend on your backend.

Also, note that this example uses Bootstrap for styling and react-chartjs-2 for charts. You would need to install these libraries and include the Bootstrap CSS in your project.

Finally, this example assumes that you have an endpoint (/api/billing) that returns the data in the required format. You would need to replace this with your actual API endpoint.