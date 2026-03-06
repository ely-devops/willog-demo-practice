# willog-demo 코드 리뷰 기준서

이 문서는 willog-demo 프로젝트의 모든 코드 리뷰에 적용되는 기준을 정의합니다. PR 검토 시 아래 항목들을 체크하여 코드 품질을 유지하세요.

## 1. 코드 스타일 규칙

### 1.1 TypeScript 필수

모든 새로운 코드는 **반드시 TypeScript**로 작성되어야 합니다.

**O: 타입 명시**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

export const useUserStore = create<User>((set) => ({
  // ...
}));
```

**X: JavaScript (any 타입 사용)**
```typescript
const useUserStore = create((set: any) => ({
  // ... 타입 정의 생략
}));
```

### 1.2 세미콜론 필수

모든 문장 끝에 세미콜론을 붙여야 합니다. ESLint가 자동 확인합니다.

**O: 세미콜론 포함**
```typescript
import { useEffect } from 'react';

const handleClick = () => {
  console.log('clicked');
};
```

**X: 세미콜론 누락**
```typescript
import { useEffect } from 'react'

const handleClick = () => {
  console.log('clicked')
}
```

### 1.3 싱글 쿼트 사용

모든 문자열은 **싱글 쿼트(`'`)**를 사용합니다. 더블 쿼트는 금지입니다.

**O: 싱글 쿼트**
```typescript
import { Button } from '@/components/Button';
const message = 'Hello, World!';
className="text-gray-800"
```

**X: 더블 쿼트**
```typescript
import { Button } from "@/components/Button";
const message = "Hello, World!";
className="text-gray-800"
```

### 1.4 후행 쉼표 (Multiline)

여러 줄로 구성된 객체, 배열, 함수 인자 마지막에 쉼표를 붙입니다.

**O: 후행 쉼표 포함**
```typescript
export interface UserProfile {
  id: string;
  name: string;
  email: string, // ← 마지막 항목에 쉼마 필수
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}; // ← 마지막 속성에 쉼마 필수

const result = fetchData(
  userId,
  { includeProfile: true },
); // ← 인자 마지막에 쉼마 필수
```

**X: 후행 쉼마 누락**
```typescript
export interface UserProfile {
  id: string;
  name: string;
  email: string // ← X: 쉼마 없음
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000 // ← X: 쉼마 없음
};
```

### 1.5 console.log 금지 (프로덕션)

**프로덕션 코드에서 console.log는 금지**입니다. 필요한 경우는 다음과 같이 처리하세요.

**O: 개발 환경에서만 로깅**
```typescript
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

**O: Error 객체 로깅 (필요한 경우)**
```typescript
try {
  await fetchData();
} catch (error) {
  console.error('Failed to fetch:', error);
}
```

**X: 프로덕션 console.log**
```typescript
const handleSubmit = () => {
  console.log('Form submitted'); // ← X: 금지
  submitForm();
};
```

**ESLint 확인:**
```bash
npm run lint
```

---

## 2. 컴포넌트 분리 기준

컴포넌트는 **재사용성**에 따라 폴더를 구분합니다.

### 2.1 공용 컴포넌트 (`components/common/`)

여러 페이지에서 **재사용되는** 컴포넌트는 이 폴더에 배치합니다.

**예시:**
- `Button.tsx` - 범용 버튼
- `SectionCard.tsx` - 섹션 카드
- `Modal.tsx` - 모달
- `Toast.tsx` - 토스트 메시지
- `LanguageSelector.tsx` - 언어 선택기
- `LoadingSpinner.tsx` - 로딩 스피너

**특징:**
- Props로 충분히 커스터마이징 가능
- 비즈니스 로직 없음 (순수 UI)
- 문서화된 Props 인터페이스

**체크리스트:**
- [ ] 2개 이상의 페이지에서 사용되는가?
- [ ] 도메인 특화 로직이 없는가?
- [ ] Props로 충분히 커스터마이징 가능한가?

### 2.2 도메인 전용 컴포넌트 (`components/{도메인}/`)

**특정 도메인 또는 기능에만 사용**되는 컴포넌트입니다.

**예시:**
```
components/
  dashboard/
    KPICard.tsx
    RouteVisualization.tsx
    AlertPanel.tsx
  warehouse/
    WarehouseMap.tsx
    WarehouseMapControls.tsx
  ai-assistant/
    AIChat.tsx
    AIResponseBlock.tsx
