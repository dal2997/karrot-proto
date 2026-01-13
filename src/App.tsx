import { useState } from "react";
import type { TabKey } from "./data/mock";
import BottomNav from "./components/BottomNav";
import MapTab from "./components/MapTab";
import LifeTab from "./components/LifeTab";

export default function App() {
  const [tab, setTab] = useState<TabKey>("life");

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-[430px]">
        {tab === "life" ? <LifeTab /> : tab === "map" ? <MapTab /> : null}
      </div>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}

