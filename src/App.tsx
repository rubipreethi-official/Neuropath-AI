import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { SkillPassionQuestion } from './pages/SkillPassionQuestion';
import { Chat2 } from './pages/chat2';
import { ChatbotAnalysis } from './pages/ChatbotAnalysis';
import { RelevantSkillQuestion } from './pages/RelevantSkillQuestion';
import { SkillDevelopmentPrograms } from './pages/SkillDevelopmentPrograms';
import { CoursesAndScholarships } from './pages/CoursesAndScholarships';
import { CareerReport } from './pages/CareerReport';

type Page =
  | 'landing'
  | 'skill-passion-question'
  | 'chat2'
  | 'chatbot-analysis'
  | 'relevant-skill-question'
  | 'skill-development'
  | 'courses-scholarships'
  | 'career-report';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userPassion, setUserPassion] = useState<string>('');
  const { userName, user } = useAuth();

  const handleSkillPassionAnswer = (knowsSkill: boolean) => {
    if (knowsSkill) {
      setCurrentPage('relevant-skill-question');
    } else {
      setCurrentPage('chat2');
    }
  };

  const goBack = () => {
    const pageOrder: Page[] = ['landing', 'skill-passion-question', 'chat2', 'chatbot-analysis', 'relevant-skill-question', 'skill-development', 'courses-scholarships', 'career-report'];
    const currentIndex = pageOrder.indexOf(currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pageOrder[currentIndex - 1]);
    }
  };

  const handleChat2Complete = (predictedPassion: string) => {
    setUserPassion(predictedPassion);
    setCurrentPage('chatbot-analysis');
  };

  const handleChatbotComplete = () => {
    setCurrentPage('relevant-skill-question');
  };

  const handleRelevantSkillAnswer = (hasRelevantSkill: boolean) => {
    if (hasRelevantSkill) {
      setCurrentPage('courses-scholarships');
    } else {
      setCurrentPage('skill-development');
    }
  };

  const handleSkillDevelopmentContinue = () => {
    setCurrentPage('courses-scholarships');
  };

  const handleCoursesAndScholarshipsContinue = () => {
    setCurrentPage('career-report');
  };

  const handleRestart = () => {
    setCurrentPage('landing');
  };

  // Redirect to landing if not authenticated and trying to access protected pages
  if (!user && currentPage !== 'landing') {
    setCurrentPage('landing');
  }

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onStart={() => setCurrentPage('skill-passion-question')} />
      )}
      {currentPage === 'skill-passion-question' && (
        <SkillPassionQuestion onAnswer={handleSkillPassionAnswer} onBack={goBack} />
      )}
      {currentPage === 'chat2' && (
        <Chat2 onComplete={handleChat2Complete} userName={userName || 'User'} onBack={goBack} />
      )}
      {currentPage === 'chatbot-analysis' && (
        <ChatbotAnalysis onComplete={handleChatbotComplete} onBack={goBack} />
      )}
      {currentPage === 'relevant-skill-question' && (
        <RelevantSkillQuestion onAnswer={handleRelevantSkillAnswer} onBack={goBack} />
      )}
      {currentPage === 'skill-development' && (
        <SkillDevelopmentPrograms onContinue={handleSkillDevelopmentContinue} onBack={goBack} />
      )}
      {currentPage === 'courses-scholarships' && (
        <CoursesAndScholarships onContinue={handleCoursesAndScholarshipsContinue} onBack={goBack} />
      )}
      {currentPage === 'career-report' && (
        <CareerReport onRestart={handleRestart} passion={userPassion} userName={userName || 'User'} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
