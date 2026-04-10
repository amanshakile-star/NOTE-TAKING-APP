import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createNote, updateNote, getNote } from '../services/noteService';
import { askAIAssistant, analyzeNoteForQuotes, highlightExamContent, textToSpeech, stopSpeech } from '../services/aiService';
import { Save, Sparkles, Volume2, VolumeX, Calendar, Tag, ArrowLeft } from 'lucide-react';
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
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');

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

  const handleAskAi = async () => {
    const q = askQuestion.trim();
    if (!q) return;

    const noteText = content.replace(/<[^>]*>/g, '').trim();
    if (!noteText) {
      alert('Please add some note content first.');
      return;
    }

    setAsking(true);
    setAskError('');
    setAskAnswer('');

    try {
      const answer = await askAIAssistant(q, noteText);
      setAskAnswer(answer);
    } catch (err) {
      console.error('Ask AI error:', err);
      setAskError(err?.message || 'Failed to get an answer. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notes')}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
            {id ? 'Edit Note' : 'New Note'}
          </h1>
        </div>
        
        {/* Action Buttons - Grouped Logically */}
        <div className="flex flex-wrap gap-2">
          {/* Secondary Actions */}
          <button
            onClick={toggleSpeech}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg transition text-sm"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Read'}</span>
          </button>
          
          {/* AI Action - Yellow */}
          <button
            onClick={handleAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{analyzing ? 'Analyzing...' : 'AI Analyze'}</span>
          </button>
          
          {/* Save Action - Green */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {/* Rich Text Editor */}
        <div className="quill-wrapper">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                [{ font: [] }],
                [{ size: ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline', 'strike',
              'color', 'background',
              'align', 'list', 'bullet',
              'blockquote', 'code-block', 'link'
            ]}
          />
        </div>

        {/* Tags and Reminder Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tags Section */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mb-2 text-sm font-medium">
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
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  onClick={() => removeTag(tag)}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition"
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          {/* Reminder Section */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mb-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* AI Highlights Display */}
        {highlights.length > 0 && (
          <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg border border-success-200 dark:border-success-800">
            <h3 className="text-gray-900 dark:text-slate-100 font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="h-5 w-5 text-success-600 dark:text-success-400" />
              AI Detected Exam Content ({highlights.length})
            </h3>
            <ul className="space-y-2">
              {highlights.map((highlight, i) => (
                <li key={i} className="text-gray-700 dark:text-slate-300 text-sm border-l-2 border-success-500 pl-3">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analyzing && (
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-700 dark:text-slate-300 text-sm">Analyzing content with AI...</p>
            </div>
          </div>
        )}

        {/* Ask AI (uses current note context) */}
        <div className="bg-white dark:bg-slate-950/40 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-gray-900 dark:text-slate-100 font-semibold text-sm sm:text-base">
              Ask AI about this note
            </h3>
            <button
              onClick={handleAskAi}
              disabled={asking || !askQuestion.trim()}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              {asking ? 'Asking…' : 'Ask AI'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskAi();
                }
              }}
              placeholder='e.g. "Summarize this note" or "Explain this paragraph"'
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {askError && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-lg">
                <p className="text-danger-700 dark:text-danger-400 text-sm">{askError}</p>
              </div>
            )}

            {askAnswer && (
              <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
                <p className="text-gray-900 dark:text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
                  {askAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant with note context */}
      <AIAssistant context={content.replace(/<[^>]*>/g, '')} />
    </div>
  );
}
