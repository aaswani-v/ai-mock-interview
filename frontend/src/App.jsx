import React, { useState, useEffect } from 'react';

// Visuals
import GalaxyBackground from './components/visuals/GalaxyBackground';

// Views
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ProfileSetupView from './views/ProfileSetupView';
import DashboardView from './views/DashboardView';
import DifficultySelectionView from './views/DifficultySelectionView';
import ActiveInterviewView from './views/ActiveInterviewView';
import AnalyticsView from './views/AnalyticsView';
import GrowthView from './views/GrowthView';
import AchievementsView from './views/AchievementsView';
import PracticeHubView from './views/PracticeHubView';
import ResumeUploadView from './views/ResumeUploadView';
import ResumeInsightsView from './views/ResumeInsightsView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import InterviewResultsView from './views/InterviewResultsView';

// Components
import Sidebar from './components/Sidebar';

// Config
import { API_URL } from './config';

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [interviewResult, setInterviewResult] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserProfile({
          name: userData.name || '',
          role: userData.role || '',
          experience: userData.experience_years || '',
          salary: userData.salary_expectation || '',
          email: userData.email || ''
        });
        
        // Go to dashboard if profile is complete, otherwise profile setup
        if (userData.profile_completed || userData.name) {
          setView('dashboard');
        } else {
          setView('profile-setup');
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Handlers
  const handleLogin = (userData) => {
    setUser(userData);
    setUserProfile({
      name: userData.name || '',
      role: userData.role || '',
      experience: userData.experience_years || '',
      salary: userData.salary_expectation || '',
      email: userData.email || ''
    });
    
    if (userData.profile_completed || userData.name) {
      setView('dashboard');
    } else {
      setView('profile-setup');
    }
  };
  
  const handleRegisterSuccess = (userData) => {
    if (userData) {
      setUser(userData);
      setUserProfile({ name: userData.name, email: userData.email });
    }
    setView('profile-setup');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setUser(null);
    setUserProfile({});
    setResumeData(null);
    setView('landing');
  };

  const handleStart = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('login');
    }
  };

  const handleInterviewComplete = (result) => {
    if (result) {
      setInterviewResult(result);
      
      // Persist interview results to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('interview_history') || '[]');
        const newEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          difficulty: selectedDifficulty,
          overallScore: result.overallScore || 0,
          visualScore: result.visualScore || 0,
          contentScore: result.contentScore || 0,
          speechScore: result.speechScore || 0,
          questionsAnswered: result.questionsAnswered || 1,
          duration: result.duration || 0,
          role: userProfile.role || 'General'
        };
        history.unshift(newEntry); // Add to beginning
        // Keep only last 50 interviews
        localStorage.setItem('interview_history', JSON.stringify(history.slice(0, 50)));
        
        // Update streak
        const today = new Date().toDateString();
        const lastPractice = localStorage.getItem('last_practice_date');
        let streak = parseInt(localStorage.getItem('practice_streak') || '0');
        
        if (lastPractice !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastPractice === yesterday.toDateString()) {
            streak += 1;
          } else {
            streak = 1; // Reset streak
          }
          localStorage.setItem('practice_streak', streak.toString());
          localStorage.setItem('last_practice_date', today);
        }
      } catch (e) {
        console.error('Error saving interview history:', e);
      }
      
      setView('interview-results');
    } else {
      setView('dashboard');
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setView('active-interview');
  };

  const handleUploadSuccess = (data) => {
    setResumeData(data);
    setView('resume-insights');
  };

  const handleProfileUpdate = async (data) => {
    setUserProfile(prev => ({ ...prev, ...data }));
    
    // Update localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const updatedUser = {
        ...userData,
        name: data.name || userData.name,
        role: data.role || userData.role,
        experience_years: data.experience || userData.experience_years,
        salary_expectation: data.salary || userData.salary_expectation,
        profile_completed: true
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const handleProfileSetupComplete = async (profileData) => {
    try {
      // Save profile to backend
      const formData = new FormData();
      formData.append('user_id', user?.uid || '');
      formData.append('name', profileData.name);
      formData.append('role', profileData.role);
      formData.append('experienceYears', profileData.experience);
      formData.append('salaryExpectation', profileData.salary || '');

      const response = await fetch(`${API_URL}/profile/update`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        handleProfileUpdate(profileData);
        setView('dashboard');
      } else {
        console.error('Failed to save profile:', data);
        // Still proceed to dashboard
        handleProfileUpdate(profileData);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      // Still proceed to dashboard
      handleProfileUpdate(profileData);
      setView('dashboard');
    }
  };

  // Render Content based on view
  const renderContent = () => {
    if (loading) return <div className="flex h-screen items-center justify-center text-cyan-500">Loading Interaura...</div>;

    switch (view) {
      case 'landing':
        return <LandingView onStart={handleStart} />;
      case 'login':
        return <LoginView onLogin={handleLogin} onRegisterClick={() => setView('register')} />;
      case 'register':
        return <RegisterView onRegisterSuccess={handleRegisterSuccess} onLoginClick={() => setView('login')} setPendingEmail={setPendingEmail} />;
      case 'profile-setup':
        return <ProfileSetupView onComplete={handleProfileSetupComplete} updateProfile={handleProfileUpdate} />;
      case 'dashboard':
        return <DashboardView onNavigate={setView} user={userProfile} />;
      case 'interview':
        return <DifficultySelectionView onSelect={handleDifficultySelect} onBack={() => setView('dashboard')} />;
      case 'active-interview':
        return <ActiveInterviewView onEndQuestion={handleInterviewComplete} userProfile={userProfile} difficulty={selectedDifficulty} />;
      case 'interview-results':
        return <InterviewResultsView data={interviewResult} onHome={() => setView('dashboard')} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'growth':
        return <GrowthView />;
      case 'achievements':
        return <AchievementsView />;
      case 'resources':
        return <PracticeHubView />;
      case 'resume-upload':
        return <ResumeUploadView onUpload={handleUploadSuccess} user={user} />;
      case 'resume-insights':
        return <ResumeInsightsView onContinue={() => setView('dashboard')} resumeData={resumeData} />;
      case 'profile':
        return <ProfileView profile={userProfile} onNavigate={setView} />;
      case 'settings':
        return <SettingsView onNavigate={setView} onLogout={handleLogout} />;
      default:
        return <DashboardView onNavigate={setView} user={userProfile} />;
    }
  };

  // Show sidebar only when logged in and not on auth/setup pages
  const showSidebar = user && !['landing', 'login', 'register', 'profile-setup'].includes(view);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <GalaxyBackground />

      <div className="relative z-10 flex h-full">
        {showSidebar && (
          <Sidebar currentView={view} setView={setView} onLogout={handleLogout} />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 relative h-full overflow-y-auto transition-all duration-300 ${showSidebar ? 'md:ml-20' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;