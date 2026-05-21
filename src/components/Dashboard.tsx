import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  BookOpen, 
  Book, 
  Calendar, 
  PenTool, 
  TrendingUp, 
  Smile, 
  ListTodo, 
  Heart,
  ChevronRight,
  BookMarked,
  Edit2,
  Camera
} from 'lucide-react';
import { Todo, BookLog, DiaryEntry } from '../types';

interface DashboardProps {
  user: { email: string; name: string };
  todos: Todo[];
  bLogs: BookLog[];
  diaries: DiaryEntry[];
  setTab: (tab: 'dashboard' | 'todo' | 'reading' | 'diary') => void;
}

export default function Dashboard({ user, todos, bLogs, diaries, setTab }: DashboardProps) {
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(() => localStorage.getItem('haru_profile_photo'));
  const [nickname, setNickname] = React.useState<string>(() => localStorage.getItem('haru_nickname') || user.name);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setProfilePhoto(dataUrl);
        localStorage.setItem('haru_profile_photo', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    if (nickname.trim()) {
      localStorage.setItem('haru_nickname', nickname.trim());
    }
  };

  // Stats calculation
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const todoProgress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const readingBooks = bLogs.filter(b => b.status !== 'completed');
  const completedBooks = bLogs.filter(b => b.status === 'completed');
  
  const latestDiary = diaries.length > 0 ? diaries[0] : null;

  // Mood frequency translation
  const moodIcons: Record<string, string> = {
    happy: '✨',
    peaceful: '🌱',
    neutral: '🍙',
    sad: '☔',
    tired: '🐈‍⬛',
    stressed: '🔥',
  };

  const moodColors: Record<string, string> = {
    happy: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    peaceful: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    neutral: 'bg-white/5 text-white/70 border-white/10',
    sad: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    tired: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    stressed: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  };

  const moodLabels: Record<string, string> = {
    happy: '행복함',
    peaceful: '평온함',
    neutral: '보통',
    sad: '슬픔',
    tired: '피곤함',
    stressed: '스트레스',
  };

  return (
    <div className="space-y-6 text-neutral-800 font-light">
      {/* Profile Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => isEditingProfile && fileInputRef.current?.click()}>
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#faf9f7] border border-neutral-200 flex items-center justify-center">
              {profilePhoto ? (
                <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[24px]">👋</div>
              )}
            </div>
            {isEditingProfile && (
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-80" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          </div>
          <div>
            {isEditingProfile ? (
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                className="text-[17px] font-medium text-neutral-800 bg-neutral-50 px-3 py-1 rounded-[8px] outline-none border border-neutral-200 w-[140px]"
                autoFocus
              />
            ) : (
              <h1 className="text-[17px] font-medium text-neutral-800">{nickname}</h1>
            )}
            <p className="text-[12px] text-neutral-400 mt-1 cursor-default">오늘도 좋은 하루 보내세요!</p>
          </div>
        </div>
        
        <button 
          onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
          className="p-2.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors"
        >
          {isEditingProfile ? <CheckSquare className="w-4 h-4 text-[#9fbb9f]" strokeWidth={2} /> : <Edit2 className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Widget 1: Todo Cards Progress (Left Panel, 7 cols) & Quick Add */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Todo Dashboard Card */}
          <div id="todo-progress-card" className="rounded-[20px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-neutral-800">
                <ListTodo className="h-4 w-4 text-[#d9ae92]" strokeWidth={1.5} />
                <h2 className="text-[14px] font-medium tracking-wide border-b border-transparent">오늘의 할 일</h2>
              </div>
              <button 
                onClick={() => setTab('todo')}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer transition-colors px-2 py-1"
              >
                더보기 <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>

            {/* Range bar progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                <span className="text-neutral-500">완료 진행률</span>
                <span className="text-neutral-800">{todoProgress}%</span>
              </div>
              <div className="h-[3px] w-full bg-neutral-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#e6c8c1] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${todoProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Mini Todolist Peek */}
            <div className="space-y-0.5 max-h-[180px] overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-[12px]">
                  새로운 할 일을 추가해보세요.
                </div>
              ) : (
                todos.slice(0, 3).map(todo => (
                  <div 
                    key={todo.id} 
                    className="flex items-center justify-between p-3 rounded-[12px] bg-transparent hover:bg-[#faf9f7] text-[13px] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-none flex items-center justify-center h-4 w-4 rounded-full border ${
                        todo.completed ? 'bg-[#9fbb9f] border-[#9fbb9f]' : 'border-neutral-200 bg-white'
                      } transition-colors`}>
                        {todo.completed && <CheckSquare className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />}
                      </div>
                      <span className={todo.completed ? 'line-through text-neutral-300' : 'text-neutral-700 font-light'}>
                        {todo.text}
                      </span>
                    </div>
                    {todo.category && (
                      <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {todo.category}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Widget 2: Reading Stats & Book slider (Right Panel, 5 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 space-y-4"
        >
          <div id="reading-dashboard-card" className="rounded-[20px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-neutral-800">
                  <BookOpen className="h-4 w-4 text-[#9fbb9f]" strokeWidth={1.5} />
                  <h2 className="text-[14px] font-medium tracking-wide border-b border-transparent">책장</h2>
                </div>
                <button 
                  onClick={() => setTab('reading')}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer transition-colors px-2 py-1"
                >
                  더보기 <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                </button>
              </div>

              {/* Cover stack & progress */}
              <div className="space-y-4">
                {readingBooks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[12px] text-neutral-400 font-light">진행 중인 독서가 없어요.</p>
                  </div>
                ) : (
                  readingBooks.slice(0, 2).map(book => {
                    const percent = Math.round((book.currentPage / book.totalPages) * 100);
                    return (
                      <div key={book.id} className="w-full">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-neutral-800 truncate mb-1">{book.title}</h4>
                          <p className="text-[11px] text-neutral-400 mb-2 truncate">{book.author}</p>
                          <div className="flex items-center justify-between gap-3">
                            <div className="h-[2px] flex-1 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#9fbb9f]" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium flex-none">{percent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Total book badge */}
            <div className="mt-8 pt-5 border-t border-neutral-100 flex justify-between items-center text-[12px] text-neutral-500 font-light">
              <span className="flex items-center gap-1.5">
                <BookMarked className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
                완독한 도서
              </span>
              <span className="font-medium text-neutral-700 bg-neutral-50 px-2.5 py-1 rounded-full">{completedBooks.length}권</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
