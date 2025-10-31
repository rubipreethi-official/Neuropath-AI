import { useRef } from 'react';
import { FileText, TrendingUp, Target, Award, BookOpen, Download, Home, Building2, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCareerData } from '../data/careerDataset';

interface CareerReportProps {
  onRestart: () => void;
  passion: string;
  userName: string;
}

export function CareerReport({ onRestart, passion, userName }: CareerReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const careerData = getCareerData(passion);
  
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#1e1b4b'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`NeuroPath-Career-Report-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // If no career data found, show default/fallback
  if (!careerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">No Career Data Available</h1>
          <p className="text-purple-200 mb-6">Please complete the assessment first.</p>
          <button
            onClick={onRestart}
            className="px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const getTagColor = (color: string) => {
    const colors: { [key: string]: string } = {
      green: 'bg-green-500/20 text-green-300 border-green-500/50',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      red: 'bg-red-500/20 text-red-300 border-red-500/50',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/50'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-5xl mx-auto" ref={reportRef}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <FileText size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {userName}'s Personalized Career Report
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            A comprehensive analysis of your career path and recommendations
          </p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-800 to-purple-900 px-8 py-6 border-b border-purple-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Career Path Analysis for {userName}</h2>
                <p className="text-purple-300 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                <p className="text-purple-200 font-semibold mt-1">Your Identified Passion: {careerData.passion}</p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-700/50 hover:bg-purple-700 text-white font-medium transition-all"
              >
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
                <h3 className="text-2xl font-bold text-white">Relevant Skills for {careerData.passion}</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <p className="text-purple-200 mb-4">
                  Based on your passion for {careerData.passion}, here are the key skills you should develop:
                </p>
                <div className="flex flex-wrap gap-2">
                  {careerData.relevantSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 rounded-full bg-purple-700/50 text-purple-200 border border-purple-600/50 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
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
                {careerData.careerPaths.map((career, index) => (
                  <div key={index} className="bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                    <h4 className="text-xl font-bold text-white mb-2">{index + 1}. {career.title}</h4>
                    <p className="text-purple-200 mb-3">
                      {career.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {career.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className={`text-xs px-3 py-1 rounded-full border ${getTagColor(tag.color)}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <GraduationCap size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recommended Courses & Degrees</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <p className="text-purple-200 mb-4">
                  Here are the top courses to help you excel in {careerData.passion}:
                </p>
                <ul className="space-y-2">
                  {careerData.courses.map((course, index) => (
                    <li key={index} className="text-purple-100 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="font-medium">{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Building2 size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Top Institutions</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <p className="text-purple-200 mb-4">
                  Consider these renowned institutions for your studies:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {careerData.institutions.map((institution, index) => (
                    <div 
                      key={index}
                      className="bg-purple-700/30 rounded-lg p-3 border border-purple-600/50"
                    >
                      <p className="text-purple-100 font-medium">{institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Award size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Training Programs</h3>
              </div>
              <div className="ml-15 bg-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <p className="text-purple-200 mb-4">
                  Enhance your skills with these specialized training programs:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {careerData.trainingPrograms.map((program, index) => (
                    <div 
                      key={index}
                      className="bg-purple-700/30 rounded-lg p-3 border border-purple-600/50 flex items-center gap-2"
                    >
                      <span className="text-purple-400">✓</span>
                      <p className="text-purple-100">{program}</p>
                    </div>
                  ))}
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
                    <span className="font-semibold text-white">Skill Development:</span> Start with the recommended courses to build your foundation in {careerData.passion}
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Apply to Institutions:</span> Research and apply to the top institutions listed above
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Training Programs:</span> Enroll in specialized training programs to gain practical experience
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Build Portfolio:</span> Start working on projects that showcase your skills
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Network:</span> Connect with professionals in the {careerData.passion} field
                  </li>
                  <li className="pl-2">
                    <span className="font-semibold text-white">Stay Updated:</span> Keep learning and adapting to the latest trends in your field
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <FileText size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Summary of Resources</h3>
              </div>
              <div className="ml-15 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Training Programs</h4>
                  <p className="text-purple-300 text-sm">{careerData.trainingPrograms.length} relevant programs</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Courses</h4>
                  <p className="text-purple-300 text-sm">{careerData.courses.length} recommended courses</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Institutions</h4>
                  <p className="text-purple-300 text-sm">{careerData.institutions.length} top institutions</p>
                </div>
                <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                  <h4 className="font-bold text-white mb-1">Career Paths</h4>
                  <p className="text-purple-300 text-sm">{careerData.careerPaths.length} recommended paths</p>
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
          <button 
            onClick={handleDownloadPDF}
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
          >
            <Download size={24} />
            Download Full Report as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
