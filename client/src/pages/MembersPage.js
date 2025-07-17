import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './MembersPage.css';
import { getTempClass, getStatusClass } from '../utils/memberUtils';
import { useMember } from '../context/MemberContext';

export default function MembersPage() {
  const { memberProfiles, setMemberProfiles } = useMember();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'memberProfiles'));
      const memberList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMemberProfiles(memberList);
      setLoading(false);
    };

    if (memberProfiles.length === 0) {
      fetchMembers();
    }
  }, []);

  useEffect(() => {
    console.log(memberProfiles);
    if (memberProfiles.length > 0) {
      setLoading(false);
    }
  }, [memberProfiles])


  return (
    <div className="members-page">
      <h2>All Members</h2>
      <div className="table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Status</th>
              <th>Temperature</th>
              <th>Start</th>
              <th>Days/Week</th>
              <th>Payment</th>
              <th>Price</th>
              <th>Referral</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(30)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j}>
                      <div className="skeleton-loader" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              memberProfiles.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/members/${m.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{m.lastName}</td>
                  <td>{m.firstName}</td>
                  <td><span className={`pill ${getStatusClass(m.membershipStatus)}`}>{m.membershipStatus}</span></td>
                  <td><span className={`pill ${getTempClass(m.temperature)}`}>{m.temperature}</span></td>
                  <td>{m.startDate}</td>
                  <td>{m.daysPerWeek}</td>
                  <td>{m.paymentMethod}</td>
                  <td>{m.price}</td>
                  <td>{m.referral}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