```

**특징:**
- 해당 도메인의 비즈니스 로직 포함
- 상태 관리 (useState, hooks)
- 도메인 특화 Props

**체크리스트:**
- [ ] 특정 페이지/도메인에서만 사용되는가?
- [ ] 해당 도메인의 컨텍스트가 필요한가?
- [ ] 다른 도메인에 영향을 주지 않는가?

### 2.3 레이아웃 컴포넌트 (`components/layout/`)

앱 전체 구조를 담당하는 컴포넌트입니다.

**필수 컴포넌트:**
- `Layout.tsx` - 메인 레이아웃 (LNB + Header + Content)
- `Header.tsx` - 상단 헤더
- `LNB.tsx` - 좌측 네비게이션

**특징:**
- 전체 앱 구조 정의
- 인증 상태 반영
- 모든 페이지에서 사용

### 2.4 인증 관련 컴포넌트 (`components/auth/`)

인증/보안 관련 컴포넌트:
- `ProtectedRoute.tsx` - 보호된 라우트 래퍼
- `LoginForm.tsx` - 로그인 폼

---

## 3. 상태 관리 기준

상태의 **범위와 생명주기**에 따라 관리 방식을 결정합니다.

### 3.1 전역 상태 → Zustand stores

앱 전체에서 공유되는 상태는 **Zustand**를 사용합니다.

**위치:** `src/stores/useXxxStore.ts`

**예시 - 인증 상태:**
```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    {
      name: 'auth-storage', // localStorage 키
    }
  )
);
```

**사용:**
```typescript
const MyComponent = () => {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

**체크리스트:**
- [ ] 여러 컴포넌트에서 접근하는가?
- [ ] 영속성(localStorage)이 필요한가?
- [ ] 타입이 명확히 정의되어 있는가?

### 3.2 로컬 상태 → useState

**단일 컴포넌트 또는 부모-자식 관계**에서만 필요한 상태:

**O: 로컬 상태 적절 사용**
```typescript
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <form>{/* ... */}</form>}
    </div>
  );
};
```

**X: Zustand를 과도하게 사용**
```typescript
// ❌ 이 상태는 로컬에서만 쓰이므로 Zustand 필요 없음
export const useModalStore = create((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
}));
```

**체크리스트:**
- [ ] 이 상태가 다른 컴포넌트에서도 필요한가?
- [ ] 페이지 이동 후 유지되어야 하는가?
- [ ] Props drilling이 너무 깊지 않은가?

### 3.3 폼 상태 → react-hook-form

폼 입력 상태는 **react-hook-form**으로 관리합니다.

**예시:**
```typescript
import { useForm } from 'react-hook-form';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginForm) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
          },
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Min 6 characters' },
        })}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
};
```

**체크리스트:**
- [ ] 폼 검증이 필요한가?
- [ ] 필드 에러 메시지를 표시하는가?
- [ ] useState를 폼 상태로 사용하지 않는가?

---

## 4. 네이밍 규칙

일관된 네이밍으로 코드의 가독성을 높입니다.

### 4.1 컴포넌트: PascalCase

React 컴포넌트 파일과 함수명은 **PascalCase**입니다.

**O: 올바른 네이밍**
```
components/
  common/
    Button.tsx
    Modal.tsx
    SectionCard.tsx
  dashboard/
    KPICard.tsx
    RouteVisualization.tsx
  layout/
    Header.tsx
    LNB.tsx
```

```typescript
// Button.tsx
export const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

**X: 잘못된 네이밍**
```typescript
export const button = () => { }; // ← 함수명이 camelCase
export const BUTTON = () => { }; // ← 함수명이 UPPER_CASE
```

### 4.2 훅: camelCase (with use prefix)

Custom hooks는 `use` 접두사 + camelCase:

**O: 올바른 훅 네이밍**
```
hooks/
  useAuth.ts
  useFetch.ts
  useLocalStorage.ts
  useDebounce.ts
```

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  return { user, login, logout };
};
```

**X: 잘못된 네이밍**
```typescript
export const getAuth = () => { }; // ← use 접두사 없음
export const UseAuth = () => { }; // ← PascalCase
```

### 4.3 유틸리티 함수: camelCase

유틸리티와 헬퍼 함수는 **camelCase**:

**O: 올바른 유틸리티 네이밍**
```
utils/
  formatDate.ts
  validateEmail.ts
  parseQueryString.ts
  calculateDistance.ts
```

```typescript
// utils/formatDate.ts
export const formatDate = (date: Date, format: string): string => {
  // 구현
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // 구현
};
```

**X: 잘못된 네이밍**
```typescript
export const FormatDate = () => { }; // ← PascalCase
export const FORMAT_DATE = () => { }; // ← UPPER_CASE
```

### 4.4 타입/인터페이스: PascalCase

모든 타입과 인터페이스는 **PascalCase**:

**O: 올바른 타입 네이밍**
```typescript
// types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile extends User {
  bio: string;
  avatar: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';
```

**X: 잘못된 네이밍**
```typescript
export interface user { } // ← camelCase
export type userStatus = 'active'; // ← camelCase
```

### 4.5 상수: UPPER_SNAKE_CASE

모든 상수는 **UPPER_SNAKE_CASE**:

**O: 올바른 상수 네이밍**
```typescript
// constants/api.ts
export const API_BASE_URL = 'https://api.willog.io';
export const REQUEST_TIMEOUT = 5000;
export const MAX_RETRIES = 3;

// constants/mapbox.ts
export const MAPBOX_TOKEN = 'pk_...';
export const DEFAULT_ZOOM = 10;
export const MAP_CENTER: [number, number] = [37.5, 126.96];
```

**X: 잘못된 네이밍**
```typescript
export const apiBaseUrl = 'https://api.willog.io'; // ← camelCase
export const MaxRetries = 3; // ← PascalCase
```

### 4.6 파일명 규칙

| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| 훅 | camelCase | `useAuth.ts`, `useFetch.ts` |
| 유틸리티 | camelCase | `formatDate.ts`, `parseUrl.ts` |
| 타입 정의 | PascalCase | `User.ts`, `ApiResponse.ts` |
| 상수 | camelCase (폴더) 또는 UPPER_SNAKE_CASE | `constants/api.ts`, `API_BASE_URL` |
| 스토어 | camelCase | `useAuthStore.ts`, `useAppStore.ts` |

---

## 5. 스타일링 규칙

이 프로젝트는 **TailwindCSS v4**를 사용합니다. 모든 스타일은 유틸리티 클래스를 사용해야 합니다.

### 5.1 TailwindCSS 유틸리티 클래스 필수

**모든 스타일은 Tailwind 클래스**를 사용하세요. CSS 파일이나 inline style은 금지입니다.

**O: Tailwind 유틸리티 사용**
```typescript
export const Button = ({ variant = 'primary' }: ButtonProps) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = variant === 'primary'
    ? 'bg-primary text-white hover:bg-blue-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button className={`${baseClasses} ${variantClasses}`}>
      Click me
    </button>
  );
};
```

**X: CSS 파일 또는 inline styles**
```typescript
// ❌ CSS 파일 (금지)
const styles = {
  button: {
    padding: '8px 16px',
    backgroundColor: '#3980fa',
    color: 'white',
  },
};

// ❌ inline style (금지)
<button style={{ padding: '8px 16px', backgroundColor: '#3980fa' }}>
  Click me
</button>

// ❌ arbitrary values로 하드코딩 (금지)
<div className="bg-[#3980fa] text-[#ffffff]">
  Bad practice
</div>
```

### 5.2 디자인 토큰 사용 (하드코딩 금지)

**절대로 색상이나 크기를 하드코딩하면 안 됩니다.** 반드시 정의된 디자인 토큰을 사용하세요.

**정의된 색상 토큰:**

| HEX 값 | 토큰 | 용도 |
|--------|------|------|
| `#17171c` | `text-gray-1000` | 본문 텍스트 |
| `#45454f` | `text-gray-800` | 부제목, 아이콘 |
| `#737680` | `text-gray-600` | 비활성 텍스트 |
| `#909097` | `text-gray-500` | 플레이스홀더 |
| `#b8b8c0` | `text-gray-400` | 뮤트된 아이콘 |
| `#dcdce0` | `border-gray-300` | 테두리 |
| `#ebebec` | `bg-gray-200` | 배경 |
| `#f2f2f4` | `bg-gray-100` | 밝은 배경 |
| `#f5f5f5` | `bg-gray-50` | 아주 밝은 배경 |
| `#417DF7` | `bg-primary`, `text-primary` | 주요 액션 |
| `#fef3c7` | `bg-orange-100` | 경고 뱃지 배경 |
| `#d97706` | `text-orange-600` | 경고 뱃지 텍스트 |
| `#fee2e2` | `bg-red-100` | 위험 뱃지 배경 |
| `#dc2d28` | `text-red-600` | 위험 뱃지 텍스트 |
| `#dcfce7` | `bg-green-100` | 성공 뱃지 배경 |
| `#16a34a` | `text-green-600` | 성공 뱃지 텍스트 |

**O: 디자인 토큰 사용**
```typescript
// ✅ 올바른 방법
<div className="bg-primary text-white">Primary Button</div>
<div className="text-gray-800">Subtitle text</div>
<div className="border border-gray-300">Card with border</div>
<div className="bg-green-100 text-green-600 px-3 py-1 rounded">Success</div>
```

**X: 하드코딩**
```typescript
// ❌ HEX 값 하드코딩
<div className="bg-[#417DF7] text-[#ffffff]">Bad Button</div>

// ❌ RGB 값 하드코딩
<div style={{ backgroundColor: 'rgb(65, 125, 247)' }}>Bad Button</div>

// ❌ arbitrary colors
<div className="bg-[#3980fa] text-[#45454f]">Bad Practice</div>
```

### 5.3 rem 단위 사용 (px 금지)

프로젝트는 **1920x1080 기준**으로 설계되었으며, 더 큰 화면에서는 rem 기반 스케일링됩니다.

**rem 변환 공식:**
```
rem = px / 16
```

**자주 사용하는 rem 변환표:**

| px | rem | 용도 |
|----|-----|------|
| 4px | 0.25rem | 작은 간격 |
| 8px | 0.5rem | 기본 간격 |
| 12px | 0.75rem | 중간 간격 |
| 16px | 1rem | 표준 간격 |
| 24px | 1.5rem | - |
| 32px | 2rem | - |
| 40px | 2.5rem | - |
| 72px | 4.5rem | 사이드바 높이 |
| 280px | 17.5rem | 사이드바 너비 (펼침) |

**O: rem 단위 사용**
```typescript
// ✅ rem 단위
<div className="w-[17.5rem] h-[4.5rem] rounded-[0.5rem] p-[1rem]">
  Properly scaled content
</div>

// ✅ Tailwind 기본 단위 (자동 rem 변환)
<div className="w-80 h-72 rounded-lg p-4">
  Container
</div>
```

**X: px 하드코딩**
```typescript
// ❌ px 하드코딩
<div className="w-[280px] h-[72px] rounded-[8px] p-[16px]">
  Bad scaling
</div>

// ❌ inline style with px
<div style={{ width: '280px', height: '72px' }}>
  No viewport scaling
</div>
```

### 5.4 SVG 아이콘 색상 패턴

인라인 SVG 아이콘을 다룰 때 다음 패턴을 따르세요.

**패턴 1: 단색 아이콘 (currentColor 사용)**

```typescript
// ✅ 올바른 방법
interface IconProps {
  className?: string;
}

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24">
    <path stroke="currentColor" d="..." />
  </svg>
);

// 사용: 부모 요소의 텍스트 색상 상속
<ChevronDownIcon className="text-gray-600" />
```

**패턴 2: 조건부 색상 (CSS 변수)**

```typescript
// ✅ CSS 변수 사용
interface StatusIconProps {
  isActive: boolean;
}

export const StatusIcon = ({ isActive }: StatusIconProps) => (
  <svg viewBox="0 0 24 24">
    <circle
      fill={isActive ? 'var(--color-green-600)' : 'var(--color-gray-400)'}
    />
  </svg>
);
```

**패턴 3: Mapbox 레이어 색상 (예외)**

Mapbox는 CSS 변수를 지원하지 않으므로 상수를 사용하세요:

```typescript
// ✅ Mapbox 색상 상수
const MAP_COLORS = {
  routeCompleted: '#60A5FA', // blue-400
  routeRemaining: '#B8B8C0', // gray-400
  activeLocation: '#16A34A', // green-600
} as const;

// Mapbox 레이어 설정
const layer = {
  id: 'route-layer',
  paint: {
    'line-color': MAP_COLORS.routeCompleted,
  },
};
```

### 5.5 뱃지/필 배경 투명도

뱃지의 배경색에 투명도를 적용할 때 정확한 rgba 값을 사용하세요.

**O: 정확한 rgba 값**
```typescript
// Primary 투명 뱃지 (파란색)
<div className="bg-[rgba(65,125,247,0.08)] text-primary px-3 py-1 rounded">
  On Schedule
</div>

// Black 투명 뱃지 (회색)
<div className="bg-[rgba(23,23,28,0.08)] text-gray-800 px-3 py-1 rounded">
  ETA Info
</div>
```

**X: Tailwind opacity modifier**
```typescript
// ❌ bg-primary/8은 CSS variable과 호환 안 될 수 있음
<div className="bg-primary/8 text-primary">
  Bad badge
</div>
```

### 5.6 Typography 커스텀 클래스

프로젝트는 Figma 기반의 typography 토큰을 제공합니다.

**정의된 텍스트 클래스:**

| 클래스 | 크기 | 굵기 | 용도 |
|--------|------|------|------|
| `text-display-xxxl` | 72px | - | KPI 큰 숫자 |
| `text-display-l` | 32px | - | KPI 단위, 통계 |
| `text-h1` | 32px | Bold | 페이지 제목 |
| `text-h2` | 24px | Bold | 섹션 제목 |
| `text-h3` | 16px | Medium | 소섹션 제목 |
| `text-h4` | 14px | Medium | 작은 제목 |
| `text-body-m` | 14px | Medium | 본문 텍스트 |
| `text-body-s` | 13px | - | 작은 본문 |
| `text-body-xs` | 12px | - | 아주 작은 텍스트 |
| `text-label-m` | 14px | Medium | 라벨 (line-height 1.3) |

**O: Typography 클래스 사용**
```typescript
<div>
  <h1 className="text-h1 text-gray-1000">Page Title</h1>
  <h2 className="text-h2 text-gray-800">Section Title</h2>
  <p className="text-body-m text-gray-600">Body text content</p>
  <label className="text-label-m text-gray-800">Form Label</label>
</div>
```

---

## 6. 오류 처리

모든 에러는 일관된 방식으로 처리되어야 합니다.

### 6.1 API 에러 → Toast 알림

API 요청 실패 시 Toast 알림으로 사용자에게 피드백합니다.

**O: API 에러 처리**
```typescript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    showErrorToast(message);
  }
};
```

**O: react-hook-form과 함께 사용**
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    const response = await submitForm(data);
    showSuccessToast('Form submitted successfully');
  } catch (error) {
    showErrorToast('Failed to submit form');
  }
};
```

### 6.2 폼 검증 에러 → 필드별 메시지

react-hook-form의 에러를 필드 아래에 표시합니다.

**O: 필드별 에러 메시지**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="mb-4">
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
          },
        })}
        placeholder="Email"
        className={errors.email ? 'border-red-600' : 'border-gray-300'}
      />
      {errors.email && (
        <span className="text-red-600 text-body-xs mt-1">
          {errors.email.message}
        </span>
      )}
    </div>
  </form>
);
```

