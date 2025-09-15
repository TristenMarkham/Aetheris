```jsx
import React, { useState } from 'react';
import { useTable, usePagination, useSortBy, useFilters, useGlobalFilter, useRowSelect } from 'react-table';
import { CSVLink } from "react-csv";
import { useExportData } from "react-table-plugins";
import { ExportToCsv, ExportToXlsx } from "react-table-plugins";
import { Input, Button, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const InventoryTable = ({ columns, data }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        nextPage,
        previousPage,
        state: { pageIndex, pageSize },
        setGlobalFilter,
        selectedFlatRows,
        exportData,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                {
                    id: 'selection',
                    Header: ({ getToggleAllRowsSelectedProps }) => <Checkbox {...getToggleAllRowsSelectedProps()} />,
                    Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />
                },
                ...columns,
            ])
        }
    )

    const [searchInput, setSearchInput] = useState('');

    const handleSearch = e => {
        const value = e.target.value || undefined;
        setGlobalFilter(value);
        setSearchInput(value);
    };

    return (
        <>
            <Button onClick={() => exportData("csv")}>Export to CSV</Button>
            <Button onClick={() => exportData("xlsx")}>Export to XLSX</Button>
            <Button onClick={() => window.print()}>Print</Button>
            <Input 
                value={searchInput}
                onChange={handleSearch} 
                placeholder="Search..." 
                style={{ width: 200, margin: '0 10px' }} 
                prefix={<SearchOutlined />}
            />
            <table {...getTableProps()} style={{ width: '100%', margin: '20px 0' }}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>{' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
            </div>
        </>
    )
}

export default InventoryTable;
```

This is a basic implementation of the requirements using react-table and antd for UI components. You would need to pass the columns and data as props to the InventoryTable component. This example uses Ant Design for the UI components and react-table for handling the table logic. This code includes pagination, sorting, filtering, global search, row selection with checkboxes, and export to CSV/XLSX functionality. The print functionality uses the browser's print function. The table is responsive by default. For inline editing, you would need to handle that in the cell rendering based on your specific data structure.