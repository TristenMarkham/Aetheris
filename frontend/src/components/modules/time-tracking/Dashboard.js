```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/time-tracking');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implement export functionality
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        {/* Implement KPI Cards */}
      </div>
      <div className="actions">
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Refresh
        </Button>
        <Button icon={<DownloadOutlined />} onClick={exportData}>
          Export
        </Button>
      </div>
      <Input.Search
        placeholder="Search..."
        onChange={e => setSearch(e.target.value)}
      />
      <div className="charts">
        <Line data={data} />
        {/* Implement more charts */}
      </div>
      <Table dataSource={filteredData} /* Implement columns */ />
    </div>
  );
};

export default Dashboard;
```

This is a basic implementation of a React dashboard component for a time-tracking module. It fetches data from an API endpoint, displays loading and error states, and provides search and export functionalities.

Note that this is a simplified example. In a real-world application, you would need to implement the KPI cards, table columns, chart data, and export functionality according to your specific requirements. You would also need to handle API errors more gracefully and possibly add pagination or infinite scrolling for the table if dealing with a large amount of data.

This component uses Ant Design for the UI components, axios for making HTTP requests, and react-chartjs-2 for the charts. You would need to install these libraries and import the necessary CSS styles.