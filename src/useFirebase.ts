import { useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { Todo, BookLog, DiaryEntry, Routine } from './types';

export function useFirebase() {
  const [user, setUser] = useState<{ email: string; name: string; uid: string } | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [books, setBooks] = useState<BookLog[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('haru_categories');
    return saved ? JSON.parse(saved) : ['Work', 'Personal', 'Reading', 'Health', 'Other'];
  });

  useEffect(() => {
    localStorage.setItem('haru_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email && fbUser.displayName) {
        setUser({ email: fbUser.email, name: fbUser.displayName, uid: fbUser.uid });
      } else {
        setUser(null);
        setTodos([]);
        setRoutines([]);
        setBooks([]);
        setDiaries([]);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const todosQ = query(collection(db, 'users', user.uid, 'todos'), where('userId', '==', user.uid));
    const unsubTodos = onSnapshot(todosQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
      setTodos(data.sort((a, b) => b.id.localeCompare(a.id))); // sort by string id implicitly handles creation sort somewhat
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/{userId}/todos'));

    const routinesQ = query(collection(db, 'users', user.uid, 'routines'), where('userId', '==', user.uid));
    const unsubRoutines = onSnapshot(routinesQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
      setRoutines(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/{userId}/routines'));

    const booksQ = query(collection(db, 'users', user.uid, 'books'), where('userId', '==', user.uid));
    const unsubBooks = onSnapshot(booksQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookLog));
      setBooks(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/{userId}/books'));

    const diariesQ = query(collection(db, 'users', user.uid, 'diaries'), where('userId', '==', user.uid));
    const unsubDiaries = onSnapshot(diariesQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
      setDiaries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/{userId}/diaries'));

    return () => {
      unsubTodos();
      unsubRoutines();
      unsubBooks();
      unsubDiaries();
    };
  }, [user]);

  // Actions
  const handleAddTodo = async (newTodo: Omit<Todo, 'id'> & { completed?: boolean }) => {
    if (!user) return;
    const id = `t_${Date.now()}`;
    const docRef = doc(db, 'users', user.uid, 'todos', id);
    await setDoc(docRef, {
      completed: false,
      ...newTodo,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(e => handleFirestoreError(e, OperationType.CREATE, docRef.path));
  };
  const handleToggleTodo = async (id: string) => {
     if (!user) return;
     const currentTodo = todos.find(t => t.id === id);
     if (!currentTodo) return;
     const docRef = doc(db, 'users', user.uid, 'todos', id);
     await updateDoc(docRef, { completed: !currentTodo.completed, updatedAt: serverTimestamp() }).catch(e => handleFirestoreError(e, OperationType.UPDATE, docRef.path));
  };
  const handleDeleteTodo = async (id: string) => {
     if (!user) return;
     const docRef = doc(db, 'users', user.uid, 'todos', id);
     await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, docRef.path));
  };

  const handleAddBook = async (newBook: Omit<BookLog, 'id'>) => {
    if (!user) return;
    const id = `b_${Date.now()}`;
    const docRef = doc(db, 'users', user.uid, 'books', id);
    await setDoc(docRef, { ...newBook, userId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }).catch(e => handleFirestoreError(e, OperationType.CREATE, docRef.path));
  };
  const handleUpdateBookProgress = async (id: string, currentPage: number, status: BookLog['status'], review?: string, existing?: Partial<BookLog>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'books', id);
    const updates: any = { currentPage, status, review, updatedAt: serverTimestamp() };
    if (status === 'completed') updates.endDate = new Date().toISOString().split('T')[0];
    await updateDoc(docRef, updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, docRef.path));
  };
  const handleDeleteBook = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'books', id);
    await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, docRef.path));
  };

  const handleAddDiary = async (newDiary: Omit<DiaryEntry, 'id'>) => {
    if (!user) {
      console.error('일기 추가 실패: 사용자 없음');
      return;
    }

    const id = `d_${Date.now()}`;
    const docRef = doc(db, 'users', user.uid, 'diaries', id);

    // undefined 필드 제거 (Firebase는 undefined를 허용하지 않음)
    const diaryData: any = {
      date: newDiary.date,
      title: newDiary.title,
      content: newDiary.content,
      mood: newDiary.mood,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // weather와 imageUrl은 값이 있을 때만 추가
    if (newDiary.weather !== undefined && newDiary.weather !== null) {
      diaryData.weather = newDiary.weather;
    }
    if (newDiary.imageUrl !== undefined && newDiary.imageUrl !== null && newDiary.imageUrl.trim() !== '') {
      diaryData.imageUrl = newDiary.imageUrl;
    }

    console.log('Firebase에 저장할 일기 데이터:', diaryData);

    try {
      await setDoc(docRef, diaryData);
      console.log('일기 저장 성공!');
    } catch (error) {
      console.error('일기 저장 실패:', error);
      handleFirestoreError(error as Error, OperationType.CREATE, docRef.path);
      alert('일기 저장에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };
  const handleDeleteDiary = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'diaries', id);
    await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, docRef.path));
  };

  const handleAddRoutine = async (newRoutine: any) => {
    if (!user) {
      console.error('루틴 추가 실패: 사용자 없음');
      return;
    }

    const id = `r_${Date.now()}`;
    const docRef = doc(db, 'users', user.uid, 'routines', id);

    // undefined 필드 제거 (Firebase는 undefined를 허용하지 않음)
    const routineData: any = {
      title: newRoutine.title,
      category: newRoutine.category || 'Work',
      cyclePeriod: newRoutine.cyclePeriod || 'daily',
      frequency: newRoutine.frequency || [],
      isActive: newRoutine.isActive !== undefined ? newRoutine.isActive : true,
      priority: newRoutine.priority || 'medium',
      isManual: newRoutine.isManual !== undefined ? newRoutine.isManual : false,
      completedDays: newRoutine.completedDays || [],
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // monthlyDay는 값이 있을 때만 추가
    if (newRoutine.monthlyDay !== undefined && newRoutine.monthlyDay !== null) {
      routineData.monthlyDay = newRoutine.monthlyDay;
    }

    console.log('Firebase에 저장할 루틴 데이터:', routineData);

    try {
      await setDoc(docRef, routineData);
      console.log('루틴 저장 성공!');
    } catch (error) {
      console.error('루틴 저장 실패:', error);
      handleFirestoreError(error as Error, OperationType.CREATE, docRef.path);
      alert('루틴 저장에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };
  const handleUpdateRoutine = async (id: string, updates: any) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'routines', id);
    
    // undefined 필드 제거 (Firebase는 undefined 필드 저장을 허용하지 않음)
    const cleanUpdates: any = { updatedAt: serverTimestamp() };
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });

    await updateDoc(docRef, cleanUpdates).catch(e => handleFirestoreError(e, OperationType.UPDATE, docRef.path));
  };
  const handleDeleteRoutine = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'routines', id);
    await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, docRef.path));
  };

  return {
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
  };
}
