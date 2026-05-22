import { useEffect } from 'react';
import { Routine, Todo } from './types';

/**
 * 루틴이 오늘 실행되어야 하는지 확인
 */
export function shouldRunToday(routine: Routine): boolean {
  if (!routine.isActive) return false;

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
 * 루틴 기반 할일 자동 생성 Hook
 */
export function useRoutineTodos(
  routines: Routine[],
  todos: Todo[],
  onAddTodo: (todo: Omit<Todo, 'id' | 'completed'>) => void
) {
  useEffect(() => {
    const today = getTodayString();

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
        console.log(`루틴 "${routine.title}"에서 오늘의 할일 생성`);
        onAddTodo({
          text: routine.title,
          category: routine.category,
          priority: 'medium',
          dueDate: today,
          routineId: routine.id,
          isFromRoutine: true,
        });
      }
    });
  }, [routines, todos, onAddTodo]);
}
