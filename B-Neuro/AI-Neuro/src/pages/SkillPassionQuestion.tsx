import { Lightbulb, HelpCircle, ArrowLeft } from 'lucide-react';

interface SkillPassionQuestionProps {
  onAnswer: (knowsSkill: boolean) => void;
  onBack?: () => void;
}

export function SkillPassionQuestion({ onAnswer, onBack }: SkillPassionQuestionProps) {
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
              onClick={() => onAnswer(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 border-2 border-purple-600/50 hover:border-purple-500 rounded-2xl p-8 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
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
