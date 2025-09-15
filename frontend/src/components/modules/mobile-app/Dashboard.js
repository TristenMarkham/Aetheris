```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('https://api.example.com/mobile-app/data')
            .then(response => response.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.toString());
                setLoading(false);
            });
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    }

    const exportData = () => {
        // Implement export functionality
    }

    const refreshData = () => {
        // Implement refresh functionality
    }

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message={error} type="error" />;
    }

    return (
        <div className="dashboard">
            <div className="kpi-cards">
                {/* Add KPI cards */}
            </div>
            <div className="charts">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="recent-activity">
                <Table dataSource={data}>
                    {/* Add table columns */}
                </Table>
            </div>
            <div className="actions">
                <Button icon={<DownloadOutlined />} onClick={exportData}>Export</Button>
                <Button icon={<ReloadOutlined />} onClick={refreshData}>Refresh</Button>
            </div>
            <div className="filter-search">
                <Input.Search placeholder="Search..." onSearch={handleSearch} />
            </div>
        </div>
    );
}

export default Dashboard;
```

This is a basic example of a React dashboard component for a "mobile-app" module. It includes a line chart, a table for recent activity, and buttons for exporting and refreshing data. It also includes a search input for filtering data. The component fetches data from an API and handles loading and error states. Please replace the API URL, table columns, and other placeholders with your actual data and requirements. You may also need to add styles and adjust the layout according to your design.