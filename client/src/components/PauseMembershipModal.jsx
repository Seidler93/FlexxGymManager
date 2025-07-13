import { useState } from 'react';
import '../pages/MemberAccountPage.css';

export default function PauseMembershipModal({ isOpen, onClose, onSubmit }) {
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!startDate) return;

    setLoading(true);
    try {
      await onSubmit({ startDate, returnDate, notes });
    } catch (err) {
      console.error('Pause submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Pause Membership</h2>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Return Date (optional):
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </label>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </label>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Pausing...' : 'Pause'}
          </button>
        </div>
      </div>
    </div>
  );
}
