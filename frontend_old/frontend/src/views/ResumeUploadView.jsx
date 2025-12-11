import React, { useRef, useState, useEffect } from 'react';
import {
    Upload, Loader, AlertCircle, CheckCircle, Zap, Target, Briefcase, ChevronRight, Calculator, ArrowLeft, HelpCircle,
    Code, Database, Layout, PenTool, Users, Globe, Server, Smartphone, Cpu, Cloud, Shield, Terminal, DollarSign, TrendingUp,
    FileText, Layers, Video, Search, ShoppingBag, BarChart, Grid
} from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/ui/Button';

const Steps = {
    UPLOAD: 1,
    ROLE: 2,
    EXPERIENCE: 3
};

// --- ICON & CATEGORY MAPPING REMAIN THE SAME ---
// (Keeping your existing mapping logic for brevity)
// --- UPDATED ICON MAPPING (Assignments for ALL 35+ Roles) ---
const getRoleIcon = (roleId) => {
    const map = {
        // Engineering (Software)
        'full-stack': Layers, 'frontend': Layout, 'backend': Server,
        'mobile-developer': Smartphone, 'ios-developer': Smartphone, 'android-developer': Smartphone,
        'game-developer': Video, 'java-developer': Code,

        // Infrastructure & Security
        'devops': Cloud, 'cloud-architect': Cloud, 'sre': Terminal,
        'security': Shield, 'cyber-security': Shield, 'network-engineer': Globe,
        'embedded-systems': Cpu, 'blockchain-developer': Globe,

        // Data & AI
        'data-scientist': Database, 'ml-engineer': Cpu, 'ai-researcher': Cpu,
        'data-analyst': BarChart, 'data-engineer': Database,

        // Product & Design
        'product-manager': ShoppingBag, 'project-manager': Users,
        'ui-ux-designer': PenTool, 'graphic-designer': PenTool,

        // Testing
        'qa-engineer': CheckCircle, 'automation-engineer': Zap,

        // Business, HR & Marketing
        'digital-marketer': TrendingUp, 'marketing-manager': TrendingUp, 'content-strategist': FileText,
        'technical-writer': FileText, 'business-analyst': BarChart, 'finance-analyst': DollarSign,
        'hr-specialist': Users, 'sales-engineer': DollarSign, 'operations-manager': Layers
    };

    if (map[roleId]) return map[roleId];

    // Fallbacks based on keywords
    if (roleId.includes('manager')) return Users;
    if (roleId.includes('analyst')) return BarChart;
    if (roleId.includes('designer')) return PenTool;
    if (roleId.includes('developer') || roleId.includes('engineer')) return Code;

    return Briefcase;
};

// --- UPDATED CATEGORY MAPPING (Matches job_roles.py Category Groups) ---
const getCategory = (roleId) => {
    const categories = {
        // Engineering
        'full-stack': 'Engineering', 'frontend': 'Engineering', 'backend': 'Engineering',
        'mobile-developer': 'Engineering', 'ios-developer': 'Engineering', 'android-developer': 'Engineering',
        'game-developer': 'Engineering', 'java-developer': 'Engineering',
        'devops': 'Engineering', 'cloud-architect': 'Engineering', 'sre': 'Engineering',
        'cyber-security': 'Engineering', 'network-engineer': 'Engineering',
        'embedded-systems': 'Engineering', 'blockchain-developer': 'Engineering',
        'qa-engineer': 'Engineering', 'automation-engineer': 'Engineering',

        // Data & AI
        'data-scientist': 'Data & AI', 'ml-engineer': 'Data & AI',
        'data-analyst': 'Data & AI', 'data-engineer': 'Data & AI', 'ai-researcher': 'Data & AI',

        // Product & Design
        'product-manager': 'Product & Design', 'project-manager': 'Product & Design',
        'ui-ux-designer': 'Product & Design', 'graphic-designer': 'Product & Design',

        // Business & HR
        'digital-marketer': 'Business & HR', 'technical-writer': 'Business & HR', 'business-analyst': 'Business & HR',
        'hr-specialist': 'Business & HR', 'sales-engineer': 'Business & HR', 'finance-analyst': 'Business & HR',
        'marketing-manager': 'Business & HR', 'operations-manager': 'Business & HR', 'content-strategist': 'Business & HR'
    };
    return categories[roleId] || 'Other';
};

