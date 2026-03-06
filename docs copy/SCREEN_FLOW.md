# willog-demo 화면별 Flow 문서

## 목차
1. [라우팅 구조](#라우팅-구조)
2. [인증 플로우](#인증-플로우)
3. [페이지별 상세 플로우](#페이지별-상세-플로우)
4. [컴포넌트 상호작용](#컴포넌트-상호작용)
5. [상태 관리](#상태-관리)
6. [비즈니스 케이스 및 도메인](#비즈니스-케이스-및-도메인)

---

## 라우팅 구조

### 전체 라우팅 다이어그램

```
willog-demo
│
├─ /login (공개 경로)
│  └─ LoginPage
│
└─ / (보호된 경로)
   │
   ├─ /dashboard
   │  ├─ /dashboard/hightech → DashboardPage (bizCase="semicon")
   │  └─ /dashboard/lifesciences → DashboardPage (bizCase="bio")
   │
   ├─ /journey
   │  ├─ /journey/hightech/:journeyId → JourneyDetailPage (bizCase="semicon")
   │  └─ /journey/lifesciences/:journeyId → JourneyDetailPage (bizCase="bio")
   │
   ├─ /register → RegisterPage
   ├─ /management → ManagementPage
   ├─ /intelligence → IntelligencePage
   ├─ /history → HistoryPage
   │
   └─ 레거시 리다이렉트 (하위 호환성)
      ├─ /dashboard → /dashboard/hightech
      ├─ /hightech → /dashboard/hightech
      ├─ /lifesciences → /dashboard/lifesciences
      ├─ /journey/:journeyId → 자동 매핑 (/journey/hightech 또는 /journey/lifesciences)
      └─ /hightech/journey/:journeyId, /lifesciences/journey/:journeyId
```

### 라우팅 구현 상세

**파일**: `/src/App.tsx`

```typescript
// 공개 경로
<Route path="/login" element={<LoginPage />} />

// 보호된 경로 (ProtectedRoute 래퍼 적용)
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>

  // 대시보드 (비즈니스 케이스별)
  <Route path="dashboard/hightech" element={<DashboardPage bizCase="semicon" />} />
  <Route path="dashboard/lifesciences" element={<DashboardPage bizCase="bio" />} />

  // 여정 상세 (비즈니스 케이스별)
  <Route path="journey/hightech/:journeyId" element={<JourneyDetailPage bizCase="semicon" />} />
  <Route path="journey/lifesciences/:journeyId" element={<JourneyDetailPage bizCase="bio" />} />

  // 기타 페이지
  <Route path="register" element={<RegisterPage />} />
  <Route path="management" element={<ManagementPage />} />
  <Route path="intelligence" element={<IntelligencePage />} />
  <Route path="history" element={<HistoryPage />} />
</Route>

// 근본 경로 처리
<Route index element={<Navigate to="/dashboard/hightech" replace />} />
```

### 경로 초기화 규칙

| 입력 경로 | 리다이렉트 대상 | 설명 |
|---------|-------------|------|
| `/` | `/dashboard/hightech` | 기본 진입점 |
| `/login` → 인증 성공 | 로그인 전 접근 경로 또는 `/hightech` | 사용자 이전 경로 복원 |
| `/dashboard` | `/dashboard/hightech` | 기본값: 반도체 도메인 |
| `/journey/:journeyId` | ID 패턴 기반 자동 매핑 | ID-SC01~04 → semicon, ID-SC05~09 → bio |

---

## 인증 플로우

### 인증 상태 관리 아키텍처

```
┌─────────────────────────────────────────────────┐
│         useAuthStore (Zustand)                  │
│  - localStorage 지속성 (key: "auth-storage")    │
├─────────────────────────────────────────────────┤
│ State:                                          │
│  - user: User | null                            │
│  - isAuthenticated: boolean                     │
│                                                 │
│ Actions:                                        │
│  - login(user): 사용자 인증, 세션 시작         │
│  - logout(): 사용자 로그아웃, 세션 종료        │
└─────────────────────────────────────────────────┘
```

### 인증 플로우 상세

#### 1. 로그인 흐름

```
[사용자]
   │
   ├─ LoginPage 접근
   │
   ├─ 1단계: 자격증명 입력
   │  ├─ 이메일: master@willog.io
   │  └─ 비밀번호: willog
   │
   ├─ 2단계: 폼 검증
   │  ├─ 필수 필드 확인
   │  └─ 버튼 활성화 조건: email && password 입력됨
   │
   ├─ 3단계: 제출 및 API 호출 (시뮬레이션)
   │  ├─ setIsLoading(true) → 스핀 아이콘 표시
   │  ├─ 1초 지연 (simulated API call)
   │  └─ setIsLoading(false)
   │
   ├─ 4단계: 자격증명 검증
   │  ├─ ✓ 인증 성공
   │  │  ├─ login() 호출 → useAuthStore에 user 저장
   │  │  ├─ localStorage에 자동 지속
   │  │  └─ navigate() → 대시보드 또는 이전 경로
   │  │
   │  └─ ✗ 인증 실패
   │     ├─ setLoginError() 호출
   │     └─ 에러 메시지 표시
```

**주요 상태 변수**:
- `email` & `password`: react-hook-form의 watch로 추적
- `isFormFilled`: 버튼 활성화 판정 (`email && password`)
- `isLoading`: API 호출 중 로딩 상태
- `loginError`: 인증 실패 메시지

**테스트 자격증명**:
```
이메일: master@willog.io
비밀번호: willog
```

#### 2. 라우트 보호 플로우

```
[사용자]
   │
   ├─ 보호된 경로 접근 시도
   │  (예: /dashboard/hightech)
   │
   ├─ ProtectedRoute 컴포넌트 체크
   │  ├─ useAuthStore의 isAuthenticated 확인
   │  │
   │  ├─ ✓ isAuthenticated === true
   │  │  └─ 요청 경로로 진행 (Outlet 렌더링)
   │  │
   │  └─ ✗ isAuthenticated === false
   │     ├─ /login으로 리다이렉트
   │     └─ 원래 접근 경로를 location.state.from으로 저장
│        (로그인 성공 후 복원)
```

**구현 코드**:
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

#### 3. 로그아웃 플로우

```
[사용자]
   │
   ├─ 로그아웃 버튼 클릭 (Header 또는 메뉴)
   │
   ├─ logout() 호출 (useAuthStore)
   │  ├─ user = null 설정
   │  ├─ isAuthenticated = false 설정
   │  └─ localStorage 자동 업데이트
   │
   └─ /login으로 리다이렉트
```

#### 4. 세션 복구 플로우 (새로고침 후)

```
[애플리케이션 로드]
   │
   ├─ App 렌더링 시작
   │
   ├─ Zustand persist 미들웨어 활성화
   │  └─ localStorage에서 "auth-storage" 키 로드
   │
   ├─ 저장된 인증 상태 복구
   │  ├─ isAuthenticated 복구 (true/false)
   │  └─ user 정보 복구 (있으면)
   │
   └─ ✓ 기존 세션 유지 → 대시보드 자동 진입
      또는
      └─ ✗ 세션 없음 → /login으로 리다이렉트
```

---

## 페이지별 상세 플로우

### 1. LoginPage (`/login`)

**상태**: 공개 경로 (인증 불필요)
**컴포넌트**: `src/pages/auth/LoginPage.tsx`

#### 페이지 구조

```
LoginPage
│
├─ Header (고정)
│  ├─ Willog Logo
│  └─ LanguageSelector
│
└─ Main Content (중앙 정렬)
   └─ Login Card (w-80, h-96)
      ├─ Symbol Logo + Title
      ├─ Form
      │  ├─ Email Input
      │  ├─ Password Input
      │  ├─ Error Message (조건부)
      │  ├─ Login Button
      │  └─ Reset Password Link
      └─ Language Selector (컨텍스트 공유)
```

#### 인터랙션 흐름

```
입력 시작
   │
   ├─ Email 입력
   │  └─ watch('email') 값 업데이트
   │
   ├─ Password 입력
   │  └─ watch('password') 값 업데이트
   │
   ├─ isFormFilled 계산
   │  └─ email && password 체크 → 버튼 활성화/비활성화
   │
   ├─ Submit 클릭
   │  ├─ setIsLoading(true) → 스핀 아이콘
   │  ├─ 1초 지연 (API 시뮬레이션)
   │  │
   │  ├─ 자격증명 검증
   │  │  ├─ ✓ master@willog.io & willog
   │  │  │  └─ login() → 대시보드 이동
   │  │  │
   │  │  └─ ✗ 기타
   │  │     └─ 에러 메시지 표시
   │  │
   │  └─ setIsLoading(false)
   │
   └─ 링크 클릭 (향후 구현)
      ├─ 비밀번호 재설정
      └─ 회원가입 (미구현)
```

#### 상태 변수

| 상태 | 타입 | 설명 |
|------|------|------|
| `email` | string | 이메일 입력값 (watch) |
| `password` | string | 비밀번호 입력값 (watch) |
| `isFormFilled` | boolean | 폼 완성 여부 (email && password) |
| `isLoading` | boolean | API 호출 중 |
| `loginError` | string | 에러 메시지 |
| `errors` | FormState | react-hook-form 검증 에러 |

#### 출력 경로

| 조건 | 목표 경로 |
|------|---------|
| 로그인 성공 | 이전 경로 또는 `/dashboard/hightech` |
| 폼 검증 실패 | (페이지 유지) |
| 자격증명 오류 | (페이지 유지, 에러 메시지 표시) |

---

### 2. DashboardPage (`/dashboard/hightech`, `/dashboard/lifesciences`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/dashboard/DashboardPage.tsx`
**Props**: `bizCase: "semicon" | "bio"`

#### 페이지 목적

- 실시간 운송 현황 시각화 (KPI, 지도, 알림)
- 여정 및 디바이스 상태 모니터링
- 3D 창고 가시화

#### 페이지 구조

```
DashboardPage (bizCase에 따라 데이터 변경)
│
├─ KPI 섹션 (4개 카드)
│  ├─ Active Journeys
│  ├─ On Schedule
│  ├─ Delayed
│  └─ Temperature Violations
│
├─ 환경 트렌드 (EnvironmentTrendSection)
│  ├─ 온도 추이 차트
│  ├─ 습도 추이 차트
│  ├─ 충격 추이 차트
│  └─ 조도 추이 차트
│
├─ 지도 섹션 (탭 2개)
│  ├─ 여정 지도 (JourneyMap)
│  │  └─ Mapbox GL로 경로 시각화
│  │
│  └─ 창고 지도 (WarehouseMap)
│     └─ Smplrspace SDK로 3D 시각화
│
├─ 알림 섹션
│  ├─ Danger (빨강)
│  ├─ Warning (주황)
│  └─ Normal (회색)
│
└─ 디바이스 테이블
   ├─ 디바이스 ID
   ├─ 상태 (정상/경고/오류)
   ├─ 배터리
   ├─ 신호 세기
   ├─ 위치
   └─ 액션 (상세 보기)
```

#### 상태 관리

**전역 상태** (Zustand):
```typescript
// useAppStore
currentCase: "semicon" | "bio"  // 비즈니스 케이스
isSidebarCollapsed: boolean      // 사이드바 접힘 상태

// useLanguageStore
language: "ko" | "en"            // 현재 언어
```

**로컬 상태** (useState):
```typescript
dateRange: [Date, Date]          // 날짜 범위
selectedYear: number             // 선택된 연도
notificationFilter: "all" | ...  // 알림 필터
mapTab: "journey" | "warehouse"  // 지도 탭 선택
warehouseViewMode: ViewMode      // 창고 지도 보기 모드
```

#### 인터랙션 흐름

```
페이지 로드
   │
   ├─ 1단계: 데이터 로드
   │  ├─ JOURNEY_DATA (mockData에서)
   │  ├─ BIO_KPI_DATA 또는 SEMICON_KPI_DATA
   │  ├─ BIO_AI_INSIGHTS 또는 SEMICON_AI_INSIGHTS
   │  └─ 지도 마커 데이터
   │
   ├─ 2단계: 사용자 상호작용
   │  ├─ 날짜 범위 선택 → DateRangePicker
   │  ├─ 연도 선택 → YearSelector
   │  ├─ 알림 필터링 → NotificationFilter
   │  ├─ 지도 탭 전환 → MapTab (Journey/Warehouse)
   │  └─ 여정 클릭 → /journey/:journeyId로 이동
   │
   ├─ 3단계: 창고 지도 초기화
   │  ├─ Smplrspace SDK 로드
   │  ├─ 3D 레벨 선택
   │  ├─ 요소 숨기기 (MutationObserver 대신 setTimeout 사용)
   │  └─ 에러 처리
   │
   └─ 4단계: 페이지 유지
      └─ 실시간 알림 (폴링 또는 WebSocket - 미구현)
```

#### 비즈니스 케이스 선택 기준

| 경로 | bizCase | KPI 데이터 | 알림 데이터 | 설명 |
|------|---------|----------|-----------|------|
| `/dashboard/hightech` | `"semicon"` | SEMICON_KPI_DATA | semiconNotificationData | 반도체 고가 물류 |
| `/dashboard/lifesciences` | `"bio"` | BIO_KPI_DATA | BIO_NOTIFICATIONS | 바이오 콜드체인 |

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| 여정 행 클릭 | `/journey/{bizCase}/{journeyId}` |
| 도메인 변경 (LNB) | `/dashboard/{domain}` |
| 로그아웃 | `/login` |

---

### 3. JourneyDetailPage (`/journey/hightech/:journeyId`, `/journey/lifesciences/:journeyId`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/journey/JourneyDetailPage.tsx`
**Props**: `bizCase: "semicon" | "bio"`

#### 페이지 목적

- 개별 여정의 상세 정보 표시
- 환경 데이터 (온도, 습도, 충격, 조도) 시계열 차트
- 이벤트 히스토리, 문서, 댓글 관리

#### 페이지 구조

```
JourneyDetailPage
│
├─ 여정 헤더
│  ├─ 여정 ID (ID-SC01 형식)
│  ├─ 상태 배지 (진행중/완료/지연)
│  ├─ 출발지 → 도착지
│  ├─ 예상 도착 시간
│  └─ 다운로드 / 공유 버튼
│
├─ 타임라인 섹션
│  ├─ 시작점 (아이콘: 출발지)
│  ├─ 구간별 마커 (평면, 배, 기차, 트럭 등)
│  ├─ 현재 위치 (파란색, 실시간)
│  └─ 종료점 (도착지)
│
├─ 지도 섹션 (탭 2개)
│  ├─ 여정 지도 (JourneyMap)
│  │  └─ 실시간 경로 시각화
│  │
│  └─ 창고 지도 (WarehouseMap)
│     └─ 3D 바닥 계획 보기
│
├─ 환경 트렌드 섹션
│  ├─ Temperature 차트 (min/max/avg/violations)
│  ├─ Humidity 차트
│  ├─ Shock (충격) 차트
│  └─ Light (조도) 차트
│
├─ 구간별 요약 테이블
│  ├─ 구간 이름 (출발지-도착지)
│  ├─ 운송 수단 (아이콘)
│  ├─ 소요 시간
│  ├─ 온도 범위
│  ├─ 습도 범위
│  └─ 이벤트 수
│
├─ 디바이스 목록 테이블
│  ├─ 디바이스 ID
│  ├─ 배터리 (%)
│  ├─ 신호 (1-5 bars)
│  └─ 마지막 업데이트
│
├─ 이벤트 히스토리 테이블
│  ├─ 시간
│  ├─ 이벤트 타입 (아이콘)
│  ├─ 설명
│  ├─ 상태 (정상/경고/오류)
│  └─ 액션 (상세)
│
├─ 문서 섹션
│  ├─ 파일 리스트
│  ├─ 다운로드 링크
│  └─ 업로드 버튼 (향후)
│
└─ 댓글 섹션
   ├─ 댓글 리스트 (작성자, 내용, 타임스탬프)
   └─ 댓글 입력 필드
```

#### 상태 관리

**URL 파라미터**:
```typescript
journeyId: string  // 여정 ID (ID-SC01, ID-SC02 등)
bizCase: string    // 라우팅 매개변수 (semicon 또는 bio)
```

**로컬 상태** (useState):
```typescript
mapTab: "journey" | "warehouse"           // 활성 맵 탭
environmentTab: EnvironmentTab            // 환경 데이터 탭 (Temperature/Humidity/Shock/Light)
warehouseViewMode: ViewMode               // 창고 지도 보기 모드
expandedDeviceId: string | null           // 확장된 디바이스 행
```

#### 인터랙션 흐름

```
페이지 로드 (journeyId 파라미터 기반)
   │
   ├─ 1단계: 여정 데이터 로드
   │  ├─ getJourneyByIdWithLang(journeyId, language)
   │  ├─ getDeviceListWithLang(journeyId, language)
   │  ├─ getEventHistoryWithLang(journeyId, language)
   │  ├─ getDocumentListWithLang(journeyId, language)
   │  └─ getCommentListWithLang(journeyId, language)
   │
   ├─ 2단계: 환경 데이터 계산
   │  ├─ 통계 (평균, 최대, 최소, 위반)
   │  └─ 차트용 시계열 데이터 변환
   │
   ├─ 3단계: 지도 초기화
   │  ├─ JourneyMap: 경로 렌더링
   │  ├─ WarehouseMap: 3D 레벨 로드
   │  └─ 마커 표시
   │
   ├─ 4단계: 사용자 상호작용
   │  ├─ 환경 탭 선택 → 차트 전환
   │  ├─ 지도 탭 선택 → Journey/Warehouse 전환
   │  ├─ 디바이스 행 클릭 → 상세 정보 표시
   │  ├─ 문서 다운로드
   │  ├─ 댓글 작성
   │  └─ 스크롤 → 더 많은 컨텐츠 로드
   │
   └─ 5단계: 페이지 유지
      └─ 실시간 업데이트 (미구현)
```

#### 환경 데이터 섹션

각 환경 탭은 동일한 구조:

```
EnvironmentTrendSection
│
├─ 통계 요약
│  ├─ 평균값 (Average)
│  ├─ 최대값 (Max)
│  ├─ 최소값 (Min)
│  └─ 위반 횟수 (Violations)
│
├─ 설명 텍스트
│  └─ "지난 18시간 동안 온도가..."
│
└─ 시계열 차트 (Recharts)
   └─ 타임라인 데이터 시각화
```

**환경 데이터 타입**:
- **Temperature**: 온도 (°C)
- **Humidity**: 습도 (%)
- **Shock**: 충격 (G, 중력가속도)
- **Light**: 조도 (Lux)

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| 뒤로 가기 | `/dashboard/{bizCase}` |
| 로그아웃 | `/login` |

---

### 4. RegisterPage (`/register`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/register/RegisterPage.tsx`

#### 페이지 목적

- 새로운 여정/디바이스/컨테이너 등록
- 파일 업로드 지원
- 등록 요약 및 검증

#### 페이지 구조

```
RegisterPage
│
├─ 페이지 제목
│  └─ "새로운 여정 등록"
│
├─ 데이터 테이블
│  ├─ 컬럼: ID, 이름, 타입, 상태, 액션
│  ├─ 정렬 기능
│  ├─ 검색 기능
│  └─ 페이지네이션
│
├─ 액션 버튼
│  ├─ 파일 업로드 버튼
│  └─ CSV 다운로드 버튼
│
├─ FileUploadModal (조건부)
│  ├─ 파일 선택
│  ├─ 파일 검증
│  └─ 업로드 진행
│
├─ RegistrationSummaryModal (조건부)
│  ├─ 디바이스 수
│  ├─ 컨테이너 수
│  ├─ 고객 분포
│  ├─ 경로 분포
│  └─ 경고 사항
│
└─ SuccessToast (조건부)
   └─ "등록 완료" 메시지
```

#### 상태 관리

**로컬 상태** (useState):
```typescript
showFileUploadModal: boolean           // 파일 업로드 모달 표시
showSummaryModal: boolean              // 요약 모달 표시
showSuccessToast: boolean              // 성공 토스트 표시
registrationData: RegisterRowData[]    // 테이블 데이터
```

**언어별 데이터**:
```typescript
// 한글
REGISTER_MOCK_DATA: RegisterRowData[]
REGISTRATION_SUMMARY_MOCK_DATA_KO: RegistrationSummaryData

// 영문
REGISTER_MOCK_DATA_EN: RegisterRowData[]
REGISTRATION_SUMMARY_MOCK_DATA_EN: RegistrationSummaryData
```

#### 인터랙션 흐름

```
페이지 로드
   │
   ├─ 데이터 표시
   │  └─ 언어에 따라 REGISTER_MOCK_DATA 또는 REGISTER_MOCK_DATA_EN 로드
   │
   ├─ 파일 업로드 버튼 클릭
   │  ├─ showFileUploadModal = true
   │  └─ FileUploadModal 표시
   │
   ├─ FileUploadModal 내
   │  ├─ 파일 선택
   │  ├─ 파일 검증 (확장자, 크기 등)
   │  └─ 업로드 클릭
   │     ├─ 데이터 처리
   │     ├─ showSummaryModal = true
   │     └─ RegistrationSummaryModal 표시
   │
   ├─ RegistrationSummaryModal 내
   │  ├─ 요약 데이터 확인
   │  ├─ "확인" 버튼 클릭
   │  ├─ showSuccessToast = true
   │  ├─ SuccessToast 표시 (3초 후 자동 닫힘)
   │  └─ 모달 닫기
   │
   └─ CSV 다운로드 버튼 클릭
      └─ REGISTER_MOCK_DATA를 CSV로 내보내기
```

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| LNB 대시보드 클릭 | `/dashboard/{bizCase}` |
| 로그아웃 | `/login` |

---

### 5. ManagementPage (`/management`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/management/ManagementPage.tsx`

#### 페이지 목적

- 디바이스, 컨테이너, 경로 등의 설정 및 관리
- 향후 구현 예정 (플레이스홀더 상태)

#### 페이지 구조

```
ManagementPage
│
├─ 페이지 제목 및 설명
│  ├─ Title: useAppStore.currentCase에 따라 로드
│  └─ Description: 관리 기능 설명
│
├─ 관리 목록 테이블 (플레이스홀더)
│  └─ "Table / List Component Area"
│
└─ 필터 설정 버튼 (미구현)
```

#### 상태 관리

**전역 상태** (Zustand):
```typescript
currentCase: "semicon" | "bio"  // 비즈니스 케이스에 따라 콘텐츠 변경
```

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| LNB 네비게이션 | 다른 페이지로 이동 |
| 로그아웃 | `/login` |

---

### 6. IntelligencePage (`/intelligence`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/intelligence/IntelligencePage.tsx`

#### 페이지 목적

- AI 기반 분석 및 인사이트 제공
- 리스크 분석, 예측 경보 등

#### 페이지 구조

```
IntelligencePage
│
├─ 페이지 제목 및 설명
│  └─ 인텔리전스 기능 소개
│
├─ 리스크 분석 차트 (좌)
│  └─ 플레이스홀더: "Chart Visualization"
│
└─ AI 인사이트 리포트 (우)
   ├─ 예측 경보 (bizCase별)
   │  ├─ bio: "보스톤 공항 온도 급상승 예측"
   │  └─ semicon: "예상 도착 시간 지연 경보"
   │
   └─ 최적 경로 제안
      └─ "데이터 기반 최적 경로 제안"
```

#### 상태 관리

**전역 상태** (Zustand):
```typescript
currentCase: "semicon" | "bio"  // 비즈니스 케이스에 따라 콘텐츠 변경
```

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| LNB 네비게이션 | 다른 페이지로 이동 |
| 로그아웃 | `/login` |

---

### 7. HistoryPage (`/history`)

**상태**: 보호된 경로
**컴포넌트**: `src/pages/history/HistoryPage.tsx`

#### 페이지 목적

- 과거 여정 조회 및 재검토
- 완료된 운송 기록 확인

#### 페이지 구조

```
HistoryPage
│
├─ 페이지 제목 및 설명
│  └─ "과거 이력 조회"
│
└─ 이력 목록
   ├─ 이력 카드 (반복)
   │  ├─ 운송 ID (TR-202504-001 형식)
   │  ├─ 완료 일시
   │  └─ "상세 보기" 버튼
   │
   └─ 각 카드: hover 시 배경색 변경 (bg-gray-50)
```

#### 상태 관리

**전역 상태** (Zustand):
```typescript
currentCase: "semicon" | "bio"  // 비즈니스 케이스에 따라 콘텐츠 변경
```

#### 출력 경로

| 이벤트 | 목표 경로 |
|-------|---------|
| "상세 보기" 클릭 | `/journey/{bizCase}/{journeyId}` (구현 예정) |
| LNB 네비게이션 | 다른 페이지로 이동 |
| 로그아웃 | `/login` |

---

## 컴포넌트 상호작용

### 레이아웃 구조 (모든 보호된 경로)

```
Layout (src/components/layout/Layout.tsx)
│
├─ Main Container
│  ├─ Flex: h-screen, w-full, overflow-hidden
│  │
│  ├─ Sidebar (LNB)
│  │  └─ Dynamic Width
│  │     ├─ Expanded: w-280px
│  │     └─ Collapsed: w-72px
│  │
│  └─ Main Content
│     ├─ Flex: flex-col, h-full
│     │
│     ├─ Header (고정)
│     │  └─ Sticky, h-64px
│     │     ├─ 현재 페이지 제목
│     │     ├─ 검색/필터 (페이지별)
│     │     └─ 프로필/로그아웃
│     │
│     └─ Content Area (스크롤 가능)
│        ├─ Flex-1, overflow-auto
│        ├─ Background: white
│        ├─ Padding: 40px
│        ├─ Outlet (React Router)
│        │  └─ 페이지별 컨텐츠
│        │
│        └─ AI Assistant
│           └─ Fixed button (우측 하단)
```

### 공통 컴포넌트 의존성

#### DateRangePicker & YearSelector

```
DashboardPage
│
├─ DateRangePicker
│  ├─ 날짜 범위 선택
│  └─ 환경 데이터 필터링
│
└─ YearSelector
   ├─ 연도 선택
   └─ KPI 데이터 재계산
```

#### EnvironmentTrendSection

```
DashboardPage & JourneyDetailPage
│
└─ EnvironmentTrendSection
   ├─ 환경 탭 관리 (Temperature/Humidity/Shock/Light)
   ├─ 통계 요약
   └─ Recharts 시계열 차트
```

#### 지도 컴포넌트

```
DashboardPage & JourneyDetailPage
│
├─ JourneyMap (react-map-gl + Mapbox GL)
│  ├─ 여정 경로 시각화
│  ├─ 완료 구간 (파란색 실선)
│  ├─ 미완료 구간 (회색 점선)
│  └─ 마커 (출발지, 도착지, 현재 위치)
│
└─ WarehouseMap (Smplrspace SDK)
   ├─ 3D 바닥 계획
   ├─ 레벨 선택
   └─ UI 요소 숨기기 (setTimeout 기반)
```

#### DataTable

```
DashboardPage & JourneyDetailPage & RegisterPage
│
└─ DataTable
   ├─ 기본 테이블 UI
   ├─ 정렬, 필터링, 페이지네이션
   ├─ 커스텀 셀 렌더링
   └─ 행 클릭 이벤트
```

#### 모달 컴포넌트

```
RegisterPage
│
├─ FileUploadModal
│  ├─ 파일 선택 (drag-drop, input)
│  ├─ 파일 검증
│  └─ 업로드
│
└─ RegistrationSummaryModal
   ├─ 요약 데이터 표시
   ├─ 확인 버튼
   └─ 성공 토스트 트리거
```

---

## 상태 관리

### Zustand Store 구조

#### 1. useAuthStore

**파일**: `src/stores/useAuthStore.ts`

```typescript
interface AuthState {
  user: User | null;                    // 현재 사용자
  isAuthenticated: boolean;              // 인증 상태
  login: (user: User) => void;          // 로그인
  logout: () => void;                    // 로그아웃
}

// localStorage 키: "auth-storage"
// 지속성: 탭/브라우저 재시작 후에도 유지
```

**사용처**:
- `ProtectedRoute`: 인증 체크
- `LoginPage`: 로그인 액션
- `Header`: 로그아웃 액션

#### 2. useAppStore

**파일**: `src/stores/useAppStore.ts`

```typescript
interface AppState {
  currentCase: "semicon" | "bio";       // 현재 비즈니스 케이스
  isSidebarCollapsed: boolean;           // 사이드바 접힘 상태

  setCurrentCase: (case) => void;       // 비즈니스 케이스 변경
  toggleSidebar: () => void;            // 사이드바 토글
}

// 초기값: currentCase = "semicon"
```

**사용처**:
- `LNB`: 도메인 선택 시 currentCase 업데이트
- `DashboardPage`, `JourneyDetailPage`: bizCase 프로퍼티와 동기화
- 모든 페이지: 사이드바 상태 읽기

#### 3. useLanguageStore

**파일**: `src/stores/useLanguageStore.ts`

```typescript
interface LanguageState {
  language: "ko" | "en";                // 현재 언어
  setLanguage: (lang: "ko" | "en") => void;
}

// localStorage 키: "willog-language"
// 초기값: 브라우저 언어 감지
```

**사용처**:
- `LanguageSelector`: 언어 변경
- i18n: 번역 문자열 선택
- MockData: 언어별 데이터 조회

### 전역 상태 흐름도

```
┌─────────────────────────────────┐
│    useAuthStore                 │
│  (인증 & 세션 관리)             │
├─────────────────────────────────┤
│ ProtectedRoute & LoginPage      │
│ + 모든 페이지의 로그아웃         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    useAppStore                  │
│  (비즈니스 케이스 & 사이드바)    │
├─────────────────────────────────┤
│ LNB (도메인 선택)               │
│ DashboardPage & JourneyDetailPage
│ + ManagementPage, IntelligencePage
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    useLanguageStore             │
│  (언어 & 지역화)                │
├─────────────────────────────────┤
│ LanguageSelector                │
│ + 모든 페이지의 i18n             │
│ + MockData 언어별 조회           │
└─────────────────────────────────┘
```

---

## 비즈니스 케이스 및 도메인

### 비즈니스 케이스 분류

| 케이스 | 경로 | 도메인 | 설명 | 사용 대상 |
|-------|------|-------|------|---------|
| semicon | `/dashboard/hightech`, `/journey/hightech/:id` | 반도체 | 반도체 고가 물류 추적 | 반도체 제조 및 로지스틱 |
| bio | `/dashboard/lifesciences`, `/journey/lifesciences/:id` | 바이오 | 바이오 콜드체인 관리 | 바이오제약, 진단 회사 |

### 데이터 매핑 테이블

#### Dashboard KPI 데이터

**경로**: `/dashboard/hightech`
```typescript
bizCase: "semicon"
데이터 소스: SEMICON_KPI_DATA
알림: semiconNotificationData
테이블: SEMICON_JOURNEY_TABLE_DATA
```

**경로**: `/dashboard/lifesciences`
```typescript
bizCase: "bio"
데이터 소스: BIO_KPI_DATA
알림: BIO_NOTIFICATIONS
테이블: BIO_JOURNEY_TABLE_DATA
```

#### Journey ID 매핑 규칙

| ID 패턴 | 비즈니스 케이스 | 도메인 |
|--------|-------------|-------|
| ID-SC01 ~ ID-SC04 | semicon | 반도체 |
| ID-SC05 ~ ID-SC09 | bio | 바이오 |

**자동 리다이렉트 로직** (App.tsx):
```typescript
const isBioJourney = journeyId?.match(/^ID-SC0[5-9]$/);
const domain = isBioJourney ? 'lifesciences' : 'hightech';
```

### LNB (Left Navigation Bar) 도메인 메뉴

```
LNB (src/components/layout/LNB.tsx)
│
├─ 도메인 선택 섹션
│  ├─ 반도체 (semicon)
│  │  └─ icon: DeveloperBoardIcon
│  │
│  ├─ 바이오 (bio)
│  │  └─ icon: MedicalServicesIcon
│  │
│  ├─ 식음료 (fnb) - 향후 추가
│  │  └─ icon: LocalDiningIcon
│  │
│  └─ 일반 물류 (general) - 향후 추가
│     └─ icon: LocalShippingIcon
│
├─ 페이지 메뉴 (선택 도메인에 따라)
│  ├─ Dashboard
│  ├─ Register
│  ├─ Management
│  ├─ Intelligence
│  └─ History
│
└─ 상단 설정/프로필
   └─ 펴기/접기 버튼
```

---

## 경로 전환 규칙 및 가드

### 다이어그램

```
Entry Point (/)
│
├─ ✓ 인증됨
│  └─ /dashboard/hightech (또는 이전 경로)
│
└─ ✗ 미인증
   └─ /login
      │
      ├─ 로그인 성공
      │  └─ /dashboard/hightech (기본) 또는 이전 시도 경로
      │
      └─ 로그인 실패
         └─ (페이지 유지, 에러 메시지)
```

### 라우트 가드 구현

```typescript
// 모든 보호된 경로는 ProtectedRoute로 래핑
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  {/* 모든 자식 경로는 자동으로 보호됨 */}
</Route>

// 로그인 실패 시 자동 리다이렉트
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}
```

---

## 요약

### 핵심 흐름

1. **진입**: 사용자는 `http://localhost:5173/`에 접근
2. **인증 체크**: ProtectedRoute에서 isAuthenticated 확인
   - ✓ 인증됨: `/dashboard/hightech` 렌더링
   - ✗ 미인증: `/login` 리다이렉트
3. **로그인**: `master@willog.io` / `willog` 입력
4. **세션 유지**: localStorage의 "auth-storage" 키에 저장
5. **도메인 선택**: LNB에서 semicon/bio 선택
6. **대시보드 보기**: KPI, 지도, 알림, 디바이스 테이블
7. **여정 상세**: 여정 행 클릭 → `/journey/{domain}/{journeyId}`
8. **페이지 탐색**: LNB 메뉴로 다른 페이지 이동
9. **로그아웃**: 헤더의 로그아웃 버튼 → `/login`

### 주요 상태 관리자

| Store | 역할 | 지속성 |
|-------|------|--------|
| useAuthStore | 인증 & 사용자 세션 | localStorage |
| useAppStore | 비즈니스 케이스 & UI 상태 | 메모리 (또는 localStorage) |
| useLanguageStore | 언어 & 지역화 | localStorage |

### 미구현 기능 (향후 개발)

- [ ] 실시간 알림 (WebSocket)
- [ ] 파일 업로드 기능
- [ ] 댓글 작성 기능
- [ ] 관리 페이지 구현
- [ ] 인텔리전스 AI 기능
- [ ] 이력 페이지 상세 보기
- [ ] 사용자 프로필 관리
- [ ] API 통합 (mock → real)

---

**마지막 업데이트**: 2025-01-30
**문서 버전**: 1.0
