import { FileText, TrendingUp, Target, Award, BookOpen, Download, Home } from 'lucide-react';

interface CareerReportProps {
  onRestart: () => void;
}

export function CareerReport({ onRestart }: CareerReportProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <FileText size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Personalized Career Report
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            A comprehensive analysis of your career path and recommendations
          </p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-800 to-purple-900 px-8 py-6 border-b border-purple-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Career Path Analysis</h2>
                <p className="text-purple-300 text-sm">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-700/50 hover:bg-purple-700 text-white font-medium transition-all">
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Target size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Identified Skills & Passions</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <p className="text-purple-200 mb-4">
                  Based on your responses and analysis, we've identified the following key areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-full bg-purple-700/50 text-purple-200 border border-purple-600/50 font-medium">
                    Technology & Programming
                  </span>
                  <span className="px-4 py-2 rounded-full bg-purple-700/50 text-purple-200 border border-purple-600/50 font-medium">
                    Problem Solving
                  </span>
                  <span className="px-4 py-2 rounded-full bg-purple-700/50 text-purple-200 border border-purple-600/50 font-medium">
                    Continuous Learning
                  </span>
                  <span className="px-4 py-2 rounded-full bg-purple-700/50 text-purple-200 border border-purple-600/50 font-medium">
                    Creative Thinking
                  </span>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <TrendingUp size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recommended Career Paths</h3>
              </div>
              <div className="ml-15 space-y-4">
                <div className="bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                  <h4 className="text-xl font-bold text-white mb-2">1. Software Developer</h4>
                  <p className="text-purple-200 mb-3">
                    Design, develop, and maintain software applications. High demand in the industry with excellent growth opportunities.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/50">
                      High Demand
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50">
                      Remote Friendly
                    </span>
                  </div>
                </div>

                <div className="bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                  <h4 className="text-xl font-bold text-white mb-2">2. Web Developer</h4>
                  <p className="text-purple-200 mb-3">
                    Create and maintain websites and web applications. Perfect for those who enjoy visual and interactive design.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/50">
                      Growing Field
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50">
                      Creative
                    </span>
                  </div>
                </div>

                <div className="bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                  <h4 className="text-xl font-bold text-white mb-2">3. Data Analyst</h4>
                  <p className="text-purple-200 mb-3">
                    Analyze data to help organizations make informed decisions. Combines technical skills with business insights.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/50">
                      In Demand
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                      Analytical
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <BookOpen size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Next Steps</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <ol className="list-decimal list-inside space-y-3 text-purple-200">
                  <li className="pl-2">
                    <span className="font-semibold text-white">Skill Development:</span> Enroll in the recommended courses to build your technical foundation
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Apply for Scholarships:</span> Explore the scholarship opportunities that match your profile
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Build Portfolio:</span> Start working on personal projects to showcase your skills
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Network:</span> Connect with professionals in your field of interest
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Stay Updated:</span> Keep learning and adapting to industry trends
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Award size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Resources Available</h3>
              </div>
              <div className="ml-15 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Skill Programs</h4>
                  <p className="text-purple-300 text-sm">6 relevant training programs</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Courses</h4>
                  <p className="text-purple-300 text-sm">4 recommended courses</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Scholarships</h4>
                  <p className="text-purple-300 text-sm">4 matching opportunities</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Career Paths</h4>
                  <p className="text-purple-300 text-sm">3 recommended paths</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-purple-800/50 hover:bg-purple-800 border border-purple-600/50 text-white text-xl font-bold transition-all"
          >
            <Home size={24} />
            Return to Home
          </button>
          <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50">
            <Download size={24} />
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
