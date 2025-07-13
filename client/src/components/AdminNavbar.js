import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import './AdminNavbar.css';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AddMemberModal from './AddMemberModal';
import DevDropdown from './DevDropdown';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar({ onAddMember }) {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [fuseInstance, setFuseInstance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await getDocs(collection(db, 'members'));
      const memberList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(memberList);

      const fuse = new Fuse(memberList, {
        keys: ['firstName', 'lastName', 'email'],
        threshold: 0.3, // lower is stricter (0.0 = exact match, 1.0 = everything)
      });
      setFuseInstance(fuse); // store in state
      
    };
    fetchMembers();
  }, []);

  const clickedResult = (memberId) => {
    setDropdownOpen(false);
    setShowSearchResults(false);
    setSearchText('');
    navigate(`/members/${memberId}`)
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('')
    : currentUser?.email?.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <nav className="admin-navbar">
      <div className="nav-left">
        <img src="/logo192.png" alt="Logo" className="logo" />
      </div>

      <div className="nav-center">
        <div className="search-container">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search clients..."
              className="search-input"
              value={searchText}
              onChange={(e) => {
                const val = e.target.value;
                setSearchText(val);

                if (!val || !fuseInstance) {
                  setFilteredMembers([]);
                  setShowSearchResults(false);
                  return;
                }

                const results = fuseInstance.search(val).map(result => result.item);
                setFilteredMembers(results);
                setShowSearchResults(true);
              }}              
            />
          </div>

          {showSearchResults && (
            <div className="search-results">
              {filteredMembers.length === 0 ? (
                <p className="no-results">No matches found</p>
              ) : (
                <ul className="results-list">
                  {filteredMembers.map(member => (
                    <li key={member.id} className="result-item" onClick={() => clickedResult(member.id)}>
                      {member.lastName}, {member.firstName}{member.email ? ` — ${member.email}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <button className="add-member-button" onClick={() => setShowAddMemberModal(true)}>
          + Add
        </button>
        <div className="notification-icon">
          <FiBell size={20} />
        </div>

        <DevDropdown />
         
        <div className="profile-circle" onClick={() => setDropdownOpen(prev => !prev)}>
          {initials}
        </div>

        {dropdownOpen && (
          <div className="dropdown">
            <p className="name scaled-text">{currentUser?.displayName || currentUser?.email}</p>
            <button>View Account</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {showAddMemberModal && (
        <AddMemberModal
          onClose={() => setShowAddMemberModal(false)}
          onAdd={async (newMember) => {
            try {
              await addDoc(collection(db, 'members'), newMember);
              alert('Member added successfully!');
            } catch (error) {
              console.error('Error adding member:', error);
              alert('Failed to add member');
            } finally {
              setShowAddMemberModal(false);
            }
          }}
        />
      )}
    </nav>
  );
}
