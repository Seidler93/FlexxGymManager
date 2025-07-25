import '../pages/MemberAccountPage.css'
import { useState } from 'react';
import PauseMembershipModal from './PauseMembershipModal';
import { pauseMembership } from '../utils/firestoreHelpers';
import { toast } from 'react-toastify';
import { cancelMember } from '../utils/firestoreHelpers';

export default function MembershipInfoSection({ member }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [memberInfo, setMemberInfo] = useState(member)
  
  const membershipData = [
    { label: 'Start Date', value: member.startDate },
    { label: 'Days Per Week', value: member.daysPerWeek },
    { label: 'Payment Frequency', value: member.paymentOption },
    { label: 'Price Point', value: member.pricePoint },
    { label: 'Referral Member', value: member.referralMember || '' },
  ];

  const handleAction = (action) => {
    setShowDropdown(false);
    console.log(`Selected action: ${action}`);

    if (action === 'pause') {
      setShowPauseModal(true);
    }
    // Add handling logic here based on the selected action
  };

  const handleCancel = async () => {
    console.log(member);
    
    try {
      await cancelMember(member, {
        nextContactDate: '2025-08-15',
        returnDate: null,
        notes: 'Cancelling due to moving out of town.'
      });
      console.log('Member successfully cancelled.');
    } catch (error) {
      console.error('Error cancelling member:', error);
    }
  };


  return (
    <div className="info-section">
      <div className="section-header">
        <h3>Membership Info</h3>
        <div className="dropdown-container">
          <button onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
          {showDropdown && (
            <ul className="dropdown-menu">
              <li onClick={() => handleAction('pause')}>Pause Membership</li>
              <li onClick={handleCancel}>Cancel Membership</li>
              {/* <li onClick={handleCancel}>Change Membership</li> */}
            </ul>
          )}
        </div>
      </div>
      <div className="info-grid">
        {membershipData.map((item, idx) => (
          <div key={idx} className="info-field">
            <label>{item.label}</label>
            <p>{item.value || '-'}</p>
          </div>
        ))}
      </div>

      <PauseMembershipModal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onSubmit={async ({ startDate, returnDate, notes, nextContactDate }) => {
          try {
            const start = new Date(startDate);
            const end = returnDate ? new Date(returnDate) : null;
            const nextContact = nextContactDate ? new Date(nextContactDate) : null;

            await pauseMembership(member.id, start, end, notes, nextContact);
            toast.success('Membership paused successfully!');
          } catch (err) {
            console.error(err);
            toast.error('Failed to pause membership.');
          } finally {
            setShowPauseModal(false); // ensure modal closes after operation
          }
        }}
      />
    </div>
  );
}
