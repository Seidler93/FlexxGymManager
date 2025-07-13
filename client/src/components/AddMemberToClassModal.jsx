import { useState, useEffect } from 'react';
import '../pages/MemberAccountPage.css';
import { useMember } from '../context/MemberContext';
import Fuse from 'fuse.js';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


export default function AddMemberToClassModal({ isOpen, onClose, addMemberToClass }) {
  const { searchedMember, setSearchedMember } = useMember(); 
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState('');
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

  const handleSelectedMember = (member) => {
    addMemberToClass(member);
    onClose();
  }
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
                      <li key={member.id} className="result-item" onClick={() => handleSelectedMember(member)}>
                        {member.lastName}, {member.firstName}{member.email ? ` — ${member.email}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
