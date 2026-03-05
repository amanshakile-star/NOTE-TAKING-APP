import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Quote, Sparkles, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNote } from '../services/noteService';
import { getRecentlyClosedNotes, removeRecentlyClosedNote } from '../utils/recentlyClosed';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyClosed, setRecentlyClosed] = useState([]);

  // Real-time listener for notes
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      setNotes([]);
      return;
    }

    console.log('Dashboard: Setting up real-time notes listener for user:', user.uid);
    setLoading(true);

    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const notesArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Dashboard: Notes updated:', notesArray.length);
        setNotes(notesArray);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Dashboard: Error listening to notes:', error);
        setError('Failed to load notes. Please check console for details.');
        setNotes([]);
        setLoading(false);
      }
    );

    return () => {
      console.log('Dashboard: Unsubscribing from notes listener');
      unsubscribe();
    };
  }, [user?.uid, authLoading]);

  // Recently closed notes (from localStorage)
  useEffect(() => {
    if (!user?.uid) {
      setRecentlyClosed([]);
      return;
    }
    setRecentlyClosed(getRecentlyClosedNotes(user.uid).slice(0, 5));
  }, [user?.uid]);

  const refreshRecentlyClosed = () => {
    if (!user?.uid) return;
    setRecentlyClosed(getRecentlyClosedNotes(user.uid).slice(0, 5));
  };

  const handleRestoreClosed = async (closedNote) => {
    if (!user?.uid) return;

    try {
      await createNote(user.uid, {
        title: closedNote.title,
        content: closedNote.content,
        tags: closedNote.tags,
        reminderDate: closedNote.reminderDate,
        highlights: closedNote.highlights
      });
      removeRecentlyClosedNote(user.uid, closedNote.id);
      refreshRecentlyClosed();
    } catch (err) {
      console.error('Dashboard: Failed to restore note from recently closed', err);
      alert('Failed to restore note. Please try again.');
    }
  };

  const handleDeleteClosedForever = (closedNote) => {
    if (!user?.uid) return;
    if (!confirm('Permanently remove this recently closed note? This cannot be undone.')) return;
    removeRecentlyClosedNote(user.uid, closedNote.id);
    refreshRecentlyClosed();
  };

  // Real-time listener for quotes
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.uid) {
      setQuotes([]);
      return;
    }

    console.log('Dashboard: Setting up real-time quotes listener for user:', user.uid);

    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      quotesQuery,
      (snapshot) => {
        const quotesArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Dashboard: Quotes updated:', quotesArray.length);
        setQuotes(quotesArray);
        setError(null);
      },
      (error) => {
        console.error('Dashboard: Error listening to quotes:', error);
        if (error.message?.includes('index')) {
          console.error('Dashboard: COMPOSITE INDEX REQUIRED for quotes!');
          console.error('Dashboard: Collection: quotes');
          console.error('Dashboard: Fields: userId (Ascending), createdAt (Descending)');
        }
        setQuotes([]);
      }
    );

    return () => {
      console.log('Dashboard: Unsubscribing from quotes listener');
      unsubscribe();
    };
  }, [user?.uid, authLoading]);

  // Calculate stats from real-time data
  const stats = {
    totalNotes: notes.length,
    quotesCount: quotes.length,
    highlightedSegments: notes.reduce((acc, note) => acc + (note.highlights?.length || 0), 0),
    memoriesResurfaced: parseInt(localStorage.getItem('memoriesResurfaced') || '0')
  };

  const statCards = [
    { icon: FileText, label: 'Total Notes', value: stats.totalNotes, color: 'text-blue-500' },
    { icon: Quote, label: 'Quotes Saved', value: stats.quotesCount, color: 'text-purple-500' },
    { icon: Sparkles, label: 'AI Highlights', value: stats.highlightedSegments, color: 'text-yellow-500' },
    { icon: Clock, label: 'Memories Resurfaced', value: stats.memoriesResurfaced, color: 'text-green-500' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <div className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-300 dark:border-danger-700 rounded-lg">
            <p className="text-danger-700 dark:text-danger-400">{error}</p>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-2">Check browser console for details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2 text-sm sm:text-base">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat, index) => {
          const links = ['/notes', '/quotes', '/notes', '/notes'];
          const colors = [
            'text-primary-500',
            'text-primary-600', 
            'text-success-500',
            'text-success-600'
          ];
          return (
            <a
              key={index}
              href={links[index]}
              className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
                <div className="w-full">
                  <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${colors[index]}`} />
              </div>
            </a>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <a 
            href="/notes/new" 
            className="p-4 sm:p-6 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg transition text-center group"
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition" />
            <p className="text-gray-900 dark:text-slate-100 font-medium text-sm sm:text-base">Create Note</p>
          </a>
          <a 
            href="/notes" 
            className="p-4 sm:p-6 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg transition text-center group"
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition" />
            <p className="text-gray-900 dark:text-slate-100 font-medium text-sm sm:text-base">View All Notes</p>
          </a>
          <a 
            href="/quotes" 
            className="p-4 sm:p-6 bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-lg transition text-center group"
          >
            <Quote className="h-8 w-8 mx-auto mb-2 text-success-600 dark:text-success-400 group-hover:scale-110 transition" />
            <p className="text-gray-900 dark:text-slate-100 font-medium text-sm sm:text-base">My Quotes</p>
          </a>
        </div>
      </div>

      {/* Recently Closed Notes */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            Recently Closed
          </h2>
          {recentlyClosed.length > 0 && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">
              Showing last {recentlyClosed.length} closed notes
            </p>
          )}
        </div>

        {recentlyClosed.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-500 text-sm">
            Notes you delete will appear here so you can quickly restore them.
          </p>
        ) : (
          <div className="space-y-3">
            {recentlyClosed.map((note) => (
              <div
                key={`${note.id}-${note.deletedAt}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                    {note.title || 'Untitled note'}
                  </p>
                  {note.deletedAt && (
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      Closed on {new Date(note.deletedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRestoreClosed(note)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-500 hover:bg-success-600 text-white text-xs sm:text-sm font-medium transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => handleDeleteClosedForever(note)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 border border-danger-200 dark:border-danger-700 hover:bg-danger-100 dark:hover:bg-danger-900/40 text-xs sm:text-sm font-medium transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
