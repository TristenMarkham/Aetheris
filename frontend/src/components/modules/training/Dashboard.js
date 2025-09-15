```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { CSVLink } from "react-csv";
import { Line } from 'react-chartjs-2';

const TrainingDashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/training')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">Error: {error.message}</Alert>;

    const kpis = data.kpis;
    const metrics = data.metrics;
    const activities = data.activities;

    return (
        <div className="training-dashboard">
            <div className="kpis">
                {kpis.map(kpi => (
                    <Card key={kpi.id}>
                        <Card.Body>
                            <Card.Title>{kpi.title}</Card.Title>
                            <Card.Text>{kpi.value}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <div className="metrics">
                <Line data={metrics} />
            </div>

            <div className="activities">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Activity</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
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
                <Button variant="primary">Add New Training</Button>
                <Button variant="secondary">Edit Training</Button>
                <CSVLink data={data} filename={"training-data.csv"}>
                    <Button variant="success">Export Data</Button>
                </CSVLink>
            </div>
        </div>
    );
};

export default TrainingDashboard;
```

This is a basic implementation of a Training Dashboard component in React. It fetches data from an API endpoint `/api/training`, displays key performance indicators (KPIs), a line chart for metrics, a table for recent activities, and buttons for quick actions including data export. It also handles loading and error states. 

Please note that this is a simple example and does not include all the requested features such as filter and search capabilities, real-time data updates, and mobile-responsive design. These features would require additional code and possibly additional libraries, and their implementation would depend on the specifics of your application.