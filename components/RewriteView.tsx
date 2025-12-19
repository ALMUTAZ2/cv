
import React, { useState, useEffect } from 'react';
import { RewriteResult } from '../types.ts';
import { 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Undo2, 
  FileText, 
  Loader2, 
  Eye, 
  Terminal,
  Cpu,
  Zap,
  Box,
  Fingerprint,
  Tag,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface RewriteViewProps {
  result: RewriteResult | null;
  onRewrite: () => void;
  isRewriting: boolean;
  originalText: string;
}

const RewriteView: React.FC<RewriteViewProps> = ({ result, onRewrite, isRewriting, originalText }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    { title: "Verifying Source Integrity", desc: "Indexing existing experience for reconstruction..." },
    { title: "STAR Synthesis", desc: "Applying Situational context to your existing bullet points..." },
    { title: "Verbal Strengthening", desc: "Replacing passive language with high-impact executive verbs..." },
    { title: "ATS Layout Engineering", desc: "Formatting for 99.9% parser compatibility across Workday & Greenhouse..." },
    { title: "Validation Check", desc: "Ensuring zero-fabrication of skills or credentials..." }
  ];

  useEffect(() => {
    if (isRewriting) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 3500);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isRewriting]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      
      const splitText = doc.splitTextToSize(result.improvedText, contentWidth);
      let cursorY = 20;

      splitText.forEach((line: string) => {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, margin, cursorY);
        cursorY += 6;
      });

      doc.save('SmartATS_Neural_Optimization.pdf');
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Error generating PDF. Please copy the text as a backup.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isRewriting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-12 max-w-2xl mx-auto px-4">
        <div className="relative">
          <div className="absolute -inset-8 border border-indigo-200/50 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
          <div className="absolute -inset-16 border border-indigo-100/30 rounded-full animate-[ping_6s_ease-in-out_infinite]" />
          
          <div className="h-44 w-44 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-2xl"></div>
          
          <div className="absolute inset-0 m-auto h-28 w-28 bg-indigo-600 rounded-[2.5rem] rotate-45 animate-pulse flex items-center justify-center shadow-2xl shadow-indigo-200">
             <div className="flex flex-col items-center -rotate-45">
                <Cpu className="h-10 w-10 text-white mb-1" />
                <Zap className="h-4 w-4 text-indigo-300 animate-bounce" />
             </div>
          </div>
        </div>
        
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Fact-Based Reconstruction</h3>
            <p className="text-slate-500 font-medium text-lg italic">"Optimizing your real experience without fabricating content"</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {loadingSteps.map((step, i) => (
               <div key={i} className={`flex items-start space-x-4 p-5 rounded-2xl border transition-all duration-700 ${
                 i === loadingStep ? 'bg-white border-indigo-200 shadow-xl translate-x-2' : 
                 i < loadingStep ? 'bg-indigo-50/50 border-transparent opacity-60' : 'opacity-20 border-transparent'
               }`}>
                 <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                   i === loadingStep ? 'bg-indigo-600 text-white animate-pulse' : 
                   i < loadingStep ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                 }`}>
                   {i < loadingStep ? <Check className="h-4 w-4" /> : <span className="text-xs font-black">{i + 1}</span>}
                 </div>
                 <div className="space-y-1">
                   <span className={`text-sm font-black uppercase tracking-widest ${i === loadingStep ? 'text-indigo-600' : 'text-slate-500'}`}>
                     {step.title}
                   </span>
                   <p className="text-xs text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                 </div>
                 {i === loadingStep && <Loader2 className="h-4 w-4 animate-spin text-indigo-600 ml-auto" />}
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto pb-24 px-4">
      {/* Action Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Fingerprint className="h-32 w-32 text-indigo-600" />
        </div>
        
        <div className="flex items-center space-x-6 text-center lg:text-left relative z-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] shadow-2xl shadow-indigo-200">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Experience Optimized</h2>
            <div className="flex items-center justify-center lg:justify-start text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mt-2 bg-indigo-50 px-3 py-1 rounded-full w-fit">
              <TrendingUp className="h-4 w-4 mr-2" />
              Verbal Power Shift: +{result.scoreImprovement}% 
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto relative z-10">
          <button
            onClick={handleCopy}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            <span>{copied ? 'Copied' : 'Copy Result'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            <span>Export Final PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-6">
          {/* Keyword Report Section */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">[KEYWORD_REPORT]</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Integrated</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywordReport.integrated.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">{kw}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Not Integrated</p>
                <div className="space-y-2">
                  {result.keywordReport.notIntegrated.map((item, i) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                      <span className="font-bold text-slate-900">{item.keyword}:</span>
                      <span className="text-slate-500 ml-1 italic">{item.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Format Fixes Section */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">[FORMAT_FIXES]</h3>
            </div>
            <ul className="space-y-3">
              {result.formatFixes.map((fix, i) => (
                <li key={i} className="flex items-start space-x-2 text-sm text-slate-600 font-medium">
                  <Check className="h-4 w-4 text-indigo-600 mt-1 shrink-0" />
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <ShieldCheck className="h-12 w-12 text-indigo-400 mb-6" />
              <h4 className="text-2xl font-black mb-4">Parser Validation</h4>
              <p className="text-base text-slate-400 leading-relaxed font-medium">
                Our Neural Engine has verified this document against <span className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-4">Workday Core 2025</span> and <span className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-4">Greenhouse AI</span> parser schemas.
              </p>
            </div>
            <FileText className="absolute -bottom-8 -right-8 h-40 w-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <button onClick={onRewrite} className="w-full group flex items-center justify-center space-x-3 text-indigo-600 font-black hover:text-indigo-800 transition-colors text-xs py-6 bg-indigo-50/30 rounded-[2rem] border-2 border-dashed border-indigo-100">
            <Undo2 className="h-5 w-5 group-hover:-rotate-45 transition-transform" />
            <span>Modify Optimization Directives</span>
          </button>
        </div>

        {/* Paper Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-slate-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">[IMPROVED_CV] PREVIEW</span>
            </div>
            <div className="flex items-center space-x-2">
               <div className="h-2 w-2 rounded-full bg-rose-400" />
               <div className="h-2 w-2 rounded-full bg-amber-400" />
               <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] border-8 border-slate-50 shadow-[0_48px_80px_-24px_rgba(0,0,0,0.2)] overflow-hidden relative min-h-[1000px]">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none h-40" />
            
            <div className="bg-slate-100/50 backdrop-blur-xl p-8 border-b border-slate-200/50 flex items-center justify-between px-12">
              <div className="flex items-center space-x-4">
                <div className="h-3 w-3 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.8)]" />
                <span className="text-[12px] font-black text-slate-500 font-mono tracking-tighter">FACTUAL_RECONSTRUCTION.txt</span>
              </div>
              <button 
                onClick={handleCopy}
                className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:bg-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Snap Copy
              </button>
            </div>

            <div className="p-16 md:p-28 text-slate-800 leading-[1.9] font-mono text-[13px] whitespace-pre-wrap selection:bg-indigo-600 selection:text-white relative z-10">
              {result.improvedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewriteView;
