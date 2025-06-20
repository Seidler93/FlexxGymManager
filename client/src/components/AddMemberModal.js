import { useState } from 'react';
import './AddMemberModal.css'; // Uses your existing modal styling

export default function AddMemberModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newMember = {
      name,
      email,
      phone,
      notes: '',
      createdAt: new Date().toISOString(),
    };

    onAdd(newMember);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Member</h3>

          <label>
            Name:
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Phone:
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <button type="submit" style={{ marginTop: '1rem' }}>Add Member</button>
        </form>
      </div>
    </div>
  );
}
