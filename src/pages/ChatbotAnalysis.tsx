import { useState } from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';

interface ChatbotAnalysisProps {
  onComplete: () => void;
}

export function ChatbotAnalysis({ onComplete }: ChatbotAnalysisProps) {
  const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user'; text: string }>>([
    { role: 'bot', text: "Hello! I'm here to help you discover your skills and passions. Let's start with a few questions to understand you better." }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <MessageCircle size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Discover Your Path
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Our AI will chat with you to understand your interests, strengths, and aspirations
          </p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden">
          <div className="bg-purple-800/50 border-b border-purple-700/50 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageCircle size={24} className="text-purple-300" />
              Career Discovery Assistant
            </h2>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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

            <div className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-6 text-center">
              <div className="mb-4">
                <MessageCircle size={48} className="text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Chatbot Integration Point
                </h3>
                <p className="text-purple-300 mb-4">
                  This is where you'll integrate your custom chatbot with trained knowledge to analyze the student's skills and passions through an interactive conversation.
                </p>
                <div className="bg-purple-900/50 rounded-lg p-4 text-left text-sm text-purple-200">
                  <p className="font-semibold mb-2">Integration Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Connect your AI chatbot API here</li>
                    <li>Implement message handling and responses</li>
                    <li>Store conversation data for analysis</li>
                    <li>Process results to identify skills and interests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-700/50 p-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 rounded-lg bg-purple-950/50 border border-purple-700/50 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled
              />
              <button
                disabled
                className="px-6 py-3 rounded-lg bg-purple-800/50 text-purple-400 border border-purple-700/50 cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

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
