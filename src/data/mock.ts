import { Home, MapPin, MessageCircle, User, Users } from "lucide-react";

type TabKey = "home" | "life" | "map" | "chat" | "me";

const TABS: Array<{ key: TabKey; label: string; icon: any }> = [
  { key: "home", label: "홈", icon: Home },
  { key: "life", label: "동네생활", icon: Users },
  { key: "map", label: "동네지도", icon: MapPin },
  { key: "chat", label: "채팅", icon: MessageCircle },
  { key: "me", label: "나의 당근", icon: User },
];

export type { TabKey };
export { TABS };

// Map tab mock meetings
export type MapMeeting = {
  id: number;
  title: string;
  location: string;
  distanceKm: number;
  time: string;
  participants: string;
  weather: string;
  tags: string[];
  host: string;
  hostRating: number;
  aiScore: number;
  aiReason: string;
  ageGroup: string;
};

export const mapMeetings: MapMeeting[] = [
  {
    id: 1,
    title: "보라매공원 점심 경도",
    location: "보라매공원",
    distanceKm: 0.8,
    time: "오늘 낮 12시",
    participants: "10/15명",
    weather: "19°C",
    tags: ["점심", "#짧은시간", "#직장인"],
    host: "점심러너",
    hostRating: 4.9,
    aiScore: 92,
    aiReason: "근처 + 시간대/활동성 선호와 일치",
    ageGroup: "20-30대",
  },
  {
    id: 2,
    title: "보라매공원 러닝 (5K)",
    location: "보라매공원",
    distanceKm: 0.6,
    time: "오늘 저녁 8시",
    participants: "8/12명",
    weather: "17°C",
    tags: ["러닝", "#초보환영", "#페이스맞춤"],
    host: "러닝메이트",
    hostRating: 4.8,
    aiScore: 88,
    aiReason: "최근 참여 기록과 유사한 강도",
    ageGroup: "20-40대",
  },
  {
    id: 3,
    title: "신대방역 근처 커피 산책",
    location: "신대방역",
    distanceKm: 1.2,
    time: "내일 오후 3시",
    participants: "4/8명",
    weather: "18°C",
    tags: ["산책", "#카페", "#수다"],
    host: "동네친구",
    hostRating: 4.6,
    aiScore: 73,
    aiReason: "대화 선호는 맞지만 거리 약간 멂",
    ageGroup: "20-30대",
  },
  {
    id: 4,
    title: "보라매공원 계단훈련",
    location: "보라매공원 북측",
    distanceKm: 0.9,
    time: "내일 오전 7시",
    participants: "6/12명",
    weather: "14°C",
    tags: ["운동", "#근력", "#아침"],
    host: "스텝업",
    hostRating: 4.7,
    aiScore: 84,
    aiReason: "활동성 높음 유형에 적합",
    ageGroup: "20-30대",
  },
  {
    id: 5,
    title: "보라매공원 야간 러닝",
    location: "보라매공원 남측",
    distanceKm: 0.7,
    time: "금요일 밤 9시",
    participants: "11/15명",
    weather: "16°C",
    tags: ["러닝", "#야간", "#안전"],
    host: "나이트러너",
    hostRating: 4.9,
    aiScore: 90,
    aiReason: "선호 시간대 + 안전 태그",
    ageGroup: "20-40대",
  },
];

export type MapChipKey =
  | "deal"
  | "food"
  | "sport"
  | "beauty"
  | "mission"
  | "gyeongdo"
  | "more";

export type MapChip = { key: MapChipKey; label: string; emoji: string };

export const mapChips: MapChip[] = [
  { key: "deal", label: "할인중", emoji: "％" },
  { key: "food", label: "음식점", emoji: "🍴" },
  { key: "sport", label: "운동", emoji: "🏃" },
  { key: "beauty", label: "뷰티", emoji: "💇" },
  { key: "mission", label: "혜택미션", emoji: "🎁" },
  { key: "gyeongdo", label: "경도", emoji: "⚡" },
  { key: "more", label: "더보기", emoji: "⋯" },
];
