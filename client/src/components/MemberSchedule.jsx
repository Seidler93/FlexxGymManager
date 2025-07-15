import { useEffect, useState } from 'react';
import '../pages/MemberAccountPage.css';
import { useMember } from '../context/MemberContext';
import { removeMemberFromSession } from '../utils/firestoreHelpers';

export default function MemberSchedule({ initialSessions }) {
  const [sessions, setSessions] = useState(initialSessions || []);
  const [upcomingGrouped, setUpcomingGrouped] = useState({});
  const [pastGrouped, setPastGrouped] = useState({});
  const { member } = useMember();

  // Helper: Ensure valid JS Date from Firestore Timestamp or raw date
  const getJSDate = (d) => (d?.toDate ? d.toDate() : new Date(d));

  // Format session date
  const formatSessionDate = (date) =>
    getJSDate(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  // Group sessions by start-of-week
  const groupSessionsByWeek = (sessionsArr) => {
    const grouped = {};

    sessionsArr.forEach((session) => {
      const dateObj = getJSDate(session.date);

      const startOfWeek = new Date(dateObj);
      const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...
      const diffToMonday = (day === 0 ? -6 : 1 - day); // Move back to Monday
      startOfWeek.setDate(dateObj.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const key = `${startOfWeek.getTime()}_${endOfWeek.getTime()}`;

      if (!grouped[key]) {
        grouped[key] = {
          startOfWeek,
          endOfWeek,
          sessions: []
        };
      }

      grouped[key].sessions.push(session);
    });

    return grouped;
  };
  
  // Load member.sessions on mount
  useEffect(() => {
    if (member?.sessions) {
      setSessions(member.sessions);
    }
  }, [member]);

  // Separate past and upcoming sessions and group them
  useEffect(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    sessions.forEach((s) => {
      const date = getJSDate(s.date);
      if (date >= now) {
        upcoming.push(s);
      } else {
        past.push(s);
      }
    });

    const sortedUpcoming = upcoming.sort((a, b) => getJSDate(a.date) - getJSDate(b.date));
    const sortedPast = past.sort((a, b) => getJSDate(b.date) - getJSDate(a.date));

    setUpcomingGrouped(groupSessionsByWeek(sortedUpcoming));
    setPastGrouped(groupSessionsByWeek(sortedPast));
  }, [sessions]);

  // Remove a session locally by instanceId
  const handleRemove = (targetSession) => {
    const updatedSessions = sessions.filter(s => s.instanceId !== targetSession.instanceId);
    setSessions(updatedSessions);
    // console.log(member.id, targetSession.instanceId);
    
    removeMemberFromSession(member.id, targetSession.instanceId);
  };

  // Render grouped sessions
  const renderGroupedSessions = (grouped, isUpcoming = true) => {
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const aStart = grouped[a].startOfWeek;
      const bStart = grouped[b].startOfWeek;
      return isUpcoming ? aStart - bStart : bStart - aStart;
    });

    return sortedKeys.map((key, i) => {
      const { startOfWeek, endOfWeek, sessions } = grouped[key];
      const weekLabel = `${startOfWeek.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })} – ${endOfWeek.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`;

      return (
        <div key={i} className="week-group">
          <h4>{weekLabel}</h4>
          <ul className="session-list">
            {sessions.map((s, idx) => (
              <li key={idx} className="session-item ">
                <span className='font-small'>
                  <strong>{formatSessionDate(s.date)}</strong> @ {s.startTime}
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
      );
    });
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
