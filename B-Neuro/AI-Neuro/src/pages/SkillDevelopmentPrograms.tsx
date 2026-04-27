import { useState, useEffect } from 'react';
import { GraduationCap, Laptop, MapPin, ExternalLink, ArrowRight, ArrowLeft, Loader2, RefreshCw, Globe, Link2 } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

interface SkillDevelopmentProgramsProps {
  onContinue: () => void;
  onBack?: () => void;
  passion: string;
}

// ─── Static fallback data (preserved from original) ───────────────────────
const STATIC_PROGRAMS = [
  {
    id: 1,
    title: 'Digital Marketing Fundamentals',
    description: 'Learn the basics of digital marketing, SEO, and social media strategies',
    type: 'online' as const,
    provider: 'Coursera',
    duration: '6 weeks',
    url: '#',
  },
  {
    id: 2,
    title: 'Web Development Bootcamp',
    description: 'Comprehensive training in HTML, CSS, JavaScript, and React',
    type: 'online' as const,
    provider: 'Udemy',
    duration: '12 weeks',
    url: '#',
  },
  {
    id: 3,
    title: 'Rural Skills Development Workshop',
    description: 'Hands-on training in agriculture technology and rural entrepreneurship',
    type: 'offline' as const,
    provider: 'Government Initiative',
    location: 'District Training Center',
    duration: '4 weeks',
    url: '#',
  },
  {
    id: 4,
    title: 'Data Science with Python',
    description: 'Master data analysis, visualization, and machine learning basics',
    type: 'online' as const,
    provider: 'edX',
    duration: '10 weeks',
    url: '#',
  },
  {
    id: 5,
    title: 'Handicraft & Design Workshop',
    description: 'Learn traditional crafts and modern design techniques',
    type: 'offline' as const,
    provider: 'Local Artisan Collective',
    location: 'Community Center',
    duration: '8 weeks',
    url: '#',
  },
  {
    id: 6,
    title: 'English Communication Skills',
    description: 'Improve spoken and written English for professional settings',
    type: 'online' as const,
    provider: 'British Council',
    duration: '8 weeks',
    url: '#',
  },
];

interface ScrapedProgram {
  title: string;
  provider: string;
  type: 'online' | 'offline';
  duration: string;
  link: string;
  description?: string;
}

interface LiveLink {
  title: string;
  url: string;
  category: string;
}

interface DisplayProgram {
  id: number;
  title: string;
  description: string;
  type: 'online' | 'offline';
  provider: string;
  location?: string;
  duration: string;
  url: string;
}

export function SkillDevelopmentPrograms({ onContinue, onBack, passion }: SkillDevelopmentProgramsProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'online' | 'offline'>('all');
  const [scrapedPrograms, setScrapedPrograms] = useState<DisplayProgram[]>([]);
  const [liveLinks, setLiveLinks] = useState<LiveLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [source, setSource] = useState('');

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
        if (data.training && data.training.length > 0) {
          setScrapedPrograms(
            data.training.map((p: ScrapedProgram, i: number) => ({
              id: i + 1,
              title: p.title,
              description: p.description || `${p.type === 'online' ? 'Online' : 'Offline'} program by ${p.provider} — focused on ${passion}`,
              type: (p.type as 'online' | 'offline') || 'online',
              provider: p.provider,
              duration: p.duration,
              url: p.link,
            }))
          );
        }
        if (data.liveLinks) setLiveLinks(data.liveLinks);
        if (data.source) setSource(data.source);
      })
      .catch(err => {
        console.error('[SkillDev] Fetch error:', err);
        setError('Could not fetch live programs. Showing curated defaults.');
      })
      .finally(() => setLoading(false));
  }, [passion, retryCount]);

  const programs: DisplayProgram[] = scrapedPrograms.length > 0 ? scrapedPrograms : STATIC_PROGRAMS;
  const filteredPrograms = programs.filter(p => selectedType === 'all' || p.type === selectedType);
  const trainingLiveLinks = liveLinks.filter(l => ['hackathon', 'training', 'course'].includes(l.category)).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <GraduationCap size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Skill Development Programs
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            {passion
              ? `Live training opportunities for "${passion}"`
              : 'Curated learning opportunities to help you build the skills you need'}
          </p>
          {source && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-800/40 border border-purple-700/50 text-xs text-purple-300">
              {source === 'scrape+llm' ? '🌐 Live data' : source === 'community+llm' ? '💬 Community data' : '🤖 AI generated'}
              {error && <span className="text-orange-400"> · fallback mode</span>}
            </div>
          )}
        </div>

        {error && !loading && (
          <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm">
            <span>{error}</span>
            <button onClick={() => setRetryCount(c => c + 1)} className="flex items-center gap-1 text-white hover:text-orange-300 transition-colors text-xs">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
            }`}
          >
            All Programs
          </button>
          <button
            onClick={() => setSelectedType('online')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              selectedType === 'online'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
            }`}
          >
            <Laptop size={18} />
            Online
          </button>
          <button
            onClick={() => setSelectedType('offline')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              selectedType === 'offline'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-800/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
            }`}
          >
            <MapPin size={18} />
            Offline
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={40} className="text-purple-400 animate-spin" />
            <p className="text-purple-300 text-lg">
              Finding live training programs for <span className="text-white font-semibold">{passion}</span>…
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    program.type === 'online'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : 'bg-green-500/20 text-green-300 border border-green-500/50'
                  }`}>
                    {program.type === 'online' ? (
                      <span className="flex items-center gap-1">
                        <Laptop size={12} />
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                <p className="text-purple-200 text-sm mb-4">{program.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-purple-300 text-sm">
                    <GraduationCap size={16} />
                    <span>{program.provider}</span>
                  </div>
                  {program.type === 'offline' && program.location && (
                    <div className="flex items-center gap-2 text-purple-300 text-sm">
                      <MapPin size={16} />
                      <span>{program.location}</span>
                    </div>
                  )}
                  <div className="text-purple-300 text-sm">
                    Duration: {program.duration}
                  </div>
                </div>

                <a
                  href={program.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-700 text-white font-medium transition-all"
                >
                  Learn More
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── Live Links bonus section ─── */}
        {!loading && trainingLiveLinks.length > 0 && (
          <div className="mt-4 mb-10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Globe size={20} className="text-purple-400" /> Trending Resources
            </h2>
            <div className="space-y-2">
              {trainingLiveLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/20 border border-purple-700/40 rounded-xl px-4 py-3 hover:border-purple-500 transition-all group"
                >
                  <Link2 size={16} className="text-purple-400 shrink-0" />
                  <span className="text-purple-100 text-sm truncate group-hover:text-white transition-colors">{link.title}</span>
                  <ExternalLink size={13} className="text-purple-400 ml-auto shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"

          >
            Continue to Opportunities
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
