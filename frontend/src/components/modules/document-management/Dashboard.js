```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/documents');
      setData(response.data);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Last Modified', dataIndex: 'lastModified', key: 'lastModified' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
  ];

  return (
    <div className="dashboard">
      <div className="kpi-cards">
        <Card title="Total Documents" loading={loading}>
          {data.length}
        </Card>
        {/* Add more KPI cards as needed */}
      </div>

      <div className="charts">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="size" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="actions">
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Refresh
        </Button>
        <Button icon={<DownloadOutlined />}>Export</Button>
      </div>

      <Input.Search
        placeholder="Search documents"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <Spin />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : (
        <Table dataSource={filteredData} columns={columns} rowKey="id" />
      )}
    </div>
  );
};

export default Dashboard;
```

This is a simplified example and might need adjustments based on your actual data structure and requirements. You might also need to handle the export functionality based on your backend capabilities. This example uses Ant Design for UI components and axios for HTTP requests.