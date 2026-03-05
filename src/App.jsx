import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import Quotes from './pages/Quotes';
import Layout from './components/Layout';
import PdfViewer from './components/PdfViewer';
import { getNote } from './services/noteService';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <div className="text-slate-900 dark:text-slate-100">Loading...</div>
    </div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PdfViewerWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNote(id);
        if (!data || data.userId !== user?.uid) {
          navigate('/notes');
          return;
        }
        setNote(data);
      } catch (e) {
        console.error('Failed to load PDF note', e);
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    };
    if (id && user?.uid) {
      load();
    }
  }, [id, user?.uid, navigate]);

  if (loading || !note) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-700 dark:text-slate-200">
        Loading PDF…
      </div>
    );
  }

  return <PdfViewer fileUrl={note.fileUrl} title={note.title} />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="notes/new" element={<NoteEditor />} />
              <Route path="notes/:id" element={<NoteEditor />} />
              <Route path="pdf/:id" element={<PdfViewerWrapper />} />
              <Route path="quotes" element={<Quotes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
