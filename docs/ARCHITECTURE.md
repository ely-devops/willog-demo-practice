# willog-saas 아키텍처 문서

## 목차

1. [개요](#개요)
2. [폴더 구조 상세 설명](#폴더-구조-상세-설명)
3. [상태 관리 (Zustand 패턴)](#상태-관리-zustand-패턴)
4. [라우팅 구조](#라우팅-구조)
5. [컴포넌트 설계 원칙](#컴포넌트-설계-원칙)
6. [스타일링 가이드](#스타일링-가이드)
7. [핵심 기능 상세](#핵심-기능-상세)

---

## 개요

willog-saas는 **Vite + React 19 + TypeScript + TailwindCSS v4** 기반의 물류 추적 및 관리 SaaS 애플리케이션입니다.

### 주요 특징

- **다중 도메인 지원**: 반도체, 바이오, 식음료, 일반 물류 등 4가지 비즈니스 도메인
- **실시간 위치 추적**: Mapbox GL을 활용한 대시보드 지도 시각화
- **3D 창고 관리**: Smplrspace SDK를 통한 3D 창고 바닥도 시각화
- **AI 어시스턴트**: 데이터 분석 및 인사이트 제공
- **국제화 (i18n)**: 한국어, 영어 지원
- **반응형 설계**: 1920x1080 기준으로 설계되며, 더 큰 뷰포트에서 rem 기반 업스케일

### 기술 스택

| 분야 | 기술 | 버전 |
|------|------|------|
| **프레임워크** | React | 19.2.0 |
| **언어** | TypeScript | 5.9.3 |
| **빌드 도구** | Vite | 7.2.4 |
| **스타일링** | TailwindCSS | 4.0.0 |
| **라우팅** | React Router | 7.11.0 |
| **상태 관리** | Zustand | 5.0.9 |
| **국제화** | i18next | 25.7.3 |
| **지도** | Mapbox GL | 3.17.0 |
| **차트** | Recharts | 3.6.0 |
| **폼** | react-hook-form | 7.69.0 |
| **유틸** | @turf/turf | 7.3.1 |
| **3D 창고** | @smplrspace/smplr-loader | 2.47.0 |

---

## 폴더 구조 상세 설명

```
willog-saas/src/
├── assets/                          # 정적 자산 (SVG, 이미지)
│   ├── willog-logo.svg
│   ├── lnb/                        # 좌측 네비게이션 아이콘
│   │   ├── layout-left.svg
│   │   ├── domain-icons/           # 도메인별 아이콘 (semicon, bio, fnb, general)
│   │   └── index.ts                # 아이콘 export
│   ├── menu-icons/                 # 메뉴 아이콘 (dashboard, register, management 등)
│   ├── domain-icons/               # 도메인 선택 드롭다운 아이콘
│   ├── header/                     # 헤더 아이콘 (언어, 알림, 설정)
│   ├── dashboard/                  # 대시보드 전용 아이콘
│   │   ├── table-icons/            # 테이블용 아이콘
│   │   └── device-icons/           # 디바이스 상태 아이콘
│   ├── common/                     # 공용 아이콘 (화살표, 정렬 등)
│   ├── ai-assistant/               # AI 어시스턴트 아이콘
│   └── index.ts
│
├── components/                      # React 컴포넌트
│   ├── auth/                        # 인증 관련
│   │   └── ProtectedRoute.tsx       # 보호된 라우트 래퍼
│   │
│   ├── layout/                      # 레이아웃 컴포넌트 (모든 페이지 공유)
│   │   ├── Layout.tsx               # 메인 레이아웃 (LNB + Header + Content)
│   │   ├── LNB.tsx                 # Left Navigation Bar (사이드바)
│   │   └── Header.tsx               # 상단 헤더 (브레드크럼, 언어, 알림, 사용자 메뉴)
│   │
│   ├── common/                      # 재사용 가능한 공통 컴포넌트
│   │   ├── charts/                 # 차트 컴포넌트
│   │   │   ├── ChartGrid.tsx       # 차트 그리드 레이아웃
│   │   │   ├── EnvironmentLineChart.tsx  # 환경 조건 라인 차트
│   │   │   └── ShockBarChart.tsx   # 충격 데이터 바 차트
│   │   ├── DataTable.tsx            # 일반 데이터 테이블
│   │   ├── KPIMiniChart.tsx         # KPI 카드용 미니 차트
│   │   ├── DateRangePicker.tsx      # 날짜 범위 선택 컴포넌트
│   │   ├── SectionCard.tsx          # 섹션 카드 래퍼
│   │   ├── ScrollToTop.tsx          # 페이지 이동 시 스크롤 상단 이동
│   │   ├── LanguageSelector.tsx     # 언어 선택 드롭다운
│   │   ├── FileUploadModal.tsx      # 파일 업로드 모달
│   │   ├── RegistrationSummaryModal.tsx  # 등록 요약 모달
│   │   └── SuccessToast.tsx         # 성공 토스트 알림
│   │
│   ├── dashboard/                   # 대시보드 전용 컴포넌트
│   │   ├── EnvironmentTrendSection.tsx      # 환경 지표 섹션
│   │   ├── EnvironmentTrendHeader.tsx       # 환경 지표 헤더
│   │   └── EnvironmentTrendStats.tsx        # 환경 지표 통계
│   │
│   ├── map/                         # 지도 관련 컴포넌트
│   │   └── JourneyMap.tsx           # Mapbox 기반 여정 지도
│   │
│   ├── warehouse/                   # 3D 창고 관련 컴포넌트
│   │   ├── WarehouseMap.tsx         # Smplrspace 3D 창고 맵
│   │   └── WarehouseMapControls.tsx # 창고 맵 컨트롤 패널
│   │
│   ├── icons/                       # 아이콘 컴포넌트
│   │   └── DomainIcons.tsx          # 도메인별 SVG 아이콘
│   │
│   └── ai-assistant/                # AI 어시스턴트 컴포넌트
│       ├── AIAssistant.tsx          # AI 어시스턴트 고정 버튼 & 상태 관리
│       ├── AIAssistantButton.tsx    # AI 호출 버튼
│       ├── AIChatWindow.tsx         # 채팅 창 (미니 모드)
│       ├── AIChatWindowFullscreen.tsx  # 채팅 창 (전체화면 모드)
│       ├── AIResponseView.tsx       # AI 응답 컨테이너
│       ├── AIResponseBlock.tsx      # AI 응답 블록 (텍스트)
│       ├── AIResponsePrompt2.tsx    # AI 응답 프롬프트 (유형 2)
│       ├── AIResponsePrompt3.tsx    # AI 응답 프롬프트 (유형 3)
│       ├── AIResponseAlert.tsx      # AI 응답 알림 박스
│       ├── AIKPICard.tsx            # AI 응답 KPI 카드
│       ├── AITrendChart.tsx         # AI 응답 추세 차트
│       ├── AIPeriodTimeline.tsx     # AI 응답 기간 타임라인
│       ├── AIAssistantTooltip.tsx   # AI 어시스턴트 툴팁
│       └── index.ts                 # 컴포넌트 export
│
├── pages/                           # 페이지 컴포넌트 (라우트 레벨)
│   ├── auth/
│   │   └── LoginPage.tsx            # 로그인 페이지
│   ├── dashboard/
│   │   └── DashboardPage.tsx        # 메인 대시보드 (KPI, 지도, 테이블, 알림)
│   ├── journey/
│   │   └── JourneyDetailPage.tsx    # 여정 상세 페이지
│   ├── register/
│   │   └── RegisterPage.tsx         # 배송 데이터 등록 페이지
│   ├── management/
│   │   └── ManagementPage.tsx       # 관리 페이지 (미구현)
│   ├── intelligence/
│   │   └── IntelligencePage.tsx     # 데이터 인텔리전스 페이지 (미구현)
│   ├── aiassistant/
│   │   └── AIAssistantPage.tsx      # AI 어시스턴트 전체화면 페이지
│   └── history/
│       └── HistoryPage.tsx          # 이력 추적 페이지 (미구현)
│
├── stores/                          # Zustand 상태 관리
│   ├── useAuthStore.ts              # 인증 상태 (사용자, 로그인 여부)
│   ├── useAppStore.ts               # 앱 전역 상태 (도메인, 사이드바, 날짜 범위)
│   └── useLanguageStore.ts          # 언어 설정 (ko/en)
│
├── hooks/                           # 커스텀 React 훅
│   ├── useUrlStateSync.ts           # URL 파라미터와 상태 동기화
│   └── index.ts
│
├── utils/                           # 유틸리티 함수 및 상수
│   ├── mockData.ts                  # 목 데이터 (KPI, 여정, 테이블 등)
│   ├── environmentMockData.ts        # 환경 지표 목 데이터
│   ├── warehouseMapData.ts          # 창고 맵 마커 데이터
│   └── temperature.ts               # 온도 관련 유틸리티
│
├── types/                           # TypeScript 타입 정의
│   ├── warehouse.types.ts           # 창고 맵 관련 타입
│   ├── file-upload.types.ts         # 파일 업로드 관련 타입
│   ├── i18next.d.ts                # i18next 타입 정의
│   └── vite-env.d.ts               # Vite 환경 변수 타입
│
├── locales/                         # 국제화 (i18n)
│   ├── ko.json                      # 한국어 번역
│   ├── en.json                      # 영어 번역
│   ├── i18n.ts                      # i18next 설정
│   └── index.ts
│
├── styles/                          # 스타일 파일
│   ├── fonts/                       # 폰트 파일
│   │   ├── gt-america.css          # GT America 폰트
│   │   └── akkurat-mono.css        # Akkurat Mono 폰트
│   └── generated/                  # 생성된 디자인 토큰
│       ├── theme.css               # 색상, 타이포그래피 토큰
│       └── utilities.css           # 유틸리티 클래스
│
├── App.tsx                          # 루트 컴포넌트 (라우트 정의)
├── main.tsx                         # 앱 진입점
├── index.css                        # 전역 스타일 (Tailwind, 커스텀 유틸리티)
└── vite-env.d.ts                   # Vite 타입 정의
```

### 주요 폴더별 역할

#### `components/`
모든 재사용 가능한 UI 컴포넌트를 포함합니다. 폴더는 기능 영역별로 구분되어 있으며, 각 컴포넌트는 단일 책임 원칙을 따릅니다.

- **layout/**: 모든 페이지에서 공유하는 레이아웃 컴포넌트
- **common/**: 여러 페이지에서 재사용되는 범용 컴포넌트
- **dashboard/**: 대시보드 페이지에만 사용되는 특화 컴포넌트
- **ai-assistant/**: AI 기능 관련 컴포넌트

#### `pages/`
라우트 레벨의 페이지 컴포넌트입니다. 각 페이지는 폴더별로 정리되고, 페이지 라우팅을 담당합니다.

#### `stores/`
Zustand를 사용한 글로벌 상태 관리입니다. localStorage 지속성을 포함하여 새로고침 후에도 상태가 유지됩니다.

#### `utils/`
목 데이터, 헬퍼 함수, 상수 등을 포함합니다. 비즈니스 로직은 최소화하고 순수 데이터와 함수만 포함합니다.

#### `types/`
TypeScript 타입 정의를 중앙화하여 관리합니다. 컴포넌트에서 필요한 모든 타입을 import할 수 있습니다.

---

## 상태 관리 (Zustand 패턴)

willog-saas는 **Zustand**를 사용하여 글로벌 상태를 관리합니다. persist 미들웨어를 사용하여 localStorage에 상태를 저장하고, 새로고침 후에도 상태가 복원됩니다.

### 1. useAuthStore - 인증 상태

```typescript
// src/stores/useAuthStore.ts
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

**특징:**
- localStorage 키: `auth-storage`
- 로그인 상태 및 사용자 정보 저장
- `ProtectedRoute` 컴포넌트에서 인증 여부 확인

**사용 예시:**
```tsx
const { isAuthenticated, login, logout } = useAuthStore();

// 로그인
login({ id: '1', email: 'user@example.com', name: 'John Doe' });

// 로그아웃
logout();
```

### 2. useAppStore - 앱 전역 상태

```typescript
// src/stores/useAppStore.ts
export type BizCase = 'bio' | 'fnb' | 'semicon' | 'general';

interface DateRange {
  start: Date;
  end: Date;
}

interface AppState {
  currentCase: BizCase;                    // 현재 선택된 도메인
  setCase: (caseType: BizCase) => void;
  isSidebarCollapsed: boolean;             // 사이드바 축소 여부
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  dateRange: DateRange;                   // 대시보드 날짜 범위
  setDateRange: (range: DateRange) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentCase: 'semicon',
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.dateRange = getDateRangeForCase(state.currentCase);
        }
      },
    }
  )
);
```

**특징:**
- localStorage 키: `willog-app-state`
- **부분 지속성**: `partialize` 옵션으로 특정 상태만 저장
- **dateRange는 persist하지 않음**: Date 객체 직렬화 문제 해결
- **onRehydrateStorage**: 복원 후 currentCase에 맞는 dateRange 자동 생성
- **도메인별 기본 날짜**: semicon은 8월-9월, 나머지는 3월-4월

**사용 예시:**
```tsx
const { currentCase, setCase, isSidebarCollapsed, toggleSidebar, dateRange, setDateRange } = useAppStore();

// 도메인 변경
setCase('bio');

// 사이드바 토글
toggleSidebar();

// 날짜 범위 변경
setDateRange({ start: new Date('2025-01-01'), end: new Date('2025-01-31') });
```

### 3. useLanguageStore - 언어 설정

```typescript
// src/stores/useLanguageStore.ts
export type Language = 'ko' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'willog-language' }
  )
);
```

**특징:**
- localStorage 키: `willog-language`
- i18next와 연동하여 언어 변경

**사용 예시:**
```tsx
const { language, setLanguage } = useLanguageStore();

// 언어 변경
setLanguage('en');
```

### 상태 관리 베스트 프랙티스

1. **상태 설계**: 상태는 단순하고 직렬화 가능해야 합니다.
2. **액션 단순화**: 각 액션은 하나의 책임만 가집니다.
3. **localStorage 관리**: persist 옵션을 명확히 설정하여 불필요한 저장을 방지합니다.
4. **Date 타입 처리**: Date 객체는 localStorage에 저장하지 않고, 필요시 계산합니다.

---

## 라우팅 구조

willog-saas는 **React Router v7**을 사용하여 라우팅을 구현합니다. 보호된 라우트 패턴을 적용하여 인증되지 않은 사용자의 접근을 차단합니다.

### 라우트 계층 구조

```
/
├── /login                           # 공개 라우트 (로그인)
│
└── / (ProtectedRoute + Layout)     # 보호된 라우트 (모든 인증 페이지)
    ├── / (redirect to /dashboard/hightech)
    │
    ├── /dashboard/:domain          # 대시보드
    │   ├── /dashboard/hightech     # 반도체/일반 물류 대시보드
    │   └── /dashboard/lifesciences # 바이오 콜드체인 대시보드
    │
    ├── /journey/:domain/:journeyId # 여정 상세
    │   ├── /journey/hightech/:journeyId
    │   └── /journey/lifesciences/:journeyId
    │
    ├── /register                   # 배송 데이터 등록
    ├── /management                 # 관리 페이지 (미구현)
    ├── /intelligence               # 데이터 인텔리전스 (미구현)
    ├── /history                    # 이력 추적 (미구현)
    │
    └── /aiassistant               # AI 어시스턴트 전체화면 페이지
```

### 라우트 정의 (src/App.tsx)

```typescript
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/hightech" replace />} />

          {/* 대시보드 라우트 */}
          <Route path="dashboard/hightech" element={<DashboardPage bizCase="semicon" />} />
          <Route path="dashboard/lifesciences" element={<DashboardPage bizCase="bio" />} />

          {/* 여정 상세 라우트 */}
          <Route path="journey/hightech/:journeyId" element={<JourneyDetailPage bizCase="semicon" />} />
          <Route path="journey/lifesciences/:journeyId" element={<JourneyDetailPage bizCase="bio" />} />

          {/* 기타 라우트 */}
          <Route path="register" element={<RegisterPage />} />
          <Route path="management" element={<ManagementPage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 도메인별 URL 매핑

willog-saas는 도메인 개념을 URL 경로에 반영합니다:

| BizCase | 경로 세그먼트 | 설명 |
|---------|------------|------|
| `semicon` | `hightech` | 반도체 고가 물류 |
| `bio` | `lifesciences` | 바이오 콜드체인 |
| `fnb` | `hightech` | 식음료 콜드체인 (semicon과 동일 경로 사용) |
| `general` | `hightech` | 일반 화물 (semicon과 동일 경로 사용) |

### ProtectedRoute 컴포넌트

```typescript
// src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

**특징:**
- useAuthStore에서 `isAuthenticated` 확인
- 미인증 사용자를 `/login`으로 리다이렉트
- 시도한 위치를 state에 저장하여 로그인 후 복귀 가능

### Layout 컴포넌트

모든 보호된 라우트는 Layout 컴포넌트로 감싸져 있습니다:

```typescript
// src/components/layout/Layout.tsx
export const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LNB Sidebar */}
      <aside className={...}>
        <LNB />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-gray-50">
        {/* Header */}
        <Header />

        {/* Page Content (Outlet) */}
        <div className="flex-1 bg-white rounded-tl-2 border border-gray-200 overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* AI Assistant (Fixed) */}
      <AIAssistant />
    </div>
  );
};
```

---

## 컴포넌트 설계 원칙

### 1. 컴포넌트 계층화

willog-saas는 다음과 같은 계층화된 컴포넌트 구조를 따릅니다:

```
Pages (라우트 레벨)
  ↓
Sections (기능 영역)
  ↓
Common Components (재사용 가능한 컴포넌트)
  ↓
UI Elements (기본 UI 요소: 버튼, 카드 등)
```

**예시**: 대시보드 페이지

```
DashboardPage
├── EnvironmentTrendSection (섹션)
│   ├── EnvironmentTrendHeader
│   ├── EnvironmentTrendStats
│   └── ChartGrid (공통 컴포넌트)
│       ├── EnvironmentLineChart
│       └── ShockBarChart
├── JourneyMap
├── DataTable
└── WarehouseMap
```

### 2. 컴포넌트 책임 분리

각 컴포넌트는 하나의 책임을 가집니다:

| 계층 | 책임 | 예시 |
|------|------|------|
| **Page** | 라우트 관리, 데이터 페칭, 전체 레이아웃 | `DashboardPage` |
| **Section** | 기능 영역 구성, 상태 관리 | `EnvironmentTrendSection` |
| **Component** | 재사용 가능한 UI 로직 | `DataTable`, `DateRangePicker` |
| **Element** | 순수 UI 렌더링 | 버튼, 카드, 텍스트 |

### 3. Props 설계

**작은 Props 인터페이스:**
```typescript
// ❌ 피해야 할 패턴 - Props가 너무 많음
interface DataTableProps {
  data: any[];
  columns: any[];
  onSort: () => void;
  onFilter: () => void;
  onExport: () => void;
  className?: string;
  // ... 10개 이상
}

// ✅ 권장 패턴 - 필수 Props만 정의
interface DataTableProps {
  data: any[];
  columns: any[];
  onRowClick?: (row: any) => void;
}
```

**Props 전파 피하기:**
```typescript
// ❌ Props drilling - 너무 깊음
<GrandParent data={data} />
  <Parent data={data} />
    <Child data={data} />

// ✅ 상태 관리 또는 Context 사용
const data = useAppStore();
<GrandParent />
  <Parent />
    <Child /> // useAppStore()에서 직접 접근
```

### 4. 컴포넌트 예시: DataTable

```typescript
// src/components/common/DataTable.tsx
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <table className={className}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className="hover:bg-gray-50 cursor-pointer"
          >
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key as keyof T], row) : row[col.key as keyof T]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 5. 아이콘 컴포넌트 패턴

아이콘은 인라인 SVG 컴포넌트로 정의하여 색상과 크기를 Tailwind 클래스로 제어합니다:

```typescript
// ✅ 권장 패턴
interface IconProps {
  className?: string;
}

const ChevronDownIcon = ({ className }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 사용
<ChevronDownIcon className="w-5 h-5 text-gray-800 hover:text-primary" />
```

### 6. 모달 및 오버레이 컴포넌트

오버레이(모달, 드롭다운)는 `createPortal`로 body에 렌더링하여 stacking context 문제를 해결합니다:

```typescript
// LNB.tsx의 도메인 선택 드롭다운
import { createPortal } from 'react-dom';

{createPortal(
  <div ref={dropdownRef} className="...">
    {/* 드롭다운 컨텐츠 */}
  </div>,
  document.body
)}
```

---

## 스타일링 가이드

willog-saas는 **TailwindCSS v4** 기반의 유틸리티 우선 방식을 사용합니다.

### 1. 설계 토큰 시스템

모든 스타일 값은 설계 토큰으로 정의되어 일관성을 유지합니다:

```css
/* src/index.css에서 정의 */
@theme {
  --color-primary: #417DF7;
  --color-gray-1000: #17171c;
  --color-gray-800: #45454f;
  /* ... 더 많은 토큰 */
}
```

**생성된 토큰**: `scripts/build-tokens.ts`에서 Figma 토큰을 자동으로 CSS로 생성합니다.

```bash
npm run tokens  # 토큰 생성
npm run tokens:watch  # 감시 모드
```

### 2. 색상 토큰 매핑

| HEX 값 | Tailwind 클래스 | 사용처 |
|--------|---------------|-------|
| `#17171c` | `text-gray-1000` | 주 텍스트 |
| `#45454f` | `text-gray-800` | 보조 텍스트, 아이콘 |
| `#737680` | `text-gray-600` | 비활성 텍스트 |
| `#417DF7` | `text-primary`, `bg-primary` | 주요 액션 |
| `#fef3c7` | `bg-orange-100` | 경고 배경 |
| `#fee2e2` | `bg-red-100` | 위험 배경 |
| `#dcfce7` | `bg-green-100` | 성공 배경 |

**사용 예시:**
```tsx
// ✅ 올바른 방식 - 토큰 사용
<div className="text-gray-1000 bg-white border border-gray-300">
  <button className="bg-primary text-white px-4 py-2 rounded">
    {t('common.save')}
  </button>
</div>

// ❌ 피해야 할 방식 - 하드코딩
<div className="text-[#17171c] bg-[#ffffff] border border-[#dcdce0]">
  <button className="bg-[#417df7] text-[#ffffff]">Save</button>
</div>
```

### 3. 타이포그래피

커스텀 타이포그래피 클래스가 `src/index.css`에 정의되어 있습니다:

| 클래스 | 크기 | 가중치 | 사용처 |
|--------|------|-------|-------|
| `text-display-xxxl` | 72px | Bold | KPI 숫자 |
| `text-display-l` | 32px | Bold | 통계 제목 |
| `text-h1` | 32px | Bold | 페이지 제목 |
| `text-h2` | 24px | Bold | 섹션 제목 |
| `text-h3` | 16px | Medium | 서브섹션 제목 |
| `text-h4` | 14px | Medium | 작은 제목 |
| `text-body-m` | 14px | Regular | 기본 텍스트 |
| `text-body-s` | 13px | Regular | 작은 텍스트 |
| `text-body-xs` | 12px | Regular | 아주 작은 텍스트 |
| `text-label-m` | 14px | Medium | 라벨 |
| `text-label-m-strong` | 14px | Bold | 강조 라벨 |

**사용 예시:**
```tsx
<div className="text-h1 text-gray-1000">페이지 제목</div>
<p className="text-body-m text-gray-600">설명 텍스트</p>
<label className="text-label-m-strong">라벨</label>
```

### 4. rem 기반 반응형 설계

프로젝트는 1920x1080 기준으로 설계되어 있으며, 더 큰 뷰포트에서 rem 기반으로 비례 스케일링됩니다:

```css
/* src/index.css */
html {
  font-size: 16px;  /* 기본값 */
}

@media (min-width: 1920px) {
  html {
    font-size: calc(16px * (100vw / 1920px));  /* 뷰포트 비례 스케일 */
  }
}
```

**px to rem 변환:**
```
rem = px / 16

예: 280px = 17.5rem, 72px = 4.5rem
```

**자주 사용하는 값:**
```tsx
// ❌ 피해야 할 방식 - px 하드코딩
className="w-[280px] h-[72px] rounded-[8px]"

// ✅ 올바른 방식 - rem 사용
className="w-[17.5rem] h-[4.5rem] rounded-[0.5rem]"
```

### 5. Badge/Pill 스타일링

뱃지 배경색은 Figma 기준의 정확한 rgba 값을 사용합니다:

```tsx
// Primary badge (파란색)
<div className="bg-[rgba(65,125,247,0.08)] text-primary px-2 py-1 rounded">
  정상 진행중
</div>

// Black badge (회색)
<div className="bg-[rgba(23,23,28,0.08)] text-gray-800 px-2 py-1 rounded">
  도착 예정
</div>

// Success badge
<div className="bg-green-100 text-green-600 px-2 py-1 rounded">
  완료
</div>

// Warning badge
<div className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
  경고
</div>

// Danger badge
<div className="bg-red-100 text-red-600 px-2 py-1 rounded">
  위험
</div>
```

### 6. 사이드바 애니메이션

사이드바 collapse/expand 애니메이션은 커스텀 타이밍 함수를 사용합니다:

```css
/* src/index.css */
@utility transition-sidebar {
  transition-property: width, padding, opacity, transform;
  transition-duration: 600ms;
  transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}

@utility transition-sidebar-content {
  transition-property: opacity, width;
  transition-duration: 550ms;
  transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}
```

**사용 예시:**
```tsx
<aside className={`
  ${isSidebarCollapsed ? 'w-[4.5rem]' : 'w-[17.5rem]'}
  transition-sidebar
`}>
  {/* 내용 */}
</aside>
```

### 7. 폰트 설정

프로젝트는 두 가지 폰트를 사용합니다:

```css
/* src/index.css */
:root {
  --font-sans: "GT America", "SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: "GT America", "SUIT Variable", SUIT, sans-serif;
  --font-mono: "Akkurat Mono", monospace;
}
```

- **GT America**: 영문, 숫자 (우선)
- **SUIT Variable**: 한글 (fallback)
- **Akkurat Mono**: 코드, 디바이스 ID, 타임스탬프 (monospace)

**사용:**
```tsx
<div className="font-sans">기본 폰트 (GT America + SUIT)</div>
<div className="font-display">표시용 폰트 (GT America)</div>
<code className="font-mono">코드 (Akkurat Mono)</code>
```

---

## 핵심 기능 상세

### 1. 대시보드 (Dashboard)

**위치**: `src/pages/dashboard/DashboardPage.tsx`

대시보드는 KPI, 지도, 환경 지표, 여정 테이블, 알림 등을 표시합니다.

**주요 기능:**
- **KPI 카드**: 배송 수, 문제 발생, 온도 위반 등의 지표
- **여정 지도**: Mapbox를 사용한 실시간 위치 추적
- **3D 창고**: Smplrspace를 사용한 3D 창고 시각화
- **환경 지표**: 온도, 습도, 충격 등의 시계열 데이터
- **여정 테이블**: 배송 여정 목록 및 상태
- **알림**: 이상 상황 알림 (온도 초과, 충격 발생 등)

**도메인별 데이터:**
```typescript
// semicon (반도체)
const SEMICON_KPI_DATA = { ... };

// bio (바이오)
const BIO_KPI_DATA = { ... };
```

### 2. 여정 상세 (Journey Detail)

**위치**: `src/pages/journey/JourneyDetailPage.tsx`

단일 배송 여정의 상세 정보를 표시합니다.

**주요 정보:**
- 배송 제품 정보 (상품명, 고객, 배송 번호)
- 현재 위치 및 예정 도착 시간
- 운송 수단 및 경로 지도
- 환경 조건 (온도, 습도, 충격, 빛 노출)
- 환경 지표 차트 (시계열)
- 이상 이벤트 목록

### 3. 등록 (Register)

**위치**: `src/pages/register/RegisterPage.tsx`

새로운 배송 데이터를 등록합니다.

**주요 기능:**
- 파일 업로드 (CSV, Excel)
- 데이터 검증
- 등록 요약 모달
- 성공 토스트 알림

### 4. AI 어시스턴트 (AI Assistant)

**위치**: `src/components/ai-assistant/`

모든 페이지에서 고정 버튼으로 활성화되는 AI 기능입니다.

**주요 기능:**
- **채팅**: 데이터 질문에 대한 AI 응답
- **응답 유형**: 텍스트, KPI 카드, 차트, 프롬프트, 알림
- **미니 모드**: 우측 하단 채팅 창
- **전체화면 모드**: `/aiassistant` 페이지

### 5. 국제화 (i18n)

**위치**: `src/locales/`

한국어(ko)와 영어(en) 두 가지 언어를 지원합니다.

**번역 파일:**
- `ko.json`: 한국어 번역
- `en.json`: 영어 번역

**사용:**
```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return <h1>{t('nav.dashboard', '대시보드')}</h1>;
};
```

**언어 변경:**
```typescript
const { language, setLanguage } = useLanguageStore();
setLanguage('en');  // 영어로 변경
```

### 6. 목 데이터 (Mock Data)

**위치**: `src/utils/mockData.ts`

실제 API 연동 전까지 사용하는 샘플 데이터입니다.

**포함 항목:**
- KPI 데이터 (KPI_DATA, BIO_KPI_DATA)
- 여정 데이터 (JOURNEY_DATA, BIO_JOURNEY_DETAIL_DATA)
- 테이블 데이터 (여정, 디바이스)
- 알림 데이터
- AI 인사이트

### 7. 지도 통합

#### Mapbox (2D 지도)

**위치**: `src/components/map/JourneyMap.tsx`

- 배송 여정의 경로 시각화
- 출발지, 현재 위치, 도착지 마커
- 경로 색상: 완료(파랑), 남은 경로(회색)
- @turf/turf를 사용한 지리 계산

#### Smplrspace (3D 창고)

**위치**: `src/components/warehouse/WarehouseMap.tsx`

- 3D 창고 바닥도 시각화
- 마커 위치 표시
- 레벨 선택 기능

**주의사항:**
- React 18 Strict Mode와 호환성 문제: `isMounted` 플래그 사용
- MutationObserver 사용 금지 (무한 루프 발생)
- Level indices는 0-based (L1 = index 0)

### 8. 매일 매일 업그레이드

일반적으로 실제 API 연동시:

1. `src/utils/mockData.ts`의 목 데이터를 API 호출로 변경
2. 페이지/컴포넌트에서 데이터 소스를 변경
3. 에러 처리 추가
4. 로딩 상태 추가

**점진적 마이그레이션:**
```typescript
// 1단계: 목 데이터
const data = BIO_KPI_DATA;

// 2단계: API 호출
const { data, loading, error } = useFetchKPI();

// 3단계: 에러 처리
if (error) return <ErrorComponent error={error} />;
if (loading) return <LoadingComponent />;
return <Dashboard data={data} />;
```

---

## 개발 워크플로우

### 프로젝트 시작

```bash
cd willog-saas
npm install
npm run dev        # 개발 서버 시작 (http://localhost:5173)
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
npm run tokens     # 디자인 토큰 생성
```

### 새로운 페이지 추가

1. `src/pages/{feature}/{FeatureName}Page.tsx` 생성
2. `src/App.tsx`에 라우트 추가
3. `src/components/layout/LNB.tsx`에 메뉴 항목 추가
4. 필요한 컴포넌트 생성

### 새로운 컴포넌트 생성

1. **공통 컴포넌트**: `src/components/common/{ComponentName}.tsx`
2. **특화 컴포넌트**: `src/components/{feature}/{ComponentName}.tsx`
3. Props 인터페이스 정의
4. 단위 테스트 작성 (미래)

### 상태 추가

1. `src/stores/use{FeatureName}Store.ts` 생성
2. `create()` 및 `persist()` 설정
3. 필요한 곳에서 `useStore()` 호출

---

## 성능 최적화 고려사항

1. **코드 분할**: 페이지 단위 lazy loading
2. **이미지 최적화**: SVG 아이콘 사용, 이미지 포맷 최적화
3. **번들 크기**: 사용하지 않는 의존성 제거
4. **메모이제이션**: 복잡한 컴포넌트에 React.memo 적용
5. **상태 정규화**: 중복 상태 최소화

---

## 알려진 제약사항 및 향후 개선 항목

### 기술 부채

1. **Mapbox 토큰**: 현재 DashboardPage에 하드코딩 → .env로 이동 필요
2. **에러 바운더리**: 포괄적인 에러 처리 부재
3. **테스트 커버리지**: 현재 테스트 파일 없음
4. **i18n 완성도**: 일부 번역이 누락되어 있을 수 있음
5. **접근성 (a11y)**: ARIA 레이블, 키보드 네비게이션 개선 필요

### 향후 개선 항목

1. **API 연동**: 실제 백엔드 API 통합
2. **실시간 업데이트**: WebSocket 또는 Server-Sent Events
3. **오프라인 지원**: Service Worker 구현
4. **고급 분석**: 더 많은 AI 기능
5. **모바일 대응**: 반응형 모바일 UI

---

## 참고 자료

- **Tailwind CSS**: https://tailwindcss.com/
- **React Router**: https://reactrouter.com/
- **Zustand**: https://github.com/pmndrs/zustand
- **Mapbox GL**: https://docs.mapbox.com/mapbox-gl-js/
- **i18next**: https://www.i18next.com/
- **Smplrspace**: https://docs.smplrspace.com/

---

**문서 작성일**: 2025년 1월 30일
**최종 업데이트**: willog-saas v0.0.0
