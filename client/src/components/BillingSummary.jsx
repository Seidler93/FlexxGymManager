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
    <>
      <div className="billing-overview-card">
        <div className="billing-overview-header">
          <div>
            <h3>Membership details</h3>
          </div>
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

        <div className="usage-section">
          <div className="usage-header">
            <div className="label">Plan usage</div>
            <div className="meta">{memberPlan.lastUpdated}</div>
          </div>

          <div className="usage-labels">
            <span className="dot blue"></span> {memberPlan.used} Sessions Used
          </div>

          <div className="usage-bar">
            <div className="used" style={{ width: `${usagePercent}%` }} />
          </div>
          <div className="usage-meta">{memberPlan.used} / {memberPlan.totalSessions}</div>
        </div>
      </div>
      <div className="billing-card">
        <h4>Payment Method</h4>
        <div className="payment-method">
          <img src="/visa-logo.png" alt="Visa" style={{ width: 40 }} />
          <p>**** 4242<br /> Exp 02/26</p>
        </div>
        <button>Change</button>
      </div>  
    </>
  );
}
