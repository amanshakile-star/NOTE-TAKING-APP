import { getUserNotes } from '../services/noteService';
import { showLocalNotification } from '../services/notificationService';

export async function setupMemoryResurfacing(userId) {
  // Check for old notes to resurface (run daily)
  const checkInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  const checkOldNotes = async () => {
    try {
      const notes = await getUserNotes(userId);
      const now = Date.now();
      
      // Find notes older than 7 days
      const oldNotes = notes.filter(note => {
        const createdAt = note.createdAt?.toMillis?.() || 0;
        const daysSince = (now - createdAt) / (1000 * 60 * 60 * 24);
        return daysSince >= 7;
      });
      
      if (oldNotes.length > 0) {
        const randomNote = oldNotes[Math.floor(Math.random() * oldNotes.length)];
        const createdAt = randomNote.createdAt?.toMillis?.() || 0;
        const daysAgo = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        
        showLocalNotification(
          'Do you remember this?',
          `From ${daysAgo} days ago: ${randomNote.title || 'Untitled note'}`
        );
        
        // Increment counter
        const count = parseInt(localStorage.getItem('memoriesResurfaced') || '0');
        localStorage.setItem('memoriesResurfaced', (count + 1).toString());
      }
    } catch (error) {
      console.error('Memory resurfacing error:', error);
    }
  };
  
  // Run immediately
  checkOldNotes();
  
  // Schedule daily checks
  return setInterval(checkOldNotes, checkInterval);
}

export function suggestDailyEntry() {
  const lastSuggestion = localStorage.getItem('lastDailySuggestion');
  const now = new Date().toDateString();
  
  if (lastSuggestion !== now) {
    showLocalNotification(
      'Daily Reflection',
      "How was your day? Record today's life entry."
    );
    localStorage.setItem('lastDailySuggestion', now);
  }
}
