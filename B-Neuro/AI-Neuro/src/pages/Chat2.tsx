import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, ArrowLeft } from 'lucide-react';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

interface Chat2Props {
  onComplete: (predictedPassion: string) => void;
  userName: string;
  onBack?: () => void;
}

const categories = [
  'AI / Data Science', 'Web Development', 'Cybersecurity', 'Mechanical Engineering', 'Design / Architecture',
  'Business Analytics', 'Renewable Energy', 'Embedded Systems / IoT', 'Mathematics / Problem Solving',
  'Teacher Training', 'Healthcare / Nursing', 'Nutrition / Dietetics', 'Environmental Science',
  'Graphic Design', 'Fashion Design', 'Agriculture / Farming', 'Animal Husbandry', 'Music / Performing Arts',
  'Languages / Literature', 'Sports / Fitness', 'Electrical Systems', 'Robotics', 'Hospitality / Tourism',
  'Civil Engineering', 'Healthcare', 'Languages', 'Electrical Engineering', 'Sports', 'Agriculture',
  'Music / Arts', 'Business / Management', 'AI / Machine Learning', 'Full Stack Development',
  'Electronics / VLSI', 'Data Analytics', 'Design Thinking', 'Business / Analytics', 'Mechanical Design',
  'Digital Design / VLSI', 'Renewable Energy / EV', 'Data Science', 'Cyber / IT'
];

const questions = [
  "On a scale of 1-5, how interested are you in programming and coding?",
  "On a scale of 1-5, how interested are you in design and creativity?",
  "On a scale of 1-5, how interested are you in science and mathematics?",
  "On a scale of 1-5, how interested are you in helping people and healthcare?",
  "On a scale of 1-5, how interested are you in environment and nature?",
  "On a scale of 1-5, how interested are you in business and management?",
  "On a scale of 1-5, how interested are you in arts and music?",
  "On a scale of 1-5, how interested are you in sports and physical activities?",
  "On a scale of 1-5, how interested are you in languages and communication?",
  "On a scale of 1-5, how interested are you in engineering and hardware?"
];

const featureMappings: { [key: string]: number[] } = {
  'AI / Data Science': [5, 1, 5, 1, 1, 2, 1, 1, 1, 3],
  'Web Development': [5, 5, 2, 1, 1, 2, 1, 1, 2, 2],
  'Cybersecurity': [4, 2, 3, 1, 1, 2, 1, 1, 2, 4],
  'Mechanical Engineering': [3, 3, 4, 1, 2, 1, 1, 1, 1, 5],
  'Design / Architecture': [1, 5, 2, 1, 3, 2, 2, 1, 2, 3],
  'Business Analytics': [4, 2, 4, 2, 1, 5, 1, 1, 3, 2],
  'Renewable Energy': [3, 2, 5, 2, 5, 2, 1, 1, 1, 4],
  'Embedded Systems / IoT': [4, 2, 4, 1, 2, 1, 1, 1, 1, 5],
  'Mathematics / Problem Solving': [2, 1, 5, 1, 1, 2, 1, 1, 1, 2],
  'Teacher Training': [1, 2, 2, 3, 1, 2, 2, 1, 5, 1],
  'Healthcare / Nursing': [1, 1, 3, 5, 1, 2, 1, 1, 3, 2],
  'Nutrition / Dietetics': [1, 2, 4, 5, 4, 2, 1, 2, 2, 1],
  'Environmental Science': [1, 2, 5, 3, 5, 1, 1, 1, 2, 2],
  'Graphic Design': [1, 5, 1, 1, 2, 1, 4, 1, 2, 1],
  'Fashion Design': [1, 5, 2, 2, 2, 3, 4, 1, 2, 1],
  'Agriculture / Farming': [1, 2, 4, 2, 5, 2, 1, 2, 1, 2],
  'Animal Husbandry': [1, 1, 3, 4, 4, 1, 1, 2, 2, 1],
  'Music / Performing Arts': [1, 3, 1, 2, 1, 1, 5, 2, 3, 1],
  'Languages / Literature': [1, 2, 1, 2, 1, 1, 2, 1, 5, 1],
  'Sports / Fitness': [1, 2, 1, 2, 1, 1, 1, 5, 3, 1],
  'Electrical Systems': [3, 1, 4, 1, 1, 1, 1, 1, 1, 5],
  'Robotics': [4, 3, 4, 1, 1, 1, 1, 1, 1, 5],
  'Hospitality / Tourism': [1, 3, 1, 3, 3, 4, 3, 2, 5, 1],
  'Civil Engineering': [2, 4, 4, 1, 3, 1, 1, 1, 1, 4],
  'Healthcare': [1, 1, 3, 5, 1, 2, 1, 1, 3, 2],
  'Languages': [1, 2, 1, 2, 1, 1, 2, 1, 5, 1],
  'Electrical Engineering': [3, 1, 4, 1, 1, 1, 1, 1, 1, 5],
  'Sports': [1, 2, 1, 2, 1, 1, 1, 5, 3, 1],
  'Agriculture': [1, 2, 4, 2, 5, 2, 1, 2, 1, 2],
  'Music / Arts': [1, 3, 1, 2, 1, 1, 5, 2, 3, 1],
  'Business / Management': [2, 2, 2, 2, 1, 5, 1, 1, 4, 2],
  'AI / Machine Learning': [5, 1, 5, 1, 1, 2, 1, 1, 1, 3],
  'Full Stack Development': [5, 4, 2, 1, 1, 2, 1, 1, 2, 3],
  'Electronics / VLSI': [3, 1, 4, 1, 1, 1, 1, 1, 1, 5],
  'Data Analytics': [4, 2, 4, 2, 1, 4, 1, 1, 2, 2],
  'Design Thinking': [1, 5, 2, 3, 2, 4, 2, 1, 3, 2],
  'Business / Analytics': [4, 2, 4, 2, 1, 5, 1, 1, 3, 2],
  'Mechanical Design': [3, 4, 4, 1, 2, 1, 1, 1, 1, 5],
  'Digital Design / VLSI': [3, 3, 4, 1, 1, 1, 1, 1, 1, 5],
  'Renewable Energy / EV': [3, 2, 5, 2, 5, 2, 1, 1, 1, 4],
  'Data Science': [4, 1, 5, 1, 1, 3, 1, 1, 1, 2],
  'Cyber / IT': [4, 2, 3, 1, 1, 2, 1, 1, 2, 4]
};

