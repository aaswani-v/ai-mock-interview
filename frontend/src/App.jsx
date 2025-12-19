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
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);

  // Fetch complete user data from backend
  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/user/complete-data/${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Store interview history
        if (data.data.interviews) {
          setInterviewHistory(data.data.interviews);
          localStorage.setItem('interview_history', JSON.stringify(data.data.interviews));
        }
        
        // Store resume data
        if (data.data.resume) {
          setResumeData(data.data.resume);
          localStorage.setItem('resume_data', JSON.stringify(data.data.resume));
        }
        
        // Store performance data
        if (data.data.performance) {
          setPerformanceData(data.data.performance);
          localStorage.setItem('performance_data', JSON.stringify(data.data.performance));
        }
        
        // Update profile if available
        if (data.data.profile) {
          const profile = data.data.profile;
          setUserProfile({
            name: profile.name || '',
            role: profile.role || '',
            experience: profile.experience_years || '',
            salary: profile.salary_expectation || '',
            email: profile.email || ''
          });
        }
        
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  // Check for existing session on load
  useEffect(() => {
    const loadUserSession = async () => {
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
          
          // Fetch complete user data from backend
          if (userData.uid) {
            await fetchUserData(userData.uid);
          }
          
          // Load cached data as fallback
          const cachedHistory = localStorage.getItem('interview_history');
          if (cachedHistory) {
            setInterviewHistory(JSON.parse(cachedHistory));
          }
          
          const cachedResume = localStorage.getItem('resume_data');
          if (cachedResume) {
            setResumeData(JSON.parse(cachedResume));
          }
          
          const cachedPerformance = localStorage.getItem('performance_data');
          if (cachedPerformance) {
            setPerformanceData(JSON.parse(cachedPerformance));
          }
          
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
    };
    
    loadUserSession();
  }, []);

  // Handlers
  const handleLogin = async (userData) => {
    setUser(userData);
    setUserProfile({
      name: userData.name || '',
      role: userData.role || '',
      experience: userData.experience_years || '',
      salary: userData.salary_expectation || '',
      email: userData.email || ''
    });
    
    // Fetch complete user data from backend
    if (userData.uid) {
      await fetchUserData(userData.uid);
    }
    
    if (userData.profile_completed || userData.name) {
      setView('dashboard');
    } else {
      setView('profile-setup');
    }
  };
  
  const handleRegisterSuccess = async (userData) => {
    if (userData) {
      setUser(userData);
      setUserProfile({ name: userData.name, email: userData.email });
      
      // Initialize empty data for new user
      setInterviewHistory([]);
      setPerformanceData(null);
      localStorage.setItem('interview_history', JSON.stringify([]));
    }
    setView('profile-setup');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('interview_history');
    localStorage.removeItem('resume_data');
    localStorage.removeItem('performance_data');
    setUser(null);
    setUserProfile({});
    setResumeData(null);
    setInterviewHistory([]);
    setPerformanceData(null);
    setView('landing');
  };

  const handleStart = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('login');
    }
  };

  const handleInterviewComplete = async (result) => {
    if (result) {
      setInterviewResult(result);
      
      // Save interview to backend
      if (user?.uid) {
        try {
          const formData = new FormData();
          formData.append('user_id', user.uid);
          formData.append('overall_score', result.overallScore || 0);
          formData.append('visual_score', result.visualScore || 0);
          formData.append('content_score', result.contentScore || 0);
          formData.append('speech_score', result.speechScore || 0);
          formData.append('difficulty', selectedDifficulty);
          formData.append('domain', userProfile.role || 'General');
          formData.append('duration', Math.round((result.duration || 0) / 60));
          formData.append('questions_answered', result.questionsAnswered || result.questionsCompleted || 1);
          
          if (result.allResults) {
            formData.append('questions', JSON.stringify(result.allResults));
          }
          
          const response = await fetch(`${API_URL}/interview/save`, {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('Interview saved to database:', data.interview_id);
          }
        } catch (error) {
          console.error('Error saving interview to database:', error);
        }
      }
      
      // Also persist to localStorage for offline access
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
          role: userProfile.role || 'General',
          domain: userProfile.role || 'General'
        };
        history.unshift(newEntry);
        // Keep only last 50 interviews
        const trimmedHistory = history.slice(0, 50);
        localStorage.setItem('interview_history', JSON.stringify(trimmedHistory));
        setInterviewHistory(trimmedHistory);
        
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

  const handleUploadSuccess = (apiResponse) => {
    // Map the nested API response to the format expected by ResumeInsightsView
    const analysis = apiResponse?.data?.analysis || apiResponse?.analysis || {};
    const atsData = analysis.ats_score || {};
    
    const mappedData = {
      // ATS Score - extract from nested structure
      atsScore: atsData.atsScore || analysis.overall_score || 0,
      
      // Skills - from analysis
      skills: analysis.skills || atsData.matchedSkills || [],
      
      // Missing skills
      missingSkills: atsData.missingSkills || [],
      
      // Strengths and suggestions
      strengths: analysis.strengths || [],
      suggestions: analysis.suggestions || [],
      
      // Job compatibilities
      jobCompatibilities: analysis.job_compatibilities || [],
      
      // File info
      fileName: apiResponse?.data?.file_name || apiResponse?.file_name || "Uploaded Resume",
      
      // Raw data for debugging
      rawAnalysis: analysis
    };
    
    console.log("Mapped resume data:", mappedData);
    setResumeData(mappedData);
    
    // Also save to localStorage for persistence
    localStorage.setItem('resume_data', JSON.stringify(mappedData));
    
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