import { useState, useEffect } from 'react';
import {
  BookOpen, Award, ExternalLink, ArrowRight, Building, Building2,
  Calendar, IndianRupee, ArrowLeft, Loader2, Link2, Globe,
  Sparkles, Clock, RefreshCw,
} from 'lucide-react';

interface CoursesAndScholarshipsProps {
  onContinue: () => void;
  onBack?: () => void;
  passion: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Types ─────────────────────────────────────────────────────────────────
interface Course {
  name: string;
  platform: string;
  link: string;
  mode: string;
  duration?: string;
  description?: string;
}

interface Scholarship {
  title: string;
  source: string;
  description: string;
  amount?: string;
  deadline?: string;
  link?: string;
}

interface Institution {
  name: string;
  location: string;
  type: string;
  link?: string;
}

interface LiveLink {
  title: string;
  url: string;
  category: string;
}

interface CareerData {
  field: string;
  courses: Course[];
  scholarships: Scholarship[];
  institutions: Institution[];
  training: unknown[];
  liveLinks: LiveLink[];
  source: string;
  enrichedAt: string;
  fromCache: boolean;
}

// ─── Static fallback data ──────────────────────────────────────────────────
const STATIC_COURSES: Course[] = [
  { name: 'Bachelor of Computer Applications (BCA)', platform: 'IGNOU', link: 'https://ignou.ac.in', mode: 'online', duration: '3 years', description: 'Comprehensive computer applications program' },
  { name: 'Diploma in Digital Marketing', platform: 'Google Skillshop', link: 'https://skillshop.google.com', mode: 'online', duration: '6 months', description: 'Modern digital marketing fundamentals' },
  { name: 'Data Science Fundamentals', platform: 'Coursera', link: 'https://coursera.org/search?query=data+science', mode: 'online', duration: '4 months', description: 'Core data science concepts and tools' },
  { name: 'Business Management Certificate', platform: 'edX', link: 'https://edx.org/search?q=business+management', mode: 'online', duration: '3 months', description: 'Business management and entrepreneurship essentials' },
];

const STATIC_SCHOLARSHIPS: Scholarship[] = [
  { title: 'National Means-cum-Merit Scholarship', source: 'Ministry of Education', description: 'Financial assistance for meritorious students', amount: '₹12,000/year', deadline: 'October 2025', link: 'https://scholarships.gov.in' },
  { title: 'Post Matric Scholarship for SC/ST/OBC', source: 'Ministry of Social Justice', description: 'Support for students from reserved categories', amount: 'Up to ₹1,20,000/year', deadline: 'November 2025', link: 'https://scholarships.gov.in' },
  { title: 'Pragati Scholarship for Girls', source: 'AICTE', description: 'For girl students in AICTE-approved institutions', amount: '₹50,000/year', deadline: 'December 2025', link: 'https://www.aicte-india.org' },
  { title: 'Prime Minister Scholarship Scheme', source: 'Ministry of Home Affairs', description: 'For wards of ex-servicemen', amount: '₹36,000/year', deadline: 'October 2025', link: 'https://scholarships.gov.in' },
];

const STATIC_INSTITUTIONS: Institution[] = [
  { name: 'Indian Institute of Technology (IIT)', location: 'Pan India', type: 'university', link: 'https://www.iitsystem.ac.in' },
  { name: 'National Institute of Technology (NIT)', location: 'Pan India', type: 'institute', link: 'https://www.nitcouncil.org.in' },
  { name: 'Indian Institute of Management (IIM)', location: 'Pan India', type: 'university', link: 'https://www.iimcat.ac.in' },
  { name: 'IGNOU — Indira Gandhi National Open University', location: 'Delhi, India', type: 'university', link: 'https://ignou.ac.in' },
];

const categoryColor: Record<string, string> = {
  course: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  scholarship: 'bg-green-500/20 text-green-300 border-green-500/50',
  job: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  hackathon: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
  news: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
};

function SourceBadge({ source, enrichedAt, fromCache }: { source: string; enrichedAt?: string; fromCache?: boolean }) {
  const time = enrichedAt ? new Date(enrichedAt).toLocaleTimeString() : '';
  const label = source === 'scrape+llm'
    ? '🌐 Live scraped + AI enriched'
    : source === 'community+llm'
    ? '💬 Community + AI enriched'
    : source === 'llm'
    ? '🤖 AI generated'
    : '📦 Cached';
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-800/40 border border-purple-700/50 text-xs text-purple-300">
      <span>{label}</span>
      {fromCache && <span className="flex items-center gap-1"><Clock size={11} /> cached</span>}
      {time && <span>· {time}</span>}
    </div>
  );
}

