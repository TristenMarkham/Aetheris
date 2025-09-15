```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/schedule');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
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
        <Card>
          <Card.Body>
            <Card.Title>Total Schedules</Card.Title>
            <Card.Text>{data.totalSchedules}</Card.Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Card.Title>Completed Schedules</Card.Title>
            <Card.Text>{data.completedSchedules}</Card.Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Card.Title>Upcoming Schedules</Card.Title>
            <Card.Text>{data.upcomingSchedules}</Card.Text>
          </Card.Body>
        </Card>
      </div>
      <div className="chart">
        <LineChart width={500} height={300} data={data.chartData}>
          <Line type="monotone" dataKey="uv" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </div>
      <div className="recent-activity">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Activity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentActivity.map((activity, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{activity.name}</td>
                <td>{activity.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="actions">
        <Button variant="primary">Add New Schedule</Button>
        <Button variant="secondary">Export Data</Button>
      </div>
    </div>
  );
};

export default Dashboard;
```

This is a basic example of a scheduling module dashboard using React. It fetches data from an API endpoint and displays it in various ways. It includes loading and error states. The data includes key performance indicators (KPIs), a line chart, a recent activity table, and action buttons. The dashboard is designed to be responsive for mobile devices. Please note that the actual layout and styling would depend on your CSS, which is not included in this example.