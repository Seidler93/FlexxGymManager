import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where, Timestamp, arrayUnion, } from 'firebase/firestore';
import { db } from '../firebase';
import AddMemberToClassModal from '../components/AddMemberToClassModal';
import { useNavigate } from 'react-router-dom';
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun'];

export default function CalendarPage() {
  const [instances, setInstances] = useState([]);
  const [expandedInstance, setExpandedInstance] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [recurring, setRecurring] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstances();
  }, []);

  const addMemberToClass = (member) => {    
    if (!recurring) {
      handleAddAttendee(selectedInstance, member);
    } else {     
      handleAddRecurring(selectedInstance, member);
    }
  }

  const showModal = (frequency, instance) => {
    setShowSearchModal(true);
    setSelectedInstance(instance)
    setRecurring(frequency !== "single")
  }

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
    if (inst.date?.toDate) {
      const dateObj = inst.date.toDate();
      dateObj.setHours(0, 0, 0, 0); // normalize to local midnight
      const dateKey = dateObj.toLocaleDateString('en-CA'); // "YYYY-MM-DD"

      if (groupedByDay[dateKey]) {
        groupedByDay[dateKey].push(inst); // no need to format date here
      }
    }
  });
  
  const toggleExpand = (id) => {
    setExpandedInstance(prev => (prev === id ? null : id));
  };

  const handleAddAttendee = async (instance, member) => {
    if (!member) return;
    console.log(instance);
    
    const memberToAdd = {
      name: `${member.lastName}, ${member.firstName}`,
      memberId: member.id
    };

    const sessionRef = doc(db, 'sessionInstances', instance.id);
    const memberRef = doc(db, 'members', member.id);

    const updatedAttendees = [...(instance.attendees || []), memberToAdd];

    // Session data to add to the user's array
    const sessionForMember = {
      instanceId: instance.id,
      date: instance.date, 
      startTime: instance.time
    };

    try {
      // Use a batch to update both documents atomically
      const batch = writeBatch(db);

      batch.update(sessionRef, { attendees: updatedAttendees });
      batch.update(memberRef, {
        sessions: arrayUnion(sessionForMember)
      });

      await batch.commit();
      fetchInstances();
    } catch (error) {
      console.error("Error adding attendee and session to member:", error);
    }
  };
  
  const handleAddRecurring = async (instance, member) => {
    if (!member || !instance) return;
    
    const sessionId = instance.sessionId;
    const today = Timestamp.now();
    
    // 1. Get all future sessionInstances with the same sessionId
    const q = query(
      collection(db, 'sessionInstances'),
      where('sessionId', '==', sessionId),
      where('date', '>=', today)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    const memberToAdd = {
      name: `${member.lastName}, ${member.firstName}`,
      memberId: member.id,
    };
    
    const sessionsAdded = [];
    
    // 2. Add member to each matching sessionInstance
    snapshot.forEach((docSnap) => {
      const instance = docSnap.data();
      const instanceRef = doc(db, 'sessionInstances', docSnap.id);

      // Session data to add to the user's array
      const sessionForMember = {
        instanceId: docSnap.id,
        date: instance.date,
        startTime: instance.time
      };

      const currentAttendees = instance.attendees || [];
      const alreadyAdded = currentAttendees.some(
        (a) => a.memberId === member.id
      );
      
      if (!alreadyAdded) {
        const updatedAttendees = [...currentAttendees, memberToAdd];
        batch.update(instanceRef, { attendees: updatedAttendees });
        sessionsAdded.push(sessionForMember);
      }
    });

    // 3. Update member doc with sessions and recurringSessions
    if (sessionsAdded.length > 0) {
      const memberRef = doc(db, 'members', member.id);

      batch.update(memberRef, {
        sessions: arrayUnion(...sessionsAdded),
        recurringSessions: arrayUnion(sessionId),
      });
    }

    // 4. Commit the batch
    await batch.commit();
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
                    <li className='schedule-card' key={instance.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', borderRadius: 8, padding: '0.75rem' }}>
                      <div onClick={() => toggleExpand(instance.id)} style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                          <button onClick={() => showModal("single", instance)} title="Add attendee">➕</button>{' '}
                          <button onClick={() => handleDeleteInstance(instance.id)} title="Delete session">🗑️</button>{' '}
                          <button onClick={() => toggleExpand(instance.id)}>{isExpanded ? 'Collapse' : 'Expand'}</button>
                          <button onClick={() => showModal("recurring", instance)}>Add Recurring</button>
                          </div>
                      </div>

                      {isExpanded && (
                        <div className='schedule-card' style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          <p><strong>Attendees:</strong></p>
                          {attendees.length > 0 ? (
                            <ul >
                              {attendees.map((attendee, i) => <li key={i} onClick={() => navigate(`/members/${attendee.memberId}`)}>{attendee.name}</li>)}
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
      <AddMemberToClassModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        addMemberToClass={addMemberToClass}
      />
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
