import { useEffect, useState } from 'react';
import '../pages/MemberAccountPage.css';

export default function MemberSchedule({ initialSessions }) {
  const [sessions, setSessions] = useState(initialSessions || []);
  const [upcomingGrouped, setUpcomingGrouped] = useState({});
  const [pastGrouped, setPastGrouped] = useState({});

  const groupSessionsByWeek = (sessionsArr) => {
    const grouped = {};

    sessionsArr.forEach((session) => {
      const dateObj = new Date(session.date);
      const dayOfWeek = dateObj.getDay(); // Sunday = 0, Saturday = 6
      const diffToSunday = dateObj.getDate() - dayOfWeek;
      const startOfWeek = new Date(dateObj);
      startOfWeek.setDate(diffToSunday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const key = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    });

    return grouped;
  };

  useEffect(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    sessions.forEach((s) => {
      const date = new Date(s.date);
      if (date >= now) {
        upcoming.push(s);
      } else {
        past.push(s);
      }
    });

    const sortedUpcoming = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedPast = past.sort((a, b) => new Date(b.date) - new Date(a.date));

    setUpcomingGrouped(groupSessionsByWeek(sortedUpcoming));
    setPastGrouped(groupSessionsByWeek(sortedPast));
  }, [sessions]);

  const handleRemove = (targetSession) => {
    const updatedSessions = sessions.filter(s => s !== targetSession);
    setSessions(updatedSessions);
  };

  const renderGroupedSessions = (grouped, isUpcoming = true) => {
    const sortedWeeks = Object.keys(grouped).sort((a, b) => {
      const aDate = new Date(a.split(' - ')[0]);
      const bDate = new Date(b.split(' - ')[0]);
      return isUpcoming ? aDate - bDate : bDate - aDate;
    });

    return sortedWeeks.map((weekRange, i) => (
      <div key={i} className="week-group">
        <h4>{weekRange}</h4>
        <ul className="session-list">
          {grouped[weekRange].map((s, idx) => (
            <li key={idx} className="session-item">
              <span>
                <strong>
                  {new Date(s.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>{' '}
                @ {s.time}
              </span>
              <button
                onClick={() => handleRemove(s)}
                className="remove-button"
                title="Remove session"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="member-schedule-container">
      <div className="schedule-section">
        <h3>Upcoming Sessions</h3>
        {Object.keys(upcomingGrouped).length === 0 ? (
          <p>No upcoming sessions.</p>
        ) : (
          renderGroupedSessions(upcomingGrouped, true)
        )}
      </div>

      <div className="schedule-section">
        <h3>Past Sessions</h3>
        {Object.keys(pastGrouped).length === 0 ? (
          <p>No past sessions.</p>
        ) : (
          renderGroupedSessions(pastGrouped, false)
        )}
      </div>
    </div>
  );
}
