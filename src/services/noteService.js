import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../config/firebase';

const NOTES_COLLECTION = 'notes';
const QUOTES_COLLECTION = 'quotes';

/* =========================
   CREATE NOTE
========================= */
export async function createNote(userId, noteData) {
  try {
    const notesRef = collection(db, NOTES_COLLECTION);

    return await addDoc(notesRef, {
      ...noteData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

/* =========================
   UPDATE NOTE
========================= */
export async function updateNote(noteId, noteData) {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId);

    // Never allow these to be overwritten
    const { userId, createdAt, ...safeData } = noteData;

    return await updateDoc(noteRef, {
      ...safeData,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

/* =========================
   DELETE NOTE
========================= */
export async function deleteNote(noteId) {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId);
    return await deleteDoc(noteRef);

  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

/* =========================
   GET USER NOTES
========================= */
export async function getUserNotes(userId) {
  try {
    const notesRef = collection(db, NOTES_COLLECTION);

    const q = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw error;
  }
}

/* =========================
   GET SINGLE NOTE
========================= */
export async function getNote(noteId) {
  try {
    const noteRef = doc(db, NOTES_COLLECTION, noteId);
    const snapshot = await getDoc(noteRef);

    return snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() }
      : null;

  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
}

/* =========================
   SAVE QUOTE
========================= */
export async function saveQuote(userId, quoteData) {
  console.log('saveQuote: Starting save for user:', userId);
  console.log('saveQuote: Quote data:', quoteData);
  
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);

    const result = await addDoc(quotesRef, {
      ...quoteData,
      userId,
      createdAt: serverTimestamp()
    });

    console.log('saveQuote: Quote saved successfully with ID:', result.id);
    return result;

  } catch (error) {
    console.error("saveQuote: Error saving quote:", error);
    console.error("saveQuote: Error details:", {
      code: error.code,
      message: error.message,
      userId,
      quoteData
    });
    throw error;
  }
}

/* =========================
   GET USER QUOTES
========================= */
export async function getUserQuotes(userId) {
  console.log('getUserQuotes: Fetching quotes for user:', userId);
  
  try {
    const quotesRef = collection(db, QUOTES_COLLECTION);

    const q = query(
      quotesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    console.log('getUserQuotes: Executing query...');
    const snapshot = await getDocs(q);

    const quotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('getUserQuotes: Fetched', quotes.length, 'quotes');
    return quotes;

  } catch (error) {
    console.error("getUserQuotes: Error fetching user quotes:", error);
    console.error("getUserQuotes: Error details:", {
      code: error.code,
      message: error.message,
      userId
    });
    
    // If it's an index error, provide helpful message
    if (error.message?.includes('index')) {
      console.error('getUserQuotes: COMPOSITE INDEX REQUIRED!');
      console.error('getUserQuotes: Collection: quotes');
      console.error('getUserQuotes: Fields: userId (Ascending), createdAt (Descending)');
    }
    
    throw error;
  }
}