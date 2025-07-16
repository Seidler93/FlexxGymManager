import { useEffect, useState } from 'react';
import '../pages/MemberAccountPage.css';
import { useMember } from '../context/MemberContext';
import { removeMemberFromSession } from '../utils/firestoreHelpers';
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns';

export default function MemberSchedule({ initialSessions }) {
  const [sessions, setSessions] = useState(initialSessions || []);
  const [upcomingGrouped, setUpcomingGrouped] = useState({});
  const [pastGrouped, setPastGrouped] = useState({});
  const { member } = useMember();
  const [ledger, setLedger] = useState([]);
  const [ledgerWeeks, setLedgerWeeks] = useState(12);

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

  useEffect(() => {
    console.log(ledgerWeeks);
    
  }, [ledgerWeeks]);

  // Separate past and upcoming sessions and group them
  useEffect(() => {
    if (!member?.daysPerWeek) return;

    const now = new Date();
    const allWeeks = [];

    for (let i = 0; i < ledgerWeeks; i++) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      allWeeks.unshift({ weekStart, weekEnd });
    }

    const ledgerData = [];
    let runningBalance = 0;

    allWeeks.forEach(({ weekStart, weekEnd }) => {
      const sessionsThisWeek = sessions.filter(s => {
        const date = getJSDate(s.date);
        return isWithinInterval(date, { start: weekStart, end: weekEnd });
      });

      const expected = parseInt(member.daysPerWeek);
      const actual = sessionsThisWeek.length;
      const credit = actual - expected;

      runningBalance += credit;

      ledgerData.push({
        weekStart,
        weekEnd,
        expected,
        actual,
        credit,
        runningBalance
      });
    });

    setLedger(ledgerData);

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
  }, [sessions, member, ledgerWeeks]);

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
        <h3>Session Ledger (Last 12 Weeks)</h3>
        <div className="ledger-controls">
          <label htmlFor="weeksInput">Weeks to show: </label>
          <input
            id="weeksInput"
            type="number"
            min={1}
            max={52}
            value={ledgerWeeks}
            onChange={(e) => setLedgerWeeks(parseInt(e.target.value) || 1)}
            style={{ width: '60px', marginRight: '8px' }}
          />
        </div>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Expected</th>
              <th>Attended</th>
              <th>Credit</th>
              <th>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry, i) => (
              <tr key={i}>
                <td>
                  {entry.weekStart.toLocaleDateString()} – {entry.weekEnd.toLocaleDateString()}
                </td>
                <td>{entry.expected}</td>
                <td>{entry.actual}</td>
                <td>{entry.credit > 0 ? `+${entry.credit}` : entry.credit}</td>
                <td>{entry.runningBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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




