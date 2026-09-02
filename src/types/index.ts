// 球場資料類型
export interface Court {
  id: number;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    city: string; // 城市
    district?: string; // 行政區
  };
  type: 'indoor' | 'outdoor' | 'covered'; // covered = 風雨球場
  fee: 'free' | 'paid';
  price: string;
  price_details?: {
    weekday?: string; // 平日價格
    weekend?: string; // 假日價格
    peak?: string; // 尖峰時段
    offpeak?: string; // 離峰時段
    rental?: string; // 球具租借
    membership?: string; // 會員費用
  };
  courts_count: number;
  surface?: 'concrete' | 'wood' | 'synthetic' | 'acrylic' | 'grass'; // 場地材質
  net_type?: 'permanent' | 'portable' | 'self' | 'provided'; // 球網類型
  ownership: 'public' | 'private' | 'school' | 'community'; // 經營類型
  opening_hours: string;
  opening_details?: {
    weekday?: string;
    weekend?: string;
    holiday?: string;
    special_notes?: string;
  };
  contact: string;
  contact_details?: {
    phone?: string;
    email?: string;
    line?: string;
    instagram?: string;
    facebook?: string;
  };
  facilities: string[];
  features?: string[]; // 球場特色
  line_group?: string;
  booking_url?: string;
  booking_method?: string;
  website?: string;
  reviews?: string;
  rating?: number; // 1-5 評分
  is_new?: boolean; // 是否為新球場（近半年內開放）
  added_date?: string; // 加入日期
  last_updated?: string; // 最後更新日期
  images?: string[]; // 球場照片
  google_maps_url?: string; // Google Maps 連結
  navigation_tips?: string; // 導航提示

  // 運動部「全國運動場館資訊網 iPlay」官方場館資料
  // 授權：政府網站資料開放宣告（無償、可再授權，使用須註明出處）
  iplay?: {
    venue: string; // iPlay 上的正式場館名稱
    authority?: string; // 隸屬機關
    operator?: string; // 實際管理／營運單位
    tel?: string; // 官方電話（含分機）
    website?: string; // 官方網站
    park?: string; // 停車場種類
    open_condition?: string; // 開放條件（免費／付費／不對外開放）
    open_days?: string; // 開放日，如「一二三四五六日」
    rent?: string; // 場地租借狀態
    verified: string; // 本站對照該筆資料的日期
    note?: string; // 資料適用範圍的補充說明
    address?: string; // 官方登記地址（與本站 location.address 並存供對照）
    gym_id?: number; // iPlay 場館編號
    page?: string; // iPlay 場館頁網址
    transit?: string; // 大眾運輸抵達方式（含步行分鐘數）
    indoor_outdoor?: string; // 室內／室外／半室內
    lighting?: boolean; // 夜間照明
    air_conditioning?: boolean; // 空調
    open_time?: string; // 官方登記開放時間
    photos?: {
      src: string; // 本站鏡像路徑（依授權重製，須標示出處）
      caption: string; // iPlay 登記的設施名稱
      taken: string; // 照片上傳年月，YYYY-MM
      width: number;
      height: number;
    }[];
  };
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
