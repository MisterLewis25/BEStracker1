
import React, { useState } from 'react';
import { Student, NewStudent, Assessment } from '../types.ts';
import { Icons, GRADELIST } from '../constants.tsx';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: NewStudent) => void;
  initialData?: Student;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<NewStudent>({
    name: initialData?.name || '',
    grade: initialData?.grade || 'Kindergarten',
    teacher: initialData?.teacher || '',
    interests: initialData?.interests || [],
    assessments: initialData?.assessments || [
      {
        id: Math.random().toString(36).substr(2, 9),
        year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        grade: 'Kindergarten',
        starReadingLevel: ''
      }
    ],
    strategies: initialData?.strategies || [],
    notes: initialData?.notes || [],
  });

  const [newInterest, setNewInterest] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const updateInitialAssessment = (field: keyof Assessment, value: any) => {
    setFormData(prev => ({
      ...prev,
      assessments: prev.assessments.map((a, i) => i === 0 ? { ...a, [field]: value } : a)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-orange-400">
        <div className="bg-orange-400 p-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Icons.Bear /> Welcome New Bear!
          </h2>
          <button onClick={onClose} className="hover:bg-orange-500 rounded-full p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Student Name</label>
              <input
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Brownie Bear"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Current Grade</label>
              <select
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all"
                value={formData.grade}
                onChange={e => {
                  setFormData({ ...formData, grade: e.target.value });
                  updateInitialAssessment('grade', e.target.value);
                }}
              >
                {GRADELIST.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Teacher</label>
              <input
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all"
                value={formData.teacher}
                onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                placeholder="Ex: Ms. Cub"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Initial STAR Reading Level</label>
              <input
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none transition-all"
                value={formData.assessments[0].starReadingLevel || ''}
                onChange={e => updateInitialAssessment('starReadingLevel', e.target.value)}
                placeholder="Ex: 1.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase">Hobbies & Interests</label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-400 outline-none"
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                placeholder="Hiking, Honey, Drawing..."
              />
              <button type="button" onClick={addInterest} className="px-6 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-100">ADD</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.interests.map((interest, i) => (
                <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
                  {interest}
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.filter((_, idx) => idx !== i) }))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancel</button>
            <button type="submit" className="px-10 py-3 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all transform active:scale-95">CREATE RECORD</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
