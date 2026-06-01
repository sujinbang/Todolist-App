export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  routineId?: string; // 루틴에서 생성된 할일인 경우
  isFromRoutine?: boolean; // 루틴 자동 생성 여부
}

export interface Routine {
  id: string;
  title: string;
  category: string;
  cyclePeriod?: 'daily' | 'weekly' | 'monthly';
  monthlyDay?: number;
  frequency: ('Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun')[];
  isActive: boolean;
  priority?: 'low' | 'medium' | 'high'; // 루틴의 기본 우선순위
  isManual?: boolean; // 수동 추가 모드 (비활성 루틴 여부)
}

export interface BookLog {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'completed' | 'wishlist';
  startDate: string;
  endDate?: string;
  review?: string;
  color: string; // Tailwind hex or class name for minimalist book jackets
  imageUrls?: string[]; // 책 사진 여러 장
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'happy' | 'peaceful' | 'neutral' | 'sad' | 'tired' | 'stressed';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  imageUrl?: string;    // 하위 호환용 (기존 데이터)
  imageUrls?: string[]; // 여러 장 사진
}
