import BillingSummary from './BillingSummary';
import InvoiceTable from './InvoiceTable';
import '../pages/MemberAccountPage.css'

export default function BillingTab() {
  return (
    <div className="billing-tab">
      <BillingSummary />
      <InvoiceTable />
    </div>
  );
}
