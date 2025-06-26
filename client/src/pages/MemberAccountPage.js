import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileCard from '../components/ProfileCard';
import EditModal from '../components/EditModal';
import MemberInfo from '../components/MemberInfo.jsx';
import BillingTab from '../components/BillingTab.jsx';
import './MemberAccountPage.js'
import { getDocumentById } from '../utils/firestoreHelpers.js';

export default function MemberAccountPage() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSectionData, setEditSectionData] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

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
            <div>
              <h3>Schedule (Coming Soon)</h3>
            </div>
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
