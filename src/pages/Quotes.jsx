import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuotes } from '../services/noteService';
import { Quote, Bell } from 'lucide-react';
import { showLocalNotification } from '../services/notificationService';

export default function Quotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadQuotes();
    }
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
    if (quotes.length === 0) {
      alert('No quotes available. Save some quotes first!');
      return;
    }
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    showLocalNotification('Your Quote', randomQuote.text);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-100">My Quotes</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-400">Loading quotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-100">My Quotes</h1>
        </div>
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadQuotes}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">My Quotes</h1>
        <button
          onClick={showRandomQuote}
          disabled={quotes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bell className="h-5 w-5" />
          Random Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map(quote => (
          <div key={quote.id} className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <Quote className="h-8 w-8 text-purple-500 mb-4" />
            <p className="text-slate-100 text-lg italic mb-4">"{quote.text}"</p>
            {quote.source && (
              <p className="text-slate-400 text-sm">— {quote.source}</p>
            )}
            <p className="text-slate-500 text-xs mt-2">
              {quote.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
            </p>
          </div>
        ))}
      </div>

      {quotes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Quote className="h-16 w-16 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400">No quotes saved yet. Mark powerful sentences in your notes!</p>
        </div>
      )}
    </div>
  );
}
