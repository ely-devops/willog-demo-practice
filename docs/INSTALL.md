# Willog SaaS 설치 가이드

Willog SaaS는 React 19, TypeScript, Vite를 기반으로 구축된 로지스틱스 추적 및 관리 애플리케이션입니다. 이 가이드를 따라 개발 환경을 설정하고 애플리케이션을 실행할 수 있습니다.

## 시스템 요구사항

개발 환경을 시작하기 전에 다음 요구사항을 확인하세요.

### 필수 요구사항
- **Node.js**: v16 이상 (v18 이상 권장)
- **npm**: v8 이상
- **Git**: 버전 관리용 (선택사항)

### 권장 운영체제
- macOS 10.15 이상
- Ubuntu 18.04 이상
- Windows 10 이상

### 권장 개발 도구
- VS Code (권장 플러그인: ESLint, TypeScript Vue Plugin)
- 최소 4GB RAM
- 1GB의 디스크 공간

## 설치 방법

### 1단계: Node.js 설치 확인

먼저 Node.js와 npm이 설치되어 있는지 확인하세요.

```bash
node --version
npm --version
```

만약 설치되어 있지 않다면 [Node.js 공식 웹사이트](https://nodejs.org/)에서 LTS 버전을 다운로드하여 설치하세요.

### 2단계: 저장소 클론 (또는 다운로드)

프로젝트 저장소를 로컬 머신으로 클론합니다.

```bash
git clone <repository-url>
cd willog/willog-saas
```

또는 ZIP 파일로 다운로드한 경우:

```bash
unzip willog-saas.zip
cd willog-saas
```

### 3단계: 의존성 설치

프로젝트 디렉토리에서 npm install을 실행하여 모든 의존성을 설치합니다.

```bash
npm install
```

이 명령은 `package.json`에 명시된 모든 필수 패키지를 설치합니다.

**설치되는 주요 패키지:**
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- TailwindCSS 4.0.0
- React Router 7.11.0
- Mapbox GL 3.17.0
- Zustand 5.0.9
- i18next 25.7.3

### 4단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다. `.env.example`을 기반으로 설정할 수 있습니다.

```bash
cp .env.example .env
```

## 환경 변수 설정

`.env` 파일을 열고 다음 환경 변수를 설정합니다.

### Mapbox 설정

```bash
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

**Mapbox 액세스 토큰 획득 방법:**

1. [Mapbox 계정](https://account.mapbox.com/)에 가입하거나 로그인하세요
2. [Access Tokens 페이지](https://account.mapbox.com/access-tokens/)로 이동하세요
3. 기본 토큰을 복사하거나 새 토큰을 생성하세요
4. 토큰을 `.env` 파일의 `VITE_MAPBOX_ACCESS_TOKEN` 값으로 설정하세요

### API 설정

```bash
VITE_API_BASE_URL=http://localhost:3000
```

**설정 가이드:**
- **개발 환경**: 백엔드 개발 서버 주소 (예: `http://localhost:3000`)
- **테스트 환경**: 테스트 서버 주소 (예: `https://api-staging.willog.io`)
- **프로덕션**: 프로덕션 API 주소 (예: `https://api.willog.io`)
- **비어 있음**: 목 데이터 모드로 작동 (기본값)

### 기능 플래그

```bash
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_3D_WAREHOUSE=true
```

**설명:**
- `VITE_ENABLE_AI_ASSISTANT`: AI 어시스턴트 기능 활성화 (true/false)
- `VITE_ENABLE_3D_WAREHOUSE`: 3D 창고 지도 기능 활성화 (true/false)

### 환경 모드

```bash
VITE_APP_ENV=development
```

**옵션:**
- `development`: 개발 환경 (HMR 활성화, 상세 에러 메시지)
- `staging`: 스테이징 환경
- `production`: 프로덕션 환경

### 환경 변수 예제

개발 환경용 완전한 `.env` 파일 예제:

```bash
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cigvWiUx...

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_3D_WAREHOUSE=true

# Build Configuration
VITE_APP_ENV=development
```

## 개발 서버 실행

### 기본 개발 서버 시작

프로젝트 디렉토리에서 다음 명령을 실행하세요.

```bash
npm run dev
```

**출력 예:**
```
VITE v7.2.4  ready in 156 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 브라우저에서 확인

브라우저를 열고 표시된 URL (일반적으로 `http://localhost:5173/`)을 방문하세요.

### 개발 서버 주요 기능

- **Hot Module Replacement (HMR)**: 파일을 저장하면 자동으로 브라우저가 새로고침됩니다
- **빠른 성능**: Vite의 ES 모듈 기반 개발 서버로 빠른 개발 환경 제공
- **에러 오버레이**: 발생한 에러를 브라우저에서 즉시 확인 가능

### 개발 서버 종료

터미널에서 `Ctrl+C` (또는 `Cmd+C`)를 눌러 서버를 종료할 수 있습니다.

## 프로덕션 빌드

### 1단계: 디자인 토큰 빌드

프로덕션 빌드를 하기 전에 디자인 토큰을 빌드해야 합니다.

```bash
npm run tokens
```

이 명령은 `scripts/build-tokens.ts`를 실행하여 디자인 토큰을 생성합니다.

### 2단계: 프로덕션 빌드 실행

```bash
npm run build
```

**실행 순서:**
1. 디자인 토큰 빌드 (`npm run tokens`)
2. TypeScript 타입 검사 (`tsc -b`)
3. Vite 번들링 및 최적화

**빌드 결과:**
- 번들된 파일: `dist/` 디렉토리
- 최적화된 JavaScript, CSS, 이미지 등 포함
- 소스 맵: `dist/` 내 `.js.map` 파일

### 3단계: 빌드 결과 확인 (선택사항)

빌드된 결과를 프로덕션 유사 환경에서 미리 확인할 수 있습니다.

```bash
npm run preview
```

**출력 예:**
```
➜  Preview available at http://localhost:4173/
```

## 개발 도구 및 명령어

### ESLint 실행 (코드 품질 검사)

```bash
npm run lint
```

프로젝트의 모든 파일을 ESLint로 검사합니다.

**확인 사항:**
- 코드 스타일 규칙 준수
- React Hooks 규칙 준수
- 미사용 변수 검출
- 잠재적 버그 검출

### 디자인 토큰 Watch 모드

디자인 토큰 파일을 수정할 때 자동으로 재빌드하려면:

```bash
npm run tokens:watch
```

이 명령은 `scripts/build-tokens.ts` 파일의 변경을 감지하여 자동으로 토큰을 재생성합니다.

## 문제 해결

### npm install 실패

**증상:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**해결 방법:**

```bash
# npm 캐시 삭제
npm cache clean --force

# node_modules 디렉토리와 package-lock.json 제거
rm -rf node_modules package-lock.json

# 다시 설치
npm install
```

또는 레거시 peer dependency 무시:

```bash
npm install --legacy-peer-deps
```

### 포트 이미 사용 중

**증상:**
```
error: listen EADDRINUSE: address already in use :::5173
```

**해결 방법:**

포트 5173을 사용하는 프로세스 종료:

```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

또는 다른 포트 사용:

```bash
npm run dev -- --port 3000
```

### Mapbox 토큰 오류

**증상:**
```
Error: Mapbox access token is required to use Mapbox GL
```

**확인 사항:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `VITE_MAPBOX_ACCESS_TOKEN` 값이 올바르게 설정되어 있는지 확인
3. 토큰이 만료되지 않았는지 확인
4. 개발 서버를 다시 시작하세요 (`npm run dev`)

### TypeScript 컴파일 에러

**증상:**
```
TS7053: Element implicitly has an 'any' type
```

**해결 방법:**

```bash
# TypeScript 재컴파일
npm run build
```

또는 타입 정의 업데이트:

```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### HMR (Hot Module Replacement) 작동 안 함

**증상:**
파일 저장 후 브라우저가 자동으로 새로고침되지 않음

**해결 방법:**

1. 개발 서버 재시작:
```bash
npm run dev
```

2. 브라우저 캐시 삭제:
   - 브라우저 개발자 도구 열기 (F12)
   - Network 탭에서 "Disable cache" 체크
   - 페이지 새로고침

3. Vite 설정 확인:
   - `vite.config.ts` 파일이 올바른지 확인
   - React 플러그인이 활성화되어 있는지 확인

### 빌드 실패

**증상:**
```
error during build: RollupError: Cannot find module '@/components/...'
```

**해결 방법:**

1. 파일 경로 확인:
   - 실제 파일 위치가 import 경로와 일치하는지 확인
   - 파일 이름의 대소문자 확인

2. 캐시 삭제:
```bash
rm -rf dist node_modules/.vite
npm run build
```

### 메모리 부족 에러

**증상:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```

**해결 방법:**

Node.js 최대 메모리 증가:

```bash
# macOS/Linux
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Windows (PowerShell)
$env:NODE_OPTIONS="--max_old_space_size=4096"; npm run build
```

### ESLint 검사 실패

**증상:**
```
error  Unexpected var, use 'const' or 'let' instead  no-var
```

**해결 방법:**

자동 수정 (일부):

```bash
npm run lint -- --fix
```

자동으로 수정되지 않는 오류는 수동으로 수정해야 합니다.

## 추가 리소스

### 공식 문서
- [Vite 문서](https://vitejs.dev/)
- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [Mapbox GL 문서](https://docs.mapbox.com/mapbox-gl-js/)

### 개발 팁
1. **개발 도구**: VS Code에 ESLint 확장 프로그램 설치하여 실시간 검사
2. **디버깅**: 브라우저 개발자 도구의 Sources 탭에서 JavaScript 디버깅
3. **성능**: Vite의 분석 기능으로 번들 크기 최적화 검토
4. **테스트**: 프로덕션 빌드 전에 `npm run preview`로 미리보기 실행

### 프로젝트별 가이드
- 설계 시스템 토큰: `.cursor/rules/design-tokens.mdc` 참조
- 기술 스펙: `docs/01.메니페스트용_SASS_기술스펙정의.md` 참조
- 라우팅 구조: `src/App.tsx` 참조
- 상태 관리: `src/stores/useAuthStore.ts` 참조

## 다음 단계

설치가 완료되었습니다. 이제 다음 단계로 진행할 수 있습니다:

1. **로컬 개발 시작**: `npm run dev`로 개발 서버 실행
2. **기능 개발**: `src/pages/`에서 페이지 컴포넌트 수정
3. **코드 검사**: `npm run lint`로 코드 품질 확인
4. **빌드 및 배포**: `npm run build`로 프로덕션 빌드

문제가 발생하면 위의 "문제 해결" 섹션을 참조하거나 팀에 문의하세요.
