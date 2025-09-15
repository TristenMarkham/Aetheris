```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/reports')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        {/* Replace with your own KPIs */}
        <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>KPI 1</Card.Title>
            <Card.Text>
              {data.kpi1}
            </Card.Text>
          </Card.Body>
        </Card>
        {/* ... */}
      </div>

      <div className="charts">
        <LineChart width={500} height={300} data={data.chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </div>

      <div className="recent-activity">
        <Table striped bordered hover>
          <thead>
            <tr>
              {/* Replace with your own table headers */}
              <th>#</th>
              <th>Header 1</th>
              <th>Header 2</th>
              {/* ... */}
            </tr>
          </thead>
          <tbody>
            {data.activities.map((activity, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{activity.field1}</td>
                <td>{activity.field2}</td>
                {/* ... */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="quick-actions">
        <Button variant="primary">Action 1</Button>
        <Button variant="secondary">Action 2</Button>
        {/* ... */}
      </div>
    </div>
  );
};

export default Dashboard;
```

This is a basic example of a dashboard component in React. It fetches data from an API endpoint (`/api/reports`), displays loading and error states, and renders KPI cards, a line chart, a recent activity table, and quick action buttons.

You'll need to replace the placeholders with your own data and elements. You might also want to add more functionality, such as search and filter capabilities, real-time data updates, export functionality, and mobile-responsive design.