import '../pages/MemberAccountPage.css'

export default function BillingSummary() {
  const memberPlan = {
    name: '2x/week',
    used: 6,
    totalSessions: 12,
    cost: 199,
    nextReset: 'July 15, 2025',
    lastUpdated: 'Updated 2 hours ago',
    benefits: [
      '12 sessions per month (plus buffer)',
      'Unlimited coach access',
      'Free class check-ins',
    ],
  };

  const usagePercent = (memberPlan.used / memberPlan.totalSessions) * 100;

  return (
    <div className="billing-container">
      <div className="billing-card unified horizontal">
        <div className="card-section left">
          <div className="billing-overview-header">
            <h3>Membership Details</h3>
            <button className="change-plan-btn">Edit</button>
          </div>

          <div className="billing-plan-grid">
            <div>
              <div className="label">Plan</div>
              <div className="value">{memberPlan.name}</div>
            </div>
            <div>
              <div className="label">Cost</div>
              <div className="value">${memberPlan.cost}/month</div>
            </div>
          </div>
        </div>

        <div className="card-section right">
          <h4>Payment Method</h4>
          <div className="payment-method">
            <img src="/Visa_Brandmark_Blue_RGB_2021.png" alt="Visa" style={{ width: 40 }} />
            <p>**** 4242<br /> Exp 02/26</p>
          </div>
          <button className="change-plan-btn">Change</button>
        </div>
      </div>
    </div>
  );
}
