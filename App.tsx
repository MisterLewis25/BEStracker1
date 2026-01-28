
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Student, NewStudent, Assessment } from './types.ts';
import { Icons, MOCK_STUDENTS, GRADELIST, SHEET_CONFIG, SECURITY_CONFIG, getCurrentAcademicYear, getNextGrade } from './constants.tsx';
import StudentCard from './components/StudentCard.tsx';
import StudentModal from './components/StudentModal.tsx';
import { syncToGoogleSheet, fetchFromGoogleSheet } from './services/sheetsService.ts';

type ConnectionState = 'checking' | 'connected' | 'error' | 'unconfigured';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('checking');
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  const initialLoadDone = useRef(false);

  const currentUrl = window.location.href;
  const isTempUrl = currentUrl.includes('.goog') || currentUrl.includes('localhost') || currentUrl.includes('webcontainer') || currentUrl.includes('preview');
  const isConfigured = SHEET_CONFIG.SYNC_ENDPOINT.includes('/exec') && SHEET_CONFIG.SYNC_ENDPOINT.length > 30;

  useEffect(() => {
    const authStatus = sessionStorage.getItem('is_teacher_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCodeInput.toUpperCase() === SECURITY_CONFIG.ACCESS_CODE.toUpperCase()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('is_teacher_authenticated', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('is_teacher_authenticated');
  };

  const handleShare = () => {
    const message = `🐾 Brown Bears Student Tracker\n\n1. Go to: ${currentUrl}\n2. Enter Access Code: ${SECURITY_CONFIG.ACCESS_CODE}\n\n${isTempUrl ? '⚠️ NOTE: This is a temporary preview link.' : '✅ This is a permanent link.'}`;
    
    navigator.clipboard.writeText(message).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    });
  };

  const checkAndApplyRollover = (data: Student[]): Student[] => {
    const currentYear = getCurrentAcademicYear();
    let hasChanges = false;
    
    const updatedData = data.map(student => {
      const hasCurrentYear = student.assessments.some(a => a.year === currentYear);
      if (!hasCurrentYear) {
        hasChanges = true;
        const sorted = [...student.assessments].sort((a, b) => b.year.localeCompare(a.year));
        const latest = sorted[0];
        const nextGrade = latest ? getNextGrade(latest.grade) : student.grade;
        const newAssessment: Assessment = {
          id: Math.random().toString(36).substr(2, 9),
          year: currentYear,
          grade: nextGrade,
          starReadingLevel: ''
        };
        return {
          ...student,
          grade: nextGrade,
          assessments: [newAssessment, ...student.assessments],
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });
    return hasChanges ? updatedData : data;
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timeout = setTimeout(() => setShowSkipButton(true), 8000);

    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        if (!isConfigured) setConnectionStatus('unconfigured');
        else setConnectionStatus('checking');

        let initialData: Student[] = [];
        const cloudData = await fetchFromGoogleSheet();
        
        if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
          initialData = cloudData;
          setConnectionStatus('connected');
        } else {
          if (isConfigured && cloudData === null) setConnectionStatus('error');
          const saved = localStorage.getItem('brown_bears_data');
          initialData = saved ? JSON.parse(saved) : MOCK_STUDENTS;
        }

        const processedData = checkAndApplyRollover(initialData);
        setStudents(processedData);
        localStorage.setItem('brown_bears_data', JSON.stringify(processedData));
      } catch (err) {
        console.error("Initialization error:", err);
        setConnectionStatus('error');
      } finally {
        setIsInitialLoading(false);
        initialLoadDone.current = true;
        clearTimeout(timeout);
      }
    };
    loadData();
  }, [isAuthenticated, isConfigured]);

  useEffect(() => {
    if (!initialLoadDone.current || isInitialLoading || !isAuthenticated) return;
    localStorage.setItem('brown_bears_data', JSON.stringify(students));
    
    const sync = async () => {
      setIsSyncing(true);
      const success = await syncToGoogleSheet(students);
      if (success) setConnectionStatus('connected');
      else setConnectionStatus('error');
      setIsSyncing(false);
    };
    
    const timer = setTimeout(sync, 2000);
    return () => clearTimeout(timer);
  }, [students, isInitialLoading, isAuthenticated]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(searchLower) ||
        student.teacher.toLowerCase().includes(searchLower) ||
        student.interests.some(i => i.toLowerCase().includes(searchLower)) ||
        student.grade.toLowerCase().includes(searchLower);
      const matchesFilter = selectedFilter === 'All' || student.grade === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, selectedFilter]);

  const handleAddStudent = (newStudentData: NewStudent) => {
    const newStudent: Student = {
      ...newStudentData,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
      notes: newStudentData.notes || [],
      strategies: newStudentData.strategies || []
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf0] p-6 text-slate-800">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-b-8 border-orange-100 p-10 w-full max-w-md text-center">
          <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-100">
            <Icons.Bear />
          </div>
          <h2 className="text-3xl font-black mb-2">Teacher Access</h2>
          <p className="text-gray-500 font-bold mb-8">Enter your school's access code to view student records.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Access Code"
              className={`w-full py-4 px-6 rounded-2xl border-4 text-center text-xl font-black tracking-widest outline-none transition-all ${authError ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-50 bg-blue-50 focus:border-blue-400'}`}
              value={accessCodeInput}
              onChange={e => { setAccessCodeInput(e.target.value); setAuthError(false); }}
            />
            {authError && <p className="text-red-500 text-xs font-bold uppercase animate-pulse">Oops! That code isn't quite right.</p>}
            <button type="submit" className="w-full bg-green-500 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-green-100 hover:bg-green-600 active:scale-95 transition-all">OPEN HUB</button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center">
             <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-2">Environment Status</p>
             <div className="flex gap-4">
                <div className="flex items-center gap-1">
                   <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
                   <span className="text-[9px] font-bold text-gray-400">SYNC PIPE</span>
                </div>
                <div className="flex items-center gap-1">
                   <div className={`w-2 h-2 rounded-full ${isTempUrl ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
                   <span className="text-[9px] font-bold text-gray-400">{isTempUrl ? 'PREVIEW MODE' : 'LIVE MODE'}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf0]">
        <div className="animate-bounce mb-4"><Icons.Bear /></div>
        <h2 className="text-2xl font-black text-orange-800">Waking up the bears...</h2>
        <p className="text-orange-500 font-bold animate-pulse mb-6">Checking records and syncing with cloud</p>
        {showSkipButton && (
          <button 
            onClick={() => setIsInitialLoading(false)}
            className="px-6 py-2 bg-white border-2 border-orange-200 text-orange-600 font-bold rounded-full hover:bg-orange-50 transition-all text-xs"
          >
            SKIP SYNC & WORK OFFLINE
          </button>
        )}
      </div>
    );
  }

  const getStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'checking': return 'bg-blue-400 animate-pulse';
      case 'error': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
      default: return 'bg-red-500';
    }
  };

  const getStatusTitle = () => {
    switch(connectionStatus) {
      case 'connected': return 'Live: Syncing with Google Sheets';
      case 'checking': return 'Checking Connection...';
      case 'error': return 'Network error or CORS issue. Check your Deployment settings.';
      default: return 'Not Configured';
    }
  };

  return (
    <div className="min-h-screen pb-20 text-slate-800">
      {showCopyToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce flex items-center gap-2">
          <span className="text-green-400">✔</span> Invite Link & Code Copied!
        </div>
      )}

      {!isConfigured && (
        <div className="fixed inset-0 z-[100] bg-orange-900/95 backdrop-blur-md flex items-center justify-center p-6 text-white overflow-y-auto">
          <div className="max-w-2xl w-full space-y-6 my-10 text-center">
            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <Icons.Bear />
            </div>
            <h2 className="text-3xl font-black">Connection Diagnostic</h2>
            <div className="bg-white/10 p-6 rounded-3xl text-left space-y-4 border border-white/20">
              <p className="text-orange-200 font-bold uppercase text-xs tracking-widest">Current App URL (Share this with teachers):</p>
              <code className="block bg-black/40 p-3 rounded-xl text-[11px] break-all border border-white/10 text-green-300 shadow-inner">
                {currentUrl}
              </code>
              <ul className="space-y-2 text-sm pt-4">
                <li className="flex gap-2"><span>1.</span> <span>Deploy your Google script as "Anyone".</span></li>
                <li className="flex gap-2"><span>2.</span> <span>Paste the URL ending in <code>/exec</code> into <code>constants.tsx</code>.</span></li>
                <li className="flex gap-2 font-bold"><span>3.</span> <span>Copy the link above 👆 to share the ACTUAL app once hosted.</span></li>
              </ul>
            </div>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-orange-900 font-bold rounded-2xl shadow-xl active:scale-95 transition-all">RETRY CONNECTION</button>
          </div>
        </div>
      )}

      {isTempUrl && (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-1.5 text-center text-[10px] font-black uppercase tracking-widest">
           ⚠️ PREVIEW MODE: THIS LINK WILL EXPIRE. HOST YOUR CODE ON GITHUB FOR A PERMANENT URL.
        </div>
      )}

      <header className="bg-white border-b-4 border-orange-400 px-6 py-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-3xl border-2 border-orange-100 shadow-inner relative group cursor-help">
              <Icons.Bear />
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-500 ${getStatusColor()}`}></div>
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block bg-gray-800 text-white text-[10px] p-2 rounded-lg whitespace-nowrap z-50">
                {getStatusTitle()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Brown Bears</h1>
                {isSyncing && <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold animate-pulse"><Icons.Cloud /> SYNCING</div>}
              </div>
              <p className="text-orange-500 font-bold uppercase text-xs tracking-[0.2em]">K-8 Central Progress Hub</p>
            </div>
          </div>
          <div className="flex flex-1 max-w-xl w-full relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.Search /></div>
            <input
              type="text"
              placeholder="Search scholars, teachers, or hobbies..."
              className="w-full pl-12 pr-4 py-4 rounded-3xl border-4 border-blue-50 focus:border-blue-400 outline-none transition-all shadow-inner text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all text-sm shadow-md shadow-blue-100">
               <Icons.Share /> <span className="hidden sm:inline">Share Hub</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 transform active:scale-95">
               <Icons.Add /> <span className="hidden sm:inline">New Student</span>
            </button>
            <div className="h-10 w-px bg-gray-100 mx-1 hidden sm:block"></div>
            <button onClick={handleLogout} title="Logout" className="p-3 text-gray-400 hover:text-red-500 transition-all"><Icons.Lock /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex overflow-x-auto gap-3 mb-10 pb-4 scrollbar-hide">
          {['All', ...GRADELIST].map(grade => (
            <button key={grade} onClick={() => setSelectedFilter(grade)} className={`whitespace-nowrap px-6 py-2 rounded-2xl font-bold transition-all ${selectedFilter === grade ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>{grade}</button>
          ))}
        </div>
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map(student => <StudentCard key={student.id} student={student} onUpdate={handleUpdateStudent} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-200">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Search /></div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No scholars found</h3>
            <p className="text-gray-400">Try adjusting your search or add a new student!</p>
          </div>
        )}
      </main>

      <StudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddStudent} />
      <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50"><Icons.Add /></button>
    </div>
  );
};

export default App;
