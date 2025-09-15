```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Spin, Alert } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import './QualityAssuranceDashboard.css';

const QualityAssuranceDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get('https://api.example.com/quality-assurance');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message="An error occurred while fetching data" type="error" />
      ) : (
        <>
          <div className="kpi-cards">
            {/* Add KPIs cards here */}
          </div>
          <div className="actions">
            <Button icon={<DownloadOutlined />} onClick={() => {}}>
              Export Data
            </Button>
            <Button icon={<ReloadOutlined />} onClick={getData}>
              Refresh Data
            </Button>
          </div>
          <Input.Search
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
            style={{ width: 200, marginBottom: '20px' }}
          />
          <LineChart
            width={500}
            height={300}
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
          <Table dataSource={filteredData} rowKey="id">
            {/* Add table columns here */}
          </Table>
        </>
      )}
    </div>
  );
};

export default QualityAssuranceDashboard;
```

Please note that this is a basic template for a dashboard component. You would need to replace the placeholders with actual KPIs, table columns, and API endpoints. Also, the CSS styles are not included in this code. You would need to create a CSS file named 'QualityAssuranceDashboard.css' and import it in this component.