const CATEGORIES = [
    { id: 'All', icon: Grid, label: 'All Roles' },
    { id: 'Engineering', icon: Code, label: 'Engineering' },
    { id: 'Data & AI', icon: Database, label: 'Data & AI' },
    { id: 'Product & Design', icon: PenTool, label: 'Product & Design' },
    { id: 'Business & HR', icon: Users, label: 'Business & HR' }
];

// --- SUB-COMPONENTS ---

const RoleCard = ({ id, title, description, icon: Icon, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group h-full flex flex-col ${isSelected
            ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50'
            }`}
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-500'}`}>
            <Icon size={24} />
        </div>
        <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>

        {isSelected && (
            <div className="absolute top-3 right-3 text-cyan-500 animate-fade-in">
                <CheckCircle size={20} className="fill-cyan-500/20" />
            </div>
        )}
    </div>
);

const NotSureCard = ({ isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`relative p-4 rounded-xl border border-dashed transition-all duration-300 cursor-pointer group h-full flex flex-col ${isSelected
            ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : 'bg-slate-900/30 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/50'
            }`}
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-500'}`}>
            <HelpCircle size={24} />
        </div>
        <h3 className="font-bold text-lg text-slate-200 mb-1">Not Sure Yet?</h3>
        <p className="text-slate-400 text-sm">We'll analyze your resume and match you to the best fitting roles automatically.</p>

        {isSelected && (
            <div className="absolute top-3 right-3 text-amber-500 animate-fade-in">
                <CheckCircle size={20} className="fill-amber-500/20" />
            </div>
        )}
    </div>
);

const CustomRoleCard = ({ isSelected, onClick, customRole, setCustomRole }) => (
    <div
        onClick={onClick}
        className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group h-full flex flex-col ${isSelected
            ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            : 'bg-slate-900/30 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50'
            }`}
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-purple-500'}`}>
            <PenTool size={24} />
        </div>
        <h3 className="font-bold text-lg text-slate-200 mb-1">Custom Role</h3>

        {isSelected ? (
            <div className="mt-2" onClick={e => e.stopPropagation()}>
                <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Prompt Engineer"
                    className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 animate-fade-in"
                    autoFocus
                />
            </div>
        ) : (
            <p className="text-slate-400 text-sm">Targeting a specific role not listed here? Type it in manually.</p>
        )}

        {isSelected && (
            <div className="absolute top-3 right-3 text-purple-500 animate-fade-in">
                <CheckCircle size={20} className="fill-purple-500/20" />
            </div>
        )}
    </div>
);

