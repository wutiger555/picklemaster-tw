// 球場資料類型
export interface Court {
  id: number;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  type: 'indoor' | 'outdoor';
  fee: 'free' | 'paid';
  price: string;
  courts_count: number;
  opening_hours: string;
  contact: string;
  facilities: string[];
  line_group?: string;
  booking_url?: string;
  website?: string;
}

// 球場資料回應
export interface CourtsData {
  courts: Court[];
}

// 學習課程
export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number; // 分鐘
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'rules' | 'techniques' | 'strategy' | 'practice';
  completed?: boolean;
}

// 學習路徑
export interface LearningPath {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  lessons: Lesson[];
  progress: number; // 0-100
}

// 使用者進度
export interface UserProgress {
  completedLessons: number[];
  currentPath: string;
  badges: string[];
  totalTime: number; // 分鐘
}
