import { useState } from 'react';
import '../pages/MemberAccountPage.css';

const fakeInvoices = [
  { number: '#012', month: 'Jun 2025', date: 'June 1, 2025', status: 'Paid', amount: '$199', plan: 'Standard' },
  { number: '#011', month: 'May 2025', date: 'May 1, 2025', status: 'Paid', amount: '$199', plan: 'Standard' },
  { number: '#010', month: 'Apr 2025', date: 'Apr 1, 2025', status: 'Unpaid', amount: '$199', plan: 'Standard' },
];

const futureCharges = [
  { id: 1, month: 'Aug 2025', date: 'August 1, 2025', status: 'Scheduled', amount: '$199', plan: 'Standard' },
  { id: 2, month: 'Sep 2025', date: 'September 1, 2025', status: 'Scheduled', amount: '$199', plan: 'Standard' },
  { id: 3, month: 'Oct 2025', date: 'October 1, 2025', status: 'Scheduled', amount: '$199', plan: 'Standard' },
  { id: 4, month: 'Nov 2025', date: 'November 1, 2025', status: 'Scheduled', amount: '$199', plan: 'Standard' },
  { id: 5, month: 'Dec 2025', date: 'December 1, 2025', status: 'Scheduled', amount: '$199', plan: 'Standard' },
];

export default function InvoiceTable() {
  const [view, setView] = useState('history');

  const handleEdit = (id) => {
    alert(`Open edit modal for charge ID: ${id}`);
    // Hook this to your edit modal logic
  };

  return (
    <div className="invoice-table-container">
      {/* Toggle View Selector */}
      <div className="billing-toggle">
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
          Purchase History
        </button>
        <button className={view === 'future' ? 'active' : ''} onClick={() => setView('future')}>
          Future Billing
        </button>
      </div>

      {view === 'history' ? (
        <>
          {/* <h4>Invoices</h4> */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {fakeInvoices.map((inv, i) => (
                <tr key={i}>
                  <td>Invoice {inv.number} – {inv.month}</td>
                  <td>{inv.date}</td>
                  <td>
                    <span className={`pill ${inv.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>{inv.amount}</td>
                  <td>{inv.plan}</td>
                  <td><a href="#">Download</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          {/* <h4>Next Charges</h4> */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Charge</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {futureCharges.map(charge => (
                <tr key={charge.id}>
                  <td>Charge – {charge.month}</td>
                  <td>{charge.date}</td>
                  <td>
                    <span className="pill scheduled">
                      {charge.status}
                    </span>
                  </td>
                  <td>{charge.amount}</td>
                  <td>{charge.plan}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(charge.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
