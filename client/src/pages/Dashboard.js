import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    active: 0,
    greenHold: 0,
    yellowHold: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const snapshot = await getDocs(collection(db, 'members'));
      const members = snapshot.docs.map(doc => doc.data());

      const active = members.filter(m => m.membershipStatus === 'Active').length;
      const greenHold = members.filter(m => m.membershipStatus === 'Green Hold').length;
      const yellowHold = members.filter(m => m.membershipStatus === 'Yellow Hold').length;

      setStats({ active, greenHold, yellowHold });
    };

    fetchStats();
  }, []);

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
