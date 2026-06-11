import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import { Todo, BookLog, DiaryEntry, MealPlan } from '../types';

interface DashboardProps {
  user: { email: string; name: string };
  todos: Todo[];
  bLogs: BookLog[];
  diaries: DiaryEntry[];
  mealPlans?: MealPlan[];
  handleUpdateMealPlan?: (id: string, updates: Partial<MealPlan>) => void;
  setTab: (tab: 'dashboard' | 'todo' | 'reading' | 'diary' | 'routine') => void;
}

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const COLUMNS = [
  { key: 'meals', label: '식사' },
  { key: 'groceries', label: '장보기 목록' }
];

function EditableCell({ value, onSave, placeholder }: { value: string; onSave: (val: string) => void; placeholder: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localVal !== value) {
      onSave(localVal);
    }
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        value={localVal}
        onChange={e => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        className="w-full min-h-[80px] text-[13px] text-neutral-800 bg-white border border-neutral-300 rounded-[8px] p-2 focus:outline-none focus:ring-2 focus:ring-neutral-200 resize-none transition-shadow"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full min-h-[80px] text-[13px] p-2 rounded-[8px] border border-transparent hover:border-neutral-200 hover:bg-white cursor-pointer transition-all whitespace-pre-wrap ${localVal ? 'text-neutral-800' : 'text-neutral-400'}`}
    >
      {localVal || <span className="opacity-0 group-hover:opacity-100 transition-opacity">클릭하여 {placeholder} 추가...</span>}
    </div>
  );
}

export default function Dashboard({ user, mealPlans = [], handleUpdateMealPlan }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const getWeekString = (d: Date) => {
    const date = new Date(d);
    const month = date.getMonth() + 1;
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
    const weekNumber = Math.ceil((date.getDate() + dayOffset) / 7);
    const weekNames = ['첫째주', '둘째주', '셋째주', '넷째주', '다섯째주', '여섯째주'];
    return `${month}월 ${weekNames[weekNumber - 1]}`;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const weekId = getMonday(currentDate);

  const getPlanForDay = (day: string) => {
    const dayId = `${weekId}-${day}`;
    // Fallback to legacy id (just 'day') if data exists from earlier
    const existingPlan = mealPlans.find(m => m.id === dayId) || mealPlans.find(m => m.id === day);
    return existingPlan || { id: dayId, meals: '', groceries: '' };
  };

  return (
    <div className="space-y-6 text-neutral-800 font-light pb-20 md:pb-0">
      <div className="bg-white p-4 md:p-6 rounded-[20px] shadow-sm border border-neutral-100">
        
        {/* Header with Week Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-50 flex items-center justify-center rounded-[12px] flex-shrink-0">
              <Utensils className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">주간 식단 표</h2>
              <p className="text-[12px] md:text-[13px] text-neutral-400 mt-0.5">원하는 주차를 선택해 식단을 기록하세요</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-50 p-1.5 rounded-xl self-end md:self-auto">
            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-white rounded-[8px] transition-colors text-neutral-500 hover:text-neutral-800 shadow-sm cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-bold text-neutral-700 min-w-[76px] text-center">
              {getWeekString(currentDate)}
            </span>
            <button onClick={handleNextWeek} className="p-1.5 hover:bg-white rounded-[8px] transition-colors text-neutral-500 hover:text-neutral-800 shadow-sm cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile-friendly table container: removed horizontal scrolling, fits to screen */}
        <div className="w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b-2 border-neutral-800">
                <th className="py-2 md:py-3 px-1 md:px-4 text-[12px] md:text-[13px] font-bold text-neutral-800 w-[16%] md:w-[20%] text-center md:text-left">요일</th>
                {COLUMNS.map(col => (
                  <th key={col.key} className="py-2 md:py-3 px-1 md:px-4 text-[12px] md:text-[13px] font-bold text-neutral-800 w-[42%] md:w-[40%] text-center md:text-left">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const plan = getPlanForDay(day);
                const dayId = `${weekId}-${day}`;
                
                return (
                  <tr key={dayId} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors group">
                    <td className="py-2 md:py-3 px-1 md:px-4 text-[12px] md:text-[13px] font-medium text-neutral-700 bg-neutral-50/30 group-hover:bg-transparent align-top pt-4 text-center md:text-left">
                      {/* Show full day name on desktop, short on mobile (e.g. '월') */}
                      <span className="hidden md:inline">{day}</span>
                      <span className="md:hidden">{day[0]}</span>
                    </td>
                    {COLUMNS.map(col => (
                      <td key={col.key} className="py-2 md:py-3 px-1 md:px-4 align-top">
                        <EditableCell
                          value={col.key === 'meals' ? plan.meals : plan.groceries}
                          onSave={(val) => {
                            if (handleUpdateMealPlan) {
                              // We always save under the new weekId format
                              handleUpdateMealPlan(dayId, { [col.key]: val });
                            }
                          }}
                          placeholder={col.label}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


