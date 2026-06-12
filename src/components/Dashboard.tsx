import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, X } from 'lucide-react';
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
  const [editingDayDateStr, setEditingDayDateStr] = useState('');
  
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
    const weeks = getWeeksInMonth(d);
    setSelectedMonday(weeks[0]);
    setFilterDay('전체');
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
    const weeks = getWeeksInMonth(d);
    setSelectedMonday(weeks[0]);
    setFilterDay('전체');
  };

  const weekId = selectedMonday.toISOString().split('T')[0];
  const weeks = getWeeksInMonth(currentMonthDate);

  // Get exactly which dates in this week belong to the current month
  const getWeekDatesInMonth = () => {
    const dates: Date[] = [];
    const currentMonth = currentMonthDate.getMonth();
    for (let i = 0; i < 7; i++) {
      const d = new Date(selectedMonday);
      d.setDate(selectedMonday.getDate() + i);
      if (d.getMonth() === currentMonth) {
        dates.push(d);
      }
    }
    return dates;
  };

  const activeDays = getWeekDatesInMonth().map(d => {
    const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return {
      date: d,
      dayName: DAYS[dayIdx],
      shortName: SHORT_DAYS[dayIdx],
      dayEn: DAYS_EN[dayIdx],
      id: `${weekId}-${DAYS_EN[dayIdx]}`,
      label: `${d.getDate()}일 (${SHORT_DAYS[dayIdx]})`
    };
  });

  const getPlanForDay = (dayEn: string, fallbackDay: string) => {
    const dayId = `${weekId}-${dayEn}`;
    const existingPlan = mealPlans.find(m => m.id === dayId) || mealPlans.find(m => m.id === `${weekId}-${fallbackDay}`) || mealPlans.find(m => m.id === fallbackDay);
    return existingPlan || { id: dayId, meals: '', groceries: '' };
  };

  const openModal = (dayObj: typeof activeDays[0]) => {
    const plan = getPlanForDay(dayObj.dayEn, dayObj.dayName);
    
    setEditingDayId(dayObj.id);
    setEditingDayName(dayObj.dayName);
    setEditingDayDateStr(`${currentMonthDate.getMonth() + 1}월 ${dayObj.date.getDate()}일`);
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

  const filteredDays = filterDay === '전체' ? activeDays : activeDays.filter(d => d.shortName === filterDay);

  return (
    <div className="space-y-6 text-neutral-800 font-light pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* Tab Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[14px] font-semibold text-neutral-800">주간 식단 계획표</h2>
      </div>

      {/* Header & Month/Week Controls */}
      <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-bold text-neutral-800">{currentMonthDate.getFullYear()}년 {currentMonthDate.getMonth() + 1}월</span>
            <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 flex-wrap w-full md:w-auto">
            {weeks.map((monday, idx) => {
              const isSelected = selectedMonday.getTime() === monday.getTime();
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedMonday(monday); setFilterDay('전체'); }}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isSelected ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-white hover:text-neutral-800'
                  }`}
                >
                  {currentMonthDate.getMonth() + 1}월 {idx + 1}째주
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Filters */}
        <div className="flex items-center gap-1 flex-wrap w-full">
          <button
            onClick={() => setFilterDay('전체')}
            className={`px-2 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterDay === '전체' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-white hover:text-neutral-800'
            }`}
          >
            전체
          </button>
          {activeDays.map(dayObj => (
            <button
              key={dayObj.shortName}
              onClick={() => setFilterDay(dayObj.shortName)}
              className={`px-2 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterDay === dayObj.shortName ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-white hover:text-neutral-800'
              }`}
            >
              {dayObj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDays.map(dayObj => {
            const plan = getPlanForDay(dayObj.dayEn, dayObj.dayName);
            
            let gList: ChecklistItem[] = [];
            try { gList = JSON.parse(plan.groceries || '[]'); } catch { /* ignore */ }

            const hasData = plan.breakfast || plan.lunch || plan.dinner || plan.meals || gList.length > 0;

            return (
              <motion.div
                key={dayObj.id}
                layoutId={`card-${dayObj.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => openModal(dayObj)}
                className="bg-white border border-neutral-100 rounded-[16px] p-5 shadow-sm hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-neutral-800 text-[15px]">{dayObj.label}</h3>
                  </div>
                  {hasData && <Check className="w-4 h-4 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                <div className="space-y-3 flex-1">
                  {(plan.breakfast || plan.meals) ? (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">🍳 아침</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.breakfast || plan.meals}</p>
                    </div>
                  ) : null}
                  {plan.lunch && (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">🍱 점심</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.lunch}</p>
                    </div>
                  )}
                  {plan.dinner && (
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">🍲 저녁</span>
                      <p className="text-[13px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed">{plan.dinner}</p>
                    </div>
                  )}
                  {!hasData && (
                    <div className="text-[12px] text-neutral-400 italic py-2">
                      🍽️ 클릭하여 식단을 계획하세요
                    </div>
                  )}
                </div>

                {gList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-semibold text-neutral-500">🛒 장보기 목록</span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {gList.filter(g => g.checked).length} / {gList.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {gList.slice(0, 3).map(g => (
                        <span key={g.id} className={`text-[10px] px-1.5 py-0.5 rounded ${g.checked ? 'bg-neutral-100 text-neutral-400 line-through' : 'bg-[#faf9f7] border border-neutral-100 text-neutral-600'}`}>
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
              className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-xl h-[90vh] sm:h-[600px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div>
                  <span className="text-[11px] font-bold text-neutral-600 mb-0.5 block">{editingDayDateStr} ({editingDayName.replace('요일', '')})</span>
                  <h3 className="font-bold text-[18px] text-neutral-800">{editingDayName} 식단 🍽️</h3>
                </div>
                <button onClick={() => setEditingDayId(null)} className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col pr-1 space-y-4">
                {/* 식단 입력 */}
                <div className="space-y-3 shrink-0">
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      🍳 아침
                    </label>
                    <textarea
                      value={editBreakfast}
                      onChange={e => setEditBreakfast(e.target.value)}
                      placeholder="아침 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[10px] px-3 py-2 text-[13px] text-neutral-800 min-h-[44px] resize-none focus:outline-none focus:border-neutral-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      🍱 점심
                    </label>
                    <textarea
                      value={editLunch}
                      onChange={e => setEditLunch(e.target.value)}
                      placeholder="점심 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[10px] px-3 py-2 text-[13px] text-neutral-800 min-h-[44px] resize-none focus:outline-none focus:border-neutral-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500 mb-1.5">
                      🍲 저녁
                    </label>
                    <textarea
                      value={editDinner}
                      onChange={e => setEditDinner(e.target.value)}
                      placeholder="저녁 메뉴를 입력하세요"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[10px] px-3 py-2 text-[13px] text-neutral-800 min-h-[44px] resize-none focus:outline-none focus:border-neutral-300 focus:bg-white transition-colors custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-neutral-100 w-full shrink-0" />

                {/* 장보기 목록 */}
                <div className="flex-1 flex flex-col min-h-[160px] overflow-hidden">
                  <label className="block text-[13px] font-bold text-neutral-800 mb-2 shrink-0">🛒 장보기 목록</label>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar mb-3 pr-1">
                    {groceries.map(g => (
                      <div key={g.id} className="flex items-center justify-between group bg-white border border-neutral-100 p-2 rounded-[10px] hover:border-neutral-200 transition-colors">
                        <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                          <input 
                            type="checkbox" 
                            checked={g.checked} 
                            onChange={() => toggleGrocery(g.id)} 
                            className="w-4 h-4 accent-neutral-600 rounded flex-shrink-0 cursor-pointer" 
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
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={newGrocery}
                      onChange={e => setNewGrocery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addGrocery(); }}
                      placeholder="필요한 식재료 입력..."
                      className="flex-1 bg-neutral-50 border border-neutral-100 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:border-neutral-300 focus:bg-white transition-colors"
                    />
                    <button onClick={addGrocery} className="p-2 bg-[#faf9f7] border border-neutral-100 text-neutral-500 rounded-[10px] hover:bg-neutral-100 transition-colors flex-shrink-0">
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
                  className="px-5 py-2 text-[13px] font-bold bg-[#d9ae92] text-white hover:bg-[#c99e82] rounded-[12px] transition-colors shadow-sm"
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
