import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileText, Loader2, Download, Home, CheckCircle, Eye,
  AlertCircle, TrendingUp, Target, BookOpen, Building2, Award, Sparkles, BarChart3, Link2, Globe, ExternalLink, Smartphone, Hand, FileUp, Mail
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://neuropath-ai-guide.onrender.com';

interface CareerReportProps {
  onRestart: () => void;
  passion: string;
  userName: string;
}

interface AIAnalysis {
  strengths: string[];
  skillGaps: string[];
  careerFitScore: number;
  careerFitReason: string;
  recommendedCourses: string[];
  recommendedInstitutions: string[];
  scholarships: string[];
  summary: string;
}

interface LiveLink {
  title: string;
  url: string;
  category: string;
}

export function CareerReport({ onRestart, passion, userName }: CareerReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [liveLinks, setLiveLinks] = useState<LiveLink[]>([]);

  // Fetch live career data to enrich the report
  useEffect(() => {
    if (!passion) return;
    fetch(`${BACKEND_URL}/api/career/data?field=${encodeURIComponent(passion)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.liveLinks?.length) setLiveLinks(data.liveLinks);
      })
      .catch(() => {/* non-critical */ });
  }, [passion]);

  // ─── Drag & Drop handlers ───────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  const validateAndSet = (f: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF and .docx files are supported.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setFile(f);
    setAnalysis(null);
  };

  // ─── Magic Transfer State ───────────────────────────────────────────────
  const [showSync, setShowSync] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [laptopVideoActive, setLaptopVideoActive] = useState(false);
  const laptopVideoRef = useRef<HTMLVideoElement>(null);
  const [floatingFile, setFloatingFile] = useState<{ x: number, y: number, fileName: string, fileType: string } | null>(null);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const floatingFileRef = useRef(floatingFile);
  const fileDataRef = useRef<string | null>(null);
  const dropFramesRef = useRef(0);

  useEffect(() => {
    floatingFileRef.current = floatingFile;
  }, [floatingFile]);

  useEffect(() => {
    const initMP = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" },
          runningMode: "VIDEO", numHands: 1
        });
        setHandLandmarker(landmarker);
      } catch (err) { console.error("MP init err", err); }
    };
    initMP();
  }, []);

  const generateSync = (forceNew = false) => {
    let id = localStorage.getItem('magic_grab_room_id');
    if (!id || forceNew) {
      id = Math.random().toString(36).substring(2, 9);
      localStorage.setItem('magic_grab_room_id', id);
    }
    setRoomId(id);
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    setQrUrl(`${baseUrl}/transfer?roomID=${id}`);
    setShowSync(true);

    if (socket) {
      socket.disconnect();
    }
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
    newSocket.on('connect', () => newSocket.emit('join-room', id));
    newSocket.on('file-picked-up', (data) => {
      fileDataRef.current = data.fileData;
      setFloatingFile({ x: window.innerWidth / 2, y: window.innerHeight / 2, fileName: data.fileName, fileType: data.fileType });
      startLaptopCamera();
    });
  };

  const connectOtherDevice = () => {
    generateSync(true);
  };

  const startLaptopCamera = () => {
    setLaptopVideoActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (laptopVideoRef.current) {
            laptopVideoRef.current.srcObject = stream;
            laptopVideoRef.current.play();
          }
        });
    }
  };

  const detectLaptopHand = useCallback(() => {
    if (!handLandmarker || !laptopVideoRef.current || !floatingFileRef.current) {
      if (laptopVideoActive) requestAnimationFrame(detectLaptopHand);
      return;
    }

    // Ensure the video is actually loaded and has dimensions before feeding to MediaPipe!
    if (laptopVideoRef.current.readyState < 2 || laptopVideoRef.current.videoWidth === 0) {
      if (laptopVideoActive) requestAnimationFrame(detectLaptopHand);
      return;
    }

    const results = handLandmarker.detectForVideo(laptopVideoRef.current, performance.now());
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const indexTip = landmarks[8];
      const newX = indexTip.x * window.innerWidth;
      const newY = indexTip.y * window.innerHeight;

      setFloatingFile(prev => prev ? { ...prev, x: newX, y: newY } : null);

      // Mathematically robust Open Palm detection:
      // A finger is straight if its tip is further from the wrist than its middle joint (PIP).
      // If the finger is curled, the tip gets closer to the wrist than the PIP.
      const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

      const isExtended = (tipIdx: number, pipIdx: number) => dist(landmarks[0], landmarks[tipIdx]) > dist(landmarks[0], landmarks[pipIdx]);

      const thumbOpen = dist(landmarks[0], landmarks[4]) > dist(landmarks[0], landmarks[3]);
      const fingersOpen = isExtended(8, 6) && isExtended(12, 10) && isExtended(16, 14) && isExtended(20, 18);

      const isOpenPalm = thumbOpen && fingersOpen;

      if (isOpenPalm) {
        dropFramesRef.current += 1;
      } else {
        dropFramesRef.current = 0;
      }

      // Require 15 consecutive frames (~0.25s) of open palm to trigger drop
      if (dropFramesRef.current > 15 && socket) {
        socket.emit('request-file-release', { roomId });
        const dataUrl = fileDataRef.current;
        if (dataUrl) {
          const arr = dataUrl.split(',');
          let mime = 'application/pdf';
          const match = arr[0].match(/:(.*?);/);
          if (match && match[1]) mime = match[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          const f = new File([u8arr], floatingFileRef.current.fileName, { type: mime });
          validateAndSet(f);
        }
        setFloatingFile(null);
        fileDataRef.current = null;
        setLaptopVideoActive(false);
        const stream = laptopVideoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        return;
      }
    }

    if (laptopVideoActive) requestAnimationFrame(detectLaptopHand);
  }, [handLandmarker, laptopVideoActive, socket, roomId]);

  useEffect(() => {
    if (laptopVideoActive && floatingFile) detectLaptopHand();
  }, [laptopVideoActive, detectLaptopHand, floatingFile]);

  useEffect(() => {
    return () => { if (socket) socket.disconnect(); }
  }, [socket]);

  const sendAnalysisEmail = async () => {
    if (!email.trim() || !analysis) return;
    setEmailSending(true);
    try {
      const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!url) throw new Error("Missing Webhook URL");
      
      const payload = {
        type: "send_analysis",
        email: email,
        passion: passion,
        analysis: analysis
      };

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send email", error);
    } finally {
      setEmailSending(false);
    }
  };

  // ─── Upload & analyse ───────────────────────────────────────────────────
  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', passion || 'General Career');

      const res = await fetch(`${BACKEND_URL}/api/resume/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── PDF download ───────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#1e1b4b',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgX = (pdfWidth - canvas.width * ratio) / 2;
      pdf.addImage(imgData, 'PNG', imgX, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Neuro-Career-Guidance-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } catch {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // ─── Score color helper ─────────────────────────────────────────────────
  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 75) return 'from-green-600/30 to-green-800/10 border-green-500/40';
    if (score >= 50) return 'from-yellow-600/30 to-yellow-800/10 border-yellow-500/40';
    return 'from-red-600/30 to-red-800/10 border-red-500/40';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-5xl mx-auto" ref={reportRef}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Sparkles size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Personalized Guidance from Neuro
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Upload your current skills as a description doc or pdf and let Neuro analyse it against your passion for{' '}
            <span className="text-white font-semibold">{passion || 'your field'}</span>
          </p>
        </div>

        {/* ── Upload Card ─────────────────────────────────────────────────── */}
        {!analysis && (
          <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 md:p-12 mb-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${isDragging
                  ? 'border-purple-400 bg-purple-800/40 scale-[1.01]'
                  : 'border-purple-700/60 hover:border-purple-500 hover:bg-purple-800/20'
                }`}
              onClick={() => document.getElementById('resume-file-input')?.click()}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
              />
              <Upload size={48} className="text-purple-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-white mb-2">
                {file ? file.name : 'Drag & drop your resume here'}
              </p>
              <p className="text-purple-300 text-sm mb-4">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB — PDF or DOCX`
                  : 'or click to browse — PDF and .docx accepted (max 10 MB)'}
              </p>
              {file && (
                <div className="flex flex-col items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 text-sm font-medium">
                    <CheckCircle size={16} />
                    Ready to analyse
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = URL.createObjectURL(file);
                      window.open(url, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-purple-700/50 hover:bg-purple-600 border border-purple-500/50 text-white text-sm font-medium transition-all"
                  >
                    <Eye size={16} />
                    Preview Document
                  </button>
                </div>
              )}
            </div>

            {/* Sync Phone Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => generateSync()}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-purple-800/40 border border-purple-600/50 hover:bg-purple-700/50 transition-colors text-purple-200 text-lg"
              >
                <Smartphone size={22} />
                Sync Phone for Magic Grab
              </button>
            </div>

            {showSync && (
              <div className="mt-6 flex flex-col items-center p-6 bg-purple-950/60 rounded-2xl border border-purple-500/30 text-center">
                <p className="text-white font-medium mb-4 text-lg">
                  {localStorage.getItem('magic_grab_room_id') === roomId ? "Waiting for file from your synced phone..." : "Scan to select document on phone"}
                </p>

                <div className="bg-white p-4 rounded-xl shadow-xl shadow-purple-900/50">
                  <QRCodeSVG value={qrUrl} size={180} />
                </div>
                <p className="text-purple-300 text-sm mt-4 break-all max-w-xs">{qrUrl}</p>

                <button
                  onClick={connectOtherDevice}
                  className="mt-6 text-sm text-purple-300 hover:text-white underline underline-offset-4 transition-colors"
                >
                  Connect a different device
                </button>

                {/* Hidden video for laptop camera tracking */}
                <video ref={laptopVideoRef} className="hidden" playsInline muted />

                {floatingFile && (
                  <div className="mt-6 flex items-center gap-3 text-green-400 bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/30">
                    <Hand size={24} className="animate-pulse" />
                    <span className="font-semibold">File Grabbed! Open your palm to drop it here.</span>
                  </div>
                )}
              </div>
            )}


            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyse}
              disabled={!file || loading}
              className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-purple-500/40"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Neuro is reading your file…
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  Analyse My Skills through my document
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Analysis Results ─────────────────────────────────────────────── */}
        {analysis && (
          <div className="space-y-6 mb-10">

            {/* ── Report header banner ─── */}
            <div className="bg-gradient-to-r from-purple-800 to-purple-900 border border-purple-700/50 rounded-2xl px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Neuro's Career Analysis for {userName}
                  </h2>
                  <p className="text-purple-300 text-sm">
                    Generated on {new Date().toLocaleDateString()} · Passion: <span className="text-white font-semibold">{passion}</span>
                  </p>
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

            {/* ── Career Fit Score ─── */}
            <div className={`bg-gradient-to-br ${scoreBg(analysis.careerFitScore)} backdrop-blur-sm border rounded-2xl p-8`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <BarChart3 size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Career Fit Score</h3>
              </div>
              <div className="flex items-end gap-4 mb-3">
                <span className={`text-7xl font-black ${scoreColor(analysis.careerFitScore)}`}>
                  {analysis.careerFitScore}
                </span>
                <span className="text-purple-300 text-2xl mb-2">/ 100</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-3 bg-purple-950/60 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${analysis.careerFitScore >= 75
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : analysis.careerFitScore >= 50
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                  style={{ width: `${analysis.careerFitScore}%` }}
                />
              </div>
              <p className="text-purple-200">{analysis.careerFitReason}</p>
            </div>

            {/* ── Summary ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Sparkles size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Neuro's Summary</h3>
              </div>
              <p className="text-purple-100 leading-relaxed text-lg">{analysis.summary}</p>
            </div>

            {/* ── Strengths ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <TrendingUp size={24} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Strengths Found in Your Resume</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                    <p className="text-purple-100">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Skill Gaps ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Target size={24} className="text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Skill Gaps to Bridge</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.skillGaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
                    <AlertCircle size={18} className="text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-purple-100">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Recommended Courses ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <BookOpen size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recommended Courses</h3>
              </div>
              <ul className="space-y-3">
                {analysis.recommendedCourses.map((course, i) => (
                  <li key={i} className="flex items-start gap-3 text-purple-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-700/60 text-purple-300 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium">{course}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Recommended Institutions ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Building2 size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recommended Institutions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.recommendedInstitutions.map((inst, i) => (
                  <div key={i} className="bg-purple-700/30 rounded-xl px-4 py-3 border border-purple-600/50">
                    <p className="text-purple-100 font-medium">{inst}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Live Resources from Internet ─── */}
            {liveLinks.length > 0 && (
              <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                    <Globe size={24} className="text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Live Resources</h3>
                    <p className="text-purple-400 text-xs mt-0.5">Fetched from the internet for {passion}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {liveLinks.slice(0, 8).map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-purple-800/20 rounded-xl px-4 py-3 hover:bg-purple-800/40 border border-purple-700/30 hover:border-purple-600 transition-all group"
                    >
                      <Link2 size={16} className="text-purple-400 shrink-0" />
                      <span className="text-purple-100 text-sm truncate group-hover:text-white transition-colors flex-1">{link.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-700/50 text-purple-300 border border-purple-600/50 shrink-0 capitalize">{link.category}</span>
                      <ExternalLink size={13} className="text-purple-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Scholarships ─── */}
            <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-800/50">
                  <Award size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Relevant Scholarships</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.scholarships.map((sch, i) => (
                  <div key={i} className="flex items-start gap-3 bg-purple-800/30 rounded-xl px-4 py-3 border border-purple-700/50">
                    <span className="text-purple-400 mt-1">✦</span>
                    <p className="text-purple-100">{sch}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Upload another ─── */}
            <button
              onClick={() => { setFile(null); setAnalysis(null); setError(''); }}
              className="w-full py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:text-white hover:border-purple-500 transition-all text-sm font-medium"
            >
              ↑ Upload a different resume
            </button>
          </div>
        )}

        {/* ── Bottom Actions ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 items-center">
          {analysis && (
            <div className="bg-purple-900/40 p-6 rounded-2xl border border-purple-700/50 w-full max-w-2xl text-center">
              <h4 className="text-white font-semibold mb-4">Mail Your Full Resume Analysis</h4>
              {!emailSent ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="your@email.com" 
                    className="flex-1 bg-purple-800/30 border border-purple-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  />
                  <button 
                    onClick={sendAnalysisEmail} 
                    disabled={emailSending || !email} 
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailSending ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />} 
                    {emailSending ? "Sending..." : "Mail Analysis"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <CheckCircle size={20} /> Analysis sent successfully!
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-purple-800/50 hover:bg-purple-800 border border-purple-600/50 text-white text-xl font-bold transition-all"
            >
              <Home size={24} />
              Return to Home
            </button>
          {analysis && (
            <button
              onClick={handleDownloadPDF}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
            >
              <Download size={24} />
              Download Full Report as PDF
            </button>
          )}
        </div>
      </div>
    </div>

      {/* Floating File Icon */}
      {floatingFile && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
          style={{ left: floatingFile.x, top: floatingFile.y }}
        >
          <FileUp size={64} className="text-purple-400 animate-pulse" />
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full mt-2 border border-purple-500/50">
            <span className="text-white font-medium text-sm">{floatingFile.fileName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
