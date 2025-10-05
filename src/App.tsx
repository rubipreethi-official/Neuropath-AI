import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { SkillPassionQuestion } from './pages/SkillPassionQuestion';
import { ChatbotAnalysis } from './pages/ChatbotAnalysis';
import { RelevantSkillQuestion } from './pages/RelevantSkillQuestion';
import { SkillDevelopmentPrograms } from './pages/SkillDevelopmentPrograms';
import { CoursesAndScholarships } from './pages/CoursesAndScholarships';
import { CareerReport } from './pages/CareerReport';

type Page =
  | 'landing'
  | 'skill-passion-question'
  | 'chatbot-analysis'
  | 'relevant-skill-question'
  | 'skill-development'
  | 'courses-scholarships'
  | 'career-report';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleSkillPassionAnswer = (knowsSkill: boolean) => {
    if (knowsSkill) {
      setCurrentPage('relevant-skill-question');
    } else {
      setCurrentPage('chatbot-analysis');
    }
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

  return (
    <AuthProvider>
      {currentPage === 'landing' && (
        <LandingPage onStart={() => setCurrentPage('skill-passion-question')} />
      )}
      {currentPage === 'skill-passion-question' && (
        <SkillPassionQuestion onAnswer={handleSkillPassionAnswer} />
      )}
      {currentPage === 'chatbot-analysis' && (
        <ChatbotAnalysis onComplete={handleChatbotComplete} />
      )}
      {currentPage === 'relevant-skill-question' && (
        <RelevantSkillQuestion onAnswer={handleRelevantSkillAnswer} />
      )}
      {currentPage === 'skill-development' && (
        <SkillDevelopmentPrograms onContinue={handleSkillDevelopmentContinue} />
      )}
      {currentPage === 'courses-scholarships' && (
        <CoursesAndScholarships onContinue={handleCoursesAndScholarshipsContinue} />
      )}
      {currentPage === 'career-report' && (
        <CareerReport onRestart={handleRestart} />
      )}
    </AuthProvider>
  );
}

export default App;
