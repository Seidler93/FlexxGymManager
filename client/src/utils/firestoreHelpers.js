import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useMember } from '../context/MemberContext';

// Fetch a document by ID
export const getDocById = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Fetch all documents in a collection
export const getAllDocs = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new document
export const addNewDoc = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

// Update a document
export const updateDocById = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteDocById = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

/**
 * Fetch a single document from a collection by its ID
 * @param {string} collectionName - The name of the Firestore collection
 * @param {string} docId - The ID of the document to fetch
 * @returns {object|null} The document data with ID, or null if not found
 */
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`No document found in "${collectionName}" with ID "${docId}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document from "${collectionName}" with ID "${docId}":`, error);
    throw error;
  }
};

/**
 * Pauses a member's membership by updating their status and recording the hold.
 * 
 * @param {string} memberId - The Firestore ID of the member.
 * @param {Date} startDate - The start date of the hold.
 * @param {Date} endDate - The end date of the hold.
 */
export async function pauseMembership(memberId, startDate, endDate, notes, nextContactDate) {
  let status;

  if (!endDate) {
    status = "Extended Hold";
  } else {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    status = durationInDays <= 28 ? "Hold" : "Extended Hold";
  }


  const holdEntry = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  const memberRef = doc(db, 'members', memberId);

  try {
    await updateDoc(memberRef, {
      membershipStatus: status,
      holds: arrayUnion(holdEntry),
      nextContactDate: nextContactDate,
      holdNotes: notes
    });
  } catch (error) {
    console.error('Error pausing membership:', error);
    throw error;
  }
}

export const useUpdateMember = () => {
  const { member, setMember } = useMember();

  const updateMember = async (updatedFields) => {
    if (!member?.id) return;

    const updatedMember = { ...member, ...updatedFields };

    // Optimistically update local context
    setMember(updatedMember);

    try {
      await updateDoc(doc(db, 'members', member.id), updatedFields);
    } catch (error) {
      console.error("Failed to update member:", error);
      // Optionally rollback or show error
    }
  };

  console.log(member?.firstName);
  

  return { updateMember };
};
