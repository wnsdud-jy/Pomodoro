export const MODE_CONFIG = {
  focus: {
    accentClassName: "from-teal-500 to-cyan-500",
  },
  short_break: {
    accentClassName: "from-amber-400 to-orange-400",
  },
  long_break: {
    accentClassName: "from-sky-500 to-indigo-500",
  },
} as const;

export type PomodoroMode = keyof typeof MODE_CONFIG;

export const MODE_ORDER = Object.keys(MODE_CONFIG) as PomodoroMode[];

export function getModeConfig(mode: PomodoroMode) {
  return MODE_CONFIG[mode];
}
