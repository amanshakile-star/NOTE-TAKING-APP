import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deleteNote } from '../services/noteService';
import { Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { addRecentlyClosedNote } from '../utils/recentlyClosed';

export default function Notes() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until auth is ready and user is available
    if (authLoading) {
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      setNotes([]);
      return;
    }

    console.log('Setting up real-time listener for user:', user.uid);
    setLoading(true);

    // Create query with composite index
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const notesArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Real-time update: Notes fetched:', notesArray.length);
        setNotes(notesArray);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to notes:', error);
        setNotes([]);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts or user changes
    return () => {
      console.log('Unsubscribing from notes listener');
      unsubscribe();
    };
  }, [user?.uid, authLoading]);

  const handleDelete = async (note) => {
    if (confirm('Delete this note?')) {
      try {
        if (user?.uid) {
          addRecentlyClosedNote(user.uid, note);
        }
        await deleteNote(note.id);
        console.log('Note deleted:', note.id);
        // No need to manually refresh - onSnapshot will update automatically
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
      }
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">My Notes</h1>
        <button
          onClick={() => navigate('/notes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="h-5 w-5" />
          New Note
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'recent', 'tagged'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-slate-700 transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 min-w-0">
                {note.type === 'pdf' && (
                  <FileText className="h-4 w-4 text-primary-400 flex-shrink-0" />
                )}
                <h3 className="text-lg font-semibold text-slate-100 line-clamp-1">
                  {note.title || 'Untitled'}
                </h3>
              </div>
              <button
                onClick={() => handleDelete(note)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {note.type !== 'pdf' && (
              <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                {stripHtml(note.content || '')}
              </p>
            )}
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {note.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {note.reminderDate && (
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                {new Date(note.reminderDate).toLocaleDateString()}
              </div>
            )}
            
            <button
              onClick={() =>
                navigate(note.type === 'pdf' ? `/pdf/${note.id}` : `/notes/${note.id}`)
              }
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition"
            >
              {note.type === 'pdf' ? 'Open PDF' : 'Open'}
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No notes yet. Create your first note!</p>
        </div>
      ) : null}
    </div>
  );
}
