import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createNote, updateNote, getNote } from '../services/noteService';
import { analyzeNoteForQuotes, highlightExamContent, textToSpeech, stopSpeech } from '../services/aiService';
import { Save, Sparkles, Volume2, VolumeX, Calendar, Tag } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

export default function NoteEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (id) loadNote();
  }, [id]);

  const loadNote = async () => {
    const note = await getNote(id);
    if (note && note.userId === user.uid) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setReminderDate(note.reminderDate || '');
      setHighlights(note.highlights || []);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    setSaving(true);
    const noteData = { title, content, tags, reminderDate, highlights };
    
    try {
      if (id) {
        await updateNote(id, noteData);
        console.log('Note updated successfully:', id);
      } else {
        const result = await createNote(user.uid, noteData);
        console.log('Note created successfully:', result.id);
      }
      
      setSaving(false);
      navigate('/notes');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save note: ${error.message}`);
      setSaving(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (!content || content.trim() === '') {
      alert('Please add some content to analyze');
      return;
    }

    setAnalyzing(true);
    console.log('AI Analyze: Starting analysis...');
    
    try {
      const plainText = content.replace(/<[^>]*>/g, '');
      console.log('AI Analyze: Content to analyze:', plainText.substring(0, 100) + '...');
      
      const detected = await highlightExamContent(plainText);
      console.log('AI Analyze: Results received:', detected);
      
      if (detected && detected.length > 0) {
        setHighlights(detected);
        console.log('AI Analyze: Highlights updated in state');
        alert(`AI Analysis complete! Found ${detected.length} highlights.`);
      } else {
        setHighlights([]);
        console.log('AI Analyze: No highlights found');
        alert('AI returned no highlights. The content may be too short or not educational.');
      }
    } catch (error) {
      console.error('AI Analyze: Error during analysis:', error);
      alert(`AI Analysis failed: ${error.message}\n\nCheck console for details.`);
      setHighlights([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const plainText = content.replace(/<[^>]*>/g, '');
      textToSpeech(plainText);
      setIsSpeaking(true);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">{id ? 'Edit Note' : 'New Note'}</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleSpeech}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition"
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            {isSpeaking ? 'Stop' : 'Read'}
          </button>
          <button
            onClick={handleAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            {analyzing ? 'Analyzing...' : 'AI Analyze'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={aiMode}
              onChange={(e) => setAiMode(e.target.checked)}
              className="rounded"
            />
            AI Reading Mode
          </label>
        </div>

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-slate-800 rounded-lg"
          modules={{
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['clean']
            ]
          }}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-slate-300 mb-2">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  onClick={() => removeTag(tag)}
                  className="px-3 py-1 bg-slate-700 text-slate-100 rounded-full text-sm cursor-pointer hover:bg-slate-600"
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-slate-300 mb-2">
              <Calendar className="h-4 w-4" />
              Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {highlights.length > 0 ? (
          <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-slate-100 font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Detected Exam Content
            </h3>
            <ul className="space-y-2">
              {highlights.map((highlight, i) => (
                <li key={i} className="text-slate-300 text-sm border-l-2 border-yellow-500 pl-3">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        ) : analyzing ? (
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <p className="text-slate-400">Analyzing content...</p>
          </div>
        ) : null}
      </div>

      {/* AI Assistant with note context */}
      <AIAssistant context={content.replace(/<[^>]*>/g, '')} />
    </div>
  );
}