### 6.3 렌더링 에러 → Error Boundary (향후 구현)

현재 프로젝트에는 Error Boundary가 없습니다. 향후 구현할 예정입니다.

**예비 계획:**
```typescript
// components/common/ErrorBoundary.tsx (향후 구현)
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 7. 리뷰 체크리스트

PR을 생성할 때 아래 항목들을 확인하세요.

### 7.1 코드 스타일
- [ ] 모든 코드가 TypeScript로 작성되었는가?
- [ ] 모든 문장 끝에 세미콜론이 있는가?
- [ ] 모든 문자열이 싱글 쿼트인가?
- [ ] Multiline에 후행 쉼마가 있는가?
- [ ] console.log가 프로덕션 코드에 없는가?
- [ ] `npm run lint`가 통과하는가?

### 7.2 컴포넌트 구조
- [ ] 컴포넌트가 올바른 폴더에 위치하는가?
- [ ] Props가 TypeScript 인터페이스로 정의되었는가?
- [ ] 단일 책임 원칙을 따르는가?
- [ ] 재사용 가능한 컴포넌트가 `components/common/`에 있는가?

### 7.3 상태 관리
- [ ] 전역 상태가 Zustand로 관리되는가?
- [ ] 로컬 상태가 useState로 관리되는가?
- [ ] 폼 상태가 react-hook-form으로 관리되는가?
- [ ] 상태 변경 로직이 명확한가?

### 7.4 스타일링
- [ ] 모든 스타일이 Tailwind 클래스로 작성되었는가?
- [ ] 하드코딩된 색상/크기가 없는가?
- [ ] 정의된 디자인 토큰을 사용하는가?
- [ ] 모든 크기가 rem 단위인가? (px 없음)
- [ ] 타이포그래피 클래스를 사용하는가?

### 7.5 오류 처리
- [ ] API 에러가 Toast로 표시되는가?
- [ ] 폼 검증 에러가 필드별로 표시되는가?
- [ ] try-catch가 적절히 사용되는가?

### 7.6 네이밍
- [ ] 컴포넌트가 PascalCase인가?
- [ ] 훅이 `use` 접두사 + camelCase인가?
- [ ] 유틸리티가 camelCase인가?
- [ ] 타입이 PascalCase인가?
- [ ] 상수가 UPPER_SNAKE_CASE인가?

### 7.7 문서화
- [ ] Props 인터페이스에 JSDoc 댓글이 있는가?
- [ ] 복잡한 로직에 설명 주석이 있는가?
- [ ] 재사용 컴포넌트에 사용 예시가 있는가?

### 7.8 성능 & 최적화
- [ ] 불필요한 re-render가 없는가?
- [ ] Props를 적절히 분해하고 있는가?
- [ ] 메모이제이션이 필요한 곳에 있는가?
- [ ] 대용량 리스트에 key prop이 있는가?

---

## 8. 프로젝트 특화 규칙

### 8.1 i18n (국제화)

모든 사용자 대면 텍스트는 **i18next**로 번역됩니다.

**O: i18n 사용**
```typescript
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </div>
  );
};
```

**X: 하드코딩된 텍스트**
```typescript
// ❌ 하드코딩 금지
<h1>Dashboard</h1>
<p>Welcome to the dashboard</p>
```

### 8.2 라우팅 패턴

모든 보호된 라우트는 `<ProtectedRoute>` 래퍼를 사용합니다.

**O: 보호된 라우트**
```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Route index element={<DashboardPage />} />
</Route>
```

**X: 보호 없는 라우트**
```typescript
// ❌ ProtectedRoute 없음
<Route path="/dashboard" element={<DashboardPage />} />
```

### 8.3 Mapbox 통합

Mapbox 토큰과 설정은 상수로 정의합니다.

**O: Mapbox 상수화**
```typescript
// constants/mapbox.ts
export const MAPBOX_TOKEN = 'pk_...';
export const DEFAULT_CENTER: [number, number] = [37.5, 126.96];
export const DEFAULT_ZOOM = 10;

