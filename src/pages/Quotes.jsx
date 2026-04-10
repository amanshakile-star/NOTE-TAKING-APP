import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuotes } from '../services/noteService';
import { Quote, Bell, RefreshCw } from 'lucide-react';
import { showLocalNotification } from '../services/notificationService';

export default function Quotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) loadQuotes();
  }, [user?.uid]);

  const loadQuotes = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      const userQuotes = await getUserQuotes(user.uid);
      setQuotes(userQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to load quotes. Please try again.');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const showRandomQuote = () => {
    if (quotes.length === 0) { alert('No quotes available yet!'); return; }
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    showLocalNotification('Your Quote', q.text);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">My Quotes</h1>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Loading quotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">My Quotes</h1>
        <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-300 dark:border-danger-700 rounded-lg">
          <p className="text-danger-700 dark:text-danger-400 text-sm">{error}</p>
          <button
            onClick={loadQuotes}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-danger-500 hover:bg-danger-600 text-white rounded-lg transition text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">My Quotes</h1>
        <button
          onClick={showRandomQuote}
          disabled={quotes.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-success-500 hover:bg-success-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
        >
          <Bell className="h-5 w-5" />
          Random Quote
        </button>
      </div>

      {/* Quotes Grid */}
      {quotes.length === 0 ? (
        <div className="text-center py-16">
          <Quote className="h-14 w-14 mx-auto text-gray-300 dark:text-slate-700 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            No quotes saved yet. Use AI Analyze on your notes to extract quotes!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition"
            >
              <Quote className="h-7 w-7 text-primary-500 mb-3" />
              <p className="text-gray-900 dark:text-slate-100 text-base sm:text-lg italic mb-3 leading-relaxed">
                "{quote.text}"
              </p>
              {quote.source && (
                <p className="text-gray-600 dark:text-slate-400 text-sm">— {quote.source}</p>
              )}
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
                {quote.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
