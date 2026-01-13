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

  /** ✅ MapTab의 frameRef를 넘겨줘야 "바닥에 딱 붙음" */
  containerRef: React.RefObject<HTMLElement | null>;

  initial?: SheetSnap;
  peekHeight?: number;
  topSafe?: number;     // full일 때 컨테이너 top에서 띄울 px
  halfRatio?: number;   // 컨테이너 높이 대비 half 위치 비율
  bottomOffset?: number; // 필요하면(탭바가 컨테이너 안에 있을 때) 사용, 지금은 0

  onSnapChange?: (snap: SheetSnap) => void;
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
}: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [containerH, setContainerH] = useState(0);

  // ✅ 컨테이너 높이를 "진짜 DOM"에서 측정 (vh 쓰면 너처럼 떠버림)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerH(rect.height);
    };

    measure();

    // ResizeObserver로 반응형/리사이즈 대응
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  // 스냅 지점: y는 "컨테이너 top 기준"에서 내려온 px
  const snaps = useMemo(() => {
    const h = containerH || 800;

    const fullTop = clamp(topSafe, 0, h - 200);
    const halfTop = clamp(Math.round(h * halfRatio), 80, h - 220);

    // ✅ bottomOffset을 고려해서 peek 위치를 컨테이너 바닥에 딱 붙게
    const peekTop = clamp(h - bottomOffset - peekHeight, 120, h - bottomOffset - 80);

    return { full: fullTop, half: halfTop, peek: peekTop } as const;
  }, [containerH, topSafe, halfRatio, peekHeight, bottomOffset]);

  const [snap, setSnap] = useState<SheetSnap>(initial);
  const y = useMotionValue(snaps[initial]);

  // 컨테이너 높이/스냅 바뀌면 현재 스냅 위치로 보정
  useEffect(() => {
    y.set(snaps[snap]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps.full, snaps.half, snaps.peek]);

  const setTo = (next: SheetSnap) => {
    setSnap(next);
    onSnapChange?.(next);
    animate(y, snaps[next], { type: "spring", stiffness: 320, damping: 32 });
  };

  const nearestSnap = (currentY: number) => {
    const candidates: Array<[SheetSnap, number]> = [
      ["full", snaps.full],
      ["half", snaps.half],
      ["peek", snaps.peek],
    ];
    candidates.sort((a, b) => Math.abs(a[1] - currentY) - Math.abs(b[1] - currentY));
    return candidates[0][0];
  };

  // ✅ 컨텐츠 높이: "컨테이너 안에서" 계산해야 아래가 비지 않음
  const contentHeight = Math.max(220, (containerH || 800) - snaps.full - 24);

  /**
   * 중요:
   * - 시트는 "컨테이너 안에 absolute"로 박아야 페이지 스크롤/레이아웃 영향 덜 받음
   * - MapTab 컨테이너(frameRef)가 relative여야 함 (너 코드는 relative 맞음)
   */
  return (
    <motion.div
      ref={sheetRef}
      className="absolute left-0 right-0 z-40 mx-auto w-full"
      style={{
        y,
        bottom: 0, // ✅ 컨테이너 바닥 기준
      }}
      drag="y"
      dragConstraints={{ top: snaps.full, bottom: snaps.peek }}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        const velocityY = info.velocity.y;
        const current = y.get();

        // 빠른 스와이프는 방향 우선
        if (Math.abs(velocityY) > 900) {
          if (velocityY < 0) setTo(current <= snaps.half ? "full" : "half");
          else setTo(current >= snaps.half ? "peek" : "half");
          return;
        }

        setTo(nearestSnap(current));
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
            onClick={() => setTo(snap === "full" ? "half" : "full")}
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
          {/* ✅ 내부 스크롤은 유지 */}
          <div className="h-full overflow-y-auto">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
