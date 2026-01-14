// src/tabs/MapTab.tsx (혹은 NeighborhoodMapView.tsx)
// ✅ 전체 교체본: BottomSheet 상세(점수/이유) + 매칭(10명 모션) + 추천 3옵션 + 모임장 설정

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BottomSheet } from "../components/BottomSheet";
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  Crosshair,
  Heart,
  Menu,
  Search,
  Sun,
  X,
  Zap,
  MapPin,
} from "lucide-react";
import { mapChips, mapMeetings } from "../data/mock";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** ====== helpers ====== */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function useEscClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
}

/** ====== Modal (frameRef portal) ====== */
function Modal({
  open,
  onClose,
  title,
  children,
  maxW = "460px",
  containerRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxW?: string;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  useBodyScrollLock(open);
  useEscClose(open, onClose);

  const hostEl = containerRef.current;
  if (!hostEl) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="w-[92%] rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200"
              style={{ maxWidth: maxW }}
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-neutral-900">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-neutral-100"
                  aria-label="닫기"
                >
                  <X className="h-5 w-5 text-neutral-700" />
                </button>
              </div>
              <div className="mt-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    hostEl
  );
}

/** ====== Toast (frameRef portal) ====== */
function Toast({
  open,
  text,
  containerRef,
}: {
  open: boolean;
  text: string;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const hostEl = containerRef.current;
  if (!hostEl) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute bottom-24 left-1/2 z-[220] w-[92%] max-w-[430px] -translate-x-1/2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>,
    hostEl
  );
}

function Chip({
  active,
  label,
  emoji,
  onClick,
}: {
  active: boolean;
  label: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-2 text-sm font-medium shadow-sm ring-1 transition",
        active
          ? "bg-neutral-900 text-white ring-neutral-900"
          : "bg-white text-neutral-900 ring-neutral-200 hover:bg-neutral-50"
      )}
    >
      <span className="mr-1">{emoji}</span>
      {label}
    </button>
  );
}

function FloatingButton({
  children,
  onClick,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full bg-white p-3 shadow-lg ring-1 ring-neutral-200 hover:bg-neutral-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type Tone = "outdoor" | "indoor" | "me";

function MapMarker({
  x,
  y,
  label,
  badge,
  onClick,
  pulse,
  tone = "outdoor",
  selected = false,
  centerIcon, // ✅ 추가
}: {
  x: number;
  y: number;
  label?: string;
  badge?: string;
  onClick: () => void;
  pulse?: boolean;
  tone?: Tone;
  selected?: boolean;
  centerIcon?: React.ReactNode; // ✅ 추가
}) {

  const toneClass =
    tone === "me"
      ? "bg-white text-neutral-900 ring-neutral-200"
      : tone === "indoor"
      ? "bg-[#5B6B7A] text-white"
      : "bg-[#2FAF7A] text-white";

  const pulseClass =
    tone === "me" ? "bg-orange-500" : tone === "indoor" ? "bg-[#5B6B7A]" : "bg-[#2FAF7A]";

  if (tone === "me") {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ left: `${x}%`, top: `${y}%` }}
        className="absolute z-[999] h-14 w-14 -translate-x-1/2 -translate-y-1/2"
        aria-label="내 위치"
      >
        <span className="relative block h-full w-full">
          {/* 바깥 ping (정확히 요소 중심 기준) */}
          <span
            className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping"
            style={{ animationDuration: "1.4s" }}
          />

          {/* 고정 링 */}
          <span className="absolute inset-2 rounded-full border-2 border-orange-400 bg-white/85 shadow-sm" />

          {/* 가운데 점 (진짜 정중앙) */}
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow" />
        </span>
      </button>
    );
  }



  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", selected ? "z-[80]" : "z-[20]")}
      aria-label={label ? `${label} 마커` : "마커"}
    >
      <span className="relative block">
        {pulse && (
          <span
            className={cn(
              "absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 animate-ping",
              pulseClass
            )}
            style={{ animationDuration: "1.4s" }}
          />
        )}

        {/* ✅ 핑 중앙에 아이콘(내 위치) 넣기 */}
        {pulse && centerIcon ? (
          <span className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
            {centerIcon}
          </span>
        ) : null}

        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-2 ring-white",
            toneClass,
            selected ? "scale-[1.03] shadow-lg" : ""
          )}
        >
          {badge ? badge : "📍"}
        </span>

        {selected && label ? (
          <span
            className="
              absolute left-1/2 top-0
              -translate-x-1/2 -translate-y-[110%]
              whitespace-nowrap
              rounded-full bg-white/95 px-3 py-1
              text-xs font-semibold text-neutral-900
              shadow ring-1 ring-neutral-200
            "
          >
            {label}
          </span>
        ) : null}
      </span>
    </button>
  );
}


