import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun'];

export default function CalendarPage() {
  const [instances, setInstances] = useState([]);
  const [expandedInstance, setExpandedInstance] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    const querySnapshot = await getDocs(collection(db, 'sessionInstances'));
    const instanceList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInstances(instanceList);
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const groupedByDay = {};
  getWeekDates().forEach(date => {
    groupedByDay[date] = [];
  });

  instances.forEach(inst => {
    if (getWeekDates().includes(inst.date)) {
      groupedByDay[inst.date].push(inst);
    }
  });

  const toggleExpand = (id) => {
    setExpandedInstance(prev => (prev === id ? null : id));
  };

  const handleAddAttendee = async (instance) => {
    const name = prompt('Enter name to add:');
    if (!name) return;

    const ref = doc(db, 'sessionInstances', instance.id);
    const attendees = instance.attendees || [];
    const updatedAttendees = [...attendees, name];

    await updateDoc(ref, { attendees: updatedAttendees });
    fetchInstances();
  };

  const handleDeleteInstance = async (id) => {
    const confirm = window.confirm('Delete this session instance?');
    if (!confirm) return;

    await deleteDoc(doc(db, 'sessionInstances', id));
    fetchInstances();
  };

  const goToToday = () => setCurrentWeekStart(getStartOfWeek(new Date()));
  const goWeekOffset = (offset) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + offset * 7);
    setCurrentWeekStart(newStart);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>This Week’s Sessions</h2>
        <div>
          <button onClick={() => goWeekOffset(-1)}>&lt; Prev</button>
          <button onClick={goToToday} style={{ margin: '0 1rem' }}>Today</button>
          <button onClick={() => goWeekOffset(1)}>Next &gt;</button>
        </div>
      </div>

      {Object.entries(groupedByDay).map(([date, dayInstances]) => (
        <div key={date} style={{ marginTop: '2rem' }}>
          <h3>{formatDateHeading(date)}</h3>
          {dayInstances.length > 0 ? (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {dayInstances
                .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                .map(instance => {
                  const isExpanded = expandedInstance === instance.id;
                  const attendees = instance.attendees || [];
                  const waitlist = instance.waitlist || [];
                  const maxCapacity = instance.maxCapacity || 6;

                  return (
                    <li key={instance.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', borderRadius: 8, padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{instance.time}</strong> — {instance.name} <br />
                          <span style={{ fontSize: '0.9rem', color: '#666' }}>
                            {attendees.length} / {maxCapacity} attending, {waitlist.length} on waitlist
                          </span>
                          <div style={{ background: '#eee', borderRadius: '4px', height: '8px', width: '100%', marginTop: '4px' }}>
                            <div
                              style={{
                                width: `${(attendees.length / maxCapacity) * 100}%`,
                                background: attendees.length >= maxCapacity ? '#d9534f' : '#5cb85c',
                                height: '100%',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                              }}
                            ></div>
                          </div>

                        </div>
                        <div>
                          <button onClick={() => handleAddAttendee(instance)} title="Add attendee">➕</button>{' '}
                          <button onClick={() => handleDeleteInstance(instance.id)} title="Delete session">🗑️</button>{' '}
                          <button onClick={() => toggleExpand(instance.id)}>{isExpanded ? 'Collapse' : 'Expand'}</button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          <p><strong>Attendees:</strong></p>
                          {attendees.length > 0 ? (
                            <ul>
                              {attendees.map((name, i) => <li key={i}>{name}</li>)}
                            </ul>
                          ) : <p style={{ fontStyle: 'italic' }}>No attendees yet.</p>}

                          <p><strong>Waitlist:</strong></p>
                          {waitlist.length > 0 ? (
                            <ul>
                              {waitlist.map((name, i) => <li key={i}>{name}</li>)}
                            </ul>
                          ) : <p style={{ fontStyle: 'italic' }}>No waitlist.</p>}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p style={{ color: '#999' }}>No sessions</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Helpers
function getStartOfWeek(date) {
  const d = new Date(date);
  const diff = d.getDate() - d.getDay(); // Sunday start
  return new Date(d.setDate(diff));
}

function formatDateHeading(dateStr) {
  const date = new Date(dateStr);
  return `${daysOfWeek[date.getDay()]} ${dateStr}`;
}

function timeToMinutes(timeStr) {
  const [t, ampm] = timeStr.split(' ');
  let [hours, minutes] = t.split(':').map(Number);
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
