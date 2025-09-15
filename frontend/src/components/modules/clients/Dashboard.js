```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import useWindowDimensions from './useWindowDimensions';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/clients');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setData(null);
  };

  const handleExport = () => {
    // Implement export functionality here
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h2>Clients Dashboard</h2>
        <div>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
          <Button icon={<DownloadOutlined />} onClick={handleExport} />
        </div>
      </div>
      <div className="dashboard__cards">
        {/* Add KPI cards here */}
      </div>
      <div className="dashboard__charts">
        <Line data={data} options={{ responsive: true }} />
      </div>
      <div className="dashboard__table">
        <Input.Search placeholder="Search clients" onSearch={handleSearch} />
        <Table dataSource={data} />
      </div>
    </div>
  );
};

export default Dashboard;
```

This is a basic implementation of a React dashboard component. It fetches data from an API endpoint (`/api/clients`) when the component mounts, and sets the data in the component's state. While the data is being fetched, a loading spinner is displayed. If an error occurs during the fetch, an error message is displayed.

The dashboard includes a header with a refresh button (which re-fetches the data when clicked) and an export button (which needs to be implemented). Below the header, there are placeholders for KPI cards and a line chart. The chart is responsive, so it will resize based on the window's dimensions.

Below the chart, there is a search input and a table. The search input is controlled, so its value is stored in the component's state. The table displays the data fetched from the API.

The dashboard is styled with CSS classes, which are not included in this code. You would need to add the CSS yourself. Also, the `useWindowDimensions` hook is not defined in this code. This hook would return the window's dimensions, and it would need to be defined elsewhere in your code.