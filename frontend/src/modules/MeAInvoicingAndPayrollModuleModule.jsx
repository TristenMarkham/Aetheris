```jsx
import React, { useState } from 'react';

const InvoicingAndPayrollModule = () => {
  const [invoices, setInvoices] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const handleGenerateInvoice = () => {
    // Logic to generate invoice
    const newInvoice = {
      id: invoices.length + 1,
      date: new Date().toLocaleDateString(),
      amount: Math.floor(Math.random() * 1000) + 500,
      client: 'Client Name'
    };
    setInvoices([...invoices, newInvoice]);
  };

  const handleGeneratePayroll = () => {
    // Logic to generate payroll
    const newPayroll = {
      id: payroll.length + 1,
      date: new Date().toLocaleDateString(),
      amount: Math.floor(Math.random() * 2000) + 1000,
      guard: 'Guard Name'
    };
    setPayroll([...payroll, newPayroll]);
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '5px' }}>
      <h2>Invoicing and Payroll Module</h2>
      <button onClick={handleGenerateInvoice}>Generate Invoice</button>
      <button onClick={handleGeneratePayroll}>Generate Payroll</button>

      <div>
        <h3>Invoices</h3>
        <ul>
          {invoices.map(invoice => (
            <li key={invoice.id}>
              <strong>Date:</strong> {invoice.date} | <strong>Amount:</strong> ${invoice.amount} | <strong>Client:</strong> {invoice.client}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Payroll</h3>
        <ul>
          {payroll.map(payroll => (
            <li key={payroll.id}>
              <strong>Date:</strong> {payroll.date} | <strong>Amount:</strong> ${payroll.amount} | <strong>Guard:</strong> {payroll.guard}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InvoicingAndPayrollModule;
```