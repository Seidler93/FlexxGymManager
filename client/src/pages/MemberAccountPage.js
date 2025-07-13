import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileCard from '../components/ProfileCard';
import EditModal from '../components/EditModal';
import MemberInfo from '../components/MemberInfo.jsx';
import BillingTab from '../components/BillingTab.jsx';
import MemberSchedule from '../components/MemberSchedule.jsx';
import './MemberAccountPage.js'
import { getDocumentById } from '../utils/firestoreHelpers.js';

export default function MemberAccountPage() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSectionData, setEditSectionData] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  // Fake data for now
  const mockSessions = [
    // July 2025 (future)
    { date: '2025-07-01', time: '9:00 AM' },
    { date: '2025-07-03', time: '6:00 PM' },
    { date: '2025-07-05', time: '7:30 AM' },
    { date: '2025-07-08', time: '5:00 PM' },
    { date: '2025-07-10', time: '10:00 AM' },
    { date: '2025-07-12', time: '6:00 PM' },
    { date: '2025-07-15', time: '8:30 AM' },
    { date: '2025-07-17', time: '5:30 PM' },
    { date: '2025-07-20', time: '9:00 AM' },
    { date: '2025-07-22', time: '4:00 PM' },
    { date: '2025-07-25', time: '6:00 PM' },
    { date: '2025-07-27', time: '7:00 AM' },
    { date: '2025-07-30', time: '5:45 PM' },

    // August 2025 (future)
    { date: '2025-08-01', time: '8:00 AM' },
    { date: '2025-08-03', time: '9:15 AM' },
    { date: '2025-08-06', time: '6:45 PM' },
    { date: '2025-08-08', time: '7:00 AM' },
    { date: '2025-08-10', time: '4:00 PM' },
    { date: '2025-08-13', time: '5:30 PM' },
    { date: '2025-08-15', time: '6:00 PM' },

    // May–June 2025 (past)
    { date: '2025-05-01', time: '9:00 AM' },
    { date: '2025-05-04', time: '6:00 PM' },
    { date: '2025-05-10', time: '10:30 AM' },
    { date: '2025-05-15', time: '5:30 PM' },
    { date: '2025-05-20', time: '8:00 AM' },
    { date: '2025-06-01', time: '10:00 AM' },
    { date: '2025-06-05', time: '4:00 PM' },
    { date: '2025-06-10', time: '5:30 PM' },
    { date: '2025-06-15', time: '7:00 AM' },
    { date: '2025-06-20', time: '6:00 PM' },
  ];
  

  useEffect(() => {
      const fetchMember = async () => {
        try {
          const data = await getDocumentById('members', memberId);
          if (data) {
            setMember(data);
          }
        } catch (error) {
          console.error('Error loading member:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchMember();
    }, [memberId]);

  return (
    <>
      {loading ? (
        <p>Loading member info...</p>
      ) : !member ? (
        <p>Member not found.</p>
      ) : (
        <div className="member-info-page">
          <ProfileCard member={member} />

          <div className="member-tab-nav">
            <button className={`tab-button ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              Account Home
            </button>
            <button className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
              Schedule
            </button>
            <button className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
              Billing
            </button>
          </div>

          {activeTab === 'home' && (
            <MemberInfo
              member={member}
              setEditSectionData={setEditSectionData}
              setShowEditModal={setShowEditModal}
            />
          )}

          {activeTab === 'schedule' && (
            <MemberSchedule initialSessions={mockSessions} />
          )}

          {activeTab === 'billing' && (
            <BillingTab/>
          )}

          {showEditModal && (
            <EditModal
              member={member}
              sectionData={editSectionData}
              onClose={() => setShowEditModal(false)}
              onSave={async (updatedFields) => {
                const updatedMember = { ...member, ...updatedFields };
                await updateDoc(doc(db, 'members', member.id), updatedFields);
                setMember(updatedMember);
                setShowEditModal(false);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
