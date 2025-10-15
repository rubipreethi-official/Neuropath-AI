import { useState } from 'react';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import AIvideo from "./AI-NPvideo.mp4";
interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950">
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Neuropath
          </div>

          {!user && (
            <div className="flex gap-3">
              <button
                onClick={() => openAuth('signin')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 text-white font-medium transition-all border border-purple-600/50"
              >
                <LogIn size={18} />
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all shadow-lg shadow-purple-500/30"
              >
                <UserPlus size={18} />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Career Guide
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-3xl mx-auto">
              Empowering rural learners with personalized career guidance, skill development, and scholarship opportunities
            </p>
          </div>

          <div className="relative w-full max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/50 border-4 border-purple-700/50">
           <video
    src={AIvideo}
    controls
    autoPlay
    loop
    muted
    className="w-full h-auto rounded-3xl"
  >
    Your browser does not support the video tag.
  </video>
          </div>

          <div className="text-center">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
            >
              Start Your Journey
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Discover Your Passion</h3>
              <p className="text-purple-300">AI-powered analysis to identify your skills and interests</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">Skill Development</h3>
              <p className="text-purple-300">Access curated courses and workshops tailored for you</p>
            </div>
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Opportunities</h3>
              <p className="text-purple-300">Discover scholarships and institutions perfect for your path</p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}
