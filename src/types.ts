export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface Routine {
  id: string;
  title: string;
  category: string;
  cyclePeriod?: 'daily' | 'weekly' | 'monthly';
  monthlyDay?: number;
  frequency: ('Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun')[];
  isActive: boolean;
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
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'happy' | 'peaceful' | 'neutral' | 'sad' | 'tired' | 'stressed';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  imageUrl?: string;
}
