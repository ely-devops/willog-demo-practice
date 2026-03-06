# Willog SaaS

**물류 추적 및 관리를 위한 React 기반 SaaS 애플리케이션**

Willog SaaS는 반도체, 바이오, 식음료 등 다양한 물류 비즈니스 도메인을 지원하는 현대적인 물류 추적 및 관리 플랫폼입니다. 실시간 GPS 추적, 환경 모니터링, AI 기반 인텔리전스 분석 기능을 제공합니다.

## 빠른 시작

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치

```bash
# 저장소 클론
cd willog-saas

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리 보기
npm run preview

# 코드 검사
npm run lint
```

## 기술 스택

| 분야 | 기술 | 버전 |
|------|------|------|
| **UI Framework** | React | 19.2.x |
| **언어** | TypeScript | 5.9.x |
| **스타일링** | TailwindCSS | 4.x |
| **빌드 도구** | Vite | 7.x |
| **라우팅** | React Router | 7.x |
| **상태 관리** | Zustand | 5.x |
| **다국어 지원** | i18next | 25.x |
| **지도 시각화** | Mapbox GL | 3.x |
| **3D 시각화** | Smplrspace SDK | - |
| **차트** | Recharts | - |
| **폼 관리** | react-hook-form | 7.x |
| **날짜 처리** | dayjs | 1.x |
| **유틸리티** | lodash | 4.x |

## 주요 기능

- **대시보드**: KPI 현황, 실시간 알림, 지도 기반 경로 시각화, 디바이스 상태 모니터링
- **여정 상세**: 환경 데이터 차트(온도, 습도, 진동), 이벤트 히스토리 조회
- **등록 관리**: 새로운 물류 경로 등록 및 관리
- **장치 관리**: 추적 장치 설정 및 상태 관리
- **인텔리전스**: AI 기반 이상 탐지 및 예측 분석
- **이력 조회**: 과거 경로 및 성과 데이터 조회
- **AI 어시스턴트**: 실시간 물류 관련 질문 및 컨설팅

### 지원하는 비즈니스 도메인

| 도메인 | 설명 | 코드 |
|--------|------|------|
| **반도체** | 반도체 고가 물류 | `semicon` |
| **바이오** | 바이오 콜드체인 관리 | `bio` |
| **식음료** | 식음료 콜드체인 관리 | `fnb` |
| **일반화물** | 일반 물류 | `general` |

## 폴더 구조

```
willog-saas/src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── common/          # 공통 컴포넌트 (버튼, 모달, 바 등)
│   ├── layout/          # 레이아웃 컴포넌트 (Header, Sidebar 등)
│   ├── auth/            # 인증 관련 컴포넌트
│   └── warehouse/       # 3D 창고 지도 컴포넌트
├── pages/               # 페이지 레벨 컴포넌트
│   ├── dashboard/       # 대시보드
│   ├── register/        # 등록 관리
│   ├── management/      # 장치 관리
│   ├── intelligence/    # 인텔리전스
│   ├── history/         # 이력 조회
│   └── auth/            # 로그인
├── stores/              # Zustand 상태 관리
├── hooks/               # 커스텀 React 훅
├── utils/               # 유틸리티 함수 및 Mock 데이터
├── locales/             # i18n 번역 파일 (한국어, 영어)
├── types/               # TypeScript 타입 정의
├── assets/              # 정적 자산 (SVG, 이미지)
└── styles/              # 글로벌 스타일
```

## 개발 가이드

### 상태 관리 (Zustand)

전역 상태는 `src/stores/` 폴더의 Zustand 스토어로 관리됩니다.

```typescript
// useAuthStore.ts - 인증 상태
const { user, isAuthenticated, login, logout } = useAuthStore();

// useLanguageStore.ts - 언어 설정
const { language, setLanguage } = useLanguageStore();

// useAppStore.ts - 애플리케이션 상태
const { businessCase, setBussinessCase } = useAppStore();
```

### 라우팅

React Router v7을 사용하며, 모든 인증 페이지는 `<ProtectedRoute>` 컴포넌트로 보호됩니다.

- 공개 경로: `/login`
- 보호된 경로: 모든 다른 경로 (레이아웃 + 아울렛)

### 다국어 지원 (i18n)

i18next를 사용하여 한국어(KO)와 영어(EN)를 지원합니다.

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('common.welcome')}</h1>;
};
```

번역 파일: `src/locales/ko.json`, `src/locales/en.json`

### 스타일링

TailwindCSS v4를 사용하며, 모든 색상과 간격은 설계 토큰으로 정의됩니다.

**중요**: 하드코딩된 색상 값이나 px 단위 대신 Tailwind 클래스와 rem 단위를 사용하세요.

```typescript
// ❌ 잘못된 예
className="text-[#2d3340] w-[280px]"

// ✅ 올바른 예
className="text-gray-800 w-[17.5rem]"
```

자세한 설계 토큰 정보는 `.cursor/rules/design-tokens.mdc` 참고

### Mapbox 통합

대시보드에서 Mapbox GL을 사용하여 경로 시각화를 제공합니다.

- 완료된 경로: 파란색 실선
- 남은 경로: 회색 점선
- 지점별 마커: 배 아이콘, 위치 핀, 경고 표시

### Smplrspace 3D 시각화

Smplrspace SDK를 사용하여 3D 창고 평면도를 시각화합니다.

**주의사항:**
- React Strict Mode 호환성: `isMounted` 플래그를 사용하여 상태 업데이트
- MutationObserver 사용 금지: 대신 `setTimeout` 사용 (무한 루프 방지)
- 레벨 인덱스: 0 기반 (L1 = 0, L2 = 1 등)

## 배포 및 환경 설정

환경 변수는 아직 구성되지 않았습니다. 추후 다음 변수들이 필요합니다:

- Mapbox 토큰
- API 기본 URL
- 기능 플래그
- 분석 토큰

`.env.example` 파일을 작성하여 필수 환경 변수를 문서화할 예정입니다.

## 기여 가이드

이 프로젝트에 기여할 때는 다음을 따르세요:

1. 기능 브랜치 생성: `git checkout -b feature/새-기능`
2. 변경 사항 커밋: `git commit -m 'feat: 새 기능 설명'`
3. 브랜치에 푸시: `git push origin feature/새-기능`
4. Pull Request 생성

### 코드 스타일

- 싱글 따옴표 사용
- 세미콜론 필수
- TailwindCSS 클래스 순서 준수
- console.log 금지 (ESLint 경고)
- React Hooks 규칙 준수

## 참고 문서

- [기술 스펙 정의](../docs/01.메니페스트용_SASS_기술스펙정의.md) - React SaaS 기술 스펙
- [설계 토큰](../.cursor/rules/design-tokens.mdc) - Tailwind 설계 토큰 레퍼런스
- [Figma 워크플로우](../.cursor/rules/figma-workflow.mdc) - Figma 디자인 연동 프로세스
- [Mapbox GL 문서](https://docs.mapbox.com/)
- [Smplrspace 문서](https://docs.smplrspace.com/)

## 라이선스

이 프로젝트의 라이선스는 추후 정의될 예정입니다.
