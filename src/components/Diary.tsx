import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Calendar,
  Lock,
  Unlock,
  Key,
  ImagePlus,
  X
} from 'lucide-react';
import { DiaryEntry } from '../types';

interface DiaryProps {
  diaries: DiaryEntry[];
  onAddDiary: (diary: Omit<DiaryEntry, 'id'>) => void;
  onDeleteDiary: (id: string) => void;
}

export default function Diary({ diaries, onAddDiary, onDeleteDiary }: DiaryProps) {
  const [isLocked, setIsLocked] = React.useState(() => !!localStorage.getItem('haru_diary_pwd'));
  const [inputPwd, setInputPwd] = React.useState('');
  const [showSetupPwd, setShowSetupPwd] = React.useState(false);
  const [newPwd, setNewPwd] = React.useState('');
  const [pwdError, setPwdError] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [mood, setMood] = React.useState<DiaryEntry['mood']>('peaceful');
  const [weather, setWeather] = React.useState<DiaryEntry['weather']>('sunny');
  const [date, setDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = React.useState<string>('All');
  const [activeDiary, setActiveDiary] = React.useState<DiaryEntry | null>(null);

  const moodIcons: Record<DiaryEntry['mood'], string> = {
    happy: '✨',
    peaceful: '🌱',
    neutral: '🍙',
    sad: '☔',
    tired: '🐈‍⬛',
    stressed: '🔥',
  };

  const moodLabels: Record<DiaryEntry['mood'], string> = {
    happy: '행복함',
    peaceful: '평온함',
    neutral: '평범함',
    sad: '슬픔',
    tired: '피곤함',
    stressed: '스트레스',
  };

  const weatherIcons: Record<NonNullable<DiaryEntry['weather']>, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '☔',
    snowy: '⛄',
    windy: '💨',
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      console.log('일기 추가 실패: 제목 또는 내용 누락');
      return;
    }

    const newDiary = {
      title: title.trim(),
      content: content.trim(),
      mood,
      weather,
      date: date || (() => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      })(),
      imageUrl,
    };

    console.log('일기 추가 시도:', newDiary);

    try {
      onAddDiary(newDiary);
      console.log('일기 추가 성공');

      // Reset fields
      setTitle('');
      setContent('');
      setMood('peaceful');
      setWeather('sunny');
      setDate(() => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      });
      setImageUrl(undefined);
      setShowAddForm(false);
    } catch (error) {
      console.error('일기 추가 중 에러:', error);
    }
  };

  // Filter lists
  const filteredDiaries = diaries.filter(item => {
    const textMatches = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const moodMatches = selectedMoodFilter === 'All' || item.mood === selectedMoodFilter;
    return textMatches && moodMatches;
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPwd === localStorage.getItem('haru_diary_pwd')) {
      setIsLocked(false);
      setPwdError(false);
      setInputPwd('');
    } else {
      setPwdError(true);
    }
  };

  const handleSetPwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.trim()) {
      localStorage.setItem('haru_diary_pwd', newPwd.trim());
      setShowSetupPwd(false);
      setNewPwd('');
    }
  };

  const handleClearPwd = () => {
    localStorage.removeItem('haru_diary_pwd');
    setShowSetupPwd(false);
    setNewPwd('');
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-12 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-neutral-400" />
        </div>
        <h2 className="text-[16px] font-semibold text-neutral-800 mb-2">일기장 잠금</h2>
        <p className="text-[13px] text-neutral-500 mb-8 text-center">비밀번호를 입력하여 일기를 열어보세요.</p>
        
        <form onSubmit={handleUnlock} className="w-full">
          <input
            type="password"
            value={inputPwd}
            onChange={(e) => {
              setInputPwd(e.target.value);
              setPwdError(false);
            }}
            placeholder="비밀번호 입력"
            className={`w-full px-4 py-3 bg-neutral-50 border ${pwdError ? 'border-red-300' : 'border-neutral-100'} rounded-[12px] focus:outline-hidden mb-4 text-[14px] text-center tracking-widest`}
            autoFocus
          />
          {pwdError && (
            <p className="text-[11px] text-red-500 text-center mb-4 mt(-2)">비밀번호가 일치하지 않습니다.</p>
          )}
          <button 
            type="submit"
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-[12px] text-[13px] font-medium transition-colors cursor-pointer"
          >
            잠금 해제
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-800 font-light relative">
      <div className="flex justify-between items-center">
        <h2 className="text-[14px] font-semibold text-neutral-800">일기</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 h-8 px-3 bg-neutral-50 hover:bg-neutral-200 text-neutral-800 rounded text-[12px] font-medium cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
          <button
            onClick={() => setShowSetupPwd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-neutral-500 hover:bg-white hover:shadow-sm cursor-pointer transition-all"
          >
            {localStorage.getItem('haru_diary_pwd') ? (
              <><Lock className="h-3.5 w-3.5" /> 잠금 변경</>
            ) : (
              <><Unlock className="h-3.5 w-3.5" /> 잠금 설정</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
        {/* Editor (7 columns) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-12 space-y-4 overflow-hidden"
            >
              <div className="rounded-[20px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100">

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">날짜</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-100 rounded focus:outline-hidden text-[13px] text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">날씨</label>
                  <div className="flex gap-1">
                    {(Object.keys(weatherIcons) as DiaryEntry['weather'][]).map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWeather(w)}
                        className={`px-2 py-1.5 rounded border text-[14px] cursor-pointer transition-colors flex-1 text-center ${
                          weather === w ? 'bg-neutral-50 border-neutral-500 text-neutral-800' : 'bg-transparent border-transparent text-neutral-500 hover:bg-white'
                        }`}
                      >
                        {weatherIcons[w!]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mood Select */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-400 mb-1">감정</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(moodIcons) as DiaryEntry['mood'][]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-1.5 rounded border text-[13px] font-medium cursor-pointer transition-colors flex flex-col items-center gap-0.5 ${
                        mood === m ? 'bg-neutral-50 border-neutral-500 text-neutral-800' : 'bg-transparent border-neutral-100 text-neutral-500 hover:bg-white hover:text-neutral-800'
                      }`}
                    >
                      <span>{moodIcons[m]}</span>
                      <span className="text-[10px]">{moodLabels[m]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-400 mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="오늘의 한 줄 요약"
                  className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 placeholder:text-neutral-500 text-neutral-800"
                  required
                />
              </div>

              {/* Content Box */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[12px] font-medium text-neutral-400">내용</label>
                  <span className="text-[11px] text-neutral-500">{content.length} 자</span>
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="오늘 어떤 일들이 있었나요?"
                  className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 placeholder:text-neutral-500 text-neutral-800 min-h-[140px] resize-none"
                  required
                />
                
                {/* Image Upload Area */}
                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  {imageUrl ? (
                    <div className="relative inline-block">
                      <img src={imageUrl} alt="Diary attachment" className="h-20 w-auto object-cover rounded-md border border-neutral-200" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-neutral-200 text-neutral-500 hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded border border-neutral-100 transition-colors cursor-pointer w-fit"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      사진 추가
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 rounded text-[12px] font-medium cursor-pointer transition-colors"
                >
                  기록 저장
                </button>
              </div>
            </form>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List (5 columns) */}
        <div className="lg:col-span-12 space-y-4">
          <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden placeholder:text-neutral-500 text-neutral-800"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedMoodFilter('All')}
                className={`px-2 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedMoodFilter === 'All' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-white hover:text-neutral-800'
                }`}
              >
                전체
              </button>
              {Object.keys(moodIcons).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMoodFilter(m)}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedMoodFilter === m ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-white hover:text-neutral-800'
                  }`}
                >
                  {moodIcons[m as DiaryEntry['mood']]} {moodLabels[m as DiaryEntry['mood']]}
                </button>
              ))}
            </div>
          </div>

          {/* Diary entries stack */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredDiaries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-md border border-neutral-100">
                <Calendar className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-[13px] font-medium text-neutral-400">결과가 없습니다.</p>
              </div>
            ) : (
              filteredDiaries.map(diary => (
                <div
                  key={diary.id}
                  onClick={() => setActiveDiary(diary)}
                  className="rounded-md border border-neutral-100 bg-white p-4 hover:border-neutral-500 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px]">{moodIcons[diary.mood]}</span>
                      <span className="text-[12px] text-neutral-400 font-medium">{diary.date}</span>
                      {diary.weather && <span className="text-[12px]">{weatherIcons[diary.weather]}</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDiary(diary.id);
                      }}
                      className="p-1 text-neutral-500 hover:text-red-400 hover:bg-white rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[14px] font-semibold text-neutral-800 group-hover:text-neutral-800 transition-colors">
                      {diary.title}
                    </h4>
                    {diary.imageUrl && (
                      <div className="mt-2 mb-1 w-full h-32 overflow-hidden rounded-md border border-neutral-100">
                        <img src={diary.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-[13px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {diary.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Diary Detail Modal Viewer */}
      <AnimatePresence>
        {activeDiary && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">{moodIcons[activeDiary.mood]}</span>
                  <div>
                    <span className="text-[12px] font-medium text-neutral-400 block">{activeDiary.date}</span>
                    <span className="text-[12px] font-medium text-neutral-700 block">{moodLabels[activeDiary.mood]}</span>
                  </div>
                  {activeDiary.weather && (
                    <span className="text-[12px] bg-white border border-neutral-100 px-1.5 py-0.5 rounded text-neutral-400">
                      {weatherIcons[activeDiary.weather]} 날씨
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveDiary(null)}
                  className="text-neutral-500 hover:text-neutral-800 cursor-pointer text-[12px] font-medium"
                >
                  닫기
                </button>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <h3 className="text-[15px] font-semibold text-neutral-800">{activeDiary.title}</h3>
                {activeDiary.imageUrl && (
                  <div className="w-full max-h-64 overflow-hidden rounded-md border border-neutral-100 flex items-center justify-center bg-neutral-50">
                    <img src={activeDiary.imageUrl} alt="" className="max-w-full max-h-64 object-contain" />
                  </div>
                )}
                <p className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap py-2 font-medium bg-white p-4 rounded border border-neutral-100">
                  {activeDiary.content}
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setActiveDiary(null)}
                  className="px-4 py-1.5 text-[12px] font-medium bg-white text-black hover:bg-neutral-200 rounded cursor-pointer transition-colors"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Setup Modal */}
      <AnimatePresence>
        {showSetupPwd && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center">
                    <Key className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-neutral-800">잠금 설정</h3>
                    <p className="text-[12px] text-neutral-400 mt-1">일기를 안전하게 보호할 비밀번호를 설정하세요.</p>
                  </div>
                </div>

                <form onSubmit={handleSetPwd}>
                  <input
                    type="text"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-[12px] focus:outline-hidden mb-6 text-[14px] tracking-wider"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSetupPwd(false)}
                      className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-[12px] text-[13px] font-medium transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                    {localStorage.getItem('haru_diary_pwd') && (
                      <button
                        type="button"
                        onClick={handleClearPwd}
                        className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-[12px] text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        잠금 해제
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!newPwd.trim()}
                      className="flex-1 py-2.5 px-4 bg-[#8b7355] hover:bg-[#7a6548] text-white rounded-[12px] text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      설정하기
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
