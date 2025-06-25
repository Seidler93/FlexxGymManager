import { useState } from 'react';
import '../pages/MemberAccountPage.css'

export default function EditModal({ sectionData, onClose, onSave }) {
  const initialValues = sectionData.reduce((acc, item) => {
    acc[item.label] = item.value || '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialValues);

  const handleChange = (label, value) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="edit-modal">
      <div className="modal-content">
        <h3>Edit Info</h3>
        {Object.keys(formData).map((label) => (
          <div key={label} className="form-row">
            <label>{label}</label>
            <input
              value={formData[label]}
              onChange={(e) => handleChange(label, e.target.value)}
            />
          </div>
        ))}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}
