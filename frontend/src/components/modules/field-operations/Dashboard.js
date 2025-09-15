```jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/field-operations')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/field-operations')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleExport = () => {
    // Implement export functionality
  };

  const filteredData = data.filter(item =>
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
            {/* Implement KPI cards */}
          </div>
          <div className="charts">
            <LineChart width={500} height={300} data={filteredData}>
              <Line type="monotone" dataKey="uv" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </div>
          <div className="actions">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Refresh</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
          </div>
          <div className="search">
            <Input.Search
              placeholder="Search"
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
          </div>
          <div className="table">
            <Table dataSource={filteredData} /* Implement columns */ />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
```
This is a basic implementation of a dashboard component using React and Ant Design. You would need to replace the placeholder comments with your actual implementation. For example, you would need to implement the KPI cards, the columns for the table, and the export functionality. You would also need to replace the API endpoint with your actual endpoint. The data is filtered based on the search input. The charts are drawn using Recharts. The data is refreshed when the refresh button is clicked. The export button is a placeholder and does not actually export the data. The component handles loading states and errors. It is also responsive.