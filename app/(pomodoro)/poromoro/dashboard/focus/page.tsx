import type { Metadata } from "next";

import { FocusTimerScreen } from "@/app/poromoro/dashboard/_components/focus-timer-screen";

export const metadata: Metadata = {
  title: "Focus Mode",
};

export default function DashboardFocusPage() {
  return <FocusTimerScreen />;
}
