import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { askAIAssistant } from '../services/aiService';

export default function AIAssistant({ context = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const answer = await askAIAssistant(question, context);
      const aiMessage = { role: 'assistant', content: answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}`,
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary-500 hover:bg-primary-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
          title="AI Assistant"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-slate-800 bg-primary-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white text-sm sm:text-base">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-slate-400 mt-8">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400 dark:text-slate-600" />
                <p className="text-sm">Ask me anything!</p>
                <p className="text-xs mt-2">
                  {context 
                    ? 'I can answer questions about your current note or general knowledge.'
                    : 'I can help with definitions, explanations, and general knowledge.'}
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2 sm:p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : msg.isError
                      ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border border-danger-300 dark:border-danger-700'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-400 dark:border-slate-400 border-t-transparent rounded-full"></div>
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {context && (
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                💡 Context from current note is available
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
