import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './MembersPage.css';

export default function MembersPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await getDocs(collection(db, 'members'));
      const memberList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(memberList);
    };

    fetchMembers();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-blue';
      case 'green hold': return 'status-green';
      case 'yellow hold': return 'status-yellow';
      default: return '';
    }
  };

  const getTempClass = (temp) => {
    switch (temp?.toLowerCase()) {
      case 'green': return 'status-green';
      case 'yellow': return 'status-yellow';
      case 'red': return 'status-red';
      default: return '';
    }
  };

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
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.lastName}</td>
                <td>{m.firstName}</td>
                <td><span className={`pill ${getStatusClass(m.membershipStatus)}`}>{m.membershipStatus}</span></td>
                <td><span className={`pill ${getTempClass(m.temperature)}`}>{m.temperature}</span></td>
                <td>{m.startDate}</td>
                <td>{m.daysPerWeek}</td>
                <td>{m.paymentOption}</td>
                <td>{m.pricePoint}</td>
                <td>{m.referral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
