import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="mt-6 text-4xl font-bold text-slate-100">Memory Intelligence</h1>
          <p className="mt-2 text-slate-400">Smart notes with AI-powered memory</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-lg shadow-xl">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium transition border border-slate-700"
            >
              Continue with Google
            </button>
          </div>

          <p className="mt-4 text-center text-slate-400 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-500 hover:text-blue-400"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