function ScorePill({ score }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
      <Zap className="h-4 w-4" />
      AI {score}점
    </div>
  );
}

type Meeting = (typeof mapMeetings)[number] & {
  aiScore?: number;
  aiReason?: string;
};

function MeetingCard({ meeting, onClick }: { meeting: Meeting; onClick: () => void }) {
  const score = (meeting as any).aiScore ?? 0;
  const reason = (meeting as any).aiReason ?? "조건·거리·활동 성향을 종합해서 점수가 높아요.";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-neutral-200 hover:bg-neutral-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <ScorePill score={score} />
          <div className="mt-2 text-base font-extrabold text-neutral-900">{(meeting as any).title}</div>
          <div className="mt-1 text-sm text-neutral-600">
            {(meeting as any).location ?? (meeting as any).place ?? "장소"} · {(meeting as any).distanceKm ?? "?"}km ·{" "}
            {(meeting as any).participants ?? (meeting as any).count ?? ""}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {(meeting as any).time ?? "오늘"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Sun className="h-4 w-4" /> {(meeting as any).weather ?? "—"}
            </span>
          </div>

          {/* ✅ LifeTab 느낌의 “왜 적절한지” 카드 */}
          <div className="mt-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
            <div className="text-xs font-extrabold text-neutral-700">왜 이 모임이 적절해요?</div>
            <div className="mt-1 text-sm text-neutral-700">{reason}</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-neutral-400" />
      </div>
    </button>
  );
}

function RealisticMapLayer() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[#f4f6f8]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(0,0,0,0.25), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.18), transparent 32%), radial-gradient(circle at 40% 80%, rgba(0,0,0,0.18), transparent 36%)",
        }}
      />
      <svg className="absolute inset-0" viewBox="0 0 430 740" preserveAspectRatio="none">
        <path
          d="M300 0 C290 90 320 160 310 240 C300 330 260 380 270 470 C285 610 350 640 360 740"
          fill="none"
          stroke="rgba(59,130,246,0.35)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M300 0 C290 90 320 160 310 240 C300 330 260 380 270 470 C285 610 350 640 360 740"
          fill="none"
          stroke="rgba(59,130,246,0.18)"
          strokeWidth="34"
          strokeLinecap="round"
        />
        <path
          d="M215 -20 C205 90 230 160 220 260 C210 360 190 420 200 520 C212 640 240 680 250 760"
          fill="none"
          stroke="rgba(10,10,10,0.10)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M215 -20 C205 90 230 160 220 260 C210 360 190 420 200 520 C212 640 240 680 250 760"
          fill="none"
          stroke="rgba(16,185,129,0.25)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 240 C90 250 140 220 210 240 C290 265 330 280 430 250"
          fill="none"
          stroke="rgba(10,10,10,0.09)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M-10 420 C80 430 150 420 230 440 C310 460 360 470 440 460"
          fill="none"
          stroke="rgba(10,10,10,0.07)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M85 260 C80 230 110 205 150 210 C185 215 205 205 235 210 C275 218 290 240 292 275 C295 330 292 370 285 420 C279 475 245 495 205 495 C170 495 140 485 115 468 C90 450 88 420 90 385 C92 345 92 305 85 260 Z"
          fill="rgba(16,185,129,0.20)"
          stroke="rgba(16,185,129,0.28)"
          strokeWidth="1.2"
        />
        <text x="145" y="330" fill="rgba(6,95,70,0.70)" fontSize="14" fontWeight="700">
          보라매공원
        </text>
      </svg>
    </div>
  );
}

