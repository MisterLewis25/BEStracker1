
import React, { useState, useMemo } from 'react';
import { Student, Note, Assessment } from '../types.ts';
import { generateStrategies } from '../services/geminiService.ts';
import { Icons, GRADELIST, getNextGrade, getNextYearString } from '../constants.tsx';

interface StudentCardProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleToggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
    if (!isExpanded) setIsExpanded(true);
  };

  const handleUpdateField = (field: keyof Student, value: any) => {
    onUpdate({ ...student, [field]: value, lastUpdated: new Date().toISOString() });
  };

  const handleAssessmentChange = (id: string, field: keyof Assessment, value: any) => {
    const updated = student.assessments.map(a => 
      a.id === id ? { ...a, [field]: value === '' ? undefined : value } : a
    );
    handleUpdateField('assessments', updated);
  };

  const addAssessmentYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Find the most recent existing year to calculate the next one
    const sortedAssessments = [...student.assessments].sort((a, b) => b.year.localeCompare(a.year));
    const latest = sortedAssessments[0] || { year: '2024-2025', grade: student.grade };
    
    const newYearString = getNextYearString(latest.year);
    const newGrade = getNextGrade(latest.grade);

    const newYear: Assessment = {
      id: Math.random().toString(36).substr(2, 9),
      year: newYearString,
      grade: newGrade,
    };

    // Add to the front of the list and update student's current grade to match the new record
    handleUpdateField('assessments', [newYear, ...student.assessments]);
    handleUpdateField('grade', newGrade);
  };

  const handleGenerateAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const newStrategies = await generateStrategies(student);
      const unique = [...new Set([...student.strategies, ...newStrategies])];
      handleUpdateField('strategies', unique);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNote.trim(),
      date: new Date().toISOString()
    };
    handleUpdateField('notes', [note, ...student.notes]);
    setNewNote('');
  };

  const sortedAssessments = useMemo(() => {
    return [...student.assessments].sort((a, b) => b.year.localeCompare(a.year));
  }, [student.assessments]);

  const latestScores = useMemo(() => {
    return sortedAssessments[0] || null;
  }, [sortedAssessments]);

  const isTcapGrade = (grade: string) => {
    const g = grade.toLowerCase();
    return ['3rd grade', '4th grade', '5th grade', '6th grade', '7th grade', '8th grade'].includes(g);
  };

  return (
    <div 
      className={`bg-white rounded-3xl overflow-hidden border-b-8 border-r-8 border-orange-100 shadow-xl transition-all duration-300 transform cursor-pointer hover:-translate-y-1 ${isExpanded ? 'ring-4 ring-orange-300' : ''}`}
      onClick={() => !isEditing && setIsExpanded(!isExpanded)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
            
            {isEditing ? (
              <div className="space-y-2 mt-2" onClick={e => e.stopPropagation()}>
                <select 
                  className="w-full text-xs p-1 border rounded bg-orange-50 font-bold"
                  value={student.grade}
                  onChange={e => handleUpdateField('grade', e.target.value)}
                >
                  {GRADELIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input 
                  className="w-full text-xs p-1 border rounded"
                  value={student.teacher}
                  onChange={e => handleUpdateField('teacher', e.target.value)}
                  placeholder="Teacher Name"
                />
              </div>
            ) : (
              <>
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full mb-1 uppercase tracking-wider">
                  {student.grade}
                </span>
                <p className="text-gray-500 font-medium italic text-sm">Teacher: {student.teacher}</p>
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Icons.Bear />
            </div>
            <button 
              onClick={handleToggleEdit}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isEditing ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'}`}
            >
              {isEditing ? 'SAVE' : 'EDIT'}
            </button>
          </div>
        </div>

        {latestScores && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Year: {latestScores.year}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-2 rounded-xl text-center">
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">Fall Benchmark</span>
                <div className="text-sm font-black text-blue-800">{latestScores.fall ?? '--'}%</div>
              </div>
              <div className="bg-green-50 p-2 rounded-xl text-center">
                <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Winter Benchmark</span>
                <div className="text-sm font-black text-green-800">{latestScores.winter ?? '--'}%</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-xl text-center">
                <span className="text-[8px] font-bold text-yellow-600 uppercase tracking-tighter">Spring Benchmark</span>
                <div className="text-sm font-black text-yellow-800">{latestScores.spring ?? '--'}%</div>
              </div>
            </div>
            {latestScores.starReadingLevel && (
              <div className="bg-purple-50 px-3 py-1.5 rounded-xl flex justify-between items-center">
                <span className="text-[9px] font-bold text-purple-600 uppercase flex items-center gap-1">
                  📖 STAR Reading Level
                </span>
                <span className="text-xs font-black text-purple-800">{latestScores.starReadingLevel}</span>
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="mt-6 space-y-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase">
                  📈 Academic History (All Years)
                </h4>
                {isEditing && (
                  <button 
                    onClick={addAssessmentYear} 
                    className="text-[10px] bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                  >
                    + ROLL OVER TO NEW YEAR
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {sortedAssessments.map(a => (
                  <div key={a.id} className={`bg-white p-3 rounded-2xl border ${a.id === latestScores?.id ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-200'} shadow-sm space-y-3`}>
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                       {isEditing ? (
                         <div className="flex gap-2">
                            <input className="text-xs font-bold border rounded px-2 py-1 w-24" value={a.year} onChange={e => handleAssessmentChange(a.id, 'year', e.target.value)} placeholder="Year (e.g. 24-25)" />
                            <select className="text-xs border rounded px-1" value={a.grade} onChange={e => handleAssessmentChange(a.id, 'grade', e.target.value)}>
                                {GRADELIST.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-600">{a.year} — {a.grade}</span>
                            {a.id === latestScores?.id && <span className="bg-orange-100 text-orange-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold">CURRENT</span>}
                         </div>
                       )}
                       {isEditing && (
                         <button 
                           onClick={() => handleUpdateField('assessments', student.assessments.filter(x => x.id !== a.id))}
                           className="text-red-400 hover:text-red-600"
                         >
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                         </button>
                       )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-black text-blue-600 uppercase mb-1">Seasonal Benchmarks (%)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['fall', 'winter', 'spring'].map((term) => (
                            <div key={term}>
                              <label className="block text-[8px] uppercase text-gray-400 font-bold">{term}</label>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  className="w-full text-xs p-1 border rounded"
                                  value={(a as any)[term] ?? ''} 
                                  onChange={e => handleAssessmentChange(a.id, term as any, e.target.value)} 
                                />
                              ) : (
                                <span className="text-xs font-bold">{(a as any)[term] ?? '--'}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50/50 p-2 rounded-xl">
                        <label className="block text-[9px] font-black text-purple-600 uppercase mb-1">Literacy Progression</label>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-bold text-gray-400 uppercase">STAR Reading Level:</span>
                           {isEditing ? (
                             <input 
                               type="text"
                               className="flex-1 text-xs p-1 border rounded"
                               placeholder="e.g. 2.5 or GE 3.1"
                               value={a.starReadingLevel || ''}
                               onChange={e => handleAssessmentChange(a.id, 'starReadingLevel', e.target.value)}
                             />
                           ) : (
                             <span className="text-xs font-black text-purple-800">{a.starReadingLevel || '--'}</span>
                           )}
                        </div>
                      </div>
                    </div>

                    {isTcapGrade(a.grade) && (
                      <div className="pt-2 border-t mt-2">
                        <label className="block text-[9px] font-black text-orange-600 uppercase mb-2 italic">TCAP State Score Results</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {k: 'tcapEla', l: 'ELA'}, 
                            {k: 'tcapMath', l: 'Math'}, 
                            {k: 'tcapScience', l: 'Science'}, 
                            {k: 'tcapSocialStudies', l: 'Soc. Studies'}
                          ].map((item) => (
                            <div key={item.k} className="flex flex-col">
                              <label className="text-[8px] text-gray-400 font-bold">{item.l}</label>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  className="text-xs p-1 border rounded"
                                  value={(a as any)[item.k] ?? ''} 
                                  onChange={e => handleAssessmentChange(a.id, item.k as any, e.target.value)} 
                                />
                              ) : (
                                <span className="text-xs font-bold text-gray-700">{(a as any)[item.k] ?? '--'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-blue-800 flex items-center gap-2 text-sm uppercase">💡 Instructional Strategies</h4>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="text-[10px] font-bold px-3 py-1 bg-white text-blue-600 border rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                >
                  {isGenerating ? 'GENERATING...' : '✨ REFRESH AI'}
                </button>
              </div>
              <div className="space-y-2">
                {student.strategies.map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white/50 p-2 rounded-xl border border-blue-100">
                    {isEditing ? (
                      <input 
                        className="flex-1 text-xs bg-transparent border-none focus:ring-0" 
                        value={s} 
                        onChange={e => {
                          const updated = [...student.strategies];
                          updated[idx] = e.target.value;
                          handleUpdateField('strategies', updated);
                        }} 
                      />
                    ) : (
                      <span className="text-xs text-gray-700 italic">"{s}"</span>
                    )}
                    {isEditing && (
                      <button onClick={() => handleUpdateField('strategies', student.strategies.filter((_, i) => i !== idx))} className="text-red-400 font-bold text-xs px-1">×</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button 
                    onClick={() => handleUpdateField('strategies', [...student.strategies, 'New Strategy'])}
                    className="w-full text-[10px] text-blue-500 font-bold py-1 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100/30"
                  >+ ADD CUSTOM STRATEGY</button>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-4">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-sm uppercase">📝 Teacher Anecdotes</h4>
              <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
                <input
                  placeholder="Type a quick observation..."
                  className="flex-1 px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 text-xs"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
                <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-sm hover:bg-green-600">POST</button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-200">
                {student.notes.map((note) => (
                  <div key={note.id} className="bg-white p-2.5 rounded-xl border border-green-100 text-[10px] shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{note.text}</p>
                    <span className="text-[8px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">{new Date(note.date).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            Last Updated: {new Date(student.lastUpdated).toLocaleDateString()}
          </span>
          <button className="text-orange-600 font-black text-xs hover:underline">
            {isExpanded ? 'CLOSE RECORD' : 'VIEW FULL RECORD'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
