import { useState } from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
 
interface ChatbotAnalysisProps {
  onComplete: () => void;
}

export function ChatbotAnalysis({ onComplete }: ChatbotAnalysisProps) {
  const [messages, setMessages] = useState<
    Array<{ role: 'bot' | 'user'; text: string }>
  >([
    {
      role: 'bot',
      text: "Hello! I'm here to help you discover your skills and passions. Let's start with a few questions to understand you better."
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
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
            {/* Existing messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-purple-800/50 text-purple-100 border border-purple-700/50'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {/* Bot Image + Chatbase iframe */}
            <div className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-6 text-center space-y-6">
              {/* Bot Picture */}
              <div className="flex justify-center">
                <img
                  src='../../assets/NeuroPath_Robot_Optimized.png' 
                  alt="Career Bot"
                  className="w-32 h-32 rounded-full border-4 border-purple-600/50 object-cover"
                />
              </div>

              {/* Chatbase Chatbot Embed */}
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
          <button
            onClick={onComplete}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
          >
            <CheckCircle size={24} />
            I'm Done Analyzing
          </button>
          <p className="text-purple-300 text-sm mt-4">
            Click when you've completed the conversation with the chatbot
          </p>
        </div>
      </div>
    </div>
  );
}
