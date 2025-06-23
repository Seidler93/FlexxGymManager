import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AddSessionModal from '../components/AddSessionModal';
import SkeletonRow from '../components/SkeletonRow';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    // Simulate delay
    setTimeout(async () => {
      const snapshot = await getDocs(collection(db, 'sessions'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const groupedSessions = {};

  sessions.forEach(session => {
    if (!session.day || !session.time) return;
    if (!groupedSessions[session.day]) groupedSessions[session.day] = [];

    groupedSessions[session.day].push({
      ...session
    });
  });

  Object.keys(groupedSessions).forEach(day => {
    groupedSessions[day].sort((a, b) => {
      const parseTime = (time) => {
        const [t, modifier] = time.split(' ');
        let [hours, minutes] = t.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return parseTime(a.time) - parseTime(b.time);
    });
  });

  const handleEdit = async (sessionId, updatedFields) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, updatedFields);
    await fetchSessions();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Scheduled Sessions</h2>
        <button onClick={() => setShowModal(true)}>+ Add Session</button>
      </div>

      {daysOfWeek.map(day => (
        <div key={day} style={{ marginBottom: '2rem' }}>
          <h3>{day}</h3>

          {loading ? (
            <ul>
              {[...Array(3)].map((_, i) => (
                <li key={i}>
                  <div className="skeleton-loader" style={{ width: '200px', height: '16px', marginBottom: '0.5rem' }} />
                </li>
              ))}
            </ul>
          ) : groupedSessions[day] && groupedSessions[day].length > 0 ? (
            <ul>
              {groupedSessions[day].map((session, i) => (
                <li key={i}>
                  <strong>{session.time}</strong> — {session.name}
                  <button
                    onClick={() => {
                      const newName = prompt('Edit session name:', session.name);
                      const newTime = prompt('Edit time:', session.time);
                      if (newName && newTime) {
                        handleEdit(session.id, { name: newName, time: newTime });
                      }
                    }}
                    style={{ marginLeft: '1rem' }}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#999' }}>No sessions</p>
          )}
        </div>
      ))}


      {showModal && (
        <AddSessionModal
          onClose={() => setShowModal(false)}
          onSessionAdded={fetchSessions}
        />
      )}
    </div>
  );
}
