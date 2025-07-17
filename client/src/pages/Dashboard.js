import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';
import { useMember } from '../context/MemberContext';

export default function Dashboard() {
  const { memberProfiles, setMemberProfiles } = useMember();
  const [stats, setStats] = useState({
    active: 0,
    greenHold: 0,
    yellowHold: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'memberProfiles'));
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const active = members.filter(m => m.membershipStatus === 'Active').length;
        const greenHold = members.filter(m => m.membershipStatus === 'Green Hold').length;
        const yellowHold = members.filter(m => m.membershipStatus === 'Yellow Hold').length;

        setStats({ active, greenHold, yellowHold });
        setMemberProfiles(members);
        
      } catch (err) {
        console.error('Error fetching member stats:', err);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    console.log(memberProfiles);
    
  }, [memberProfiles])


  return (
    <main>
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card active">
          <h3>Active Members</h3>
          <p>{stats.active}</p>
        </div>
        <div className="stat-card green-hold">
          <h3>Green Hold</h3>
          <p>{stats.greenHold}</p>
        </div>
        <div className="stat-card yellow-hold">
          <h3>Yellow Hold</h3>
          <p>{stats.yellowHold}</p>
        </div>
      </div>
    </main>
  );
}
