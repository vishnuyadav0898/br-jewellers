import { create } from "zustand";

export const useProfilerStore = create((set) => ({
  stats: {},
  addRender: (id, phase, actualDuration) =>
    set((state) => {
      const current = state.stats[id] || {
        count: 0,
        totalDuration: 0,
        peakDuration: 0,
        phases: { mount: 0, update: 0 },
      };
      const nextCount = current.count + 1;
      const nextTotal = current.totalDuration + actualDuration;
      const nextPeak = Math.max(current.peakDuration, actualDuration);
      const nextPhases = {
        ...current.phases,
        [phase]: (current.phases[phase] || 0) + 1,
      };

      return {
        stats: {
          ...state.stats,
          [id]: {
            count: nextCount,
            totalDuration: nextTotal,
            peakDuration: nextPeak,
            avgDuration: nextTotal / nextCount,
            phases: nextPhases,
            lastRendered: Date.now(),
          },
        },
      };
    }),
  clearStats: () => set({ stats: {} }),
}));
