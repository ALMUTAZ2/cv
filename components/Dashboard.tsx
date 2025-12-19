
import React from 'react';
import { HistoryItem } from '../types.ts';
import { 
  BarChart, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Briefcase,
  Zap,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  history: HistoryItem[];
  onViewResult: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onViewResult }) => {
  const stats = [
    { label: 'Total Analyses', value: history.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Avg. ATS Score', value: `${history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Top Match', value: `${history.length ? Math.max(...history.map(h => h.matchPercentage)) : 0}%`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Applications', value: history.length, icon: Briefcase, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center md:text-left">Performance Dashboard</h2>
        <p className="text-slate-500 mt-1 text-center md:text-left">Monitor your career progression and CV quality trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">ATS Score Progress</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...history].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick History List */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Analysis</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="group p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{item.fileName}</h4>
                  <span className="text-indigo-600 font-black text-sm">{item.score}%</span>
                </div>
                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.date}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200"></div>
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FileText className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-400 text-sm">No analysis history found.</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
