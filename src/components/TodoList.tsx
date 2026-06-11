import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Calendar, 
  Tag, 
  Clock,
  CheckCircle2,
  Circle,
  X,
  RotateCcw,
  AlertCircle,
  ImagePlus,
  Pencil
} from 'lucide-react';
import { Todo, Routine } from '../types';
import { compressImage } from '../imageUtils';

interface TodoListProps {
  todos: Todo[];
  routines: Routine[];
  categories: string[];
  onAddTodo: (todo: Omit<Todo, 'id'> & { completed?: boolean }) => void;
  onToggleTodo: (id: string) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onAddCategory: (cat: string) => void;
  onDeleteCategory?: (cat: string) => void;
  setTab: (tab: any) => void;
}

function shouldRunOnDate(routine: Routine, dateStr: string): boolean {
  if (!routine.isActive) return false;
  if (routine.isManual) return false;

  // 현지 날짜 오차 방지를 위한 수동 날짜 파싱
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return false;

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const dayOfMonth = date.getDate();

  switch (routine.cyclePeriod) {
    case 'daily':
      return true;

    case 'weekly':
      return routine.frequency.includes(dayOfWeek as any);

    case 'monthly':
      return routine.monthlyDay === dayOfMonth;

    default:
      return routine.frequency.includes(dayOfWeek as any);
  }
}

function isRoutineMatchingDate(routine: Routine, dateStr: string): boolean {
  if (!routine.isActive) return false;

  // 현지 날짜 오차 방지를 위한 수동 날짜 파싱
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return false;

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const dayOfMonth = date.getDate();

  switch (routine.cyclePeriod) {
    case 'daily':
      return true;

    case 'weekly':
      return routine.frequency.includes(dayOfWeek as any);

    case 'monthly':
      return routine.monthlyDay === dayOfMonth;

    default:
      return routine.frequency.includes(dayOfWeek as any);
  }
}

