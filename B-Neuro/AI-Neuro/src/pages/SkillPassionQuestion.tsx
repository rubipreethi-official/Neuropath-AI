import { useState } from 'react';
import { Lightbulb, HelpCircle, ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface SkillPassionQuestionProps {
  onAnswer: (knowsSkill: boolean, passion?: string) => void;
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

export function SkillPassionQuestion({ onAnswer, onBack }: SkillPassionQuestionProps) {
  const [showPassionInput, setShowPassionInput] = useState(false);
  const [passionValue, setPassionValue] = useState('');
  const [preWarming, setPreWarming] = useState(false);

  const handleYesClick = () => {
    setShowPassionInput(true);
  };

  const handleChipClick = (chip: string) => {
    setPassionValue(chip);
  };

  const handleSubmit = async () => {
    const trimmed = passionValue.trim();
    if (!trimmed) return;
    // Fire-and-forget background enrichment so backend has a head start
    setPreWarming(true);
    try {
      fetch(`${BACKEND_URL}/api/career/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: trimmed }),
      }).catch(() => {/* ignore network errors */});
      // Short delay so server receives the request before we navigate away
      await new Promise(r => setTimeout(r, 300));
    } catch { /* ignore */ }
    setPreWarming(false);
    onAnswer(true, trimmed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        )}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Lightbulb size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Start With You
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Understanding your current knowledge helps us provide the best guidance for your career journey
          </p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Do you know your skills or passion?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleYesClick}
              className={`group relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 border-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 rounded-2xl p-8 ${
                showPassionInput
                  ? 'border-purple-400 shadow-purple-500/50'
                  : 'border-purple-600/50 hover:border-purple-500'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-700/50 mx-auto mb-4">
                  <Lightbulb size={32} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Yes, I Know</h3>
                <p className="text-purple-200">
                  I have a clear understanding of my skills and what I'm passionate about
                </p>
              </div>
            </button>

            <button
              onClick={() => onAnswer(false)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 border-2 border-purple-600/50 hover:border-purple-500 rounded-2xl p-8 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-700/50 mx-auto mb-4">
                  <HelpCircle size={32} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No, Help Me Discover</h3>
                <p className="text-purple-200">
                  I need guidance to identify my skills and explore my passions
                </p>
              </div>
            </button>
          </div>

          {/* Inline passion input — revealed only after "Yes, I Know" */}
          {showPassionInput && (
            <div className="mt-10 animate-fade-in">
              <div className="border-t border-purple-700/50 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-purple-400" />
                  <h3 className="text-xl font-bold text-white">What is your skill or passion?</h3>
                </div>

                {/* Quick-pick chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {QUICK_PICKS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        passionValue === chip
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
                    value={passionValue}
                    onChange={(e) => setPassionValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Or type your own (e.g., Robotics, Fashion Design…)"
                    className="flex-1 px-5 py-3 rounded-xl bg-purple-800/40 border border-purple-700/50 text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!passionValue.trim() || preWarming}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                  >
                    {preWarming ? (
                      <><Loader2 size={18} className="animate-spin" /> Preparing…</>
                    ) : (
                      <><Send size={18} /> Continue</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-purple-300 text-sm">
            Don't worry, there's no wrong answer. We're here to help you every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
}
