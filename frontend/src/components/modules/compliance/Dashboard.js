```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/compliance');
        setData(response.data);
        setError(null);
      } catch (error) {
        setError('Something went wrong');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleExport = () => {
    // Implement export functionality here
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : (
        <>
          <div className="kpi-cards">
            {/* Implement KPI cards here */}
          </div>
          <div className="charts">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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
          <div className="actions">
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              Export
            </Button>
          </div>
          <div className="table">
            <Input.Search
              placeholder="Search by name"
              onSearch={handleSearch}
              style={{ width: 200, margin: '0 10px' }}
            />
            <Table dataSource={filteredData} /* columns={columns} */ rowKey="id" />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
```

This is a basic implementation of a dashboard component for a "compliance" module. It uses the Ant Design library for UI components and Recharts for the line chart. The data is fetched from a hypothetical "/api/compliance" endpoint using Axios. The dashboard includes a search input that filters the data in real-time. The export functionality is left as a placeholder for you to implement based on your specific requirements.

Please replace the `/* columns={columns} */` comment with your actual columns configuration for the Ant Design Table component. Similarly, replace the `/* Implement KPI cards here */` comment with your actual KPI cards.

This component is mobile-responsive as long as it's used within a responsive layout. It has loading states and error handling for the data fetching. It does not include real-time data updates, as that would require a different approach (like WebSockets or Server-Sent Events), which is beyond the scope of this example.