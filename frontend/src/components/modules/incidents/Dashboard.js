```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
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
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.incidents.com');
      setData(response.data);
      setError(null);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implement export functionality
  };

  const filteredData = data.filter((incident) =>
    incident.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div className="dashboard">
      <div className="actions">
        <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
          Refresh
        </Button>
        <Button icon={<DownloadOutlined />} onClick={exportData}>
          Export
        </Button>
      </div>
      <Input.Search
        placeholder="Search incidents"
        onChange={(e) => setSearch(e.target.value)}
      />
      {error ? (
        <Alert message={error} type="error" />
      ) : loading ? (
        <Spin size="large" />
      ) : (
        <>
          <div className="cards">
            <Card title="Total Incidents" bordered={false}>
              {data.length}
            </Card>
            <Card title="Open Incidents" bordered={false}>
              {data.filter((incident) => incident.status === 'open').length}
            </Card>
            <Card title="Closed Incidents" bordered={false}>
              {data.filter((incident) => incident.status === 'closed').length}
            </Card>
          </div>
          <LineChart width={600} height={300} data={data}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
          <Table dataSource={filteredData} columns={columns} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
```

This is a basic implementation of a dashboard component for an "incidents" module. It uses the Ant Design library for UI components and axios for making API requests. The data is fetched from a hypothetical API endpoint ('https://api.incidents.com') and stored in the component's state using the useState and useEffect hooks.

The dashboard includes KPI cards, a line chart, a table of recent incidents, and action buttons for refreshing the data and exporting it. The table data can be filtered using the search input. The component also handles loading states and displays an error message if the data fetch fails.

Please replace the API endpoint and adjust the data processing according to your actual data structure. The export functionality is also left to be implemented according to your requirements.