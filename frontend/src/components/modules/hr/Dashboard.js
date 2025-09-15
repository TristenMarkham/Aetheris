```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import './HRDashboard.css';

const HRDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/hr')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    axios.get('/api/hr')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredData = data.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div className="hr-dashboard">
      <div className="kpi-cards">
        {/* Add your KPI cards here */}
      </div>
      <div className="charts">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid stroke="#f5f5f5" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" yAxisId={0} />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" yAxisId={1} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="actions">
        <Button icon={<DownloadOutlined />} onClick={() => {}}>Export</Button>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Refresh</Button>
      </div>
      <Input.Search placeholder="Search..." onChange={handleSearch} />
      <Table dataSource={filteredData} columns={[
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        // Add more columns as needed
      ]} />
    </div>
  );
};

export default HRDashboard;
```

This is a basic structure of a HR Dashboard component in React. You need to replace the placeholders with actual data and components based on your requirements. This component uses `axios` for data fetching, `antd` for UI components, and `recharts` for charts. You need to install these libraries using npm or yarn.

Please note that this is a very basic example. In a real-world application, you would need to handle more cases and structure your code differently. Also, the API endpoint '/api/hr' is just a placeholder. Replace it with your actual API endpoint.