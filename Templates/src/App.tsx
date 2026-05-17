/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Menu, 
  ChevronDown, 
  Lock, 
  Plus, 
  Home, 
  Compass, 
  Bell, 
  Send, 
  User,
  Check,
  ListTodo,
  Trash2,
  Pencil
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  Tooltip,
  PieChart,
  Pie
} from 'recharts';

// --- Components ---

const StatusIcon = ({ status, count }: { status: string; count?: number }) => {
  if (status === 'checked') {
    return (
      <div className="w-10 h-10 bg-[#BC9D7F] rounded-[14px] flex items-center justify-center">
        <Check className="w-5 h-5 text-white" />
      </div>
    );
  }

  const getBaseColor = () => {
    switch (status) {
      case 'active': return 'bg-white';
      case 'blue': return 'bg-[#3FB4FF]';
      case 'red': return 'bg-[#FF4B4B]';
      case 'calendar': return 'bg-[#2A2A2A]'; // Deep gray for calendar
      default: return 'bg-[#2A2A2A]';
    }
  };

  return (
    <div className={`w-10 h-10 ${getBaseColor()} rounded-[14px] flex items-center justify-center relative`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {count && count > 0 ? (
          <span className="text-white text-sm font-bold z-10">{count}</span>
        ) : (
          <div className={`w-6 h-6 ${status === 'active' ? 'bg-white' : 'opacity-20 bg-white'} rounded-full`} />
        )}
      </div>
    </div>
  );
};

const CalendarDay = ({ day, count, isSelected, onClick }: { day: number | string; count: number; isSelected?: boolean; onClick: () => void }) => {
  const getTextColor = () => {
    if (isSelected) return 'text-black';
    return 'text-white';
  };

  return (
    <button 
      onClick={onClick}
      disabled={!day}
      className={`flex flex-col items-center gap-1.5 py-1 transition-all active:scale-95 ${!day ? 'opacity-0 cursor-default' : 'cursor-pointer hover:bg-white/5 rounded-xl'}`}
    >
      <StatusIcon status="calendar" count={count} />
      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${isSelected ? 'bg-white' : ''} ${getTextColor()}`}>
        {day}
      </div>
    </button>
  );
};

interface Task {
  id: number;
  title: string;
  completed: boolean;
  isRoutineInstance?: boolean;
}

interface Category {
  id: string;
  name: string;
  tasks: Task[];
}

export default function App() {
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop';
  });
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('nickname') || 'sjbang';
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editName, setEditName] = useState(nickname);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Calendar State ---
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [dailyData, setDailyData] = useState<{ [key: string]: Category[] }>(() => {
    const saved = localStorage.getItem('dailyData');
    if (saved) return JSON.parse(saved);
    return {
      '2026-05-17': [
        {
          id: 'self-care',
          name: 'self care 🛀',
          tasks: [
            { id: 1, title: '유산균, 양배추환 먹기', completed: false },
            { id: 2, title: '오메가3, 타우린 먹기', completed: false }
          ]
        }
      ]
    };
  });

  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'category' | 'routine' | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'routines' | 'profile'>('home');

  const [routines, setRoutines] = useState<any[]>(() => {
    const saved = localStorage.getItem('routines');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [newRoutine, setNewRoutine] = useState({ title: '', categoryId: '', frequency: 'daily', value: '' });
  
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editRoutineBuffer, setEditRoutineBuffer] = useState({ title: '', categoryId: '', frequency: 'daily', value: '' });

  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [addingTaskForCategoryId, setAddingTaskForCategoryId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const currentCategories = dailyData[selectedDate] || [];

  // --- Effects for Persistence ---
  useEffect(() => {
    localStorage.setItem('profileImage', profileImage);
  }, [profileImage]);

  useEffect(() => {
    localStorage.setItem('nickname', nickname);
  }, [nickname]);

  useEffect(() => {
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
  }, [dailyData]);

  useEffect(() => {
    localStorage.setItem('routines', JSON.stringify(routines));
  }, [routines]);
  // --- Routine Logic ---
  const applyRoutinesForDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 is Sunday, I use 1-7 for Mon-Sun usually or just 0-6
    const dayOfMonth = date.getDate();

    const matchingRoutines = routines.filter(r => {
      if (r.frequency === 'daily') return true;
      if (r.frequency === 'weekly' && r.value === dayOfWeek.toString()) return true;
      if (r.frequency === 'monthly' && r.value === dayOfMonth.toString()) return true;
      if (r.frequency === 'once' && r.value === dateStr) return true;
      return false;
    });

    if (matchingRoutines.length === 0) return;

    let updatedDailyData = { ...dailyData };
    let categoriesForDay = [...(updatedDailyData[dateStr] || [])];
    let changed = false;

    matchingRoutines.forEach(routine => {
      // Find category in dailyData for this date
      let catIndex = categoriesForDay.findIndex(c => c.id === routine.categoryId);
      
      if (catIndex === -1) {
        // Find category name from other dates
        const allCategories = Object.values(dailyData).flat() as Category[];
        const existingCat = allCategories.find(c => c.id === routine.categoryId);
        if (existingCat) {
          categoriesForDay.push({
            id: existingCat.id,
            name: existingCat.name,
            tasks: []
          });
          catIndex = categoriesForDay.length - 1;
          changed = true;
        }
      }

      if (catIndex !== -1) {
        // Check if task from this routine already exists for this day
        const taskExists = categoriesForDay[catIndex].tasks.some(t => t.title === routine.title && t.isRoutineInstance);
        if (!taskExists) {
          categoriesForDay[catIndex].tasks.push({
            id: Date.now() + Math.random(),
            title: routine.title,
            completed: false,
            isRoutineInstance: true
          });
          changed = true;
        }
      }
    });

    if (changed) {
      setDailyData(prev => ({
        ...prev,
        [dateStr]: categoriesForDay
      }));
    }
  };

  const updateRoutine = (id: string) => {
    setRoutines(routines.map(r => r.id === id ? { ...editRoutineBuffer, id } : r));
    setEditingRoutineId(null);
  };

  // --- Dashboard Data Helpers ---
  const getDailyStats = () => {
    const categories = dailyData[selectedDate] || [];
    let total = 0;
    let completed = 0;
    categories.forEach(cat => {
      total += cat.tasks.length;
      cat.tasks.forEach(task => {
        if (task.completed) completed++;
      });
    });
    return [
      { name: 'Completed', value: completed, color: '#3FB4FF' },
      { name: 'Remaining', value: Math.max(0, total - completed), color: '#2A2A2A' }
    ];
  };

  const getLastFiveDaysStats = () => {
    const data = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        data.push({
            name: `${d.getMonth() + 1}/${d.getDate()}`,
            completed: getCompletedCount(dateStr)
        });
    }
    return data;
  };

  const getMonthlyStats = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let total = 0;
    let completed = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayStats = getCompletedCount(dateStr);
        const dayCategories = dailyData[dateStr] || [];
        let dayTotal = 0;
        dayCategories.forEach(cat => dayTotal += cat.tasks.length);
        
        total += dayTotal;
        completed += dayStats;
    }
    
    return { 
        total, 
        completed, 
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Run routine application when date changes
  useEffect(() => {
    applyRoutinesForDate(selectedDate);
  }, [selectedDate, routines]);

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        tasks: []
      };
      
      setDailyData({
        ...dailyData,
        [selectedDate]: [...currentCategories, newCategory]
      });
      setNewCategoryName('');
      setCreationMode(null);
    }
  };

  const addRoutine = () => {
    if (newRoutine.title.trim() && newRoutine.categoryId) {
      setRoutines([...routines, { ...newRoutine, id: `routine-${Date.now()}` }]);
      setNewRoutine({ title: '', categoryId: '', frequency: 'daily', value: '' });
      setCreationMode(null);
    }
  };

  const addTask = (categoryId: string) => {
    if (newTaskTitle.trim()) {
      const updatedCategories = currentCategories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            tasks: [...cat.tasks, { id: Date.now(), title: newTaskTitle, completed: false }]
          };
        }
        return cat;
      });

      setDailyData({
        ...dailyData,
        [selectedDate]: updatedCategories
      });
      setNewTaskTitle('');
      setAddingTaskForCategoryId(null);
    }
  };

  const toggleTask = (categoryId: string, taskId: number) => {
    const updatedCategories = currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          tasks: cat.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return cat;
    });

    setDailyData({
      ...dailyData,
      [selectedDate]: updatedCategories
    });
  };

  const deleteTask = (categoryId: string, taskId: number) => {
    const updatedCategories = currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          tasks: cat.tasks.filter(t => t.id !== taskId)
        };
      }
      return cat;
    });

    setDailyData({
      ...dailyData,
      [selectedDate]: updatedCategories
    });
  };

  const deleteCategory = (categoryId: string) => {
    setDailyData({
      ...dailyData,
      [selectedDate]: currentCategories.filter(c => c.id !== categoryId)
    });
  };
  
  const getCompletedCount = (dateStr: string) => {
    const categoriesAtDay = dailyData[dateStr] || [];
    let count = 0;
    categoriesAtDay.forEach(cat => {
      cat.tasks.forEach(task => {
        if (task.completed) count++;
      });
    });
    return count;
  };

  // --- Calendar Helpers ---
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust firstDay to start from Monday (1)
    const padding = (firstDay === 0 ? 7 : firstDay) - 1;
    
    const days = [];
    for (let i = 0; i < padding; i++) {
      days.push({ day: '', key: `pad-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, key: dateStr });
    }
    return days;
  };

  const handleYearChange = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1));
  };

  const handleMonthChange = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-end sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="relative">
          <button 
            id="menu-btn" 
            onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isHeaderMenuOpen ? 'bg-white text-black' : 'hover:bg-white/10'}`}
          >
            <Plus className={`w-6 h-6 transition-transform ${isHeaderMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          <AnimatePresence>
            {isHeaderMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-0 mt-3 w-48 bg-[#111111] border border-gray-800 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
              >
                <button 
                  onClick={() => {
                    setCreationMode('category');
                    setIsHeaderMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">카테고리 추가</span>
                </button>
                <button 
                  onClick={() => {
                    setCreationMode('routine');
                    setIsHeaderMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">루틴 추가</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {creationMode === 'category' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#111111] border-b border-gray-800 absolute w-full z-20 overflow-hidden"
          >
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">새 카테고리 추가</h3>
                <button onClick={() => setCreationMode(null)} className="text-gray-500 hover:text-white transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="예: 운동 💪, 공부 📚"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  className="flex-1 bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#3FB4FF]"
                />
                <button 
                  onClick={addCategory}
                  className="bg-[#3FB4FF] text-black font-bold px-6 rounded-2xl"
                >
                  생성
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {creationMode === 'routine' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#111111] border-b border-gray-800 absolute w-full z-20 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">새 루틴 추가</h3>
                <button onClick={() => setCreationMode(null)} className="text-gray-500 hover:text-white transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="루틴 이름 (예: 물 마시기)"
                  value={newRoutine.title}
                  onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#3FB4FF]"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">카테고리</label>
                    <select 
                      value={newRoutine.categoryId}
                      onChange={(e) => setNewRoutine({ ...newRoutine, categoryId: e.target.value })}
                      className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#3FB4FF] appearance-none"
                    >
                      <option value="">선택하세요</option>
                      {/* Use categories from all days to populate options, or just current. 
                          Ideally we have a global category list, but for now we extract from dailyData. */}
                      {Array.from(new Set(Object.values(dailyData).flat().map(c => JSON.stringify({ id: (c as Category).id, name: (c as Category).name }))))
                        .map(s => JSON.parse(s))
                        .map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">반복 주기</label>
                    <div className="flex bg-black border border-gray-800 rounded-2xl p-1 overflow-x-auto">
                      {['daily', 'weekly', 'monthly', 'once'].map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            let defaultValue = '';
                            if (f === 'weekly') defaultValue = '1';
                            if (f === 'monthly') defaultValue = '1';
                            if (f === 'once') defaultValue = selectedDate;
                            setNewRoutine({ ...newRoutine, frequency: f, value: defaultValue });
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${newRoutine.frequency === f ? 'bg-[#3FB4FF] text-black' : 'text-gray-500'}`}
                        >
                          {f === 'daily' ? '매일' : f === 'weekly' ? '매주' : f === 'monthly' ? '매월' : '일회성'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {newRoutine.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">요일 선택</label>
                    <div className="flex justify-between gap-1 overflow-x-auto pb-2 px-1">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                        <button
                          key={i}
                          onClick={() => setNewRoutine({ ...newRoutine, value: i.toString() })}
                          className={`min-w-[40px] h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs ${newRoutine.value === i.toString() ? 'bg-white text-black' : 'bg-black border border-gray-800 text-gray-500'}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {newRoutine.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">일자 선택</label>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setNewRoutine({ ...newRoutine, value: (i + 1).toString() })}
                          className={`h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs ${newRoutine.value === (i + 1).toString() ? 'bg-white text-black' : 'bg-black border border-gray-800 text-gray-500'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {newRoutine.frequency === 'once' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">날짜 선택</label>
                    <input 
                      type="date" 
                      value={newRoutine.value}
                      onChange={(e) => setNewRoutine({ ...newRoutine, value: e.target.value })}
                      className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#3FB4FF] [color-scheme:dark]"
                    />
                  </div>
                )}

                <button 
                  onClick={addRoutine}
                  className="w-full bg-[#3FB4FF] text-black font-bold py-4 rounded-2xl mt-4"
                >
                  루틴 생성
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Profile Stats */}
              <section className="px-6 pt-6 bg-black relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-800" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#3FB4FF] rounded-full flex items-center justify-center border-2 border-black active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  <div className="flex flex-col pt-1 flex-1">
                    <AnimatePresence mode="wait">
                      {isEditingNickname ? (
                        <motion.div 
                          key="edit-name"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="space-y-3"
                        >
                          <input 
                            autoFocus
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (setNickname(editName), setIsEditingNickname(false))}
                            className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#3FB4FF] font-bold text-lg"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setNickname(editName);
                                setIsEditingNickname(false);
                              }}
                              className="bg-[#3FB4FF] text-black font-bold px-4 py-1.5 rounded-lg text-sm"
                            >
                              저장
                            </button>
                            <button 
                              onClick={() => {
                                setEditName(nickname);
                                setIsEditingNickname(false);
                              }}
                              className="text-gray-500 font-bold px-4 py-1.5 rounded-lg text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="display-name"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            {nickname}
                            <button 
                              onClick={() => {
                                setEditName(nickname);
                                setIsEditingNickname(true);
                              }}
                              className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded uppercase hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          </h1>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Date Selector */}
              <section className="px-6 mt-10">
                <button 
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <h2 className="text-2xl font-bold font-display">
                    {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 group-hover:text-white transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="bg-[#111111] rounded-3xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-8">
                          <button className="p-2 bg-black rounded-xl" onClick={() => handleYearChange(-1)}>
                            <Plus className="w-5 h-5 rotate-45" />
                          </button>
                          <span className="text-xl font-bold">{viewDate.getFullYear()} Year</span>
                          <button className="p-2 bg-black rounded-xl" onClick={() => handleYearChange(1)}>
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                handleMonthChange(i);
                                setIsPickerOpen(false);
                              }}
                              className={`py-3 rounded-xl text-sm font-bold transition-colors ${viewDate.getMonth() === i ? 'bg-[#3FB4FF] text-black' : 'bg-black text-gray-500 hover:bg-white/5'}`}
                            >
                              {i + 1}월
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Calendar Grid */}
                <div className="mt-8">
                  <div className="grid grid-cols-7 text-center mb-6">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                      <div key={day} className={`text-xs font-medium ${i === 5 ? 'text-[#3FB4FF]' : i === 6 ? 'text-[#FF4B4B]' : 'text-gray-400'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-4">
                    {generateCalendarDays().map((item) => (
                      <div key={item.key}>
                        <CalendarDay 
                          day={item.day} 
                          count={item.dateStr ? getCompletedCount(item.dateStr) : 0} 
                          isSelected={item.dateStr === selectedDate} 
                          onClick={() => item.dateStr && setSelectedDate(item.dateStr)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Categories & Tasks */}
              <section className="mt-12 space-y-16">
                {currentCategories.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">이 날짜에 등록된 할 일이 없습니다.</p>
                    <button 
                      onClick={() => setCreationMode('category')}
                      className="mt-4 text-[#3FB4FF] text-sm font-bold active:scale-95 transition-transform"
                    >
                      + 새 카테고리 추가
                    </button>
                  </div>
                )}
                {currentCategories.map(category => (
                  <div key={category.id} className="px-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 bg-[#111111] py-1.5 pl-3 pr-2 rounded-2xl border border-gray-800/50">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="text-[#3FB4FF] font-semibold text-lg">{category.name}</span>
                        <button 
                          onClick={() => setAddingTaskForCategoryId(addingTaskForCategoryId === category.id ? null : category.id)}
                          className={`p-1.5 rounded-xl transition-colors ${addingTaskForCategoryId === category.id ? 'bg-white text-black' : 'bg-black text-white'}`}
                        >
                          <Plus className={`w-4 h-4 transition-transform ${addingTaskForCategoryId === category.id ? 'rotate-45' : ''}`} />
                        </button>
                      </div>
                      <button 
                        onClick={() => deleteCategory(category.id)}
                        className="text-xs text-gray-600 hover:text-red-500 transition-colors font-medium"
                      >
                        카테고리 삭제
                      </button>
                    </div>

                    <div className="space-y-6">
                      <AnimatePresence>
                        {addingTaskForCategoryId === category.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                          >
                            <div className="flex items-center gap-4 bg-[#1A1A1A] p-4 rounded-2xl border border-gray-800">
                              <input
                                autoFocus
                                type="text"
                                placeholder="할 일을 입력하세요..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask(category.id)}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 font-medium text-lg"
                              />
                              <button 
                                onClick={() => addTask(category.id)}
                                className="px-4 py-1.5 bg-[#3FB4FF] text-black font-bold rounded-xl text-sm"
                              >
                                추가
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {category.tasks.map(task => (
                        <motion.div 
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between group"
                        >
                          <button 
                            onClick={() => toggleTask(category.id, task.id)}
                            className="flex items-center gap-4 text-left"
                          >
                            <StatusIcon status={task.completed ? 'checked' : 'idle'} />
                            <span className={`transition-all font-medium text-lg leading-none ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                              {task.title}
                            </span>
                          </button>
                          <button 
                            onClick={() => deleteTask(category.id, task.id)}
                            className="p-2 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity text-red-500"
                          >
                            <Plus className="w-6 h-6 rotate-45" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            </motion.div>
          )}

          {activeTab === 'routines' && (
            <motion.div
              key="routines-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 pt-6"
            >
              <h2 className="text-2xl font-bold mb-8">내 루틴 목록</h2>
              
              {routines.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-gray-500 mb-6">등록된 루틴이 없습니다.</p>
                  <button 
                    onClick={() => {
                      setCreationMode('routine');
                      setActiveTab('home');
                    }}
                    className="bg-[#3FB4FF] text-black font-bold px-8 py-3 rounded-2xl"
                  >
                    첫 루틴 만들기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {routines.map(routine => (
                    <div key={routine.id} className="bg-[#111111] border border-gray-800 rounded-3xl p-5 overflow-hidden">
                      {editingRoutineId === routine.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editRoutineBuffer.title}
                            onChange={(e) => setEditRoutineBuffer({ ...editRoutineBuffer, title: e.target.value })}
                            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#3FB4FF]"
                          />
                          <div className="flex bg-black border border-gray-800 rounded-2xl p-1 overflow-x-auto">
                            {['daily', 'weekly', 'monthly', 'once'].map((f) => (
                              <button
                                key={f}
                                onClick={() => {
                                  let defaultValue = '';
                                  if (f === 'weekly') defaultValue = '1';
                                  if (f === 'monthly') defaultValue = '1';
                                  if (f === 'once') defaultValue = selectedDate;
                                  setEditRoutineBuffer({ ...editRoutineBuffer, frequency: f, value: defaultValue });
                                }}
                                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${editRoutineBuffer.frequency === f ? 'bg-[#3FB4FF] text-black' : 'text-gray-500'}`}
                              >
                                {f === 'daily' ? '매일' : f === 'weekly' ? '매주' : f === 'monthly' ? '매월' : '일회성'}
                              </button>
                            ))}
                          </div>

                          {editRoutineBuffer.frequency === 'weekly' && (
                            <div className="flex justify-between gap-1 overflow-x-auto pb-2 px-1">
                              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                                <button
                                  key={i}
                                  onClick={() => setEditRoutineBuffer({ ...editRoutineBuffer, value: i.toString() })}
                                  className={`min-w-[40px] h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs ${editRoutineBuffer.value === i.toString() ? 'bg-white text-black' : 'bg-black border border-gray-800 text-gray-500'}`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          )}

                          {editRoutineBuffer.frequency === 'monthly' && (
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 31 }).map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setEditRoutineBuffer({ ...editRoutineBuffer, value: (i + 1).toString() })}
                                  className={`h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs ${editRoutineBuffer.value === (i + 1).toString() ? 'bg-white text-black' : 'bg-black border border-gray-800 text-gray-500'}`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateRoutine(routine.id)}
                              className="flex-1 bg-[#3FB4FF] text-black font-bold py-3 rounded-2xl"
                            >
                              저장
                            </button>
                            <button 
                              onClick={() => setEditingRoutineId(null)}
                              className="px-6 border border-gray-800 font-bold py-3 rounded-2xl"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                              <Compass className="w-5 h-5 text-[#3FB4FF]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{routine.title}</h3>
                              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">
                                {routine.frequency === 'daily' ? '매일' : 
                                routine.frequency === 'weekly' ? `매주 ${['일', '월', '화', '수', '목', '금', '토'][parseInt(routine.value)]}요일` :
                                routine.frequency === 'monthly' ? `매월 ${routine.value}일` :
                                `일회성 (${routine.value})`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                setEditingRoutineId(routine.id);
                                setEditRoutineBuffer({ ...routine });
                              }}
                              className="p-3 text-gray-600 hover:text-[#3FB4FF] transition-colors"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setRoutines(routines.filter(r => r.id !== routine.id))}
                              className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 pt-6 space-y-10"
            >
              <h2 className="text-2xl font-bold">나의 대시보드</h2>

              {/* Profile Card */}
              <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 flex items-center gap-6">
                <div className="relative inline-block">
                  <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-800" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{nickname}</h3>
                  <button 
                    onClick={() => {
                      setEditName(nickname);
                      setIsEditingNickname(true);
                      setActiveTab('home');
                    }}
                    className="text-sm text-[#3FB4FF] font-bold mt-1"
                  >
                    닉네임 변경
                  </button>
                </div>
              </div>

              {/* Daily Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">일별 달성도</h3>
                  <div className="h-48 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={getDailyStats()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {getDailyStats().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">
                            {Math.round((getDailyStats()[0].value / (getDailyStats()[0].value + getDailyStats()[1].value || 1)) * 100)}%
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Completed</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-xs font-bold px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#3FB4FF]" />
                        <span className="text-gray-400">완료 {getDailyStats()[0].value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2A2A2A]" />
                        <span className="text-gray-400">남음 {getDailyStats()[1].value}</span>
                    </div>
                  </div>
                </div>

                {/* 5-Day Trend */}
                <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">최근 5일 트렌드</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getLastFiveDaysStats()}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#666' }} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar 
                                dataKey="completed" 
                                fill="#3FB4FF" 
                                radius={[4, 4, 0, 0]} 
                                barSize={12} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-black/40 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">이번 달 평균 달성률</p>
                        <p className="text-xl font-bold">{getMonthlyStats().percentage}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#3FB4FF]/10 flex items-center justify-center">
                        <Compass className="w-6 h-6 text-[#3FB4FF]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-900 pb-8 pt-4 px-10 z-40">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={`p-2 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Home className={`w-7 h-7 ${activeTab === 'home' ? 'fill-white' : ''}`} />
          </button>
          <button 
            onClick={() => setActiveTab('routines')}
            className={`p-2 transition-colors ${activeTab === 'routines' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <ListTodo className={`w-7 h-7 ${activeTab === 'routines' ? 'fill-white opacity-20' : ''}`} />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <User className={`w-7 h-7 ${activeTab === 'profile' ? 'fill-white' : ''}`} />
          </button>
        </div>
      </nav>
    </div>
  );
}
