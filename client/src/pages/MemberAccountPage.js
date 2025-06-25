import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileCard from '../components/ProfileCard';
import InfoSection from '../components/InfoSection';
import EditModal from '../components/EditModal';
import './MemberAccountPage.js'

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
        const docRef = doc(db, 'members', memberId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMember({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn('No such member!');
        }
      } catch (error) {
        console.error('Error fetching member:', error);
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
            <div className='member-info-page'>
              <InfoSection
                title="Personal Information"
                data={[
                  { label: 'First Name', value: member.firstName },
                  { label: 'Last Name', value: member.lastName },
                  { label: 'Date of Birth', value: member.dateOfBirth },
                  { label: 'Email Address', value: member.email },
                  { label: 'Phone Number', value: member.phone },
                  { label: 'User Role', value: member.role },
                ]}
                onEdit={(sectionData) => {
                  setEditSectionData(sectionData);
                  setShowEditModal(true);
                }}
              />

              <InfoSection
                title="Info"
                data={[
                  { label: 'Start Date', value: member.startDate },
                  { label: 'Days Per Week', value: member.daysPerWeek },
                  { label: 'Payment Frequency', value: member.paymentOption },
                  { label: 'Price Point', value: member.pricePoint },
                  { label: 'Referral Member', value: member.referralMember || ''},
                ]}
                onEdit={(sectionData) => {
                  setEditSectionData(sectionData);
                  setShowEditModal(true);
                }}
              />

              <InfoSection
                title="Address"
                data={[
                  { label: 'Country', value: member.country },
                  { label: 'City', value: member.city },
                  { label: 'Postal Code', value: member.postalCode },
                ]}
                onEdit={(sectionData) => {
                  setEditSectionData(sectionData);
                  setShowEditModal(true);
                }}
              />
            </div>
          )}

        {activeTab === 'schedule' && (
          <div>
            <h3>Schedule (Coming Soon)</h3>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h3>Billing Info (Coming Soon)</h3>
          </div>
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