export default function TodoList({ todos, routines, categories, onAddTodo, onToggleTodo, onUpdateTodo, onDeleteTodo, onAddCategory, onDeleteCategory, setTab }: TodoListProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showYearModal, setShowYearModal] = React.useState(false);
  const [addMode, setAddMode] = React.useState<'todo' | 'category'>('todo');

  // Todo Form
  const [newText, setNewText] = React.useState('');
  const [category, setCategory] = React.useState<string>(categories[0] || '');
  const [priority, setPriority] = React.useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    const compressedPromises = validFiles.map(f => compressImage(f));
    const compressedImages = await Promise.all(compressedPromises);
    setImageUrls(prev => [...prev, ...compressedImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Edit Todo Form
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<string>('');
  const [editPriority, setEditPriority] = React.useState<Todo['priority']>('medium');
  const [editDueDate, setEditDueDate] = React.useState('');
  const [editImageUrls, setEditImageUrls] = React.useState<string[]>([]);
  const editFileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [viewingImageUrl, setViewingImageUrl] = React.useState<string | null>(null);

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    const compressedPromises = validFiles.map(f => compressImage(f));
    const compressedImages = await Promise.all(compressedPromises);
    setEditImageUrls(prev => [...prev, ...compressedImages]);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
    setEditCategory(todo.category || (categories[0] || ''));
    setEditPriority(todo.priority || 'medium');
    setEditDueDate(todo.dueDate);
    const initialImages = todo.imageUrls ? [...todo.imageUrls] : (todo.imageUrl ? [todo.imageUrl] : []);
    setEditImageUrls(initialImages);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodoId || !editText.trim()) return;
    onUpdateTodo(editingTodoId, {
      text: editText.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDueDate,
      imageUrls: editImageUrls
    });
    setEditingTodoId(null);
  };


  // Category Form
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<string>('All');
  
  // By default, select today
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addMode === 'todo') {
      if (!newText.trim()) return;
      onAddTodo({
        text: newText.trim(),
        category,
        priority,
        dueDate,
        imageUrls
      });
      setNewText('');
      setImageUrls([]);
      setShowAddModal(false);
    } else if (addMode === 'category') {
      if (!newCategoryName.trim()) return;
      onAddCategory(newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setAddMode('todo');
    }
  };

  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Generate Month Dates for Calendar
  const getMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Fill previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const iso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      days.push({
        dateString: iso,
        dayOfMonth: d.getDate(),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      days.push({
        dateString: iso,
        dayOfMonth: d.getDate(),
        isCurrentMonth: true
      });
    }

    // Fill next month leading days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(year, month + 1, i);
        const iso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        days.push({
            dateString: iso,
            dayOfMonth: d.getDate(),
            isCurrentMonth: false
        });
    }
    
    return days;
  };

  const monthDates = getMonthDates();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  // Generate Virtual Todos for active routines scheduled for selectedDate
  const virtualRoutineTodos: Todo[] = [];
  routines.forEach(routine => {
    if (shouldRunOnDate(routine, selectedDate)) {
      // Check if a real todo already exists for this routine on this date
      const realTodoExists = todos.some(
        t => t.routineId === routine.id && t.dueDate === selectedDate
      );
      if (!realTodoExists) {
        virtualRoutineTodos.push({
          id: `virtual_${routine.id}_${selectedDate}`,
          text: routine.title,
          completed: false,
          category: routine.category,
          priority: routine.priority || 'medium',
          dueDate: selectedDate,
          routineId: routine.id,
          isFromRoutine: true,
          isVirtual: true // Custom flag to identify virtual item
        } as any);
      }
    }
  });

  const allItems = [...todos, ...virtualRoutineTodos];

  // Filtering list
  const filteredTodos = allItems
    .filter(todo => {
      const dateMatches = todo.dueDate === selectedDate;
      const textMatches = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const catMatches = filterCategory === 'All' || todo.category === filterCategory;
      return dateMatches && textMatches && catMatches;
    })
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

  // Filter active manual routines scheduled for selectedDate that haven't been added yet
  const manualRoutinesToInject = routines.filter(routine => {
    if (!routine.isActive || !routine.isManual) return false;
    
    const isScheduled = isRoutineMatchingDate(routine, selectedDate);
    if (!isScheduled) return false;

    const alreadyAdded = todos.some(
      t => t.routineId === routine.id && t.dueDate === selectedDate
    );
    return !alreadyAdded;
  });

  return (
    <div className="space-y-6 text-neutral-800 font-light">
      {/* Header and Calendar Layer */}
      <div className="border border-neutral-100 bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
        
        <div className="flex justify-between items-start mb-6 relative">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-2 py-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer leading-none">
              &larr;
            </button>
            <h2 
              className="text-[15px] font-medium text-neutral-800 px-2 tracking-wide cursor-pointer hover:bg-neutral-100 rounded py-1 transition-colors"
              onClick={() => setShowYearModal(true)}
            >
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h2>
            <button onClick={nextMonth} className="px-2 py-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer leading-none">
              &rarr;
            </button>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-[#d9ae92] border border-[#d9ae92] hover:bg-[#c99e82] text-white rounded-[12px] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-[#d9ae92]/20"
          >
            <Plus className="h-4 w-4" />
            등록
          </button>
        </div>

        {/* Monthly Calendar */}
        <div className="bg-white border-t border-neutral-100 pt-4">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-[11px] font-semibold text-neutral-500 pb-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((dayInfo, idx) => {
              const isSelected = dayInfo.dateString === selectedDate;
              const isToday = dayInfo.dateString === (() => {
                const d = new Date();
                return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
              })();
              const hasRealTodos = todos.some(t => t.dueDate === dayInfo.dateString);
              const hasRoutineTodos = routines.some(r => shouldRunOnDate(r, dayInfo.dateString));
              const hasTodos = hasRealTodos || hasRoutineTodos;
              return (
                <button
                  key={`${dayInfo.dateString}-${idx}`}
                  onClick={() => setSelectedDate(dayInfo.dateString)}
                  className={`aspect-square p-1 rounded-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                    !dayInfo.isCurrentMonth ? 'opacity-30' : ''
                  } ${
                    isSelected 
                      ? 'bg-neutral-200 text-black z-10' 
                      : isToday ? 'bg-neutral-50 text-neutral-800 font-bold' : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800'
                  }`}
                >
                  <span className="text-xs font-mono">
                    {dayInfo.dayOfMonth}
                  </span>
                  {hasTodos && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-neutral-500 absolute bottom-1.5" />
                  )}
                  {hasTodos && isSelected && (
                    <span className="w-1 h-1 rounded-full bg-black absolute bottom-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main List */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-neutral-100 bg-white p-4 rounded-md shadow-sm relative z-10">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['All', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === cat ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                  }`}
                >
                  {cat === 'All' ? '모든 카테고리' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="일정 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-100 rounded-sm focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-md border border-neutral-100">
                <p className="text-sm font-medium text-neutral-400">등록된 할 일이 없습니다.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTodos.map(todo => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex flex-col sm:flex-row justify-between p-3 rounded-sm border transition-all ${
                      todo.completed 
                        ? 'bg-white border-transparent opacity-60' 
                        : 'bg-white border-neutral-100 hover:border-neutral-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => {
                          if ((todo as any).isVirtual) {
                            onAddTodo({
                              text: todo.text,
                              category: todo.category,
                              priority: todo.priority,
                              dueDate: todo.dueDate,
                              routineId: todo.routineId,
                              isFromRoutine: true,
                              completed: true
                            } as any);
                          } else {
                            onToggleTodo(todo.id);
                          }
                        }}
                        className={`mt-0.5 shrink-0 flex items-center justify-center h-4 w-4 rounded-sm border transition-all cursor-pointer ${
                          todo.completed 
                            ? 'bg-neutral-300 border-neutral-300 text-black' 
                            : 'border-neutral-500 hover:border-neutral-300 text-transparent'
                        }`}
                      >
                        {todo.completed && <Check className="h-3 w-3" />}
                      </button>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium transition-all truncate leading-tight ${
                            todo.completed ? 'line-through text-neutral-500' : 'text-neutral-800'
                          }`}>
                            {todo.text}
                          </p>
                          {todo.isFromRoutine && (
                            <RotateCcw className="h-3 w-3 text-blue-500 shrink-0" title="루틴에서 생성됨" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {todo.priority === 'high' && <span className="text-[10px] text-red-400 font-medium tracking-wider relative flex items-center gap-0.5"><AlertCircle className="h-2.5 w-2.5" /> High</span>}
                          {todo.priority === 'medium' && <span className="text-[10px] text-yellow-400 font-medium tracking-wider relative flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> Med</span>}
                          {todo.priority === 'low' && <span className="text-[10px] text-green-400 font-medium tracking-wider relative flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" /> Low</span>}

                          <span className="text-[10px] text-neutral-400 px-1.5 py-0.5 bg-neutral-50 rounded flex items-center gap-1">
                            {todo.category}
                          </span>
                        </div>
                        {(todo.imageUrls && todo.imageUrls.length > 0) || todo.imageUrl ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(todo.imageUrls || (todo.imageUrl ? [todo.imageUrl] : [])).map((url, idx) => (
                              <div key={idx} className="cursor-pointer" onClick={() => setViewingImageUrl(url)}>
                                <img src={url} alt={`첨부 이미지 ${idx + 1}`} className="h-20 w-20 object-cover rounded border border-neutral-100 hover:opacity-90 transition-opacity" />
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    {!((todo as any).isVirtual) && (
                      <div className="mt-3 sm:mt-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => openEditModal(todo)}
                          className="p-1 text-neutral-500 hover:text-blue-500 hover:bg-neutral-50 rounded cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-50 rounded cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* 수동 추가 루틴 섹션 */}
          {manualRoutinesToInject.length > 0 && (
            <div className="mt-6 border border-neutral-100 bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <h3 className="text-xs font-semibold text-neutral-500 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
                수동 추가 루틴
              </h3>
              <p className="text-[11px] text-neutral-400 mb-4">
                이 날짜에 계획된 수동(비활성) 루틴입니다. 클릭하여 할 일 목록에 추가하세요.
              </p>
              <div className="flex flex-wrap gap-2">
                {manualRoutinesToInject.map(routine => {
                  const priorityColor = {
                    high: 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100/50',
                    medium: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100/50',
                    low: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100/50'
                  }[routine.priority || 'medium'];

                  return (
                    <motion.button
                      key={routine.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onAddTodo({
                          text: routine.title,
                          category: routine.category,
                          priority: routine.priority || 'medium',
                          dueDate: selectedDate,
                          routineId: routine.id,
                          isFromRoutine: true,
                        });
                      }}
                      className={`px-3.5 py-2 rounded-[12px] border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${priorityColor}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{routine.title}</span>
                      <span className="text-[9px] opacity-60 px-1 py-0.2 bg-white/60 rounded">
                        {routine.category}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-neutral-100 rounded-[20px] shadow-sm overflow-hidden relative"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAddMode('todo')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded transition-colors cursor-pointer ${addMode === 'todo' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:text-neutral-800'}`}
                  >할 일</button>
                  <button 
                    onClick={() => setAddMode('category')}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded transition-colors cursor-pointer ${addMode === 'category' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:text-neutral-800'}`}
                  >카테고리</button>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-800 rounded cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  {addMode === 'todo' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">내용</label>
                        <input
                          type="text"
                          value={newText}
                          onChange={e => setNewText(e.target.value)}
                          placeholder="새로운 할 일"
                          className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                          autoFocus
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-medium text-neutral-400 mb-1">카테고리</label>
                          <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-white text-neutral-800">{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-medium text-neutral-400 mb-1">날짜</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">우선순위</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'high', label: '높음' },
                            { value: 'medium', label: '보통' },
                            { value: 'low', label: '낮음' }
                          ].map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setPriority(p.value as any)}
                              className={`flex-1 py-1.5 rounded text-[12px] font-medium transition-all border cursor-pointer ${
                                priority === p.value 
                                  ? `bg-neutral-50 border-neutral-500 text-neutral-800` 
                                  : 'bg-white border-neutral-100 text-neutral-500 hover:text-neutral-800'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">사진 첨부 (선택)</label>
                        <div className="flex flex-col gap-2">
                          <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <div className="flex flex-wrap gap-2">
                            {imageUrls.map((url, idx) => (
                              <div key={idx} className="relative group rounded border border-neutral-100 overflow-hidden" style={{ width: '60px', height: '60px' }}>
                                <img src={url} alt="첨부 이미지" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4 text-white" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-[60px] h-[60px] flex flex-col items-center justify-center bg-neutral-50 rounded border border-neutral-100 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                            >
                              <ImagePlus className="h-4 w-4 mb-1" />
                              <span className="text-[10px]">사진</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {addMode === 'category' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">카테고리 이름</label>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          placeholder="새로운 카테고리"
                          className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-none focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                          autoFocus
                          required={categories.length === 0}
                        />
                      </div>
                      
                      {categories.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-[12px] font-medium text-neutral-400 mb-2">기존 카테고리 (삭제)</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((cat, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-full text-[12px] text-neutral-600">
                                <span>{cat}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onDeleteCategory?.(cat);
                                  }}
                                  className="text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-white text-black rounded text-[13px] font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      {addMode === 'todo' ? '할 일 등록' : '카테고리 추가'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Todo Modal */}
      <AnimatePresence>
        {editingTodoId && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-neutral-100 rounded-[20px] shadow-sm overflow-hidden relative"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <span className="px-3 py-1.5 text-[13px] font-medium text-neutral-800">할 일 수정</span>
                <button 
                  onClick={() => setEditingTodoId(null)}
                  className="p-1 text-neutral-500 hover:text-neutral-800 rounded cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1">내용</label>
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        placeholder="할 일 내용"
                        className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">카테고리</label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-white text-neutral-800">{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-400 mb-1">날짜</label>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={e => setEditDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1">우선순위</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'high', label: '높음' },
                          { value: 'medium', label: '보통' },
                          { value: 'low', label: '낮음' }
                        ].map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setEditPriority(p.value as any)}
                            className={`flex-1 py-1.5 rounded text-[12px] font-medium transition-all border cursor-pointer ${
                              editPriority === p.value 
                                ? `bg-neutral-50 border-neutral-500 text-neutral-800` 
                                : 'bg-white border-neutral-100 text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-neutral-400 mb-1">사진 첨부 (선택)</label>
                      <div className="flex flex-col gap-2">
                        <input type="file" accept="image/*" multiple className="hidden" ref={editFileInputRef} onChange={handleEditImageUpload} />
                        <div className="flex flex-wrap gap-2">
                          {editImageUrls.map((url, idx) => (
                            <div key={idx} className="relative group rounded border border-neutral-100 overflow-hidden" style={{ width: '60px', height: '60px' }}>
                              <img src={url} alt="첨부 이미지" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="w-[60px] h-[60px] flex flex-col items-center justify-center bg-neutral-50 rounded border border-neutral-100 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            <ImagePlus className="h-4 w-4 mb-1" />
                            <span className="text-[10px]">사진</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-white text-black rounded text-[13px] font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      수정 완료
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImageUrl && (
          <div className="fixed inset-0 z-[70] bg-black/90 flex justify-center items-center p-4 cursor-pointer" onClick={() => setViewingImageUrl(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-full max-h-full flex justify-center items-center"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewingImageUrl(null)}
                className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
              <img 
                src={viewingImageUrl} 
                alt="원본 이미지" 
                className="max-w-full max-h-[85vh] object-contain rounded-md"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Year Selection Modal */}
      <AnimatePresence>
        {showYearModal && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[24px] shadow-xl w-full max-w-[320px] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[16px] font-medium text-neutral-800 tracking-wide">년도 이동</h3>
                  <button onClick={() => setShowYearModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {Array.from({ length: 21 }, (_, i) => currentMonth.getFullYear() - 10 + i).map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
                        setShowYearModal(false);
                      }}
                      className={`py-3 rounded-[12px] text-[13px] font-medium transition-colors border ${ 
                        year === currentMonth.getFullYear()
                          ? 'bg-[#d9ae92] text-white border-[#d9ae92]'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#d9ae92] hover:text-[#d9ae92]'
                      }`}
                    >
                      {year}년
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
