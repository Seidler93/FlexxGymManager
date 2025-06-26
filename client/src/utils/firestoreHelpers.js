import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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