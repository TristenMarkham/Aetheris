```jsx
import React, { useState, useEffect } from 'react';
import { useTable, usePagination, useSortBy, useFilters, useGlobalFilter, useRowSelect, useBlockLayout, useResizeColumns } from 'react-table';
import { useExportData } from 'react-table-plugins';
import { Input, Button } from 'reactstrap';
import { CSVLink } from "react-csv";
import { GlobalFilter, DefaultColumnFilter, SelectColumnFilter } from './Filters';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { Styles, Table, Pagination, Header } from './Styles';

const TrainingTable = ({ columns, data }) => {
    const defaultColumn = React.useMemo(
        () => ({
            Filter: DefaultColumnFilter,
            minWidth: 30,
            width: 150,
            maxWidth: 400
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state,
        selectedFlatRows,
        allColumns,
        getToggleHideAllColumnsProps,
        exportData,
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        useBlockLayout,
        useResizeColumns,
        useExportData
    );

    const { pageIndex, pageSize, globalFilter } = state;

    const [exportCSV, setExportCSV] = useState([]);

    useEffect(() => {
        setExportCSV(selectedFlatRows.map(row => row.original));
    }, [selectedFlatRows]);

    return (
        <Styles>
            <Table {...getTableProps()}>
                <Header>
                    <tr>
                        <th>
                            <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} /> Select All
                        </th>
                        {allColumns.map(column => (
                            <th key={column.id}>
                                <div>
                                    <IndeterminateCheckbox {...column.getToggleHiddenProps()} />{' '}
                                    {column.Header}
                                </div>
                            </th>
                        ))}
                    </tr>
                </Header>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            <th>
                                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                            </th>
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
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                <td>
                                    <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                                </td>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            <Pagination>
                <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</Button>
                <Button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</Button>
                <Button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</Button>
                <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</Button>
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
                <span>
                    | Go to page:{' '}
                    <Input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            gotoPage(page);
                        }}
                        style={{ width: '100px' }}
                    />
                </span>
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </Pagination>
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button onClick={() => exportData('csv')}>Export All As CSV</Button>
            <Button onClick={() => exportData('xlsx')}>Export All As Excel</Button>
            <Button onClick={() => window.print()}>Print</Button>
            <CSVLink data={exportCSV} filename={"trainings.csv"}>Export Selected As CSV</CSVLink>
        </Styles>
    );
};

export default TrainingTable;
```

Please note that this code assumes you have the necessary styling and helper components (`Filters`, `IndeterminateCheckbox`, `Styles`) in place. It also assumes you're using `reactstrap` for UI components and `react-table-plugins` for exporting data. If not, you'll need to adjust the code accordingly.