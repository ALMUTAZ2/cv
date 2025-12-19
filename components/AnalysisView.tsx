import React, { useState } from 'react';
import { AnalysisResult } from '../types.ts';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  ListChecks, 
  Wand2,
  ArrowRight,
  Target,
  Clock,
  Code,
  FileSearch,
  Layers,
  Sparkles,
  Cpu,
  Zap,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  onRewrite: () => void;
  isRewriting: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onRewrite, isRewriting }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'parser' | 'compliance' | 'relevance'>('overview');

  const scoreData = (val: number) => [
    { name: 'Score', value: val },
    { name: 'Gap', value: 100 - val },
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'text-rose-600 bg-rose-50 border-rose-100';
    if (severity === 'medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-indigo-600 bg-indigo-50 border-indigo-100';
  };

  const ScoreRing = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={scoreData(value)}
              cx="50%" cy="50%"
              innerRadius={45} outerRadius={55}
              startAngle={90} endAngle={450}
              dataKey="value"
            >
              <Cell fill={color} stroke="none" />
              <Cell fill="#f1f5f9" stroke="none" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto pb-24">
      {/* Header with High-Tech Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Neural Diagnostic Complete</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Audit Insights</h2>
        </div>
        
        <button
          onClick={onRewrite}
          disabled={isRewriting}
          className="group relative flex items-center space-x-4 bg-slate-900 text-white pl-8 pr-10 py-6 rounded-[2.5rem] font-bold transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50 overflow-hidden"
        >
          {/* Neon Pulse Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          
          <div className="relative flex items-center space-x-4">
            {isRewriting ? (
              <Cpu className="h-7 w-7 animate-spin text-indigo-400" />
            ) : (
              <div className="relative">
                <Wand2 className="h-7 w-7 text-indigo-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-amber-400 animate-pulse" />
              </div>
            )}
            <div className="text-left leading-tight">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Execute Strategy</span>
              <span className="block text-xl font-black tracking-tight">Apply AI Fixes Now</span>
            </div>
          </div>
        </button>
      </div>

      {/* Main Score Dashboard */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] grid grid-cols-1 lg:grid-cols-4 gap-16 items-center">
        <div className="flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-12 lg:pb-0 lg:pr-12">
          <div className="relative w-56 h-56">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData(result.finalScore)}
                  cx="50%" cy="50%"
                  innerRadius={75} outerRadius={95}
                  startAngle={90} endAngle={450}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#4f46e5" />
                  <Cell fill="#f8fafc" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">{result.finalScore}%</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ATS Score</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-12">
          <ScoreRing value={result.scores.parseability} label="Structure" color="#6366f1" />
          <ScoreRing value={result.scores.compliance} label="Compliance" color="#8b5cf6" />
          <ScoreRing value={result.scores.relevance} label="Job Fit" color="#ec4899" />
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex p-2 bg-slate-100 rounded-[2rem] border border-slate-200 sticky top-6 z-30 shadow-sm backdrop-blur-md">
        <TabButton id="overview" label="Strategic Map" active={activeTab} onClick={setActiveTab} icon={Target} />
        <TabButton id="parser" label="System View" active={activeTab} onClick={setActiveTab} icon={Code} />
        <TabButton id="compliance" label="Audit Check" active={activeTab} onClick={setActiveTab} icon={ListChecks} />
        <TabButton id="relevance" label="Keyword Sync" active={activeTab} onClick={setActiveTab} icon={FileSearch} />
      </div>

      {/* Dynamic Content Views */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-indigo-600 fill-indigo-600" />
                  Priority Fixes
                </h3>
                <div className="space-y-5">
                  {result.topFixes.map((fix, i) => (
                    <div key={i} className="group flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300">
                      <div className="flex items-start space-x-5">
                        <div className="mt-1 flex items-center justify-center h-8 w-8 rounded-full bg-slate-900 text-white text-[10px] font-black">
                          0{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-snug">{fix.hint}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              <Clock className="h-3 w-3 mr-1" /> {fix.duration}
                            </span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Impact: +{fix.impact}pts</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-indigo-600" />
                  Impact Factor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Quantification Ratio</span>
                        <span className="text-sm font-black text-indigo-600">{Math.round(result.impactDetails.quantificationRatio * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${result.impactDetails.quantificationRatio * 100}%` }}></div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                      "Successful CVs quantify impact. You currently have {result.impactDetails.quantificationRatio > 0.3 ? 'strong' : 'weak'} numeric evidence."
                    </p>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-center">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Executive Verb Rating</span>
                    <p className="text-5xl font-black">{result.impactDetails.score}<span className="text-xl text-slate-500">/100</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
                <h4 className="text-xl font-black mb-4">Level Alignment</h4>
                <div className="inline-flex px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  {result.relevanceDetails.seniorityMatch}
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                  We've detected that your experience depth {result.relevanceDetails.seniorityMatch === 'match' ? 'is perfectly tuned' : 'needs recalibration'} for this specific role.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Skill Taxonomy</h4>
                <div className="space-y-6">
                  <CoverageBar label="Technical Stack" value={result.relevanceDetails.skillCoverage.hardSkills} />
                  <CoverageBar label="Ecosystem Tools" value={result.relevanceDetails.skillCoverage.tools} />
                  <CoverageBar label="Core Leadership" value={result.relevanceDetails.skillCoverage.softSkills} />
                  <CoverageBar label="Credentials" value={result.relevanceDetails.skillCoverage.certifications} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs (implementation follows same high-fidelity style) */}
        {activeTab !== 'overview' && (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="font-bold text-slate-500 tracking-tight">Syncing detailed diagnostic data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ id, label, active, onClick, icon: Icon }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-2xl text-sm font-black transition-all ${
      active === id ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const CoverageBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-slate-900">{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
      <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default AnalysisView;