type ChipKey = (typeof mapChips)[number]["key"];

type MatchOption = {
  id: string;
  meeting: Meeting;
  score: number;
  reason: string;
};

type MatchStep = "closed" | "filter" | "matching" | "options" | "confirm" | "hostSetup";

/** ====== score / reason 더미 생성기 ====== */
function seededScore(i: number, min = 62, max = 96) {
  const v = (Math.sin(i * 999) + 1) / 2; // 0..1
  return Math.round(min + v * (max - min));
}
function pickReason(i: number) {
  const reasons = [
    "최근 참여한 모임 성향과 비슷하고, 이동거리 대비 만족도가 높아요.",
    "같은 시간대에 유저 활동 로그가 많아서 성사 확률이 높아요.",
    "근처에서 선호도가 높은 장소/키워드가 겹쳐 점수가 올라갔어요.",
    "유사 유저들이 참여 후 재참여율이 높았던 패턴이라 추천해요.",
    "날씨/시간/거리 조건이 안정적이라 취소율이 낮아요.",
  ];
  return reasons[i % reasons.length];
}

export default function NeighborhoodMapView() {

  const [pinsOn, setPinsOn] = useState(false); // ✅ 위치 버튼 누르면 마커 표시
  const [nudgeLocate, setNudgeLocate] = useState(true); // ✅ 첫 화면 유도 이펙트
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null); // ✅ 클릭한 마커만 라벨 표시

  /** 폰 프레임 */
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [activeChip, setActiveChip] = useState<ChipKey>(mapChips[0]?.key ?? ("deal" as ChipKey));
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  /** toast */
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  /** matching flow */
  const [matchStep, setMatchStep] = useState<MatchStep>("closed");
  const [scoreMin, setScoreMin] = useState(60);
  const [scoreMax, setScoreMax] = useState(95);
  const [duration, setDuration] = useState<"1시간" | "2시간">("1시간");

  const [waitCount, setWaitCount] = useState(10); // “대기열” 느낌 (고정해도 되고 랜덤해도 됨)
  const [acceptingCount, setAcceptingCount] = useState(1);
  const [matchOptions, setMatchOptions] = useState<MatchOption[]>([]);
  const [pickedOption, setPickedOption] = useState<MatchOption | null>(null);

  /** host setup(모임장 설정) */
  const [hostPlace, setHostPlace] = useState("보라매공원");
  const [hostTime, setHostTime] = useState("오늘 12:30");
  const [hostMinScore, setHostMinScore] = useState(70);

  const acceptTimerRef = useRef<number | null>(null);
  const stepTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, ms = 1800) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (acceptTimerRef.current) window.clearInterval(acceptTimerRef.current);
      if (stepTimerRef.current) window.clearTimeout(stepTimerRef.current);
    };
  }, []);

  /** 칩 바꾸면 상세 닫기 */
  useEffect(() => {
    setSelectedMeeting(null);
  }, [activeChip]);

  /** chips: 경도 -> 모임 */
  const chipsForView = useMemo(() => {
    return mapChips.map((c) => (c.key === "gyeongdo" ? { ...c, label: "모임" } : c));
  }, []);

  const activeChipLabel = useMemo(() => {
    return chipsForView.find((c) => c.key === activeChip)?.label ?? "주변";
  }, [chipsForView, activeChip]);

  const isMeetingChip = activeChipLabel === "모임";

  /** meetings: 부족하면 더미로 확장 + aiScore/aiReason 더미 채우기 */
  const meetings = useMemo<Meeting[]>(() => {
    const base = (mapMeetings as any[]).map((m, idx) => {
      const aiScore = (m?.aiScore ?? seededScore(idx)) as number;
      const aiReason = (m?.aiReason ?? pickReason(idx)) as string;
      return { ...m, aiScore, aiReason } as Meeting;
    });

    const need = 20; // 지도 마커/리스트 충분히 보이게
    if (base.length >= need) return base;

    const extra: Meeting[] = [];
    for (let i = base.length; i < need; i++) {
      const src = base[i % base.length] ?? {};
      extra.push({
        ...(src as any),
        id: `dummy-${i}`,
        title: (src as any).title ?? "모임",
        distanceKm: ((i % 7) + 1) * 0.3,
        participants: `${(i % 6) + 3}명`,
        time: i % 2 === 0 ? "오늘" : "내일",
        weather: i % 3 === 0 ? "맑음" : "흐림",
        aiScore: seededScore(i),
        aiReason: pickReason(i),
      } as any);

    }
    return [...base, ...extra];
  }, []);

  /** 지도 마커 슬롯(늘림) */
  const markerSlots = useMemo(
    () => [
      // ✅ 야외(outdoor): 러닝/산책/공원/등산/야외활동
      { x: 52, y: 48, tone: "outdoor" as const, badge: "🏃" }, // 러닝
      { x: 35, y: 62, tone: "outdoor" as const, badge: "🚶" }, // 산책
      { x: 42, y: 40, tone: "outdoor" as const, badge: "⚡" }, // 빠른 매칭(야외)
      { x: 24, y: 56, tone: "outdoor" as const, badge: "📌" }, // 핀/핫스팟
      { x: 50, y: 28, tone: "outdoor" as const, badge: "🏓" }, // (야외로 가정) 탁구/스포츠
      { x: 18, y: 34, tone: "outdoor" as const, badge: "🥗" }, // 가벼운 픽업/야외 느낌
      { x: 48, y: 66, tone: "outdoor" as const, badge: "🍜" }, // 식사(야외/근처 모임)
      { x: 56, y: 60, tone: "outdoor" as const, badge: "🎯" }, // 목표/챌린지(야외)

      // ✅ 실내(indoor): 카페/취미/공방/영화/쇼핑/실내운동
      { x: 66, y: 52, tone: "indoor" as const, badge: "☕" }, // 카페
      { x: 28, y: 46, tone: "indoor" as const, badge: "🧘" }, // 요가/필라테스(실내)
      { x: 32, y: 30, tone: "indoor" as const, badge: "🏸" }, // 배드민턴(실내)
      { x: 12, y: 50, tone: "indoor" as const, badge: "📚" }, // 스터디/독서
      { x: 76, y: 58, tone: "indoor" as const, badge: "🛍️" }, // 쇼핑
      { x: 82, y: 30, tone: "indoor" as const, badge: "🎬" }, // 영화/문화
      { x: 86, y: 50, tone: "indoor" as const, badge: "🎧" }, // 공연/음악/실내

      // ✅ 이동/역(실내로 두는 게 화면 톤 정리에 유리)
      { x: 60, y: 30, tone: "indoor" as const, badge: "🚇" }, // 역/이동
      { x: 70, y: 38, tone: "indoor" as const, badge: "🎁" }, // 이벤트/혜택(실내)
    ],
    []
  );


  const closeAllMatch = useCallback(() => {
    setMatchStep("closed");
    setPickedOption(null);
    setMatchOptions([]);
    if (acceptTimerRef.current) window.clearInterval(acceptTimerRef.current);
    if (stepTimerRef.current) window.clearTimeout(stepTimerRef.current);
    acceptTimerRef.current = null;
    stepTimerRef.current = null;
  }, []);

  const openMatchFilter = useCallback(() => {
    closeAllMatch();
    setSelectedMeeting(null);
    setAcceptingCount(1);
    setWaitCount(10);
    setMatchStep("filter");
  }, [closeAllMatch]);

  /** 1) 매칭 시작 -> 10명 채워지는 모션 -> 2) 옵션 3개 보여주기 */
  const startMatching = useCallback(() => {
    closeAllMatch();
    setSelectedMeeting(null);
    setMatchStep("matching");
    setAcceptingCount(1);

    // 10명까지 채우는 모션
    acceptTimerRef.current = window.setInterval(() => {
      setAcceptingCount((c) => (c < 10 ? c + 1 : c));
    }, 450);

    // 완료되면 옵션 생성(3개)로 이동
    stepTimerRef.current = window.setTimeout(() => {
      if (acceptTimerRef.current) window.clearInterval(acceptTimerRef.current);
      acceptTimerRef.current = null;

      // 후보 풀: 점수범위/시간(대충) 반영한 느낌만 주기
      const pool = meetings
        .map((m) => {
          const s = (m.aiScore ?? 0) as number;
          return { m, s };
        })
        .filter(({ s }) => s >= scoreMin && s <= scoreMax);

      const basePool = pool.length ? pool : meetings.map((m) => ({ m, s: m.aiScore ?? seededScore(0) }));

      // 상위/중간/하위 느낌 섞어서 3개 뽑기 + 정렬(점수 높은 순)
      const raw = [0, 2, 4]
        .map((k, idx) => basePool[(k + idx) % basePool.length])
        .map(({ m, s }, idx) => ({
          id: `opt-${idx}`,
          meeting: m,
          score: Math.min(99, Math.max(50, s + (idx === 0 ? 2 : idx === 1 ? 0 : -3))),
          reason:
            idx === 0
              ? "유사 유저들의 참여율/재참여율이 높고, 이동거리 대비 만족도가 가장 높아요."
              : idx === 1
              ? "시간대와 장소 선호가 잘 맞고, 성사 확률이 안정적으로 높아요."
              : "조건은 약간 덜 맞지만 근처에서 빠르게 모일 수 있는 대안이에요.",
        }))
        .sort((a, b) => b.score - a.score);

      setMatchOptions(raw);
      setMatchStep("options");
    }, 2600);
  }, [closeAllMatch, meetings, scoreMin, scoreMax]);

  /** 옵션 선택 -> 확인 화면 */
  const pickOption = useCallback((opt: MatchOption) => {
    setPickedOption(opt);
    setMatchStep("confirm");
  }, []);

  /** 모임 생성하기 -> 모임장 설정 화면 */
  const goHostSetup = useCallback(() => {
    setMatchStep("hostSetup");
    // 기본값 채우기
    const baseTitle = pickedOption?.meeting?.title ?? "모임";
    if (baseTitle.includes("공원")) setHostPlace("보라매공원");
  }, [pickedOption]);

  /** 모임장 설정 완료 -> toast + 지도/시트에서 선택 */
  const completeHostSetup = useCallback(() => {
    const m = pickedOption?.meeting ?? meetings[0];
    setSelectedMeeting(m);
    showToast("모임이 생성되었어요! 지도에서 확인해보세요", 1800);
    closeAllMatch();
  }, [pickedOption, meetings, showToast, closeAllMatch]);

  return (
    <div
      ref={frameRef}
      className="relative mx-auto w-full max-w-[430px] h-[calc(100vh-56px-76px)] min-h-[620px] overflow-hidden bg-white"
    >
      {/* header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" className="rounded-full p-2 hover:bg-neutral-100" aria-label="메뉴">
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1 px-2">
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-neutral-900">
              신림동 <ChevronRight className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-full p-2 hover:bg-neutral-100" aria-label="알림">
              <Bell className="h-6 w-6" />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-neutral-100" aria-label="검색">
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {chipsForView.map((c) => (
            <Chip
              key={c.key}
              active={activeChip === c.key}
              label={c.label}
              emoji={c.emoji}
              onClick={() => {
                setActiveChip(c.key);
                if (c.label === "모임") openMatchFilter();
              }}
            />
          ))}
        </div>
      </div>

      {/* map */}
      {/* map */}
      <div className="relative h-full overflow-hidden">
        <RealisticMapLayer />

        {/* ✅ 마커 오버레이: 여기만 위로 올리면 전체가 같이 움직임 */}
        <div
          className="absolute inset-0 z-10"
          style={{ transform: "translateY(-56px)" }} // ← 여기 숫자만 조절
        >
          {/* ✅ 내 위치 */}
          {pinsOn && (
            <MapMarker
              x={50}
              y={50}
              tone="me"
              onClick={() => {
                setActiveMarkerId((prev) => (prev === "me" ? null : "me"));
                showToast("현재 위치", 1200);
              }}
            />
          )}

          {/* ✅ 모임 마커들 */}
          {pinsOn &&
            meetings.slice(0, markerSlots.length).map((m, i) => {
              const id = (m as any).id ?? (m as any).title ?? i;

              return (
                <MapMarker
                  key={id}
                  x={markerSlots[i].x}
                  y={markerSlots[i].y}
                  label={(m as any).title}
                  badge={markerSlots[i].badge}
                  tone={markerSlots[i].tone}
                  selected={activeMarkerId === id}
                  onClick={() => {
                    setSelectedMeeting(m);
                    setActiveMarkerId((prev) => (prev === id ? null : id));
                  }}
                />
              );
            })}
        </div>


        <div className="absolute right-4 top-24 z-20 flex flex-col gap-2">
          <FloatingButton
            onClick={() => {
              setPinsOn((v) => {
                const next = !v;

                // ✅ 한 번이라도 눌렀으면 유도 이펙트 끔
                if (nudgeLocate) setNudgeLocate(false);

                // 마커를 끄면, 라벨/선택도 같이 정리
                if (!next) {
                  setActiveMarkerId(null);
                  setSelectedMeeting(null);
                }

                showToast(next ? "주변 모임 아이콘 표시" : "아이콘 숨김", 1400);
                return next;
              });
            }}
            aria-label="현재 위치"
            className={cn(
              "relative",
              nudgeLocate ? "ring-2 ring-orange-400/50" : ""
            )}
          >
            {/* ✅ 버튼 주변 반짝/펄스 */}
            {nudgeLocate && (
              <>
                <span className="pointer-events-none absolute -inset-1 rounded-full bg-orange-400/20 animate-ping" />
                <span className="pointer-events-none absolute -inset-2 rounded-full ring-2 ring-orange-400/30 animate-pulse" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                  눌러서 주변 보기
                </span>
              </>
            )}

            <Crosshair className="h-5 w-5" />
          </FloatingButton>

          <FloatingButton onClick={() => showToast("관심 지역 설정", 1400)} aria-label="관심">
            <Heart className="h-5 w-5" />
          </FloatingButton>
        </div>
      </div>

      {/* BottomSheet */}
      <BottomSheet
        containerRef={frameRef}
        bottomOffset={-70}
        header={
          <div className="flex w-full items-center gap-2">
            <div className="text-sm font-extrabold text-neutral-900">
              {activeChipLabel}
              {selectedMeeting ? " · 상세" : ""}
            </div>

            {isMeetingChip && !selectedMeeting ? (
              <button
                type="button"
                onClick={openMatchFilter}
                className="ml-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-extrabold text-white"
              >
                빠른 매칭
              </button>
            ) : null}

            <div className="ml-auto text-xs font-semibold text-neutral-500">위로 스와이프</div>
          </div>
        }
      >
        {!selectedMeeting ? (
          <div className="space-y-3">
            {meetings.map((m, idx) => (
              <button
                key={(m as any).id ?? idx}
                type="button"
                onClick={() => setSelectedMeeting(m)}
                className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-neutral-900">{(m as any).title}</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {(m as any).location ?? (m as any).place ?? "장소"} · {(m as any).distanceKm ?? "?"}km ·{" "}
                      {(m as any).participants ?? (m as any).count ?? ""}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ScorePill score={(m.aiScore ?? 0) as number} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <MeetingCard meeting={selectedMeeting as any} onClick={() => {}} />

            <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
              <div className="text-sm font-extrabold text-neutral-900">참여/예약</div>
              <div className="mt-2 text-sm text-neutral-600">
                여기서 “상세페이지로 이동”을 붙이면 됨 (지금은 프로토타입이라 시트 안에서 상세 표현)
              </div>
              <button
                type="button"
                onClick={() => showToast("프로토타입: 상세 페이지 이동", 1400)}
                className="mt-3 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-extrabold text-white"
              >
                상세페이지로
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                목록으로
              </button>
              <button
                type="button"
                onClick={() => showToast("프로토타입: 참여/예약", 1400)}
                className="flex-1 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white"
              >
                예약/참여
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ===== 매칭 플로우 모달들 ===== */}

      {/* 0) 필터(빠른 매칭) */}
      <Modal
        open={matchStep === "filter"}
        onClose={closeAllMatch}
        title="⚡ 모임 · 빠른 매칭"
        containerRef={frameRef}
        maxW="460px"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="text-sm font-extrabold text-neutral-900">조건을 고르면 AI가 근처 모임을 추천해요</div>
            <div className="mt-1 text-sm text-neutral-600">다음 화면에서 추천 옵션 3개를 점수순으로 보여줄게요.</div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">AI 점수</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                <span>{scoreMin}</span>
                <span>{scoreMax}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={scoreMin}
                  onChange={(e) => setScoreMin(Math.min(Number(e.target.value), scoreMax - 1))}
                />
                <input
                  type="range"
                  min={55}
                  max={99}
                  value={scoreMax}
                  onChange={(e) => setScoreMax(Math.max(Number(e.target.value), scoreMin + 1))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">모임 시간</div>
            <div className="mt-2 flex gap-2">
              {(["1시간", "2시간"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold ring-1",
                    duration === d
                      ? "bg-neutral-900 text-white ring-neutral-900"
                      : "bg-white text-neutral-900 ring-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={startMatching}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white"
          >
            AI로 매칭 시작
          </button>
        </div>
      </Modal>

      {/* 1) 매칭 중(10명 채우기) */}
      <Modal
        open={matchStep === "matching"}
        onClose={closeAllMatch}
        title="매칭 중…"
        containerRef={frameRef}
        maxW="420px"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="text-sm font-extrabold text-neutral-900">조건에 맞는 후보를 모으는 중이에요</div>
            <div className="mt-1 text-sm text-neutral-600">유사 유저 데이터 기반으로 빠르게 후보를 정리 중…</div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-neutral-900">대기열</div>
              <div className="text-sm font-extrabold text-orange-600">{waitCount}명</div>
            </div>

            {/* 진행바 */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: "8%" }}
                animate={{ width: `${Math.min(100, 8 + acceptingCount * 9)}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            {/* 10명 채우기 뱃지 */}
            <div className="mt-4">
              <div className="text-xs font-bold text-neutral-600">후보 수집</div>
              <div className="mt-2 grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-6 rounded-md ring-1",
                      i < acceptingCount ? "bg-orange-500 ring-orange-500" : "bg-white ring-neutral-200"
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-500">수집됨: {acceptingCount}/10</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 2) 추천 옵션 3개(점수순) */}
      <Modal
        open={matchStep === "options"}
        onClose={closeAllMatch}
        title="추천 옵션"
        containerRef={frameRef}
        maxW="460px"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="h-5 w-5" />
              <div className="text-sm font-extrabold">조건에 맞는 옵션을 찾았어요</div>
            </div>
            <div className="mt-2 text-sm text-emerald-800">
              {duration} · 점수 {scoreMin}~{scoreMax} 기준으로 3개를 골랐고, <b>점수 높은 순</b>으로 정렬했어요.
            </div>
          </div>

          <div className="space-y-3">
            {matchOptions.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pickOption(opt)}
                className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-extrabold text-neutral-500">옵션 {idx + 1}</div>
                      <ScorePill score={opt.score} />
                    </div>
                    <div className="mt-2 text-base font-extrabold text-neutral-900">{(opt.meeting as any).title}</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {(opt.meeting as any).location ?? (opt.meeting as any).place ?? "장소"} ·{" "}
                      {(opt.meeting as any).distanceKm ?? "?"}km · {(opt.meeting as any).participants ?? (opt.meeting as any).count ?? ""}
                    </div>

                    <div className="mt-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
                      <div className="text-xs font-extrabold text-neutral-700">점수 이유</div>
                      <div className="mt-1 text-sm text-neutral-700">{opt.reason}</div>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* 3) 선택 옵션 확인 */}
      <Modal
        open={matchStep === "confirm"}
        onClose={closeAllMatch}
        title="선택한 모임"
        containerRef={frameRef}
        maxW="460px"
      >
        <div className="space-y-4">
          {pickedOption ? (
            <>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
                <div className="flex items-center gap-2">
                  <ScorePill score={pickedOption.score} />
                  <div className="text-xs font-semibold text-neutral-500">추천 1순위 기준</div>
                </div>
                <div className="mt-2 text-base font-extrabold text-neutral-900">{(pickedOption.meeting as any).title}</div>
                <div className="mt-1 text-sm text-neutral-600">
                  {(pickedOption.meeting as any).location ?? (pickedOption.meeting as any).place ?? "장소"} ·{" "}
                  {(pickedOption.meeting as any).distanceKm ?? "?"}km
                </div>
                <div className="mt-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="text-xs font-extrabold text-neutral-700">왜 이게 제일 높아요?</div>
                  <div className="mt-1 text-sm text-neutral-700">{pickedOption.reason}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={goHostSetup}
                className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-extrabold text-white"
              >
                모임 생성하기
              </button>

              <button
                type="button"
                onClick={() => setMatchStep("options")}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-extrabold ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                다른 옵션 보기
              </button>
            </>
          ) : null}
        </div>
      </Modal>

      {/* 4) 모임장 설정(장소/시간/유저 점수) */}
      <Modal
        open={matchStep === "hostSetup"}
        onClose={closeAllMatch}
        title="모임장 설정"
        containerRef={frameRef}
        maxW="460px"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="text-sm font-extrabold text-neutral-900">모임을 실제로 만들기 전에 설정을 정해요</div>
            <div className="mt-1 text-sm text-neutral-600">장소/시간/참가자 기준 점수를 조정할 수 있어요.</div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">장소</div>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 ring-1 ring-neutral-200">
              <MapPin className="h-5 w-5 text-neutral-600" />
              <input
                value={hostPlace}
                onChange={(e) => setHostPlace(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none"
                placeholder="예: 보라매공원"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">시간</div>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 ring-1 ring-neutral-200">
              <Clock className="h-5 w-5 text-neutral-600" />
              <input
                value={hostTime}
                onChange={(e) => setHostTime(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none"
                placeholder="예: 오늘 12:30"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <div className="text-xs font-bold text-neutral-500">참가자 최소 점수</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                <span>50</span>
                <span className="text-sm font-extrabold text-neutral-900">{hostMinScore}</span>
                <span>99</span>
              </div>
              <input
                className="mt-2 w-full"
                type="range"
                min={50}
                max={99}
                value={hostMinScore}
                onChange={(e) => setHostMinScore(Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-neutral-500">
                점수가 높을수록 “성향/참여율” 기반으로 필터링이 강해지는 느낌을 줄 수 있음
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={completeHostSetup}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white"
          >
            설정 완료 · 모임 생성
          </button>
        </div>
      </Modal>

      <Toast open={!!toast} text={toast ?? ""} containerRef={frameRef} />
    </div>
  );
}