export function CoursesAndScholarships({ onContinue, onBack, passion }: CoursesAndScholarshipsProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'scholarships' | 'institutions' | 'links'>('courses');
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!passion) return;
    setLoading(true);
    setError('');

    fetch(`${BACKEND_URL}/api/career/data?field=${encodeURIComponent(passion)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then(data => {
        setCareerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Career data fetch error:', err);
        setError('Could not fetch live data. Showing curated defaults.');
        setLoading(false);
      });
  }, [passion, retryCount]);

  const courses = careerData?.courses?.length ? careerData.courses : STATIC_COURSES;
  const scholarships = careerData?.scholarships?.length ? careerData.scholarships : STATIC_SCHOLARSHIPS;
  const institutions = careerData?.institutions?.length ? careerData.institutions : STATIC_INSTITUTIONS;
  const liveLinks = careerData?.liveLinks || [];

  const tabs = [
    { id: 'courses' as const, label: 'Courses', icon: <BookOpen size={18} />, count: courses.length },
    { id: 'scholarships' as const, label: 'Scholarships', icon: <Award size={18} />, count: scholarships.length },
    { id: 'institutions' as const, label: 'Institutions', icon: <Building2 size={18} />, count: institutions.length },
    { id: 'links' as const, label: 'Live Links', icon: <Globe size={18} />, count: liveLinks.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <button onClick={onBack} className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        )}

        {/* ── Header ─── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Sparkles size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Path Forward</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-4">
            {passion ? `Live career opportunities for "${passion}"` : 'Explore curated courses, scholarships, and institutions'}
          </p>
          {careerData && (
            <SourceBadge source={careerData.source} enrichedAt={careerData.enrichedAt} fromCache={careerData.fromCache} />
          )}
        </div>

        {/* ── Loading spinner ─── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative">
              <Loader2 size={56} className="text-purple-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe size={24} className="text-purple-300" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-purple-200 text-lg font-semibold">Fetching live data from the internet…</p>
              <p className="text-purple-400 text-sm mt-1">Searching courses, scholarships & opportunities for <span className="text-white font-medium">{passion}</span></p>
              <div className="flex items-center justify-center gap-2 mt-4">
                {['Scraping web sources', 'Querying communities', 'AI synthesis'].map((step, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs bg-purple-800/50 text-purple-300 border border-purple-700/50 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Error bar ─── */}
        {error && !loading && (
          <div className="flex items-center justify-between gap-3 mb-6 px-5 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm">
            <span>{error}</span>
            <button onClick={() => setRetryCount(c => c + 1)} className="flex items-center gap-1 text-white hover:text-orange-300 transition-colors text-xs">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* ── Tabs ─── */}
        {!loading && (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${activeTab === tab.id ? 'bg-white/20' : 'bg-purple-700/50'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── COURSES TAB ─── */}
            {activeTab === 'courses' && (
              <div className="space-y-5 mb-12">
                {courses.map((course, i) => (
                  <div key={i} className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <BookOpen size={22} className="text-purple-400 mt-0.5 shrink-0" />
                          <div>
                            <h3 className="text-xl font-bold text-white">{course.name}</h3>
                            <div className="flex items-center gap-2 text-purple-300 text-sm mt-1">
                              <Building size={14} />
                              <span>{course.platform}</span>
                              {course.mode && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {course.mode}
                                </span>
                              )}
                              {course.duration && (
                                <span className="text-purple-400 text-xs">· {course.duration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {course.description && (
                          <p className="text-purple-200 text-sm ml-9">{course.description}</p>
                        )}
                      </div>
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 text-white font-medium transition-all text-sm whitespace-nowrap"
                      >
                        View Course <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SCHOLARSHIPS TAB ─── */}
            {activeTab === 'scholarships' && (
              <div className="space-y-5 mb-12">
                {scholarships.map((sch, i) => (
                  <div key={i} className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <Award size={22} className="text-purple-400 mt-0.5 shrink-0" />
                          <div>
                            <h3 className="text-xl font-bold text-white">{sch.title}</h3>
                            <div className="flex items-center gap-2 text-purple-300 text-sm mt-1">
                              <Building size={14} />
                              <span>{sch.source}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-purple-200 text-sm ml-9 mb-3">{sch.description}</p>
                        <div className="flex flex-wrap gap-3 ml-9">
                          {sch.amount && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
                              <IndianRupee size={11} /> {sch.amount}
                            </span>
                          )}
                          {sch.deadline && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/50">
                              <Calendar size={11} /> Deadline: {sch.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={sch.link || 'https://scholarships.gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-700/40 hover:bg-green-600/60 text-white font-medium transition-all text-sm whitespace-nowrap"
                      >
                        Apply Now <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── INSTITUTIONS TAB ─── */}
            {activeTab === 'institutions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {institutions.map((inst, i) => (
                  <div key={i} className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Building2 size={22} className="text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug">{inst.name}</h3>
                        <p className="text-purple-300 text-sm mt-1">{inst.location}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-purple-700/50 text-purple-200 border border-purple-600/50 capitalize">
                          {inst.type}
                        </span>
                      </div>
                    </div>
                    {inst.link && inst.link !== '#' && (
                      <a
                        href={inst.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 text-white font-medium transition-all text-sm"
                      >
                        Visit Website <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── LIVE LINKS TAB ─── */}
            {activeTab === 'links' && (
              <div className="space-y-3 mb-12">
                {liveLinks.length > 0 ? (
                  liveLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl px-5 py-4 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20 group"
                    >
                      <Link2 size={20} className="text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-purple-200 transition-colors">{link.title}</p>
                        <p className="text-purple-400 text-xs truncate mt-0.5">{link.url}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${categoryColor[link.category] || 'bg-purple-700/50 text-purple-300 border-purple-600/50'}`}>
                        {link.category}
                      </span>
                      <ExternalLink size={16} className="text-purple-400 shrink-0 group-hover:text-white transition-colors" />
                    </a>
                  ))
                ) : (
                  <div className="text-center py-12 text-purple-400">
                    <Globe size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Live links will appear after the data is fully enriched.</p>
                    <button onClick={() => setRetryCount(c => c + 1)} className="mt-4 flex items-center gap-2 mx-auto text-purple-300 hover:text-white text-sm transition-colors">
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── CTA ─── */}
        {!loading && (
          <div className="text-center">
            <button
              onClick={onContinue}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
            >
              Get Personalized Guidance from Neuro
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
