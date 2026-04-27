import { useState } from 'react';
import { MessageCircle, CheckCircle, Send, Sparkles } from 'lucide-react';
import { BackButton } from './Backbutton';

interface ChatbotAnalysisProps {
  onComplete: (passion: string) => void;
  onBack?: () => void;
}

const QUICK_PICKS = [
  'Technology & Software',
  'Data Science & AI',
  'Business & Entrepreneurship',
  'Arts & Design',
  'Healthcare & Medicine',
  'Agriculture & Environment',
  'Education & Teaching',
  'Finance & Economics',
  'Engineering',
  'Media & Communication',
];

export function ChatbotAnalysis({ onComplete, onBack }: ChatbotAnalysisProps) {
  const [showFinalPassion, setShowFinalPassion] = useState(false);
  const [finalPassion, setFinalPassion] = useState('');

  const handleDoneClick = () => {
    setShowFinalPassion(true);
  };

  const handleChipClick = (chip: string) => {
    setFinalPassion(chip);
  };

  const handleSubmit = () => {
    const trimmed = finalPassion.trim();
    if (!trimmed) return;
    onComplete(trimmed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">

        {/* Back button */}
        {onBack && <BackButton onBack={onBack} />}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <MessageCircle size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Discover Your Path
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Our AI will chat with you to understand your interests, strengths,
            and aspirations
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden">
          <div className="bg-purple-800/50 border-b border-purple-700/50 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageCircle size={24} className="text-purple-300" />
              Neuropath career chatbot
            </h2>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <div className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-6 text-center space-y-6">
              {/* Bot Picture */}
              <div className="flex justify-center">
                <img
                  src="../../assets/NeuroPath_Robot_Optimized.png"
                  alt="Career Bot"
                  className="w-32 h-32 rounded-full border-4 border-purple-600/50 object-cover"
                />
              </div>

              {/* Chatbase iframe */}
              <div className="rounded-xl overflow-hidden border border-purple-700/50 bg-purple-800/30">
                <iframe
                  src="https://www.chatbase.co/chatbot-iframe/jiaVrX6-wd8oYDtP0SuZm"
                  width="100%"
                  height="700"
                  frameBorder="0"
                  allow="microphone; camera"
                  title="NeuroPath Career Chatbot"
                  className="rounded-xl"
                  style={{ minHeight: '700px' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Button */}
        <div className="mt-8 text-center">
          {!showFinalPassion && (
            <>
              <button
                onClick={handleDoneClick}
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
              >
                <CheckCircle size={24} />
                I'm Done Analyzing
              </button>
              <p className="text-purple-300 text-sm mt-4">
                Click when you've completed the conversation with the chatbot
              </p>
            </>
          )}

          {/* Inline Final-Passion capture */}
          {showFinalPassion && (
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-8 mt-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={22} className="text-green-400" />
                <span className="text-green-300 font-semibold">Great — analysis complete!</span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={20} className="text-purple-400" />
                <h3 className="text-xl font-bold text-white">Identified your final passion?</h3>
              </div>
              <p className="text-purple-300 text-sm mb-5">
                Based on your chat with Neuro, what field excites you the most? Pick a quick option or type your own.
              </p>

              {/* Quick-pick chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {QUICK_PICKS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      finalPassion === chip
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                        : 'bg-purple-800/40 text-purple-200 border-purple-700/50 hover:bg-purple-700/50 hover:border-purple-500'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Free-text input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={finalPassion}
                  onChange={(e) => setFinalPassion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Or type your own passion / field…"
                  className="flex-1 px-5 py-3 rounded-xl bg-purple-800/40 border border-purple-700/50 text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!finalPassion.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                >
                  <Send size={18} />
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}