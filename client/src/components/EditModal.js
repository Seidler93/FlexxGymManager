import { useState } from 'react';
import '../pages/MemberAccountPage.css'
import { useUpdateMember } from '../utils/firestoreHelpers';

export default function EditModal({ sectionData, onClose }) {
  const { updateMember } = useUpdateMember();

  const initialValues = sectionData.reduce((acc, item) => {
    acc[item.dbName] = item.value || '';
    return acc;
  }, {});

  const labelMap = sectionData.reduce((acc, item) => {
    acc[item.dbName] = item.label;
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = async () => {
    await updateMember(formData);
    onClose();
  };

  return (
    <div className="edit-modal">
      <div className="modal-content">
        <h3>Edit Info</h3>
        {Object.keys(formData).map((field) => (
          <div key={field} className="form-row">
            <label>{labelMap[field]}</label>
            <input
              value={formData[field]}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
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
