import '../pages/MemberAccountPage.css'
import { useMember } from '../context/MemberContext';

const avatarColors = [
  '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
  '#2196F3', '#03A9F4', '#009688', '#4CAF50',
  '#FFC107', '#FF9800', '#795548', '#607D8B'
];

function getInitials(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  const first = words[0]?.charAt(0) || '';
  const last = words[1]?.charAt(0) || '';
  return (first + last).toUpperCase();
}

function getRandomColor(seed) {
  let total = 0;
  for (let i = 0; i < seed.length; i++) {
    total += seed.charCodeAt(i);
  }
  return avatarColors[total % avatarColors.length];
}

export default function ProfileCard() {
  const { member } = useMember(); 
  const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  const initials = getInitials(fullName);
  const bgColor = getRandomColor(fullName);

  return (
    <div className="profile-card">
      <div className="avatar" style={{ backgroundColor: bgColor }}>
        {initials}
      </div>      
      <div className="info">
        <h2>{fullName || 'Unnamed Member'}</h2>
        <p className="sub-role">{member.membershipStatus}</p>
        <p className="sub-role">{member.temperature}</p>
        {/* <p className="location">{member.city || 'City'}, {member.country || 'Country'}</p> */}
      </div>
    </div>
  );
}