export function Chat2({ onComplete, userName, onBack }: Chat2Props) {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm here to help you discover your area of interest based on your passions and skills. I'll ask you a few questions on a scale of 1-5 (1: not interested, 5: very interested). Let's start!", sender: 'bot' }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [predictedPassion, setPredictedPassion] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAddedFirstQuestion = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add first question only once on component mount using ref to prevent double-call in strict mode
    if (!hasAddedFirstQuestion.current) {
      hasAddedFirstQuestion.current = true;
      addBotMessage(questions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { text, sender: 'bot' }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { text, sender: 'user' }]);
  };

  const handleResponse = (response: number) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    addUserMessage(response.toString());

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => addBotMessage(questions[currentQuestionIndex + 1]), 500);
    } else {
      // All questions answered, analyze
      analyzeInterest(newResponses);
    }
  };

  // Calculate cosine similarity between two vectors
  const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  };

  // Calculate weighted euclidean distance (lower is better)
  const weightedDistance = (vec1: number[], vec2: number[]): number => {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      // Weight by the user's response - higher responses get more weight
      const weight = vec1[i] / 5;
      sum += weight * Math.pow(vec1[i] - vec2[i], 2);
    }
    return Math.sqrt(sum);
  };

  const analyzeInterest = async (userResponses: number[]) => {
    setIsAnalyzing(true);
    addBotMessage("Great! Let me analyze your responses using advanced pattern matching algorithms to find your best area of interest.");

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate similarity scores for all categories
    const similarities: Array<{ category: string; similarity: number; distance: number }> = [];
    
    categories.forEach(category => {
      const categoryMapping = featureMappings[category];
      if (categoryMapping) {
        const similarity = cosineSimilarity(userResponses, categoryMapping);
        const distance = weightedDistance(userResponses, categoryMapping);
        similarities.push({ 
          category, 
          similarity, 
          distance 
        });
      }
    });

    // Sort by similarity (higher is better) and then by distance (lower is better)
    similarities.sort((a, b) => {
      // Primary sort: cosine similarity (descending)
      const simDiff = b.similarity - a.similarity;
      if (Math.abs(simDiff) > 0.01) return simDiff;
      // Secondary sort: distance (ascending)
      return a.distance - b.distance;
    });

    // Get top 3 matches
    const top3 = similarities.slice(0, 3);
    
    const predictedArea = similarities[0].category;
    const confidenceScore = (similarities[0].similarity * 100).toFixed(1);

    console.log('Top 3 matches:', top3);
    console.log('User responses:', userResponses);

    setTimeout(() => {
      addBotMessage(`${userName}, based on your responses, your primary area of interest is: **${predictedArea}** (${confidenceScore}% match). This is determined using cosine similarity analysis of your interest patterns!`);
      
      if (top3.length > 1) {
        const alternativesText = `Alternative matches: ${top3.slice(1, 3).map(s => `${s.category} (${(s.similarity * 100).toFixed(1)}%)`).join(', ')}`;
        setTimeout(() => addBotMessage(alternativesText), 800);
      }
      
      setPredictedPassion(predictedArea);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 1000);
  };

  const handleSendResponse = () => {
    const value = parseInt(inputValue);
    if (value >= 1 && value <= 5) {
      handleResponse(value);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendResponse();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Brain size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI-Powered Interest Discovery
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Answer simple questions and let our advanced matching algorithm identify your perfect career path
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden">
          <div className="bg-purple-800/50 border-b border-purple-700/50 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Brain size={24} className="text-purple-300" />
              AI Career Interest Analysis
            </h2>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-purple-800/50 text-purple-100 border border-purple-700/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-purple-800/50 text-purple-100 border border-purple-700/50 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300"></div>
                    <span>Analyzing your interests using AI pattern matching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {currentQuestionIndex < questions.length && !isAnalyzing && (
            <div className="border-t border-purple-700/50 p-6">
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 1-5"
                  className="flex-1 bg-purple-800/30 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={20} />
                  Send
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setInputValue(num.toString());
                      handleResponse(num);
                    }}
                    className="flex-1 py-2 rounded-lg bg-purple-800/30 hover:bg-purple-700/50 border border-purple-700/50 text-purple-200 font-semibold transition-all hover:scale-105"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Continue to Detailed Analysis Button */}
        {analysisComplete && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onComplete(predictedPassion)}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
            >
              <Brain size={24} />
              Continue to Personalized Analysis - Institutes, Scholarships & Best Courses
            </button>
            <p className="text-purple-300 text-sm mt-4">
              Get detailed recommendations tailored to your interests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat2;
