import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AddSessionModal from '../components/AddSessionModal';
import './SessionsPage.css';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    const snapshot = await getDocs(collection(db, 'sessions'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const parseTime = (time) => {
    const [t, modifier] = time.split(' ');
    let [hours, minutes] = t.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const groupedSessions = {};
  daysOfWeek.forEach(day => groupedSessions[day] = []);
  sessions.forEach(session => {
    if (!session.day || !session.time) return;
    groupedSessions[session.day].push(session);
  });
  Object.keys(groupedSessions).forEach(day => {
    groupedSessions[day].sort((a, b) => parseTime(a.time) - parseTime(b.time));
  });

  const handleEdit = async (sessionId, updatedFields) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, updatedFields);
    await fetchSessions();
  };

  const toggleExpand = (id) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  return (
    <div className="sessions-week-container">
      <div className="header-row">
        <h2>Weekly Session View</h2>
        <button onClick={() => setShowModal(true)}>+ Add Session</button>
      </div>

      <div className="week-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="day-column">
            <h3>{day}</h3>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : groupedSessions[day].length > 0 ? (
              groupedSessions[day].map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-info" onClick={() => toggleExpand(session.id)}>
                    <strong>{session.time}</strong>
                    {/* <strong>{session.time}</strong> — {session.name}<br /> */}
                    <span>{(session.recurringAttendees?.length || 0)}/6 Recurring</span>
                  </div>

                  {expandedSessionId === session.id && (
                    <div className="member-list">
                      <strong>Recurring Members:</strong>
                      <ul>
                        {session.recurringAttendees?.length > 0 ? (
                          session.recurringAttendees.map((member, i) => (
                            <li key={i}>{member.name}</li>
                          ))
                        ) : (
                          <li style={{ fontStyle: 'italic' }}>No recurring members</li>
                        )}
                      </ul>
                      <button
                        onClick={() => {
                          const newName = prompt('Edit session name:', session.name);
                          const newTime = prompt('Edit time:', session.time);
                          if (newName && newTime) {
                            handleEdit(session.id, { name: newName, time: newTime });
                          }
                        }}
                      >Edit</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#999' }}>No sessions</p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <AddSessionModal
          onClose={() => setShowModal(false)}
          onSessionAdded={fetchSessions}
        />
      )}
    </div>
  );
}
