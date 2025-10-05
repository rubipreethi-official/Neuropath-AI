import { useState } from 'react';
import { BookOpen, Award, ExternalLink, ArrowRight, Building, Calendar, IndianRupee } from 'lucide-react';

interface CoursesAndScholarshipsProps {
  onContinue: () => void;
}

export function CoursesAndScholarships({ onContinue }: CoursesAndScholarshipsProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'scholarships'>('courses');

  const courses = [
    {
      id: 1,
      title: 'Bachelor of Computer Applications (BCA)',
      institution: 'Indira Gandhi National Open University',
      description: 'Comprehensive program in computer applications and software development',
      skillCategory: 'Technology',
      duration: '3 years',
      url: '#',
    },
    {
      id: 2,
      title: 'Diploma in Digital Marketing',
      institution: 'Indian Institute of Digital Education',
      description: 'Learn modern digital marketing strategies and tools',
      skillCategory: 'Marketing',
      duration: '6 months',
      url: '#',
    },
    {
      id: 3,
      title: 'Certificate in Agricultural Technology',
      institution: 'National Institute of Agricultural Extension Management',
      description: 'Modern farming techniques and agricultural technology',
      skillCategory: 'Agriculture',
      duration: '1 year',
      url: '#',
    },
    {
      id: 4,
      title: 'Bachelor of Business Administration',
      institution: 'Distance Education Council',
      description: 'Business management and entrepreneurship skills',
      skillCategory: 'Business',
      duration: '3 years',
      url: '#',
    },
  ];

  const scholarships = [
    {
      id: 1,
      title: 'National Means-cum-Merit Scholarship',
      organization: 'Ministry of Education, Govt. of India',
      description: 'Financial assistance for meritorious students from economically weaker sections',
      eligibility: 'Class 9-12, Annual family income below ₹3.5 lakhs',
      amount: '₹12,000 per year',
      deadline: 'October 31, 2025',
      url: '#',
    },
    {
      id: 2,
      title: 'Post Matric Scholarship for SC/ST/OBC',
      organization: 'Ministry of Social Justice',
      description: 'Support for students belonging to SC/ST/OBC categories',
      eligibility: 'Post-matriculation students from SC/ST/OBC categories',
      amount: 'Up to ₹1,20,000 per year',
      deadline: 'November 30, 2025',
      url: '#',
    },
    {
      id: 3,
      title: 'Digital India Scholarship',
      organization: 'Ministry of Electronics & IT',
      description: 'Scholarship for students pursuing technology courses',
      eligibility: 'Students enrolled in CS/IT/Electronics programs',
      amount: '₹50,000 per year',
      deadline: 'September 15, 2025',
      url: '#',
    },
    {
      id: 4,
      title: 'Pragati Scholarship for Girls',
      organization: 'AICTE',
      description: 'Support for girl students pursuing technical education',
      eligibility: 'Girls enrolled in AICTE-approved institutions',
      amount: '₹50,000 per year',
      deadline: 'December 15, 2025',
      url: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Award size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Path Forward
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Explore relevant courses and scholarships tailored to your skills and aspirations
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-8 py-4 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
            }`}
          >
            <BookOpen size={20} />
            Courses & Institutions
          </button>
          <button
            onClick={() => setActiveTab('scholarships')}
            className={`px-8 py-4 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'scholarships'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
            }`}
          >
            <Award size={20} />
            Scholarships
          </button>
        </div>

        {activeTab === 'courses' && (
          <div className="space-y-6 mb-12">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        <BookOpen size={24} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{course.title}</h3>
                        <div className="flex items-center gap-2 text-purple-300 mb-2">
                          <Building size={16} />
                          <span className="text-sm">{course.institution}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-purple-200 mb-4 ml-9">{course.description}</p>

                    <div className="flex flex-wrap gap-3 ml-9">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-700/50 text-purple-200 border border-purple-600/50">
                        {course.skillCategory}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-700/50 text-purple-200 border border-purple-600/50">
                        Duration: {course.duration}
                      </span>
                    </div>
                  </div>

                  <a
                    href={course.url}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-700/50 hover:bg-purple-700 text-white font-medium transition-all whitespace-nowrap"
                  >
                    View Details
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scholarships' && (
          <div className="space-y-6 mb-12">
            {scholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        <Award size={24} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{scholarship.title}</h3>
                        <div className="flex items-center gap-2 text-purple-300 mb-2">
                          <Building size={16} />
                          <span className="text-sm">{scholarship.organization}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-purple-200 mb-4 ml-9">{scholarship.description}</p>

                    <div className="space-y-2 ml-9">
                      <div className="text-purple-300 text-sm">
                        <span className="font-semibold">Eligibility:</span> {scholarship.eligibility}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
                          <IndianRupee size={12} />
                          {scholarship.amount}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/50">
                          <Calendar size={12} />
                          Deadline: {scholarship.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={scholarship.url}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-700/50 hover:bg-purple-700 text-white font-medium transition-all whitespace-nowrap"
                  >
                    Apply Now
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
          >
            View My Career Report
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
