// src/components/BottomSheet.tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ChevronUp } from "lucide-react";

type SheetSnap = "peek" | "half" | "full";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Props = {
  header?: React.ReactNode;
  children: React.ReactNode;

  /** ✅ MapTab의 frameRef를 넘겨줘야 "컨테이너 바닥 기준"으로 정확히 맞음 */
  containerRef: React.RefObject<HTMLElement | null>;

  initial?: SheetSnap;
  peekHeight?: number;
  topSafe?: number; // full일 때 컨테이너 top에서 띄울 px
  halfRatio?: number; // 컨테이너 높이 대비 half 위치 비율
  bottomOffset?: number; // ✅ 탭바 가림 방지 (너는 -50 쓰는 케이스)
  onSnapChange?: (snap: SheetSnap) => void;

  /**
   * ✅ 중간에 어중간하게 멈추는 게 싫으면 true
   * - 드래그 끝에서도 full/peek로만 스냅(half 금지)
   * - 헤더 버튼도 full<->peek 왕복
   */
  twoPointSnap?: boolean;
};

export function BottomSheet({
  header,
  children,
  containerRef,
  initial = "peek",
  peekHeight = 160,
  topSafe = 8,
  halfRatio = 0.45,
  bottomOffset = 0,
  onSnapChange,
  twoPointSnap = true, // ✅ 기본 ON (니가 원하는 동작)
}: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [containerH, setContainerH] = useState(0);

  /** ✅ 컨테이너 높이를 "진짜 DOM"에서 측정 */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerH(rect.height);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  /** 스냅 지점: y는 "컨테이너 top 기준"에서 내려온 px */
  const snaps = useMemo(() => {
    const h = containerH || 800;

    // full: 거의 최상단 (topSafe 만큼만 남김)
    const fullTop = clamp(topSafe, 0, h - 200);

    // half: 중간 (필요하면 유지)
    const halfTop = clamp(Math.round(h * halfRatio), 80, h - 220);

    // peek: 바닥에서 peekHeight만 보이게
    // bottomOffset=-50이면 peekTop이 그만큼 더 "위로" 올라가서 탭바를 피함
    const peekTop = clamp(h - bottomOffset - peekHeight, 120, h - bottomOffset - 80);

    return { full: fullTop, half: halfTop, peek: peekTop } as const;
  }, [containerH, topSafe, halfRatio, peekHeight, bottomOffset]);

  const [snap, setSnap] = useState<SheetSnap>(initial);
  const y = useMotionValue(snaps[initial]);

  /** 컨테이너 높이/스냅 바뀌면 현재 스냅 위치로 보정 */
  useEffect(() => {
    y.set(snaps[snap]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps.full, snaps.half, snaps.peek]);

  const setTo = (next: SheetSnap) => {
    setSnap(next);
    onSnapChange?.(next);
    animate(y, snaps[next], { type: "spring", stiffness: 320, damping: 32 });
  };

  const nearestSnap = (currentY: number, projected = currentY) => {
    const candidates: Array<[SheetSnap, number]> = twoPointSnap
      ? ([
          ["full", snaps.full],
          ["peek", snaps.peek],
        ] as Array<[SheetSnap, number]>)
      : ([
          ["full", snaps.full],
          ["half", snaps.half],
          ["peek", snaps.peek],
        ] as Array<[SheetSnap, number]>);

    candidates.sort((a, b) => Math.abs(a[1] - projected) - Math.abs(b[1] - projected));
    return candidates[0][0];
  };

  /** ✅ 컨텐츠 높이: "컨테이너 안에서" 계산 */
  const contentHeight = Math.max(220, (containerH || 800) - snaps.full - 24);

  /** ✅ 드래그 바운드: twoPointSnap이면 full~peek만 */
  const dragConstraints = twoPointSnap
    ? { top: snaps.full, bottom: snaps.peek }
    : { top: snaps.full, bottom: snaps.peek };

  return (
    <motion.div
      ref={sheetRef}
      className="absolute left-0 right-0 z-40 mx-auto w-full"
      style={{
        y,
        bottom: 0, // ✅ 컨테이너 바닥 기준
      }}
      drag="y"
      dragConstraints={dragConstraints}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        const current = y.get();
        const velocity = info.velocity.y;

        // 속도 반영
        const projected = current + velocity * 0.12;

        // ✅ 중간 멈춤 방지: twoPointSnap이면 full/peek로만
        if (twoPointSnap) {
          const mid = (snaps.full + snaps.peek) / 2;
          const next: SheetSnap = projected < mid ? "full" : "peek";
          setTo(next);
          return;
        }

        // 3포인트 스냅(필요할 때)
        const next = nearestSnap(current, projected);
        setTo(next);
      }}
    >
      <div className="overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-neutral-200">
        {/* grab handle */}
        <div className="flex items-center justify-center pt-2">
          <div className="h-1.5 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* header */}
        <div className="px-4 pb-2 pt-2">
          <button
            type="button"
            onClick={() => {
              // ✅ 니가 원하는 동작: 올렸다가 다시 누르면 "첫 화면(peek)"까지 내려감
              if (twoPointSnap) {
                setTo(snap === "full" ? "peek" : "full");
                return;
              }

              // 3포인트일 때는 full<->half로 토글(원하면 바꿔도 됨)
              setTo(snap === "full" ? "half" : "full");
            }}
            className="flex w-full items-center justify-between rounded-2xl px-2 py-2 hover:bg-neutral-50"
            aria-label="시트 확장/축소"
          >
            <div className="min-w-0 flex-1">{header}</div>
            <ChevronUp
              className={`ml-2 h-5 w-5 shrink-0 text-neutral-500 transition ${
                snap === "full" ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* content */}
        <div className="px-4 pb-6" style={{ height: contentHeight }}>
          {/* ✅ 내부 스크롤 유지 */}
          <div className="h-full overflow-y-auto">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