// components/dashboard/RouteMap.tsx
import { MAPBOX_TOKEN, DEFAULT_CENTER } from '@/constants/mapbox';

export const RouteMap = () => {
  return (
    <Map
      accessToken={MAPBOX_TOKEN}
      initialViewState={{ longitude: DEFAULT_CENTER[1], latitude: DEFAULT_CENTER[0], zoom: DEFAULT_ZOOM }}
    >
      {/* ... */}
    </Map>
  );
};
```

---

## 9. 일반적인 안티패턴

코드 리뷰에서 자주 발견되는 문제들:

| 안티패턴 | 문제 | 해결책 |
|----------|------|--------|
| 색상 하드코딩 | 유지보수 어려움, 디자인 불일치 | 디자인 토큰 사용 |
| px 단위 고정 | 대화면 스케일링 안 됨 | rem 단위 사용 |
| 과도한 Props drilling | 코드 복잡도 증가 | 상태 관리 (Zustand) 사용 |
| 폼 상태를 Zustand로 관리 | 불필요한 전역 상태 | react-hook-form 사용 |
| 여러 useState | 상태 관리 복잡도 | useReducer 또는 커스텀 훅 |
| console.log 방치 | 프로덕션 로그 오염 | 삭제 또는 DEV 체크 |
| 타입 any 사용 | 타입 안정성 감소 | 명시적 타입 정의 |
| 컴포넌트 파일 과대 | 가독성 저하, 유지보수 어려움 | 컴포넌트 분리 |

---

## 10. 추가 리소스

- **ESLint 설정**: `eslint.config.js`
- **TypeScript 설정**: `tsconfig.app.json`
- **Tailwind 설정**: `tailwind.config.ts`
- **i18n 설정**: `src/locales/i18n.ts`
- **디자인 토큰**: `src/styles/generated/theme.css`
- **CLAUDE.md**: 프로젝트 전체 가이드

---

마지막 체크: **모든 항목이 이해되었는가?** 질문이 있으면 팀에 문의하세요.
