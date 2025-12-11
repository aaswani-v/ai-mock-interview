import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { getDoc, doc, query, collection, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Visuals
import GalaxyBackground from './components/visuals/GalaxyBackground';

// Views
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import VerificationView from './views/VerificationView';
import ProfileSetupView from './views/ProfileSetupView';
import DashboardView from './views/DashboardView';
import ModeSelectionView from './views/ModeSelectionView';
import ActiveInterviewView from './views/ActiveInterviewView';
import AnalyticsView from './views/AnalyticsView';
import GrowthView from './views/GrowthView';
import AchievementsView from './views/AchievementsView';
import PracticeHubView from './views/PracticeHubView';
import ResumeUploadView from './views/ResumeUploadView';
import ResumeInsightsView from './views/ResumeInsightsView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';

// Components
import Sidebar from './components/Sidebar';

// Mock Data
import { MOCK_QUESTIONS } from './data/mockData';

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // landing, login, register, dashboard, mode-selection, interview, etc...
  const [question, setQuestion] = useState(MOCK_QUESTIONS[0]); // Current interview question
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");

  // Auth Listener
  // Auth Listener (stable, single subscription) - put this into App.js (replace existing useEffect)
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;

      setUser(currentUser);

      if (currentUser) {
        try {
          // Fetch profile from Firestore (if exists)
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data();
            // Ensure a name field always exists (fallback to displayName, then email local part)
            const fallbackName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
            setUserProfile({ ...profileData, name: profileData.name || fallbackName });
          } else {
            // No Firestore profile yet — use auth profile or email fallback
            const fallbackName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
            setUserProfile({ name: fallbackName, email: currentUser.email });
          }

          // Fetch latest resume analysis (optional)
          try {
            const resumeQuery = query(
              collection(db, "resumes"),
              where("userId", "==", currentUser.uid),
              orderBy("uploadedAt", "desc"),
              limit(1)
            );
            const resumeSnap = await getDocs(resumeQuery);
            if (!resumeSnap.empty) {
              const data = resumeSnap.docs[0].data();
              setResumeData({
                ...data,
                missingSkills: data.analysis?.missingSkills || [],
                jobCompatibilities: data.analysis?.jobCompatibilities || data.jobCompatibilities || []
              });
            } else {
              setResumeData(null);
            }
          } catch (e) {
            console.error("Error fetching resume", e);
            setResumeData(null);
          }

        } catch (e) {
          console.error("Error fetching profile", e);
          setUserProfile({});
        }

        // Update view safely using previous state
        setView(prev => {
          if (!currentUser.emailVerified) return 'verification';
          if (['login', 'register', 'landing'].includes(prev)) return 'dashboard';
          return prev;
        });

      } else {
        // Logged out — show landing unless currently on auth pages
        setUserProfile({});
        setResumeData(null);
        setView(prev => (['landing', 'register', 'login'].includes(prev) ? prev : 'landing'));
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
    // run once
  }, []);


  // Handlers
  const handleLogin = () => setView('dashboard');
  const handleRegisterSuccess = () => setView('verification');
  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };

  const handleStart = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('login');
    }
  };

  const handleModeSelect = (modeId) => {
    // In future, set mode in context
    setView('interview');
  };

  const handleUploadSuccess = (data) => {
    setResumeData(data);
    setView('resume-insights');
  };

  const handleProfileUpdate = (data) => {
    setUserProfile(prev => ({ ...prev, ...data }));
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
      case 'verification':
        // Pass email from state or auth user
        return <VerificationView email={pendingEmail || user?.email} onComplete={() => setView('profile-setup')} />;
      case 'profile-setup':
        return <ProfileSetupView onComplete={() => setView('dashboard')} updateProfile={handleProfileUpdate} />;
      case 'dashboard':
        return <DashboardView onNavigate={setView} user={userProfile} />;
      case 'mode-selection':
        return <ModeSelectionView onSelectMode={handleModeSelect} />;
      case 'interview':
        return <ActiveInterviewView question={question} onEndQuestion={() => setView('dashboard')} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'growth':
        return <GrowthView />;
      case 'achievements':
        return <AchievementsView />;
      case 'resources':
        return <PracticeHubView />;
      case 'resume-upload':
        return <ResumeUploadView onUpload={handleUploadSuccess} />;
      case 'resume-insights':
        return <ResumeInsightsView onContinue={() => setView('dashboard')} resumeData={resumeData} />;
      case 'profile':
        return <ProfileView profile={userProfile} onNavigate={setView} />;
      case 'settings':
        return <SettingsView onNavigate={setView} />;
      default:
        return <DashboardView onNavigate={setView} user={userProfile} />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <GalaxyBackground />

      <div className="relative z-10 flex h-full">
        {/* Sidebar only when logged in and not in 'fullscreen' views like landing/login/register/verification */}
        {user && user.emailVerified && !['landing', 'login', 'register', 'verification', 'profile-setup'].includes(view) && (
          <Sidebar currentView={view} setView={setView} onLogout={handleLogout} />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 relative h-full transition-all duration-300 ${user && user.emailVerified && !['landing', 'login', 'register', 'verification', 'profile-setup'].includes(view) ? 'md:ml-20' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;