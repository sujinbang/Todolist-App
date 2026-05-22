import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routine } from '../types';
import { Clock, Plus, Trash2, Edit3, CheckCircle2, RotateCcw, X } from 'lucide-react';

interface RoutineManagerProps {
  routines: Routine[];
  onAddRoutine: (routine: Omit<Routine, 'id'>) => void;
  onUpdateRoutine: (id: string, updates: Partial<Routine>) => void;
  onDeleteRoutine: (id: string) => void;
  categories: string[];
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: '월', Tue: '화', Wed: '수', Thu: '목', Fri: '금', Sat: '토', Sun: '일' };

export default function RoutineManager({ routines, onAddRoutine, onUpdateRoutine, onDeleteRoutine, categories }: RoutineManagerProps) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState(categories[0] || 'Work');
  const [cyclePeriod, setCyclePeriod] = React.useState<Routine['cyclePeriod']>('daily');
  const [frequency, setFrequency] = React.useState<Routine['frequency']>([]);
  const [monthlyDay, setMonthlyDay] = React.useState<number>(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (cyclePeriod === 'weekly' && frequency.length === 0)) {
      console.log('루틴 추가 실패: 유효성 검사 실패', { title, cyclePeriod, frequency });
      return;
    }

    const newRoutine = {
      title,
      category,
      cyclePeriod,
      frequency: cyclePeriod === 'weekly' ? frequency : [],
      monthlyDay: cyclePeriod === 'monthly' ? monthlyDay : undefined,
      isActive: true
    };

    console.log('루틴 추가 시도:', newRoutine);

    try {
      onAddRoutine(newRoutine);
      console.log('루틴 추가 성공');

      // 폼 초기화
      setTitle('');
      setFrequency([]);
      setCyclePeriod('daily');
      setMonthlyDay(1);
      setShowAdd(false);
    } catch (error) {
      console.error('루틴 추가 중 에러:', error);
    }
  };

  const toggleDay = (day: any) => {
    setFrequency(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="space-y-4 text-neutral-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[14px] font-semibold text-neutral-800">루틴</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="h-8 px-3 bg-neutral-50 hover:bg-neutral-200 text-neutral-800 rounded text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start">
        {/* Right Column - Routine List */}
        <div className="space-y-2">
          <div className="grid gap-2">
            {routines.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-md border border-neutral-100">
                <p className="text-sm font-medium text-neutral-400">등록된 루틴이 없습니다.</p>
              </div>
            ) : (
              routines.map(routine => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-sm border transition-all ${
                    routine.isActive ? 'bg-white border-neutral-100' : 'bg-white border-transparent opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className={`text-[13px] font-medium truncate ${routine.isActive ? 'text-neutral-800' : 'text-neutral-500 line-through'}`}>{routine.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-400">
                        {routine.category}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {(!routine.cyclePeriod || routine.cyclePeriod === 'weekly') ? (
                        WEEK_DAYS.map(day => {
                          const active = routine.frequency.includes(day as any);
                          return (
                            <span key={day} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-sm font-medium ${
                              active ? 'bg-neutral-600 text-neutral-800' : 'bg-transparent text-neutral-500'
                            }`}>
                              {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-sm font-medium bg-neutral-100 text-neutral-600">
                          {routine.cyclePeriod === 'daily' ? '매일' : `매월 ${routine.monthlyDay || 1}일`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:self-center self-end">
                    <button 
                      onClick={() => onUpdateRoutine(routine.id, { isActive: !routine.isActive })}
                      className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors cursor-pointer ${
                        routine.isActive ? 'bg-neutral-50 text-neutral-700 hover:text-neutral-800' : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-600'
                      }`}
                    >
                      {routine.isActive ? '끄기' : '켜기'}
                    </button>
                    <button 
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-50 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-end sm:items-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white border border-neutral-100 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-semibold text-neutral-800 text-[13px]">
                  새 루틴
                </h3>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-800 rounded cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <form className="space-y-4" onSubmit={handleAdd}>
                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-1">내용</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="매일 아침 스트레칭"
                      className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-none focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                      autoFocus
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-1">카테고리</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-none focus:border-neutral-500 text-neutral-800"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-white text-neutral-800">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-2">반복 주기</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setCyclePeriod('daily')}
                        className={`flex-1 py-1.5 rounded-[12px] text-[12px] font-medium border transition-colors cursor-pointer ${
                          cyclePeriod === 'daily' ? 'bg-[#9fbb9f] border-[#9fbb9f] text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        매일
                      </button>
                      <button
                        type="button"
                        onClick={() => setCyclePeriod('weekly')}
                        className={`flex-1 py-1.5 rounded-[12px] text-[12px] font-medium border transition-colors cursor-pointer ${
                          cyclePeriod === 'weekly' ? 'bg-[#9fbb9f] border-[#9fbb9f] text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        매주
                      </button>
                      <button
                        type="button"
                        onClick={() => setCyclePeriod('monthly')}
                        className={`flex-1 py-1.5 rounded-[12px] text-[12px] font-medium border transition-colors cursor-pointer ${
                          cyclePeriod === 'monthly' ? 'bg-[#9fbb9f] border-[#9fbb9f] text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        매월
                      </button>
                    </div>

                    {cyclePeriod === 'weekly' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {WEEK_DAYS.map(day => {
                          const isSelected = frequency.includes(day as any);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`flex-1 min-w-[36px] py-1.5 rounded text-[12px] font-medium border transition-colors cursor-pointer ${
                                isSelected ? 'bg-neutral-600 border-neutral-600 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800'
                              }`}
                            >
                              {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {cyclePeriod === 'monthly' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[12px] text-neutral-500">매월</span>
                        <select
                          value={monthlyDay}
                          onChange={(e) => setMonthlyDay(Number(e.target.value))}
                          className="px-3 py-1.5 text-[12px] bg-white border border-neutral-200 rounded-[8px] focus:outline-none focus:border-neutral-500 text-neutral-800"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}일</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!title.trim() || (cyclePeriod === 'weekly' && frequency.length === 0)}
                      className="w-full py-2 bg-[#d9ae92] text-white rounded-[12px] text-[13px] font-medium hover:bg-[#c99e82] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      등록하기
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
