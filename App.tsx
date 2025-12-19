
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  Wand2, 
  Settings, 
  Plus, 
  History, 
  ShieldCheck, 
  Zap, 
  Menu,
  X,
  CreditCard,
  Timer
} from 'lucide-react';
import { AppState, AnalysisResult, RewriteResult, HistoryItem } from './types.ts';
import { analyzeCV, rewriteCV } from './geminiService.ts';
import Dashboard from './components/Dashboard.tsx';
import FileUpload from './components/FileUpload.tsx';
import AnalysisView from './components/AnalysisView.tsx';
import RewriteView from './components/RewriteView.tsx';
import Pricing from './components/Pricing.tsx';
import RateLimitOverlay from './components/RateLimitOverlay.tsx';

const RPM_LIMIT = 15;
const RPD_LIMIT = 1500;
const TOTAL_FREE_LIMIT = 2; // تحديث الحد الإجمالي إلى 2

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    analysisResult: null,
    rewriteResult: null,
    isAnalyzing: false,
    isRewriting: false,
    history: [],
    usageCount: 0,
    dailyUsageCount: 0,
    lastResetDate: new Date().toLocaleDateString(),
  });

  const [rpmTimestamps, setRpmTimestamps] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [rateLimitState, setRateLimitState] = useState<{ active: boolean; type: 'RPM' | 'RPD'; resetTime: number }>({
    active: false,
    type: 'RPM',
    resetTime: 0
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('smartats_history');
    const savedUsage = localStorage.getItem('smartats_usage');
    const savedDailyCount = localStorage.getItem('smartats_daily_count');
    const savedLastDate = localStorage.getItem('smartats_last_date');
    const today = new Date().toLocaleDateString();

    let dailyCount = savedDailyCount ? parseInt(savedDailyCount) : 0;
    let lastDate = savedLastDate || today;

    if (lastDate !== today) {
      dailyCount = 0;
      lastDate = today;
      localStorage.setItem('smartats_daily_count', '0');
      localStorage.setItem('smartats_last_date', today);
    }

    setState(prev => ({ 
      ...prev, 
      history: savedHistory ? JSON.parse(savedHistory) : [],
      usageCount: savedUsage ? parseInt(savedUsage) : 0,
      dailyUsageCount: dailyCount,
      lastResetDate: lastDate
    }));
  }, []);

  const getWaitTimes = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // فحص RPM (طلبات في الدقيقة)
    const validRpmTimestamps = rpmTimestamps.filter(ts => ts > oneMinuteAgo);
    if (validRpmTimestamps.length >= RPM_LIMIT) {
      const oldestRequest = Math.min(...validRpmTimestamps);
      return { limited: true, type: 'RPM' as const, resetTime: oldestRequest + 60000 };
    }

    // فحص RPD (طلبات في اليوم)
    if (state.dailyUsageCount >= RPD_LIMIT) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      return { limited: true, type: 'RPD' as const, resetTime: midnight.getTime() };
    }

    return { limited: false };
  };

  const handleAnalyze = async (text: string, jd: string, name: string) => {
    // 1. فحص الحد الإجمالي (2 طلبات)
    if (state.usageCount >= TOTAL_FREE_LIMIT) {
      setState(prev => ({ ...prev, currentView: 'pricing' }));
      return;
    }

    // 2. فحص حدود السرعة (RPM/RPD)
    const check = getWaitTimes();
    if (check.limited) {
      setRateLimitState({ active: true, type: check.type, resetTime: check.resetTime! });
      return;
    }

    setCvText(text);
    setJdText(jd);
    setFileName(name);
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const result = await analyzeCV(text, jd);
      const now = Date.now();
      const newUsage = state.usageCount + 1;
      const newDailyCount = state.dailyUsageCount + 1;
      
      setRpmTimestamps(prev => [...prev.filter(ts => ts > now - 60000), now]);
      localStorage.setItem('smartats_usage', newUsage.toString());
      localStorage.setItem('smartats_daily_count', newDailyCount.toString());

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        fileName: name,
        score: result.finalScore,
        matchPercentage: result.relevanceDetails.matchPercent,
      };

      const newHistory = [newHistoryItem, ...state.history];
      localStorage.setItem('smartats_history', JSON.stringify(newHistory));

      setState(prev => ({
        ...prev,
        analysisResult: result,
        history: newHistory,
        usageCount: newUsage,
        dailyUsageCount: newDailyCount,
        isAnalyzing: false,
        currentView: 'analyze'
      }));
    } catch (error) {
      console.error("Analysis failed", error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      alert("Analysis failed. Please try again.");
    }
  };

  const handleRewrite = async () => {
    const check = getWaitTimes();
    if (check.limited) {
      setRateLimitState({ active: true, type: check.type, resetTime: check.resetTime! });
      return;
    }

    setState(prev => ({ ...prev, isRewriting: true, currentView: 'rewrite' }));
    try {
      const result = await rewriteCV(cvText, jdText, state.analysisResult || undefined);
      const now = Date.now();
      setRpmTimestamps(prev => [...prev.filter(ts => ts > now - 60000), now]);
      
      setState(prev => ({ ...prev, rewriteResult: result, isRewriting: false }));
    } catch (error) {
      console.error("Rewrite failed", error);
      setState(prev => ({ ...prev, isRewriting: false }));
      alert("AI Rewriter is currently unavailable.");
    }
  };

  const navigateTo = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const SidebarItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: AppState['currentView'] }) => (
    <button
      onClick={() => navigateTo(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-bold transition-all rounded-xl mb-1 group ${
        state.currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${state.currentView === view ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter']">
      {rateLimitState.active && (
        <RateLimitOverlay 
          type={rateLimitState.type} 
          resetTime={rateLimitState.resetTime} 
          onClose={() => setRateLimitState(prev => ({ ...prev, active: false }))} 
        />
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg text-slate-900 tracking-tighter">SmartATS Pro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-500 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-12">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">SmartATS</h1>
                <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mt-1">Enterprise Engine</p>
              </div>
            </div>

            <nav>
              <SidebarItem icon={Plus} label="New Deep Audit" view="home" />
              <SidebarItem icon={BarChart3} label="Audit Insights" view="dashboard" />
              <SidebarItem icon={Wand2} label="AI Gap Filler" view="rewrite" />
              <SidebarItem icon={History} label="Audit History" view="dashboard" />
              <SidebarItem icon={CreditCard} label="Pricing" view="pricing" />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                <span>Free Trial Usage</span>
                <span>{state.usageCount} / {TOTAL_FREE_LIMIT}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000" 
                  style={{ width: `${(state.usageCount / TOTAL_FREE_LIMIT) * 100}%` }}
                ></div>
              </div>
            </div>

            <button className="flex items-center w-full px-4 py-3 text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-900 rounded-xl transition-all">
              <Settings className="mr-3 h-5 w-5 text-slate-400" />
              System Settings
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto pt-16 lg:pt-0 scroll-smooth">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {state.currentView === 'home' && (
            <FileUpload 
              onAnalyze={handleAnalyze} 
              isAnalyzing={state.isAnalyzing} 
              usageCount={state.usageCount}
            />
          )}

          {state.currentView === 'analyze' && state.analysisResult && (
            <AnalysisView 
              result={state.analysisResult} 
              onRewrite={handleRewrite}
              isRewriting={state.isRewriting}
            />
          )}

          {state.currentView === 'rewrite' && (
            <RewriteView 
              result={state.rewriteResult} 
              onRewrite={handleRewrite}
              isRewriting={state.isRewriting}
              originalText={cvText}
            />
          )}

          {state.currentView === 'dashboard' && (
            <Dashboard 
              history={state.history} 
              onViewResult={(id) => navigateTo('analyze')}
            />
          )}

          {state.currentView === 'pricing' && <Pricing />}
        </div>
      </main>
    </div>
  );
};

export default App;
