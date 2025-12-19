
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Briefcase, FileText, Loader2, Info, CheckCircle2, Search, X, ShieldCheck } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface FileUploadProps {
  onAnalyze: (text: string, jd: string, fileName: string) => void;
  isAnalyzing: boolean;
  usageCount: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isAnalyzing, usageCount }) => {
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [showJd, setShowJd] = useState(false);
  
  const statusMessages = [
    "Reading Document...",
    "Scanning Keywords...",
    "AI Engine Processing...",
    "Cross-referencing JD...",
    "Finalizing Report..."
  ];
  const messageIndexRef = useRef(0);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setProgress(prev => {
          // حركة أسرع في البداية لتقليل الشعور بالانتظار
          if (prev < 80) return prev + 4;
          if (prev < 98) return prev + 0.5;
          return prev;
        });
        
        const msgIdx = Math.min(Math.floor(progress / 20), statusMessages.length - 1);
        if (msgIdx !== messageIndexRef.current) {
          messageIndexRef.current = msgIdx;
          setStatus(statusMessages[msgIdx]);
        }
      }, 300);
    } else {
      if (progress > 0) {
        setProgress(100);
        setStatus("Completed!");
      }
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, progress]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setStatus('Analyzing File...');
    setProgress(10);

    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractTextFromDocx(file);
      } else {
        const reader = new FileReader();
        extractedText = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
      }
      setCvText(extractedText);
      setProgress(100);
      setStatus('CV Ready');
      setTimeout(() => setIsParsing(false), 300);
    } catch (error) {
      setStatus('Failed to read file');
      setIsParsing(false);
      setProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cvText) {
      messageIndexRef.current = 0;
      setStatus(statusMessages[0]);
      setProgress(5);
      onAnalyze(cvText, jdText, fileName || "CV_Document");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">SmartATS Analysis</h2>
        <p className="text-slate-500 font-medium">Get enterprise-grade feedback on your CV's compatibility.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!fileName ? (
            <div className="relative group">
              <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="mb-2 text-lg text-slate-700 font-bold">Select CV File</p>
                  <p className="text-sm text-slate-500 font-medium">PDF or DOCX supported</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
              </label>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="bg-indigo-600 p-3 rounded-xl shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">{fileName}</p>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">Document Parsed</p>
                </div>
              </div>
              <button type="button" onClick={() => { setFileName(''); setCvText(''); setProgress(0); }} className="p-2 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {(isParsing || isAnalyzing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black text-indigo-600 uppercase tracking-widest">
                <span className="animate-pulse">{status}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div 
                  className={`h-full transition-all duration-300 rounded-full bg-indigo-600`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button type="button" onClick={() => setShowJd(!showJd)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center transition-colors">
              <Briefcase className="h-4 w-4 mr-2" />
              {showJd ? 'Remove Job Details' : 'Add Job Description (Fill Gaps Automatically)'}
            </button>
            {showJd && (
              <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste job requirements here to find and fill skill gaps..." className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all" />
              </div>
            )}
          </div>

          <button type="submit" disabled={!cvText || isAnalyzing || isParsing} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-indigo-100">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing Report...</span>
              </>
            ) : (
              <>
                <Search className="h-6 w-6" />
                <span>Run Analysis</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1 text-indigo-500" /> Secure Analysis</div>
            <div className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1 text-indigo-500" /> ATS Compatibility</div>
          </div>
        </form>
      </div>

      <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-start space-x-4">
        <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
          <Info className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="text-sm text-indigo-900 font-medium leading-relaxed">
          <span className="font-bold">Pro Tip:</span> If you provide a Job Description, our AI will automatically suggest and add missing keywords to your CV during the rewrite process.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
