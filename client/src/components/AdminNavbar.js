import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import './AdminNavbar.css';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AddMemberModal from './AddMemberModal';

export default function AdminNavbar({ onAddMember }) {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [devDropdownOpen, setDevDropdownOpen] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await getDocs(collection(db, 'members'));
      const memberList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(memberList);
    };
    fetchMembers();
  }, []);


  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('')
    : currentUser?.email?.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  const deleteAllFromCollection = async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, collectionName, docSnap.id)));
    await Promise.all(deletePromises);
    alert(`Deleted all from ${collectionName}`);
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
                if (val.length === 0) {
                  setFilteredMembers([]);
                  setShowSearchResults(false);
                } else {
                  const filtered = members.filter(member =>
                    member.name?.toLowerCase().includes(val.toLowerCase()) ||
                    member.email?.toLowerCase().includes(val.toLowerCase()) ||
                    member.phone?.toLowerCase().includes(val.toLowerCase())
                  );
                  setFilteredMembers(filtered);
                  setShowSearchResults(true);
                }
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
                    <li key={member.id} className="result-item">
                      {member.name} — {member.email}
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

        <div className="dev-actions">
          <button
            className="dev-button"
            onClick={() => setDevDropdownOpen(prev => !prev)}
          >
            Dev Actions ▾
          </button>
          {devDropdownOpen && (
            <div className="dropdown dev-dropdown">
              <button onClick={() => deleteAllFromCollection('sessions')}>Delete All Sessions</button>
              <button onClick={() => deleteAllFromCollection('sessionInstances')}>Delete All Instances</button>
            </div>
          )}
        </div>

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
