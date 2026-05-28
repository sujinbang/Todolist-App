import { useEffect, useState, useCallback } from 'react';
import { Routine, Todo } from './types';

/**
 * 루틴이 오늘 실행되어야 하는지 확인
 */
export function shouldRunToday(routine: Routine): boolean {
  if (!routine.isActive) return false;
  if (routine.isManual) return false;

  const today = new Date();
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
  const dayOfMonth = today.getDate();

  switch (routine.cyclePeriod) {
    case 'daily':
      return true;

    case 'weekly':
      return routine.frequency.includes(dayOfWeek as any);

    case 'monthly':
      return routine.monthlyDay === dayOfMonth;

    default:
      // cyclePeriod가 없으면 weekly로 간주 (기존 데이터 호환)
      return routine.frequency.includes(dayOfWeek as any);
  }
}

/**
 * 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 자정까지 남은 시간 계산 (밀리초)
 */
function getTimeUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

/**
 * 루틴 기반 할일 자동 생성 Hook
 */
export function useRoutineTodos(
  routines: Routine[],
  todos: Todo[],
  onAddTodo: (todo: Omit<Todo, 'id' | 'completed'>) => void
) {
  const [currentDate, setCurrentDate] = useState(getTodayString());

  // 루틴 생성 로직
  const createRoutineTodos = useCallback(() => {
    const today = getTodayString();

    // 날짜가 바뀌었는지 확인
    if (today !== currentDate) {
      console.log(`날짜 변경 감지: ${currentDate} → ${today}`);
      setCurrentDate(today);
    }

    // 활성화된 루틴 중 오늘 실행되어야 하는 루틴 필터링
    const todaysRoutines = routines.filter(shouldRunToday);

    todaysRoutines.forEach(routine => {
      // 이미 오늘 생성된 할일이 있는지 확인
      const existingTodo = todos.find(
        todo =>
          todo.routineId === routine.id &&
          todo.dueDate === today
      );

      // 없으면 새로 생성
      if (!existingTodo) {
        console.log(`루틴 "${routine.title}"에서 ${today}의 할일 생성`);
        onAddTodo({
          text: routine.title,
          category: routine.category,
          priority: routine.priority || 'medium',
          dueDate: today,
          routineId: routine.id,
          isFromRoutine: true,
        });
      }
    });
  }, [routines, todos, onAddTodo, currentDate]);

  // 초기 실행 및 루틴/투두 변경 시 실행
  useEffect(() => {
    createRoutineTodos();
  }, [createRoutineTodos]);

  // 날짜 변경 감지: 자정에 자동으로 체크
  useEffect(() => {
    const scheduleNextCheck = () => {
      const timeUntilMidnight = getTimeUntilMidnight();

      console.log(`다음 루틴 체크: ${Math.round(timeUntilMidnight / 1000 / 60)}분 후 (자정)`);

      // 자정에 실행되도록 타이머 설정
      const timer = setTimeout(() => {
        console.log('자정 도달 - 루틴 체크 시작');
        createRoutineTodos();
        scheduleNextCheck(); // 다음날 자정을 위해 재설정
      }, timeUntilMidnight + 1000); // 자정 1초 후 실행

      return timer;
    };

    const timer = scheduleNextCheck();

    return () => {
      clearTimeout(timer);
    };
  }, [createRoutineTodos]);

  // 추가: 앱이 백그라운드에서 포그라운드로 돌아올 때도 체크
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('앱 활성화 - 루틴 체크');
        createRoutineTodos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [createRoutineTodos]);
}
