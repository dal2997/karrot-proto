
import { TABS, type TabKey } from "../data/mock";
import { cn } from "./utils";

export default function BottomNav({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[430px] border-t border-neutral-200 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold",
                  active ? "text-orange-500" : "text-neutral-500"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "" : "opacity-80")} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