const ResumeUploadView = ({ onUpload }) => {
    const [step, setStep] = useState(Steps.UPLOAD);
    const [roles, setRoles] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [customRole, setCustomRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState("All");
    const [experience, setExperience] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Load roles on mount (Full Static Fallback Data matching job_roles.py)
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch(`${API_URL}/jobs/roles`);
                if (!res.ok) throw new Error("Failed to fetch roles");
                const data = await res.json();
                setRoles(data);
            } catch (e) {
                console.warn("API failed, loading static role definitions");
                setRoles({
                    // --- Software Development ---
                    "full-stack": { title: "Full Stack Developer", description: "Develop both frontend and backend applications" },
                    "frontend": { title: "Frontend Developer", description: "Build user interfaces and experiences" },
                    "backend": { title: "Backend Developer", description: "Build server-side applications and APIs" },
                    "mobile-developer": { title: "Mobile App Developer", description: "Build iOS and Android applications" },
                    "ios-developer": { title: "iOS Developer", description: "Develop native applications for Apple devices" },
                    "android-developer": { title: "Android Developer", description: "Develop native applications for Android devices" },
                    "game-developer": { title: "Game Developer", description: "Create video games for various platforms" },
                    "java-developer": { title: "Java Developer", description: "Develop enterprise applications using Java" },

                    // --- Data & AI ---
                    "data-scientist": { title: "Data Scientist", description: "Analyze data and build predictive models" },
                    "ml-engineer": { title: "ML Engineer", description: "Build and deploy machine learning systems" },
                    "data-analyst": { title: "Data Analyst", description: "Interpret data to help make business decisions" },
                    "data-engineer": { title: "Data Engineer", description: "Design and maintain data pipelines" },
                    "ai-researcher": { title: "AI Researcher", description: "Research and develop new AI algorithms" },

                    // --- Infrastructure ---
                    "devops": { title: "DevOps Engineer", description: "Manage infrastructure and deployment pipelines" },
                    "cloud-architect": { title: "Cloud Architect", description: "Design and manage cloud infrastructure" },
                    "cyber-security": { title: "Cyber Security Analyst", description: "Protect systems and networks from threats" },
                    "sre": { title: "Site Reliability Engineer", description: "Ensure system reliability and scalability" },

                    // --- Product & Design ---
                    "product-manager": { title: "Product Manager", description: "Lead product development and strategy" },
                    "project-manager": { title: "Project Manager", description: "Plan and execute projects" },
                    "ui-ux-designer": { title: "UI/UX Designer", description: "Design user interfaces and experiences" },
                    "graphic-designer": { title: "Graphic Designer", description: "Create visual concepts and layouts" },

                    // --- Testing ---
                    "qa-engineer": { title: "QA Engineer", description: "Ensure software quality through testing" },
                    "automation-engineer": { title: "Automation Engineer", description: "Write scripts to automate testing" },

                    // --- Other Tech ---
                    "blockchain-developer": { title: "Blockchain Developer", description: "Build decentralized applications" },
                    "embedded-systems": { title: "Embedded Sys Engineer", description: "Program embedded devices" },
                    "network-engineer": { title: "Network Engineer", description: "Manage computer networks" },
                    "sales-engineer": { title: "Sales Engineer", description: "Sell technical products using engineering knowledge" },

                    // --- Business & HR ---
                    "digital-marketer": { title: "Digital Marketer", description: "Promote products online" },
                    "technical-writer": { title: "Technical Writer", description: "Create technical documentation" },
                    "business-analyst": { title: "Business Analyst", description: "Analyze business processes and requirements" },
                    "hr-specialist": { title: "HR Specialist", description: "Manage recruitment and employee relations" },
                    "finance-analyst": { title: "Finance Analyst", description: "Analyze financial data and trends" },
                    "marketing-manager": { title: "Marketing Manager", description: "Plan and execute marketing strategies" },
                    "operations-manager": { title: "Operations Manager", description: "Oversee daily business operations" },
                    "content-strategist": { title: "Content Strategist", description: "Plan and manage content strategy" }
                });
            }
        };
        fetchRoles();
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
            setStep(Steps.ROLE);
            setError(null);
        } else {
            setError("Please upload a valid PDF file.");
        }
    };

    const handleFinalSubmit = async () => {
        if (!uploadedFile) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('userId', 'guest-user');

        let roleIdToSend = selectedRole;
        if (selectedRole === 'custom') roleIdToSend = customRole.trim();
        else if (selectedRole === 'not-sure') roleIdToSend = 'general';

        formData.append('roleId', roleIdToSend);
        formData.append('experienceLevel', experience);

        try {
            console.log("Starting resume analysis...");
            const [res] = await Promise.all([
                fetch(`${API_URL}/resume/upload`, { method: 'POST', body: formData }),
                // Minimum wait time to show the "Analyzing" animation (User requested 5-10s delay previously)
                new Promise(resolve => setTimeout(resolve, 5000))
            ]);

            console.log("API Status:", res.status);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
            }

            const data = await res.json();
            console.log("Analysis Result:", data);

            if (data.success) {
                // SUCCESS: Trigger parent handler to switch view
                console.log("Calling onUpload with success data...");
                onUpload(data);
            } else {
                throw new Error(data.detail || "Upload failed");
            }
        } catch (err) {
            console.error("Resume Upload Error:", err);
            setError(err.message || "Failed to analyze resume. Please try again.");
            setUploading(false); // This effectively sends user back to the previous step (Experience), but now with an error message.
        }
    };

    // --- RENDER HELPERS ---

    const renderUpload = () => (
        <div className="flex flex-col items-center justify-center animate-fade-in-up w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h2>
            <p className="text-slate-400 mb-8 text-center max-w-md">Let's start by analyzing your current resume.</p>

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf" />

            <div
                onClick={() => fileInputRef.current.click()}
                className={`w-full max-w-2xl h-64 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/50 group relative overflow-hidden hover:border-cyan-500/50 hover:bg-slate-800/50`}
            >
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/10">
                    <Upload size={32} className="text-slate-400 group-hover:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Click to Upload PDF</h3>
                <p className="text-slate-500 text-sm">Max Size: 5MB</p>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
        </div>
    );

    const renderRoles = () => {
        const filteredRoles = activeTab === 'All'
            ? Object.entries(roles)
            : Object.entries(roles).filter(([id]) => getCategory(id) === activeTab);

        // Logic: Button is disabled ONLY if:
        // 1. No role is selected (null)
        // 2. Custom is selected BUT the text input is empty
        const isNextDisabled = !selectedRole || (selectedRole === 'custom' && !customRole.trim());

        return (
            <div className="animate-fade-in-up w-full max-w-6xl mx-auto flex flex-col h-full">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">Select Job Profile</h2>
                <p className="text-slate-400 mb-6 text-center">Which role are you targeting?</p>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === cat.id
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <cat.icon size={16} /> {cat.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 min-h-[300px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">

                        {/* 1. NOT SURE CARD */}
                        <NotSureCard
                            isSelected={selectedRole === 'not-sure'}
                            onClick={() => setSelectedRole('not-sure')}
                        />

                        {/* 2. CUSTOM ROLE CARD */}
                        <CustomRoleCard
                            isSelected={selectedRole === 'custom'}
                            onClick={() => setSelectedRole('custom')}
                            customRole={customRole}
                            setCustomRole={setCustomRole}
                        />

                        {/* 3. STANDARD ROLES (Now matching the format exactly) */}
                        {filteredRoles.map(([id, role]) => (
                            <RoleCard
                                key={id}
                                id={id}
                                title={role.title}
                                description={role.description}
                                icon={getRoleIcon(id)}
                                isSelected={selectedRole === id}
                                onClick={() => setSelectedRole(id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky bottom-0 z-10 pb-2">
                    <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep(Steps.UPLOAD)}>Back</Button>
                    <Button
                        disabled={isNextDisabled}
                        onClick={() => setStep(Steps.EXPERIENCE)}
                        icon={ChevronRight}
                        // Visual Feedback: If active, use Primary color, else Secondary
                        variant={isNextDisabled ? "secondary" : "primary"}
                        className={`transition-all duration-300 ${!isNextDisabled ? 'shadow-[0_0_20px_rgba(6,182,212,0.4)]' : ''}`}
                    >
                        {isNextDisabled ? "Select a Role" : "Next: Experience"}
                    </Button>
                </div>
            </div>
        );
    };

    const renderExperience = () => (
        <div className="animate-fade-in-up w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Years of Experience</h2>
            <p className="text-slate-400 mb-12">How long have you been working in this field?</p>

            <div className="relative mb-16 px-4">
                <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="mt-8">
                    <span className="text-6xl font-black text-white">{experience}</span>
                    <span className="text-xl text-slate-500 ml-2">Years</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2 justify-center">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="flex justify-center gap-4">
                <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep(Steps.ROLE)}>Back</Button>
                <Button onClick={handleFinalSubmit} icon={Zap} disabled={uploading} className="shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    {uploading ? 'Analyzing...' : 'Analyze My Resume'}
                </Button>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="flex flex-col items-center justify-center animate-fade-in-up w-full h-[60vh]">
            <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
                <Target size={48} className="absolute inset-0 m-auto text-cyan-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Analyzing Resume...</h2>
            <p className="text-slate-400">Comparing against 30+ Job Profiles...</p>
        </div>
    );

    if (uploading) return renderProcessing();

    return (
        <div className="h-full p-6 overflow-hidden flex flex-col">
            <div className="mb-4 flex justify-center shrink-0">
                <div className="flex items-center gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-colors ${step >= i ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-800'}`}></div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {step === Steps.UPLOAD && renderUpload()}
                {step === Steps.ROLE && renderRoles()}
                {step === Steps.EXPERIENCE && renderExperience()}
            </div>
        </div>
    );

};

export default ResumeUploadView;