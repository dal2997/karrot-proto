import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Search,
  Sparkles,
  Users,
  X,
  CloudRain,
} from "lucide-react";

type MeetingItem = {
  id: number;
  title: string;
  desc: string;
  area: string;
  count: string;
  img: string;
  active?: string;
};

type PersonalizedMeeting = MeetingItem & {
  when: string;
  members: string;
  vibe: string;
  score: number;
  why: string;
  report: {
    carrotTradeFit: string;
    taste: string;
    carrotScore: string;
    ageBand: string;
    genderRatio: string;
    attendance: string;
    summary: string;

    successProbability: number; // 0~100
  };
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** 공용 바텀시트 모달 */
function Sheet({
  open,
  onClose,
  titleLeft,
  titleRight,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleLeft: React.ReactNode;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold leading-snug text-neutral-900">
                  {titleLeft}
                </div>
                {titleRight ? (
                  <div className="mt-1 text-sm font-bold text-neutral-500">
                    {titleRight}
                  </div>
                ) : null}
              </div>

              <button
                onClick={onClose}
                className="ml-3 rounded-xl p-2 text-neutral-600 hover:bg-neutral-100"
                aria-label="close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* body */}
            <div className="max-h-[72vh] overflow-auto px-5 py-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** 상단 동네 + 서브탭 */
function TopSubTabs({
  value,
  onChange,
}: {
  value: "life" | "meet" | "cafe";
  onChange: (v: "life" | "meet" | "cafe") => void;
}) {
  const tabs: Array<{ key: "life" | "meet" | "cafe"; label: string }> = [
    { key: "life", label: "동네생활" },
    { key: "meet", label: "모임" },
    { key: "cafe", label: "카페" },
  ];

  return (
    <div className="px-5 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-extrabold tracking-tight text-neutral-900">
          봉천동
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="bell"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm font-bold">
        {tabs.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "relative pb-2 text-neutral-500",
                active && "text-neutral-900"
              )}
            >
              {t.label}
              {active ? (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full bg-orange-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: string;
}) {
  return (
    <div className="px-5 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg font-extrabold text-neutral-900">
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 text-sm text-neutral-500">{subtitle}</div>
          ) : null}
        </div>
        {right ? (
          <button className="text-sm font-bold text-neutral-500 hover:text-neutral-700">
            {right}{" "}
            <ChevronRight className="inline h-4 w-4 -translate-y-[1px]" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** ✅ (1번) 공통 pill 스타일: 나랑x점 / 미니리포트 동일 사이즈 */
const PILL =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold leading-none ring-1";
const PILL_ICON =
  "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]";

/** “나랑 94점” 뱃지 정리 */
function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={`${PILL} bg-orange-50 text-orange-600 ring-orange-100`}
      title={`나랑 ${score}점`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>{`나랑 ${score}점`}</span>
    </div>
  );
}

function MetaLine({
  when,
  area,
  members,
}: {
  when: string;
  area: string;
  members: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-neutral-500">
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="h-4 w-4" />
        {when}
      </span>
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        {area}
      </span>
      <span className="inline-flex items-center gap-1">
        <Users className="h-4 w-4" />
        {members}
      </span>
    </div>
  );
}

/** TOP5 카드 */
function Top5Card({
  item,
  onOpenReport,
  onOpenDetail,
}: {
  item: PersonalizedMeeting;
  onOpenReport: () => void;
  onOpenDetail: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <div
      className="
        rounded-[28px] bg-white p-4
        ring-1 ring-neutral-200/80
        shadow-[0_8px_24px_rgba(0,0,0,0.06)]
        hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]
        transition-shadow
      "
    >
      <div className="flex gap-4">
        <img
          src={item.img}
          alt=""
          className="h-[72px] w-[72px] rounded-2xl object-cover ring-1 ring-neutral-200/70"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold text-neutral-900">
                {item.title}
              </div>
              <div className="mt-0.5 text-[13px] leading-snug text-neutral-600">
                {item.desc}
              </div>
            </div>

            {/* 오른쪽: 나랑X점(호버 팝오버) + 미니리포트 버튼 세로 스택 */}
            <div className="relative flex shrink-0 flex-col items-end gap-2">
              <div
                className="relative"
                onMouseEnter={() => setWhyOpen(true)}
                onMouseLeave={() => setWhyOpen(false)}
              >
                {/* ✅ 나랑 X점: 호버 트리거 */}
                <ScoreBadge score={item.score} />

                {/* ✅ 호버 팝오버(기존 '왜 나랑 맞을까' 내용 이쪽으로 이동) */}
                {whyOpen ? (
                  <div className="absolute right-0 top-[44px] z-20 w-[260px] rounded-2xl bg-white p-3 text-[12px] leading-relaxed text-neutral-700 shadow-xl ring-1 ring-neutral-200">
                    <div className="font-extrabold text-neutral-900">추천 이유</div>
                    <div className="mt-1">{item.why}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-neutral-50 px-2 py-1 text-[11px] font-bold text-neutral-600 ring-1 ring-neutral-200">
                        우천확률 반영
                      </span>
                      <span className="rounded-full bg-neutral-50 px-2 py-1 text-[11px] font-bold text-neutral-600 ring-1 ring-neutral-200">
                        활동 반경 유사
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ✅ 미니리포트: 나랑X점 바로 아래 */}
              <button
                onClick={onOpenReport}
                className={`${PILL} bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50`}
              >
                <span className={`${PILL_ICON} bg-neutral-100 text-neutral-700`}>
                  i
                </span>
                미니리포트
              </button>
            </div>
          </div>


          <MetaLine when={item.when} area={item.area} members={item.members} />

                    {/* ✅ 컴팩트: 기본은 얇게, hover/tap 시 팝오버로 '왜 나랑 맞을까' 노출 */}


          <div className="mt-3 flex gap-2">
            <button
              onClick={onOpenDetail}
              className="flex-1 rounded-2xl bg-neutral-900 px-3 py-3 text-sm font-extrabold text-white hover:bg-black"
            >
              모임 보기
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-extrabold text-neutral-800 hover:bg-neutral-50">
              <Heart className="h-5 w-5" />
              관심
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 신규/인기 리스트 행 */
function SimpleRow({ item, onClick }: { item: MeetingItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left hover:bg-neutral-50"
    >
      <img
        src={item.img}
        alt=""
        className="h-12 w-12 rounded-2xl object-cover ring-1 ring-neutral-200"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold text-neutral-900">
          {item.title}
        </div>
        <div className="mt-1 line-clamp-1 text-xs text-neutral-600">
          {item.desc}
        </div>
        <div className="mt-1 text-[11px] text-neutral-500">
          {item.area} · {item.count}
          {item.active ? ` · ${item.active}` : ""}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-neutral-300" />
    </button>
  );
}

/** 미니리포트 */
function GreenScorePill({ score }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[12px] font-extrabold text-white">
      <Sparkles className="h-4 w-4" />
      {`나랑 ${score}점`}
    </div>
  );
}

function SuccessChanceChip({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-[12px] font-extrabold text-emerald-800 ring-1 ring-emerald-100">
      <span className="text-emerald-700">성사 가능성</span>
      <span className="rounded-xl bg-white px-2 py-1 text-[12px] font-extrabold text-emerald-900 ring-1 ring-emerald-100">
        {value}%
      </span>
    </div>
  );
}


function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-3 ring-1 ring-neutral-200">
      <div className="text-[11px] font-extrabold text-neutral-500">{label}</div>
      <div className="mt-1 text-[14px] font-extrabold leading-snug text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function ExceptionModal({
  open,
  onClose,
  onSeeIndoor,
  onProceedAnyway,
}: {
  open: boolean;
  onClose: () => void;
  onSeeIndoor: () => void;
  onProceedAnyway: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="relative w-full max-w-[320px] overflow-hidden rounded-[22px] bg-white ring-1 ring-neutral-200 shadow-2xl"
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
                <CloudRain className="h-7 w-7 text-orange-500" />
              </div>

              <div className="mt-4 text-[16px] font-extrabold text-neutral-900">
                모임 취소 위험 알림
              </div>
              <div className="mt-2 text-[12px] leading-relaxed text-neutral-600">
                오늘 오후 소나기 예보가 있어요.
                <br />
                주변 실내 운동 공간이나 카페 모임으로 바꿔볼까요?
              </div>

              <button
                onClick={onSeeIndoor}
                className="mt-4 w-full rounded-2xl bg-orange-500 py-3 text-sm font-extrabold text-white hover:bg-orange-600"
              >
                실내 활동 보기
              </button>

              <button
                onClick={onProceedAnyway}
                className="mt-2 w-full rounded-2xl bg-white py-3 text-sm font-extrabold text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                그래도 참여
              </button>

              <button
                onClick={onClose}
                className="mt-2 w-full rounded-2xl bg-white py-3 text-sm font-extrabold text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}



/** ✅ 풀스크린 상세: 오버레이로 띄워서 BottomNav/TopAppBar 가리기 */
function MeetingDetailScreen({
  item,
  onBack,
  onProceedAnyway,
}: {
  item: PersonalizedMeeting;
  onBack: () => void;
  onProceedAnyway: (m: PersonalizedMeeting) => void;
}) {

  const [exceptionOpen, setExceptionOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] bg-white">
      {/* header */}
      <div className="sticky top-0 z-[70] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[430px] px-5 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="rounded-full p-2 text-neutral-800 hover:bg-neutral-100"
              aria-label="back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              className="rounded-full p-2 text-neutral-800 hover:bg-neutral-100"
              aria-label="search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-2">
            <div className="text-lg font-extrabold text-neutral-900">{item.title}</div>
            <div className="mt-1 text-sm text-neutral-500">{item.area} · 일정 모집 중</div>
          </div>
        </div>
        <div className="h-px bg-neutral-200" />
      </div>

      {/* body */}
      <div className="mx-auto max-w-[430px] px-5 pb-28 pt-4">
        <img
          src={item.img}
          alt=""
          className="h-64 w-full rounded-[36px] object-cover ring-1 ring-neutral-200"
        />

        <div className="mt-5 text-2xl font-extrabold text-neutral-900">{item.title}</div>

        <div className="mt-3 text-sm leading-relaxed text-neutral-700">
          사진과 내용은 프로토타입용 더미입니다. 실제 모임 소개글이 들어갈 자리예요.
          오늘은 가볍게 모여서 분위기 좋게 운동하고, 끝나고 근처에서 간단히 정리하는 모임!
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">활동일자</div>
            <div className="mt-2 flex items-center gap-2 text-base font-extrabold text-neutral-900">
              <CalendarDays className="h-5 w-5 text-neutral-700" />
              {item.when}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">시간</div>
            <div className="mt-2 text-base font-extrabold text-neutral-900">19:00 ~ 20:30</div>
          </div>

          <div className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">장소</div>
            <div className="mt-2 flex items-center gap-2 text-base font-extrabold text-neutral-900">
              <MapPin className="h-5 w-5 text-neutral-700" />
              {item.area}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">구성원</div>
            <div className="mt-2 flex items-center gap-2 text-base font-extrabold text-neutral-900">
              <Users className="h-5 w-5 text-neutral-700" />
              {item.members}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-neutral-200">
          <div className="text-lg font-extrabold text-neutral-900">모임 분위기</div>
          <div className="mt-2 text-sm text-neutral-700">{item.vibe}</div>

          <div className="mt-4 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-extrabold text-neutral-900">왜 나랑 맞을까?</div>
            <div className="mt-1 text-xs text-neutral-700">{item.why}</div>
          </div>
        </div>
      </div>

      {/* bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[430px] px-5 py-4">
          <div className="flex gap-3">
            <button className="w-24 rounded-2xl border border-neutral-300 py-3 text-sm font-extrabold text-neutral-900">
              관심
            </button>
            <button
              onClick={() => setExceptionOpen(true)}
              className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-extrabold text-white hover:bg-orange-600"
            >
              참여하기
            </button>
          </div>
        </div>
      </div>

      {/* ✅ (3번) 여기 추가 */}
      <ExceptionModal
        open={exceptionOpen}
        onClose={() => setExceptionOpen(false)}
        onSeeIndoor={() => {
          // 실내 활동 보기: 일단 팝업만 닫고(나중에 실내 리스트로 연결)
          setExceptionOpen(false);
          // TODO: 실내 활동 화면/리스트로 이동시키고 싶으면 여기서 setDetail(null) 같은 흐름 대신
          // indoor 화면 state를 열어주면 됨
        }}
        onProceedAnyway={() => {
          // 그래도 참여: 팝업 닫고 -> LifeMeetView로 올려서 리뷰 띄우기
          setExceptionOpen(false);
          onProceedAnyway(item);
        }}
      />

    </div>
  );
}


function LifeMeetView() {
  const [subTab, setSubTab] = useState<"life" | "meet" | "cafe">("meet");
  const [selected, setSelected] = useState<MeetingItem | null>(null); // 신규/인기용
  const [detail, setDetail] = useState<PersonalizedMeeting | null>(null); // TOP5 풀스크린
  const [report, setReport] = useState<PersonalizedMeeting | null>(null);

  const [reviewFor, setReviewFor] = useState<PersonalizedMeeting | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);


  // ✅ 훅(useMemo)은 항상 호출되어야 함 → detail 분기보다 위
  const top5 = useMemo<PersonalizedMeeting[]>(
    () => [
      {
        id: 1001,
        title: "보라매공원 러닝 크루 (5km 가볍게)",
        desc: "퇴근 후 5km, 스트레칭까지 깔끔하게",
        area: "보라매동",
        count: "12명",
        img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=320&q=60",
        vibe: "빡세지 않게, 꾸준히 · 초보/복귀 러너 많아요",
        when: "오늘",
        members: "3/15 참여중",
        score: 94,
        why: "최근 동네 스포츠 참여 기록이 있고, 모임 출석률이 높은 타입이라 꾸준히 참여할 가능성이 높아요.",
        report: {
          carrotTradeFit: "동네 거래/활동 반경이 보라매권과 유사",
          taste: "운동/산책 키워드 선호 + 저녁 시간대 활동",
          carrotScore: "당근점수 4.7 기반 신뢰도 높음",
          ageBand: "20–30대 비중 높고 사용자와 유사",
          genderRatio: "남 55% / 여 45% (균형형)",
          attendance: "최근 4주 평균 출석률 78%",
          summary: "활동 반경과 시간대가 딱 맞고, 꾸준히 참여할 가능성이 높아서 추천했어요.",
          successProbability: 90,
        },
      },
      {
        id: 1002,
        title: "배드민턴 초보 환영 (주 1회)",
        desc: "라켓 없어도 OK, 구력 0부터",
        area: "봉천동",
        count: "28명",
        img: "/badminton.png",
        vibe: "기초 위주 · 함께 배우는 분위기",
        when: "이번 주 토",
        members: "6/20 참여중",
        score: 91,
        why: "초보 친화/학습형 모임을 자주 저장한 패턴",
        report: {
          carrotTradeFit: "대중교통 이동 패턴이 봉천권과 자주 겹침",
          taste: "‘초보/배움/동네친구’ 태그 반응 높음",
          carrotScore: "당근점수 4.6 · 응답 속도 안정적",
          ageBand: "20–40대 고르게 분포",
          genderRatio: "남 48% / 여 52%",
          attendance: "정기 모임 출석률 72%",
          summary: "처음 시작하기 좋은 구조라서, 부담 없이 정착하기 좋아 보여요.",
          successProbability: 80,
        },
      },
      {
        id: 1003,
        title: "주말 등산 (관악산 라이트)",
        desc: "정상보다 산책처럼 · 사진도 찍어요",
        area: "신림동",
        count: "64명",
        img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=320&q=60",
        vibe: "천천히 걷고 쉬는 타임 많음",
        when: "이번 주 일",
        members: "8/30 참여중",
        score: 88,
        why: "주말 야외활동 선호 + ‘산책’ 콘텐츠 소비",
        report: {
          carrotTradeFit: "주말 활동 반경이 관악권으로 자주 이동",
          taste: "자연/아웃도어 콘텐츠 반응이 높음",
          carrotScore: "당근점수 4.5",
          ageBand: "30대 비중 높음",
          genderRatio: "남 50% / 여 50%",
          attendance: "모임 출석률 69%",
          summary: "가볍게 즐기는 아웃도어 스타일이랑 맞아서 추천했어요.",
          successProbability: 67,
        },
      },
      {
        id: 1004,
        title: "탁구 한판 (퇴근 후 40분)",
        desc: "짧게 치고 해산 · 지각 없는 모임",
        area: "동작구",
        count: "18명",
        img: "/tk.png",
        vibe: "시간 엄수 · 가성비 운동",
        when: "내일",
        members: "4/12 참여중",
        score: 86,
        why: "짧은 시간대 모임을 선호하는 패턴",
        report: {
          carrotTradeFit: "퇴근 시간대 활동 로그와 일치",
          taste: "‘짧은 시간/직장인’ 키워드 선호",
          carrotScore: "당근점수 4.7",
          ageBand: "20–30대",
          genderRatio: "남 60% / 여 40%",
          attendance: "출석률 75%",
          summary: "짧고 확실하게 운동하는 성향이랑 잘 맞아요.",
          successProbability: 66,
        },
      },
      {
        id: 1005,
        title: "실내 클라이밍 체험 (초보)",
        desc: "체험권 같이 쓰고 안전 교육부터",
        area: "서울대입구",
        count: "22명",
        img: "/climb.png",
        vibe: "친절한 설명 · 무리하지 않아요",
        when: "이번 주 금",
        members: "5/16 참여중",
        score: 84,
        why: "새로운 스포츠 체험을 저장한 이력",
        report: {
          carrotTradeFit: "주중 저녁 이동 반경에 포함",
          taste: "새로운 체험형 콘텐츠 반응",
          carrotScore: "당근점수 4.6",
          ageBand: "20대 후반–30대 초반",
          genderRatio: "남 45% / 여 55%",
          attendance: "출석률 67%",
          summary: "체험형이라 진입장벽 낮고, 취향 확장에 좋아요.",
          successProbability: 55,
        },
      },
    ],
    []
  );

  const newly = useMemo<MeetingItem[]>(
    () => [
      {
        id: 1,
        title: "아크로라운지 서울파티룸 노량진 만나로 브런치",
        desc: "브런치 카페에서 가볍게 모여요",
        area: "동작구 노량진동",
        count: "신규 모임",
        img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=240&q=60",
      },
      {
        id: 2,
        title: "스포츠댄스 사교댄스",
        desc: "기초 수업 회원 모집 · 체계적인 수업",
        area: "봉천동",
        count: "19명",
        active: "2시간 전 활동",
        img: "/dance.png",
      },
      {
        id: 3,
        title: "보라매공원 경도",
        desc: "가볍게 뛰고 스트레칭까지",
        area: "보라매동",
        count: "10명",
        img: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=240&q=60",
      },
    ],
    []
  );

  const popular = useMemo<MeetingItem[]>(
    () => [
      {
        id: 11,
        title: "🌿낙성대 서플댄스🌿",
        desc: "연습실에서 서플댄스 같이 해요",
        area: "낙성대동",
        count: "18명",
        img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=240&q=60",
      },
      {
        id: 12,
        title: "소소한 공예인 모임",
        desc: "공예 작가/애호가/관심 있는 분들 환영",
        area: "행운동",
        count: "208명",
        active: "2시간 전 활동",
        img: "/art.png",
      },
      {
        id: 13,
        title: "골프치며놀자 (안양·광명·시흥)",
        desc: "월례회/정기 스크린 · 초보도 가능",
        area: "경기 안양 만안구",
        count: "29명",
        img: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=240&q=60",
      },
    ],
    []
  );

  // ✅ 여기서 분기해야 훅 순서 안 깨짐
  if (detail) {
    return (
      <MeetingDetailScreen
        item={detail}
        onBack={() => setDetail(null)}
        onProceedAnyway={(m) => {
          // ✅ 1) 상세 닫고
          setDetail(null);

          // ✅ 2) 리뷰 팝업 띄우기
          setReviewFor(m);
          setReviewOpen(true);
        }}
      />
    );
  }


  return (
    <div className="bg-neutral-50 pb-24">
      <TopSubTabs value={subTab} onChange={setSubTab} />

      {subTab !== "meet" ? (
        <div className="px-5 py-16 text-center text-sm text-neutral-500">
          프로토타입: ‘모임’ 탭만 활성화
        </div>
      ) : (
        <>
          <SectionHeader
            title="개인화 추천 TOP 5"
            subtitle="내 활동/취향 기반으로 모임을 골랐어요"
            right="전체보기"
          />

          <div className="mt-3 space-y-4 px-5">
            {top5.slice(0, 5).map((m) => (
              <Top5Card
                key={m.id}
                item={m}
                onOpenReport={() => setReport(m)}
                onOpenDetail={() => setDetail(m)}
              />
            ))}
          </div>

          <div className="mt-6 px-5">
            <div className="rounded-3xl bg-white p-2 ring-1 ring-neutral-200">
              <div className="px-3 pt-3 text-base font-extrabold text-neutral-900">
                신규 모임
              </div>
              <div className="px-3 pt-1 text-xs text-neutral-500">
                방금 만들어졌어요
              </div>
              <div className="mt-2 divide-y divide-neutral-100">
                {newly.map((m) => (
                  <SimpleRow key={m.id} item={m} onClick={() => setSelected(m)} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 px-5">
            <div className="rounded-3xl bg-white p-2 ring-1 ring-neutral-200">
              <div className="px-3 pt-3 text-base font-extrabold text-neutral-900">
                인기 모임
              </div>
              <div className="px-3 pt-1 text-xs text-neutral-500">
                저장 많이 된 모임
              </div>
              <div className="mt-2 divide-y divide-neutral-100">
                {popular.map((m) => (
                  <SimpleRow key={m.id} item={m} onClick={() => setSelected(m)} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ 미니리포트: 2열 그리드로 변경 */}
      <Sheet
        open={!!report}
        onClose={() => setReport(null)}
        titleLeft={
          <span className="block">
            AI 미니리포트 · <span className="font-extrabold">{report?.title}</span>
          </span>
        }
      >
        {report ? (
          <div className="space-y-4">
            {/* 상단 요약 카드 */}
            {/* 상단 요약 카드 (촘촘 버전) */}
            <div className="rounded-3xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
              {/* 한 줄 헤더 */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-neutral-900">
                  요약
                </div>

                {/* 칩 2개를 오른쪽에 compact하게 */}
                <div className="flex items-center gap-2">
                  <GreenScorePill score={report.score} />
                  <SuccessChanceChip value={report.report.successProbability} />
                </div>
              </div>

              {/* 짧은 안내 (한 줄~두 줄) */}
              <div className="mt-2 text-[11px] leading-relaxed text-neutral-600">
                성사 가능성은 <span className="font-bold text-neutral-700">우천확률</span>과{" "}
                <span className="font-bold text-neutral-700">구성원의 과거 모임 성사 이력</span>을
                종합 반영한 점수예요.
              </div>

              {/* 요약 본문: 빈칸 안 나게 조금 더 붙임 */}
              <div className="mt-3 text-[15px] leading-relaxed text-neutral-800">
                {report.report.summary}
              </div>
            </div>

            {/* ✅ 2열 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <ReportCard label="당근 거래목록" value={report.report.carrotTradeFit} />
              <ReportCard label="취향" value={report.report.taste} />
              <ReportCard label="당근점수" value={report.report.carrotScore} />
              <ReportCard label="연령대" value={report.report.ageBand} />
              <ReportCard label="성비" value={report.report.genderRatio} />
              <ReportCard label="모임 출석율" value={report.report.attendance} />
            </div>

            <button
              onClick={() => {
                setDetail(report);
                setReport(null);
              }}
              className="w-full rounded-3xl bg-neutral-900 py-4 text-base font-extrabold text-white"
            >
              이 모임 보기
            </button>
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewFor(null);
        }}
        titleLeft="러닝 모임은 즐거우셨나요?"
        titleRight="경험을 공유해 주세요"
      >
        {reviewFor ? (
          <div className="space-y-4">
            <div className="text-sm font-bold text-neutral-700">
              {reviewFor.title}
            </div>

            {/* 별점(더미 UI) */}
            <div className="flex items-center justify-center gap-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-full bg-neutral-50 ring-1 ring-neutral-200 text-xl"
                  title={`${i + 1}점`}
                >
                  ☆
                </button>
              ))}
            </div>

            {/* 추천태그(더미) */}
            <div>
              <div className="text-xs font-extrabold text-neutral-900">추천 태그</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["분위기가 좋아요", "초보자에게 적합", "또 가고 싶어요", "코스가 좋아요"].map(
                  (t) => (
                    <button
                      key={t}
                      className="rounded-full bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-700 ring-1 ring-orange-100 hover:bg-orange-100"
                    >
                      #{t}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setReviewOpen(false);
                setReviewFor(null);
              }}
              className="w-full rounded-3xl bg-neutral-900 py-4 text-base font-extrabold text-white"
            >
              리뷰 남기기
            </button>
          </div>
        ) : null}
      </Sheet>



      {/* 신규/인기 간단 상세 */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        titleLeft={selected?.title ?? "상세"}
      >
        {selected ? (
          <div className="space-y-3">
            <img src={selected.img} className="h-44 w-full rounded-3xl object-cover" alt="" />
            <div className="text-sm text-neutral-700">{selected.desc}</div>
            <div className="text-sm font-bold text-neutral-900">{selected.area}</div>
            <div className="text-xs text-neutral-500">{selected.count}</div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}

export default function LifeTab() {
  return <LifeMeetView />;
}
