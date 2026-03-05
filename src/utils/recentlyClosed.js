const STORAGE_KEY = 'recentlyClosedNotes';
const MAX_RECENT_PER_USER = 10;

function safeGetStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function readAllRaw() {
  const storage = safeGetStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('recentlyClosed: Failed to parse storage, resetting', e);
    return [];
  }
}

function writeAllRaw(items) {
  const storage = safeGetStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('recentlyClosed: Failed to write storage', e);
  }
}

export function getRecentlyClosedNotes(userId) {
  if (!userId) return [];
  const all = readAllRaw();
  return all
    .filter((item) => item.userId === userId)
    .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
}

export function addRecentlyClosedNote(userId, note) {
  if (!userId || !note?.id) return;

  const all = readAllRaw();

  const cleanedNote = {
    id: note.id,
    title: note.title || '',
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    reminderDate: note.reminderDate || '',
    highlights: Array.isArray(note.highlights) ? note.highlights : [],
    userId,
    deletedAt: Date.now()
  };

  const withoutThis = all.filter(
    (item) => !(item.userId === userId && item.id === cleanedNote.id)
  );

  const withNew = [...withoutThis, cleanedNote].sort(
    (a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)
  );

  const perUser = withNew.filter((item) => item.userId === userId);
  const others = withNew.filter((item) => item.userId !== userId);
  const limitedPerUser = perUser.slice(0, MAX_RECENT_PER_USER);

  writeAllRaw([...others, ...limitedPerUser]);
}

export function removeRecentlyClosedNote(userId, noteId) {
  if (!userId || !noteId) return;
  const all = readAllRaw();
  const filtered = all.filter(
    (item) => !(item.userId === userId && item.id === noteId)
  );
  writeAllRaw(filtered);
}

