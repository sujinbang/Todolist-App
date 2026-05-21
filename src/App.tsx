import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, 
  ListTodo, 
  BookOpen, 
  PenTool, 
  Heart,
  Smile,
  BookMarked,
  Sparkles,
  Github,
  Sun,
  Moon,
  TrendingUp,
  Award,
  LogOut,
  RotateCcw
} from 'lucide-react';

import { Todo, BookLog, DiaryEntry } from './types';
import Dashboard from './components/Dashboard';
import TodoList from './components/TodoList';
import RoutineManager from './components/RoutineManager';
import ReadingLog from './components/ReadingLog';
import Diary from './components/Diary';
import Auth from './components/Auth';
import { useFirebase } from './useFirebase';
import { auth } from './firebase';

export default function App() {
  const {
    user,
    todos,
    routines,
    categories,
    setCategories,
    books,
    diaries,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleAddBook,
    handleUpdateBookProgress,
    handleDeleteBook,
    handleAddDiary,
    handleDeleteDiary,
    handleAddRoutine,
    handleUpdateRoutine,
    handleDeleteRoutine,
  } = useFirebase();

  const [tab, setTab] = React.useState<'dashboard' | 'todo' | 'routine' | 'reading' | 'diary'>('dashboard');

  // Stats calculation for the sidebar preview
  const activeTodosCount = todos.filter(t => !t.completed).length;
  const currentlyReadingCount = books.filter(b => b.status === 'reading').length;

  if (!user) {
    return (
      <Auth 
        onLoginSuccess={(email, name) => {
          // auth state listeners from Firebase will catch this and set user
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-800 flex flex-col antialiased font-sans pb-20 font-light">
      
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-[#faf9f7]/90 backdrop-blur-sm border-b border-neutral-200 px-4 py-2 flex items-center justify-end">
        {/* Sign Out Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              auth.signOut();
            }}
            className="px-3 py-1.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-[12px] transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {tab === 'dashboard' && (
              <Dashboard 
                user={user}
                todos={todos} 
                bLogs={books} 
                diaries={diaries} 
                setTab={setTab}
              />
            )}
            
            {tab === 'todo' && (
              <TodoList 
                todos={todos}
                categories={categories}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onAddCategory={(cat) => setCategories(prev => [...prev, cat])}
                onDeleteCategory={(cat) => setCategories(prev => prev.filter(c => c !== cat))}
                setTab={setTab}
              />
            )}

            {tab === 'routine' && (
              <RoutineManager 
                routines={routines}
                categories={categories}
                onAddRoutine={handleAddRoutine}
                onUpdateRoutine={handleUpdateRoutine}
                onDeleteRoutine={handleDeleteRoutine}
              />
            )}

            {tab === 'reading' && (
              <ReadingLog 
                bLogs={books}
                onAddBook={handleAddBook}
                onUpdateProgress={handleUpdateBookProgress}
                onDeleteBook={handleDeleteBook}
              />
            )}

            {tab === 'diary' && (
              <Diary 
                diaries={diaries}
                onAddDiary={handleAddDiary}
                onDeleteDiary={handleDeleteDiary}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#faf9f7]/90 backdrop-blur-md border-t border-neutral-200 text-[10px] px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-around max-w-md mx-auto h-[56px]">
          <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors cursor-pointer ${tab === 'dashboard' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
            <BarChart2 className={`h-4 w-4 ${tab === 'dashboard' ? 'opacity-100' : 'opacity-70'}`} strokeWidth={tab === 'dashboard' ? 2 : 1.5} />
            <span className={`text-[10px] ${tab === 'dashboard' ? 'font-medium' : ''}`}>홈</span>
          </button>
          
          <button onClick={() => setTab('todo')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors cursor-pointer ${tab === 'todo' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
            <div className="relative">
              <ListTodo className={`h-4 w-4 ${tab === 'todo' ? 'opacity-100' : 'opacity-70'}`} strokeWidth={tab === 'todo' ? 2 : 1.5} />
              {activeTodosCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#e8ccd5] border border-white text-[8px] text-neutral-700 font-medium shadow-sm">
                  {activeTodosCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${tab === 'todo' ? 'font-medium' : ''}`}>할일</span>
          </button>
          
          <button onClick={() => setTab('routine')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors cursor-pointer ${tab === 'routine' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
            <RotateCcw className={`h-4 w-4 ${tab === 'routine' ? 'opacity-100' : 'opacity-70'}`} strokeWidth={tab === 'routine' ? 2 : 1.5} />
            <span className={`text-[10px] ${tab === 'routine' ? 'font-medium' : ''}`}>루틴</span>
          </button>
          
          <button onClick={() => setTab('reading')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors cursor-pointer ${tab === 'reading' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
            <div className="relative">
              <BookOpen className={`h-4 w-4 ${tab === 'reading' ? 'opacity-100' : 'opacity-70'}`} strokeWidth={tab === 'reading' ? 2 : 1.5} />
              {currentlyReadingCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#d5e0d8] border border-white text-[8px] text-neutral-700 font-medium shadow-sm">
                  {currentlyReadingCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${tab === 'reading' ? 'font-medium' : ''}`}>독서</span>
          </button>
          
          <button onClick={() => setTab('diary')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors cursor-pointer ${tab === 'diary' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
            <div className="relative">
              <PenTool className={`h-4 w-4 ${tab === 'diary' ? 'opacity-100' : 'opacity-70'}`} strokeWidth={tab === 'diary' ? 2 : 1.5} />
            </div>
            <span className={`text-[10px] ${tab === 'diary' ? 'font-medium' : ''}`}>일기</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
