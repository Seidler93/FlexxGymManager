import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AddSessionModal from '../components/AddSessionModal';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchSessions = async () => {
    const querySnapshot = await getDocs(collection(db, 'sessions'));
    const sessionList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSessions(sessionList);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Sessions</h2>
        <button onClick={() => setShowModal(true)}>➕ Add Session</button>
      </div>

      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            <strong>{session.name}</strong> — {session.date || 'No date'}
          </li>
        ))}
      </ul>

      {showModal && (
        <AddSessionModal
          onClose={() => setShowModal(false)}
          onSessionAdded={fetchSessions}
        />
      )}
    </div>
  );
}
