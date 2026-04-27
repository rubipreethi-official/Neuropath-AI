import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { SkillPassionQuestion } from "./pages/SkillPassionQuestion";
import Chat2 from "./pages/Chat2";
import { ChatbotAnalysis } from "./pages/ChatbotAnalysis";
import { RelevantSkillQuestion } from "./pages/RelevantSkillQuestion";
import { SkillDevelopmentPrograms } from "./pages/SkillDevelopmentPrograms";
import { CoursesAndScholarships } from "./pages/CoursesAndScholarships";
import { CareerReport } from "./pages/CareerReport";

// ---------------------------------------------------------------------------
// Helpers — passion is stored in sessionStorage so it survives navigation
// ---------------------------------------------------------------------------
const PASSION_KEY = "neuropath_user_passion";

function getPassion() {
  return sessionStorage.getItem(PASSION_KEY) ?? "";
}
function setPassion(value: string) {
  sessionStorage.setItem(PASSION_KEY, value);
}
function clearPassion() {
  sessionStorage.removeItem(PASSION_KEY);
}

// ---------------------------------------------------------------------------
// Auth guard — redirects to "/" if user is not logged in.
// Pages listed in PUBLIC_PATHS are accessible without auth.
// ---------------------------------------------------------------------------
const PUBLIC_PATHS = ["/", "/chatbot-analysis"];

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && !PUBLIC_PATHS.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ---------------------------------------------------------------------------
// All page components wired with useNavigate
// ---------------------------------------------------------------------------
function AppRoutes() {
  const navigate = useNavigate();
  const { userName } = useAuth();

  // #1 — SkillPassionQuestion: now receives passion string when user knows it
  const handleSkillPassionAnswer = (knowsSkill: boolean, passion?: string) => {
    if (knowsSkill) {
      setPassion(passion ?? "");
      navigate("/relevant-skill-question");
    } else {
      navigate("/chat2");
    }
  };

  const handleChat2Complete = (predictedPassion: string) => {
    setPassion(predictedPassion);
    navigate("/chatbot-analysis");
  };

  // #2 — ChatbotAnalysis: now receives final passion string
  const handleChatbotComplete = (passion: string) => {
    setPassion(passion);
    navigate("/relevant-skill-question");
  };

  const handleRelevantSkillAnswer = (hasRelevantSkill: boolean) => {
    navigate(hasRelevantSkill ? "/courses-scholarships" : "/skill-development");
  };

  const handleSkillDevelopmentContinue = () => {
    navigate("/courses-scholarships");
  };

  const handleCoursesAndScholarshipsContinue = () => {
    navigate("/career-report");
  };

  const handleRestart = () => {
    clearPassion();
    navigate("/");
  };

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <LandingPage
            onStart={() => navigate("/skill-passion-question")}
            onChatBot={() => navigate("/chatbot-analysis")}
          />
        }
      />

      <Route
        path="/chatbot-analysis"
        element={
          <ChatbotAnalysis
            onComplete={handleChatbotComplete}
            onBack={() => navigate("/")}
          />
        }
      />

      {/* Auth-protected */}
      <Route
        path="/skill-passion-question"
        element={
          <RequireAuth>
            <SkillPassionQuestion
              onAnswer={handleSkillPassionAnswer}
              onBack={() => navigate(-1)}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/chat2"
        element={
          <RequireAuth>
            <Chat2
              onComplete={handleChat2Complete}
              userName={userName || "User"}
              onBack={() => navigate(-1)}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/relevant-skill-question"
        element={
          <RequireAuth>
            <RelevantSkillQuestion
              onAnswer={handleRelevantSkillAnswer}
              onBack={() => navigate(-1)}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/skill-development"
        element={
          <RequireAuth>
            <SkillDevelopmentPrograms
              passion={getPassion()}
              onContinue={handleSkillDevelopmentContinue}
              onBack={() => navigate(-1)}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/courses-scholarships"
        element={
          <RequireAuth>
            <CoursesAndScholarships
              passion={getPassion()}
              onContinue={handleCoursesAndScholarshipsContinue}
              onBack={() => navigate(-1)}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/career-report"
        element={
          <RequireAuth>
            <CareerReport
              onRestart={handleRestart}
              passion={getPassion()}
              userName={userName || "User"}
            />
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;