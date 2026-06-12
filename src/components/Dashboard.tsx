import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, ChevronLeft, ChevronRight, Check, Plus, Trash2, X } from 'lucide-react';
import { MealPlan } from '../types';

interface DashboardProps {
  user: { email: string; name: string };
  mealPlans?: MealPlan[];
  handleUpdateMealPlan?: (id: string, updates: Partial<MealPlan>) => void;
}

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function Dashboard({ user, mealPlans = [], handleUpdateMealPlan }: DashboardProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedMonday, setSelectedMonday] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });
  const [filterDay, setFilterDay] = useState('전체');

  // Modal State
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayName, setEditingDayName] = useState('');
  
  const [editBreakfast, setEditBreakfast] = useState('');
  const [editLunch, setEditLunch] = useState('');
  const [editDinner, setEditDinner] = useState('');
  
  const [groceries, setGroceries] = useState<ChecklistItem[]>([]);
  const [newGrocery, setNewGrocery] = useState('');

  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weeks: Date[] = [];
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const diff = firstDay.getDate() - firstDayOfWeek + (firstDayOfWeek === 0 ? -6 : 1);
    const startMonday = new Date(firstDay.setDate(diff));

    for (let i = 0; i < 6; i++) {
      const monday = new Date(startMonday);
      monday.setDate(startMonday.getDate() + (i * 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      if (monday.getMonth() === month || sunday.getMonth() === month) {
        weeks.push(monday);
      }
    }
    return weeks;
  };

  const prevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
    // Auto select first week of new month
    const weeks = getWeeksInMonth(d);
    setSelectedMonday(weeks[0]);
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
    // Auto select first week of new month
    const weeks = getWeeksInMonth(d);
    setSelectedMonday(weeks[0]);
  };

  const weekId = selectedMonday.toISOString().split('T')[0];
  const weeks = getWeeksInMonth(currentMonthDate);

  const getPlanForDay = (day: string) => {
    const dayEn = DAYS_EN[DAYS.indexOf(day)];
    const dayId = `${weekId}-${dayEn}`;
    const existingPlan = mealPlans.find(m => m.id === dayId) || mealPlans.find(m => m.id === `${weekId}-${day}`) || mealPlans.find(m => m.id === day);
    return existingPlan || { id: dayId, meals: '', groceries: '' };
  };

  const openModal = (day: string) => {
    const plan = getPlanForDay(day);
    const dayEn = DAYS_EN[DAYS.indexOf(day)];
    
    setEditingDayId(`${weekId}-${dayEn}`);
    setEditingDayName(day);
    setEditBreakfast(plan.breakfast || plan.meals || '');
    setEditLunch(plan.lunch || '');
    setEditDinner(plan.dinner || '');
    
    try {
      const parsed = JSON.parse(plan.groceries || '[]');
      if (Array.isArray(parsed)) {
        setGroceries(parsed);
      } else {
        throw new Error('Not array');
      }
    } catch {
      const lines = (plan.groceries || '').split('\n').filter(l => l.trim());
      setGroceries(lines.map(l => ({ id: Math.random().toString(), text: l, checked: false })));
    }
  };

  const handleSaveModal = () => {
    if (handleUpdateMealPlan && editingDayId) {
      handleUpdateMealPlan(editingDayId, {
        breakfast: editBreakfast,
        lunch: editLunch,
        dinner: editDinner,
        groceries: JSON.stringify(groceries)
      });
    }
    setEditingDayId(null);
  };

  const toggleGrocery = (id: string) => {
    setGroceries(prev => prev.map(g => g.id === id ? { ...g, checked: !g.checked } : g));
  };

  const removeGrocery = (id: string) => {
    setGroceries(prev => prev.filter(g => g.id !== id));
  };

  const addGrocery = () => {
    if (!newGrocery.trim()) return;
    setGroceries(prev => [...prev, { id: Date.now().toString(), text: newGrocery.trim(), checked: false }]);
    setNewGrocery('');
  };

  const filteredDays = filterDay === '전체' ? DAYS : [DAYS.find(d => d.startsWith(filterDay))!];

  return (
    <div className="space-y-6 text-neutral-800 font-light pb-20 md:pb-0">
      
      {/* Header & Month/Week Controls */}
      <div className="bg-white p-4 md:p-6 rounded-[20px] shadow-sm border border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-50 flex items-center justify-center rounded-[12px] flex-shrink-0">
              <Utensils className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">주간 식단 계획표</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <button onClick={prevMonth} className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[13px] font-semibold text-neutral-600">{currentMonthDate.getMonth() + 1}월</span>
                <button onClick={nextMonth} className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 custom-scrollbar w-full md:w-auto max-w-full">
            {weeks.map((monday, idx) => {
              const isSelected = selectedMonday.getTime() === monday.getTime();
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMonday(monday)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                    isSelected ? 'bg-orange-500 text-white shadow-sm' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {currentMonthDate.getMonth() + 1}월 {idx + 1}째주
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setFilterDay('전체')}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filterDay === '전체' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            전체
          </button>
          {SHORT_DAYS.map(day => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filterDay === day ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDays.map(day => {
            const plan = getPlanForDay(day);
            const dayEn = DAYS_EN[DAYS.indexOf(day)];
            const dayId = `${weekId}-${dayEn}`;
            
            let gList: ChecklistItem[] = [];
            try { gList = JSON.parse(plan.groceries || '[]'); } catch { /* ignore */ }

            const hasData = plan.breakfast || plan.lunch || plan.dinner || plan.meals || gList.length > 0;

            return (
              <motion.div
                key={dayId}
                layoutId={`card-${dayId}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => openModal(day)}
                className="bg-white border border-neutral-100 rounded-[16px] p-5 shadow-sm hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-neutral-800 text-[15px]">{day}</h3>
                  {hasData && <Check className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                <div className="space-y-3 flex-1">
                  {(plan.breakfast || plan.meals) ? (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">아침</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.breakfast || plan.meals}</p>
                    </div>
                  ) : null}
                  {plan.lunch && (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">점심</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.lunch}</p>
                    </div>
                  )}
                  {plan.dinner && (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">저녁</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.dinner}</p>
                    </div>
                  )}
                  {!hasData && (
                    <div className="text-[12px] text-neutral-400 italic py-2">
                      클릭하여 식단을 계획하세요
                    </div>
                  )}
                </div>

                {gList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-neutral-500">장보기 목록</span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {gList.filter(g => g.checked).length} / {gList.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {gList.slice(0, 3).map(g => (
                        <span key={g.id} className={`text-[10px] px-1.5 py-0.5 rounded ${g.checked ? 'bg-neutral-100 text-neutral-400 line-through' : 'bg-orange-50 text-orange-700'}`}>
                          {g.text}
                        </span>
                      ))}
                      {gList.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-500">+{gList.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDayId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-xl max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div>
                  <span className="text-[11px] font-bold text-orange-500 mb-0.5 block">{currentMonthDate.getMonth() + 1}월 {weeks.findIndex(w => w.getTime() === selectedMonday.getTime()) + 1}째주</span>
                  <h3 className="font-bold text-[18px] text-neutral-800">{editingDayName} 식단</h3>
                </div>
                <button onClick={() => setEditingDayId(null)} className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-5">
                {/* 식단 입력 */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-200" /> 아침
                    </label>
                    <textarea
                      value={editBreakfast}
                      onChange={e => setEditBreakfast(e.target.value)}
                      placeholder="아침 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[12px] px-3 py-2.5 text-[13px] text-neutral-800 min-h-[60px] resize-none focus:outline-none focus:border-orange-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> 점심
                    </label>
                    <textarea
                      value={editLunch}
                      onChange={e => setEditLunch(e.target.value)}
                      placeholder="점심 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[12px] px-3 py-2.5 text-[13px] text-neutral-800 min-h-[60px] resize-none focus:outline-none focus:border-orange-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600" /> 저녁
                    </label>
                    <textarea
                      value={editDinner}
                      onChange={e => setEditDinner(e.target.value)}
                      placeholder="저녁 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[12px] px-3 py-2.5 text-[13px] text-neutral-800 min-h-[60px] resize-none focus:outline-none focus:border-orange-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-neutral-100 w-full my-4" />

                {/* 장보기 목록 */}
                <div>
                  <label className="block text-[13px] font-bold text-neutral-800 mb-3">장보기 목록</label>
                  <div className="space-y-2 mb-3">
                    {groceries.map(g => (
                      <div key={g.id} className="flex items-center justify-between group bg-white border border-neutral-100 p-2 rounded-[10px] hover:border-neutral-200 transition-colors">
                        <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                          <input 
                            type="checkbox" 
                            checked={g.checked} 
                            onChange={() => toggleGrocery(g.id)} 
                            className="w-4 h-4 accent-orange-500 rounded flex-shrink-0 cursor-pointer" 
                          />
                          <span className={`text-[13px] truncate ${g.checked ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                            {g.text}
                          </span>
                        </div>
                        <button onClick={() => removeGrocery(g.id)} className="text-neutral-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newGrocery}
                      onChange={e => setNewGrocery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addGrocery(); }}
                      placeholder="필요한 식재료 입력..."
                      className="flex-1 bg-neutral-50 border border-neutral-100 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:border-orange-300 focus:bg-white transition-colors"
                    />
                    <button onClick={addGrocery} className="p-2 bg-orange-50 text-orange-600 rounded-[10px] hover:bg-orange-100 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-5 shrink-0 border-t border-neutral-50 mt-2">
                <button
                  onClick={() => setEditingDayId(null)}
                  className="px-4 py-2 text-[13px] font-medium text-neutral-500 hover:bg-neutral-50 rounded-[12px] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveModal}
                  className="px-5 py-2 text-[13px] font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-[12px] transition-colors shadow-sm"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
