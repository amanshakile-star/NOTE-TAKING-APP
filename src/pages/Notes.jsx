import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deleteNote } from '../services/noteService';
import { Plus, Trash2, Calendar, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { addRecentlyClosedNote } from '../utils/recentlyClosed';

export default function Notes() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) { setLoading(false); setNotes([]); return; }

    setLoading(true);
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q,
      (snap) => {
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Notes listener error:', err);
        setNotes([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user?.uid, authLoading]);

  const handleDelete = async (note) => {
    if (!confirm('Delete this note?')) return;
    try {
      if (user?.uid) addRecentlyClosedNote(user.uid, note);
      await deleteNote(note.id);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete note');
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const filtered = notes.filter(note => {
    const matchSearch = !search ||
      (note.title || '').toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(note.content || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'tagged' && note.tags?.length > 0) ||
      (filter === 'recent' && note.updatedAt?.seconds > Date.now() / 1000 - 86400 * 7);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">My Notes</h1>
        <button
          onClick={() => navigate('/notes/new')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium text-sm sm:text-base"
        >
          <Plus className="h-5 w-5" />
          New Note
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'recent', 'tagged'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition text-sm font-medium ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Loading notes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-14 w-14 mx-auto text-gray-300 dark:text-slate-700 mb-4" />
          <p className="text-gray-500 dark:text-slate-400">
            {search ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(note => (
            <div
              key={note.id}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition flex flex-col"
            >
              <div className="p-4 sm:p-5 flex-1">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">
                      {note.title || 'Untitled'}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(note)}
                    className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition flex-shrink-0"
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Preview */}
                <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-3 mb-3 leading-relaxed">
                  {stripHtml(note.content || '') || 'No content yet...'}
                </p>

                {/* Tags */}
                {note.tags?.length > 0 && (
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {note.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-xs rounded-full">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Reminder */}
                {note.reminderDate && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-xs mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(note.reminderDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Open button */}
              <div className="px-4 sm:px-5 pb-4">
                <button
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg transition text-sm font-medium"
                >
                  Open Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
