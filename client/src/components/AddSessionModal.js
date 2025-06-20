import { useState } from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AddSessionModal.css';
import { FiEdit2 } from 'react-icons/fi';
import TimeSelect from './TimeSelect';
import { v4 as uuidv4 } from 'uuid';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const allTimes = Array.from({ length: ((22 - 4 + 1) * 4) }, (_, i) => {
  const base = 4 * 60;
  const totalMinutes = base + i * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const isPM = totalMinutes >= 12 * 60;
  const displayHour = ((hour % 12) || 12).toString();
  const displayMinute = minute.toString().padStart(2, '0');
  const ampm = isPM ? 'PM' : 'AM';
  return `${displayHour}:${displayMinute} ${ampm}`;
});

const durations = Array.from({ length: 8 }, (_, i) => (i + 1) * 15);

function getNextNDates(dayName, count) {
  const daysMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const result = [];
  let date = new Date();
  date.setHours(0, 0, 0, 0);

  while (result.length < count) {
    if (date.getDay() === daysMap[dayName]) {
      result.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }

  return result;
}

export default function AddSessionModal({ onClose, onSessionAdded }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('Small Group Personal Training');
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTimes, setStartTimes] = useState({});
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();

    for (const day of selectedDays) {
      const times = startTimes[day] || [];
      for (const time of times) {
        const sessionId = uuidv4();
        const sessionData = {
          id: sessionId,
          name: title,
          recurring: isRecurring,
          day,
          time,
          duration,
          description,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'sessions', sessionId), sessionData);

        // Create 8 occurrences (~2 months of weekly sessions)
        const dates = getNextNDates(day, 8);
        for (const sessionDate of dates) {
          const instanceId = uuidv4(); // 👈 Generate ID
          const instanceData = {
            id: instanceId,
            sessionId,
            name: title,
            date: sessionDate.toISOString().split('T')[0],
            time,
            duration,
            attendees: [],
          };
          await setDoc(doc(db, 'sessionInstances', instanceId), instanceData); // 👈 Use setDoc with ID
        }
      }
    }

    onSessionAdded();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="session-title-row">
            {isEditingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
              />
            ) : (
              <h3 onClick={() => setIsEditingTitle(true)}>
                {title} <FiEdit2 style={{ cursor: 'pointer' }} />
              </h3>
            )}
          </div>

          <label>
            Recurring:
            <select onChange={e => setIsRecurring(e.target.value === 'yes')}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>

          {isRecurring && (
            <>
              <div className="day-buttons">
                {daysOfWeek.map(day => (
                  <button
                    type="button"
                    key={day}
                    className={selectedDays.includes(day) ? 'active' : ''}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {selectedDays.map(day => (
                <div key={day} style={{ marginBottom: '1rem' }}>
                  <strong>{day}</strong>
                  <TimeSelect
                    values={startTimes[day] || []}
                    onChange={(newTimes) => setStartTimes(prev => ({
                      ...prev,
                      [day]: newTimes
                    }))}
                  />
                </div>
              ))}
            </>
          )}

          <label>
            Duration:
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
              {durations.map(d => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </label>

          <label>
            Description:
            <textarea
              rows={3}
              placeholder="Optional description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>

          <button type="submit" style={{ marginTop: '1rem' }}>Add Session</button>
        </form>
      </div>
    </div>
  );
}
