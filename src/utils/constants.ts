// 球場尺寸常數（英尺）
export const COURT_DIMENSIONS = {
  WIDTH: 20, // 英尺
  LENGTH: 44, // 英尺
  NON_VOLLEY_ZONE: 7, // 非截擊區（廚房區）深度
  SERVICE_AREA_WIDTH: 10, // 發球區寬度
};

// 學習路徑類型
export const LEARNING_PATHS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// 頁面路由
export const ROUTES = {
  HOME: '/',
  LEARNING: '/learning',
  COURTS: '/courts',
  ABOUT: '/about',
  RESOURCES: '/resources',
} as const;

// 球場類型
export const COURT_TYPES = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
} as const;

// 收費類型
export const FEE_TYPES = {
  FREE: 'free',
  PAID: 'paid',
} as const;

// 地圖預設中心點（台灣中心）
export const DEFAULT_MAP_CENTER = {
  lat: 24.0,
  lng: 121.0,
  zoom: 7,
} as const;
