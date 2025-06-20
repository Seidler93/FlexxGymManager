import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import './AddSessionModal.css';
import { FiEdit2 } from 'react-icons/fi';
import Select from 'react-select';
import TimeSelect from './TimeSelect';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const allTimes = Array.from({ length: ((22 - 4 + 1) * 4) }, (_, i) => {
  const base = 4 * 60; // 4:00 AM in minutes
  const totalMinutes = base + i * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const isPM = totalMinutes >= 12 * 60;
  const displayHour = ((hour % 12) || 12).toString();
  const displayMinute = minute.toString().padStart(2, '0');
  const ampm = isPM ? 'PM' : 'AM';
  return `${displayHour}:${displayMinute} ${ampm}`;
});

const timeOptions = allTimes.map(t => ({ value: t, label: t }));

const durations = Array.from({ length: 8 }, (_, i) => (i + 1) * 15); // 15 to 120

export default function AddSessionModal({ onClose, onSessionAdded }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('Small Group Personal Training');
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTimes, setStartTimes] = useState({});
  const [duration, setDuration] = useState(60); // in minutes
  const [description, setDescription] = useState('');

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const createdAt = new Date().toISOString();

    const newSessionPromises = [];

    selectedDays.forEach(day => {
      const times = startTimes[day] || [];
      times.forEach(time => {
        const sessionTemplate = {
          name: title,
          recurring: isRecurring,
          day,
          time,
          duration,
          description,
          createdAt,
          active: true
        };
        newSessionPromises.push(addDoc(collection(db, 'sessions'), sessionTemplate));
      });
    });

    await Promise.all(newSessionPromises);
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{day}</strong>
                  </div>
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
