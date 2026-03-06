import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BizCase = 'bio' | 'fnb' | 'semicon' | 'general';

export interface DateRange {
  start: Date;
  end: Date;
}

interface AppState {
  currentCase: BizCase;
  setCase: (caseType: BizCase) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

// 도메인별 기본 날짜 범위
const getDateRangeForCase = (bizCase: BizCase): DateRange => {
  if (bizCase === 'semicon') {
    // Scenario 1: Aug 28, 2025부터
    return {
      start: new Date('2025-08-01'),
      end: new Date('2025-09-30'),
    };
  }
  // bio, fnb, general → Scenario 5: Mar 31, 2025부터
  return {
    start: new Date('2025-03-31'),
    end: new Date('2025-04-30'),
  };
};

// 기본값: semicon 도메인
const DEFAULT_DATE_RANGE = getDateRangeForCase('semicon');

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentCase: 'semicon', // default
      setCase: (caseType) => set({
        currentCase: caseType,
        dateRange: getDateRangeForCase(caseType), // 도메인 변경 시 날짜도 함께 변경
      }),
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      dateRange: DEFAULT_DATE_RANGE,
      setDateRange: (range) => set({ dateRange: range }),
    }),
    {
      name: 'willog-app-state',
      partialize: (state) => ({
        currentCase: state.currentCase,
        isSidebarCollapsed: state.isSidebarCollapsed,
        // dateRange는 persist하지 않음 (Date 직렬화 이슈)
      }),
      // 상태 복원 후 currentCase에 맞게 dateRange 동기화
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.dateRange = getDateRangeForCase(state.currentCase);
        }
      },
    }
  )
);

