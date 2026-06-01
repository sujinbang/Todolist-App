import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Award, 
  Star, 
  Book, 
  ChevronRight, 
  ChevronLeft,
  Edit3,
  Check,
  Search,
  BookMarked,
  ImagePlus,
  X
} from 'lucide-react';
import { BookLog } from '../types';

interface ReadingLogProps {
  bLogs: BookLog[];
  onAddBook: (book: Omit<BookLog, 'id'>) => void;
  onUpdateProgress: (id: string, currentPage: number, status: BookLog['status'], review?: string) => void;
  onDeleteBook: (id: string) => void;
}

const jacketColors = [
  'bg-gradient-to-br from-indigo-500 to-indigo-700',
  'bg-gradient-to-br from-rose-500 to-rose-700',
  'bg-gradient-to-br from-emerald-500 to-emerald-700',
  'bg-gradient-to-br from-amber-500 to-amber-700',
  'bg-gradient-to-br from-cyan-500 to-cyan-700',
  'bg-gradient-to-br from-violet-500 to-violet-700',
  'bg-gradient-to-br from-slate-600 to-slate-800'
];

export default function ReadingLog({ bLogs, onAddBook, onUpdateProgress, onDeleteBook }: ReadingLogProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<BookLog | null>(null);
  const [viewingReviewBook, setViewingReviewBook] = React.useState<BookLog | null>(null);

  // Add Book inputs
  const [title, setTitle] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [totalPages, setTotalPages] = React.useState(250);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [status, setStatus] = React.useState<BookLog['status']>('reading');
  const [review, setReview] = React.useState('');
  const [addImageUrls, setAddImageUrls] = React.useState<string[]>([]);
  const addFileInputRef = React.useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'All' | 'reading' | 'completed' | 'wishlist'>('All');

  // Editing Book inputs (for progress modal)
  const [editCurrentPage, setEditCurrentPage] = React.useState(0);
  const [editReview, setEditReview] = React.useState('');
  const [editImageUrls, setEditImageUrls] = React.useState<string[]>([]);
  const [editImgIdx, setEditImgIdx] = React.useState(0);
  const editFileInputRef = React.useRef<HTMLInputElement>(null);

  // 공통 이미지 업로드 함수
  const uploadImages = (
    files: FileList | null,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    ref: React.RefObject<HTMLInputElement>
  ) => {
    if (!files) return;
    const arr: File[] = Array.from(files);
    const remaining = 10 - current.length;
    if (remaining <= 0) { alert('사진은 최대 10장까지 추가할 수 있습니다.'); return; }
    const valid = arr.slice(0, remaining).filter(f => {
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}은 5MB를 초과합니다.`); return false; }
      return true;
    });
    Promise.all(valid.map(f => new Promise<string>(res => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.readAsDataURL(f);
    }))).then(results => setter(prev => [...prev, ...results]));
    if (ref.current) ref.current.value = '';
  };

  // 책 이미지 배열 반환 (하위 호환)
  const getBookImages = (b: BookLog): string[] => {
    if (b.imageUrls && b.imageUrls.length > 0) return b.imageUrls;
    return [];
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const randomColor = jacketColors[Math.floor(Math.random() * jacketColors.length)];

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      totalPages: Math.max(1, totalPages),
      currentPage: status === 'completed' ? totalPages : Math.min(currentPage, totalPages),
      status,
      review: review.trim() || undefined,
      startDate: (() => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      })(),
      color: randomColor,
      imageUrls: addImageUrls.length > 0 ? addImageUrls : undefined,
    });

    // Reset fields
    setTitle('');
    setAuthor('');
    setTotalPages(250);
    setCurrentPage(0);
    setStatus('reading');
    setReview('');
    setAddImageUrls([]);
    setShowAddForm(false);
  };

  const handleOpenEdit = (book: BookLog) => {
    setSelectedBook(book);
    setEditCurrentPage(book.currentPage);
    setEditReview(book.review || '');
    setEditImageUrls(book.imageUrls || []);
    setEditImgIdx(0);
  };

  const handleSaveEdit = () => {
    if (!selectedBook) return;
    const finalPage = Math.min(editCurrentPage, selectedBook.totalPages);
    let finalStatus: BookLog['status'] = selectedBook.status;
    
    if (finalPage >= selectedBook.totalPages) {
      finalStatus = 'completed';
    } else if (finalPage > 0 && (selectedBook.status === 'wishlist' || selectedBook.status === 'completed')) {
      finalStatus = 'reading';
    } else if (finalPage === 0 && selectedBook.status === 'completed') {
      finalStatus = 'reading';
    }

    onUpdateProgress(selectedBook.id, finalPage, finalStatus, editReview.trim());
    setSelectedBook(null);
  };

  // Filter books list
  const filteredBooks = bLogs.filter(book => {
    const textMatches = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatches = filterType === 'All' || book.status === filterType;
    return textMatches && typeMatches;
  });

  return (
    <div className="space-y-6 text-neutral-800">
      {/* Tab Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[14px] font-semibold text-neutral-800">독서 기록</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 h-8 px-3 bg-neutral-50 hover:bg-neutral-200 text-neutral-800 rounded text-[12px] font-medium cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      {/* Form Overlay (Modal-like card) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-md border border-neutral-100 bg-white p-5 shadow-sm overflow-hidden"
          >
            <h3 className="font-semibold text-neutral-800 mb-4 text-[13px]">새 도서</h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="데미안"
                    className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">저자</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="헤르만 헤세"
                    className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-1">총 페이지</label>
                    <input
                      type="number"
                      value={totalPages}
                      onChange={e => setTotalPages(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-1">현재 페이지</label>
                    <input
                      type="number"
                      value={currentPage}
                      onChange={e => setCurrentPage(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                      min={0}
                      disabled={status === 'wishlist' || status === 'completed'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-neutral-400 mb-1">상태</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as BookLog['status'])}
                      className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800"
                    >
                      <option value="reading" className="bg-white text-neutral-800">📖 읽는 중</option>
                      <option value="completed" className="bg-white text-neutral-800">✨ 완독</option>
                      <option value="wishlist" className="bg-white text-neutral-800">📝 위시</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">메모</label>
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="짧은 평을 적어보세요"
                    className="w-full px-3 py-2 text-[13px] bg-white border border-neutral-100 rounded focus:outline-hidden focus:border-neutral-500 text-neutral-800 placeholder:text-neutral-500 min-h-[85px] resize-none"
                  />
                </div>

                {/* 사진 추가 */}
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">사진</label>
                  <input type="file" accept="image/*" multiple className="hidden" ref={addFileInputRef}
                    onChange={e => uploadImages(e.target.files, addImageUrls, setAddImageUrls, addFileInputRef)} />
                  {addImageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {addImageUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`사진 ${idx+1}`} className="h-14 w-14 object-cover rounded border border-neutral-200" />
                          <button type="button" onClick={() => setAddImageUrls(p => p.filter((_,i) => i!==idx))}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow border border-neutral-200 text-neutral-500 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {addImageUrls.length < 10 && (
                    <button type="button" onClick={() => addFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded border border-neutral-100 transition-colors cursor-pointer w-fit">
                      <ImagePlus className="h-3 w-3" />
                      사진 추가 {addImageUrls.length > 0 && <span className="text-neutral-400">({addImageUrls.length}/10)</span>}
                    </button>
                  )}
                </div>

                <div className="flex gap-2 mt-4 md:mt-0 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-[12px] font-medium text-neutral-400 hover:text-neutral-800 rounded transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-[12px] font-medium bg-white text-black hover:bg-neutral-200 rounded cursor-pointer transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Shelf Section */}
      <div className="space-y-4">
        {/* Shelf Sub Header & Search filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-md bg-white border border-neutral-100">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'All' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              전체 ({bLogs.length})
            </button>
            <button
              onClick={() => setFilterType('reading')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'reading' ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              읽는 중 ({bLogs.filter(b => b.status === 'reading').length})
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'completed' ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-400 hover:bg-neutral-50'
              }`}
            >
              완독한 책 ({bLogs.filter(b => b.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterType('wishlist')}
              className={`px-3 py-1.5 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'wishlist' ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-400 hover:bg-neutral-50'
              }`}
            >
              위시리스트 ({bLogs.filter(b => b.status === 'wishlist').length})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-800/30" />
            <input
              type="text"
              placeholder="제목, 작가 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-100 rounded-lg focus:outline-hidden focus:border-white/30 text-neutral-800 placeholder:text-neutral-800/20 font-medium"
            />
          </div>
        </div>

        {/* Book Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-md border border-neutral-100">
            <BookOpen className="h-8 w-8 text-neutral-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-400">등록된 도서가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map(book => {
                const percent = Math.round((book.currentPage / book.totalPages) * 100) || 0;
                return (
                  <motion.div
                    key={book.id}
                    layoutId={`book-card-${book.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-sm border border-neutral-100 bg-white p-4 flex flex-col"
                  >
                    <div className="flex gap-4 items-start flex-1">
                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1 mb-0.5">
                          <h4 className="font-medium text-neutral-800 text-[13px] truncate">
                            {book.title}
                          </h4>
                        </div>
                        <p className="text-[12px] text-neutral-500 mb-2 truncate">
                          {book.author}
                        </p>

                        {/* 사진 썸네일 */}
                        {(() => {
                          const imgs = getBookImages(book);
                          return imgs.length > 0 ? (
                            <div className="mb-2 flex gap-1.5 overflow-x-auto">
                              {imgs.slice(0, 3).map((url, idx) => (
                                <div key={idx} className="relative shrink-0">
                                  <img src={url} alt="" className="h-14 w-14 object-cover rounded border border-neutral-100" />
                                  {idx === 2 && imgs.length > 3 && (
                                    <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center text-white text-[10px] font-bold">+{imgs.length-3}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null;
                        })()}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            book.status === 'completed' ? 'bg-neutral-100 text-neutral-700' :
                            book.status === 'reading' ? 'bg-neutral-50 text-neutral-800' :
                            'bg-neutral-100 text-neutral-500'
                          }`}>
                            {book.status === 'completed' ? '✨ 마침' : 
                             book.status === 'reading' ? '📖 읽는 중' : '📝 위시'}
                          </span>
                        </div>

                        {/* Page Count statistics */}
                        {book.status !== 'wishlist' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-neutral-500">
                              <span>진도</span>
                              <span>{book.currentPage} / {book.totalPages} p</span>
                            </div>
                            <div className="h-[3px] bg-neutral-50 rounded-full overflow-hidden">
                              <div className="h-full bg-neutral-400" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {book.review && (
                      <div 
                        onClick={() => setViewingReviewBook(book)}
                        className="mt-3 p-2.5 rounded-[12px] bg-neutral-50 hover:bg-neutral-100/70 text-[11px] text-neutral-500 line-clamp-2 cursor-pointer transition-colors border border-transparent hover:border-neutral-100"
                        title="기록 전체 보기"
                      >
                        “ {book.review} ”
                      </div>
                    )}

                    {/* Footer menu buttons */}
                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-neutral-100">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-800 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        기록 기록/수정
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-1 hover:bg-neutral-50 rounded text-neutral-500 hover:text-red-400 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Progress Modifier Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div>
                <span className="text-[11px] font-medium text-neutral-400 block mb-0.5">상태 기록</span>
                <h3 className="text-[14px] font-semibold text-neutral-800 truncate">"{selectedBook.title}"</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">
                    현재 페이지 (최대 {selectedBook.totalPages}p)
                  </label>
                  <input
                    type="number"
                    value={editCurrentPage}
                    onChange={e => setEditCurrentPage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-neutral-100 rounded focus:outline-hidden text-[13px] text-neutral-800"
                    max={selectedBook.totalPages}
                    min={0}
                  />
                  <div className="h-[2px] bg-neutral-50 rounded mt-2">
                    <div 
                      className="h-full bg-neutral-400 rounded" 
                      style={{ width: `${Math.min(100, Math.round((editCurrentPage / selectedBook.totalPages) * 100))}%` }} 
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedBook.totalPages === editCurrentPage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-neutral-100 text-neutral-700 p-2.5 rounded text-[12px] font-medium mt-2 flex items-center gap-2">
                        <span>🎉 완독을 축하합니다!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1">메모</label>
                  <textarea
                    value={editReview}
                    onChange={e => setEditReview(e.target.value)}
                    placeholder="짧은 코멘트를 남겨주세요."
                    className="w-full px-3 py-2 bg-white border border-neutral-100 rounded text-[13px] min-h-[80px] resize-none focus:outline-hidden placeholder:text-neutral-500 text-neutral-800"
                  />
                </div>

                {/* 사진 추가/수정 */}
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-1.5">사진</label>
                  <input type="file" accept="image/*" multiple className="hidden" ref={editFileInputRef}
                    onChange={e => uploadImages(e.target.files, editImageUrls, setEditImageUrls, editFileInputRef)} />
                  {editImageUrls.length > 0 && (
                    <div className="space-y-2 mb-2">
                      <div className="relative w-full rounded-md border border-neutral-100 overflow-hidden bg-neutral-50 flex items-center justify-center" style={{minHeight:'120px', maxHeight:'180px'}}>
                        <img src={editImageUrls[editImgIdx]} alt="" className="max-w-full max-h-[180px] object-contain" />
                        {editImageUrls.length > 1 && (
                          <>
                            <button type="button" onClick={() => setEditImgIdx(i => Math.max(0,i-1))} disabled={editImgIdx===0}
                              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-0.5 shadow border border-neutral-100 disabled:opacity-30 cursor-pointer">
                              <ChevronLeft className="h-3 w-3 text-neutral-700" />
                            </button>
                            <button type="button" onClick={() => setEditImgIdx(i => Math.min(editImageUrls.length-1,i+1))} disabled={editImgIdx===editImageUrls.length-1}
                              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-0.5 shadow border border-neutral-100 disabled:opacity-30 cursor-pointer">
                              <ChevronRight className="h-3 w-3 text-neutral-700" />
                            </button>
                            <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] px-1 py-0.5 rounded-full">{editImgIdx+1}/{editImageUrls.length}</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {editImageUrls.map((url, idx) => (
                          <div key={idx} className="relative shrink-0 group">
                            <button type="button" onClick={() => setEditImgIdx(idx)}
                              className={`h-10 w-10 rounded border-2 overflow-hidden cursor-pointer ${idx===editImgIdx?'border-neutral-600':'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                            <button type="button" onClick={() => { setEditImageUrls(p=>p.filter((_,i)=>i!==idx)); setEditImgIdx(i=>Math.max(0,Math.min(i,editImageUrls.length-2))); }}
                              className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow border border-neutral-200 text-neutral-500 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {editImageUrls.length < 10 && (
                    <button type="button" onClick={() => editFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded border border-neutral-100 transition-colors cursor-pointer w-fit">
                      <ImagePlus className="h-3 w-3" />
                      사진 추가 {editImageUrls.length > 0 && <span className="text-neutral-400">({editImageUrls.length}/10)</span>}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-3 py-1.5 text-[12px] font-medium text-neutral-400 hover:text-neutral-800 rounded transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-[12px] font-medium bg-white text-black hover:bg-neutral-200 rounded cursor-pointer transition-colors"
                >
                  기록 저장
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Viewer Modal */}
      <AnimatePresence>
        {viewingReviewBook && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 pb-[80px] sm:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-5 text-neutral-800"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#9fbb9f] tracking-wider uppercase">독서 기록 감상</span>
                  <h3 className="text-[15px] font-semibold text-neutral-800 leading-tight truncate max-w-[200px]" title={viewingReviewBook.title}>
                    {viewingReviewBook.title}
                  </h3>
                  <p className="text-[12px] text-neutral-400 font-light truncate max-w-[200px]" title={viewingReviewBook.author}>{viewingReviewBook.author}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                  viewingReviewBook.status === 'completed' ? 'bg-[#d5e0d8] text-neutral-700' :
                  viewingReviewBook.status === 'reading' ? 'bg-neutral-50 text-neutral-600' :
                  'bg-neutral-100 text-neutral-500'
                }`}>
                  {viewingReviewBook.status === 'completed' ? '✨ 완독' : 
                   viewingReviewBook.status === 'reading' ? '📖 읽는 중' : '📝 위시'}
                </span>
              </div>

              {viewingReviewBook.status !== 'wishlist' && (
                <div className="p-3 bg-[#faf9f7] rounded-[12px] text-[11px] text-neutral-500 space-y-1 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-400">읽은 페이지: </span>
                    <span className="font-medium text-neutral-700">{viewingReviewBook.currentPage} / {viewingReviewBook.totalPages}p</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-white border border-neutral-100 rounded-full">
                    {Math.round((viewingReviewBook.currentPage / viewingReviewBook.totalPages) * 100) || 0}% 완료
                  </span>
                </div>
              )}

              <div className="border-t border-neutral-100 pt-4">
                <label className="block text-[11px] font-semibold text-neutral-400 tracking-wide uppercase mb-2">남긴 기록/메모</label>
                <div className="bg-neutral-50/50 border border-neutral-100 rounded-[16px] p-4 text-[13px] text-neutral-600 leading-relaxed font-light whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                  {viewingReviewBook.review}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingReviewBook(null)}
                  className="h-9 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[12px] text-[12px] font-medium transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
