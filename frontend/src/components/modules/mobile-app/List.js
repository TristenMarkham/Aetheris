```jsx
import React, { useState } from 'react';
import { Table, Input, Button, Space, Pagination } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { CSVLink } from "react-csv";

const MobileAppTable = ({ data }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  let searchInput;

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { searchInput = node; }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      ...getColumnSearchProps('version'),
    },
    // Add more columns as needed
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onShowSizeChange = (current, pageSize) => {
    setItemsPerPage(pageSize);
    setCurrentPage(current);
  };

  const onPageChange = (page, pageSize) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }}>
        Delete
      </Button>
      <CSVLink data={data} filename={"mobile-apps.csv"}>
        <Button type="primary" style={{ marginBottom: 16 }}>
          Export to CSV
        </Button>
      </CSVLink>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 240 }}
      />
      <Pagination
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={1}
        total={data.length}
        onChange={onPageChange}
        current={currentPage}
      />
    </div>
  );
};

export default MobileAppTable;
```

This is a basic implementation using Ant Design's Table and Pagination components, react-csv for CSV export, and react-highlight-words for search highlighting. You would need to implement the delete functionality, and add more columns as needed. Also, this code assumes that the data prop is an array of objects, where each object represents a mobile app record. For virtualization, you could use react-window or react-virtualized. For inline editing, you could use Ant Design's editable cell feature. For print functionality, you could use window.print(). For column customization, you could use Ant Design's column settings feature. For responsive design, you could use Ant Design's responsive grid system.