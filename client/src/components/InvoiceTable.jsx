import '../pages/MemberAccountPage.css'

const fakeInvoices = [
  { number: '#012', month: 'Jun 2025', date: 'June 1, 2025', status: 'Paid', amount: '$199', plan: 'Standard' },
  { number: '#011', month: 'May 2025', date: 'May 1, 2025', status: 'Paid', amount: '$199', plan: 'Standard' },
  { number: '#010', month: 'Apr 2025', date: 'Apr 1, 2025', status: 'Unpaid', amount: '$199', plan: 'Standard' },
];

export default function InvoiceTable() {
  return (
    <div className="invoice-table-container">
      <h4>Invoices</h4>
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
    </div>
  );
}
