import '../pages/MemberAccountPage.css'

export default function InfoSection({ title, data, onEdit }) {
  return (
    <div className="info-section">
      <div className="section-header">
        <h3>{title}</h3>
        <button onClick={() => onEdit(data)}>Edit</button>
      </div>
      <div className="info-grid">
        {data.map((item, idx) => (
          <div key={idx} className="info-field">
            <label>{item.label}</label>
            <p>{item.value || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
