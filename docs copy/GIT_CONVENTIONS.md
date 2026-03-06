# Git 브랜치 전략 및 컨벤션

이 문서는 willog-demo 프로젝트의 Git 워크플로우, 브랜치 전략, 커밋 메시지 규칙을 정의합니다.

## 목차

1. [브랜치 전략](#브랜치-전략)
2. [브랜치 네이밍 규칙](#브랜치-네이밍-규칙)
3. [커밋 메시지 규칙](#커밋-메시지-규칙)
4. [Git 워크플로우](#git-워크플로우)
5. [주의사항](#주의사항)

---

## 브랜치 전략

### 현재 전략: Trunk-Based Development

willog-demo는 **단일 `main` 브랜치**를 기반으로 운영하는 Trunk-Based Development 모델을 사용합니다.

#### 특징

- **메인 브랜치**: `main` - 항상 배포 가능한 상태 유지
- **단기 기능 브랜치**: 기능 구현 시에만 임시로 생성 후 병합
- **빠른 배포 사이클**: 작은 단위의 커밋과 자주하는 통합
- **병렬 개발 가능**: 다중 개발자가 독립적인 기능을 동시 진행

#### 장점

- 병합 충돌 최소화
- 배포 준비 시간 단축
- CI/CD 파이프라인 단순화
- 코드 리뷰 용이

### 선택적 브랜치 사용

필요에 따라 다음 브랜치를 임시로 생성하고, 기능이 완료되면 `main`에 병합:

| 브랜치 타입 | 용도 | 생성 기준 |
|----------|------|---------|
| `feature/*` | 새로운 기능 개발 | 기능이 여러 커밋을 필요할 때 |
| `fix/*` | 버그 수정 (계획된) | 정기 버그 수정 사항 |
| `hotfix/*` | 긴급 버그 수정 | 프로덕션 이슈 즉시 대응 필요 시 |
| `release/*` | 릴리스 준비 | 특정 버전 릴리스 관련 작업 시 |
| `experiment/*` | 실험적 코드 | 검증이 필요한 아이디어 탐색 시 |

---

## 브랜치 네이밍 규칙

### 명명 패턴

```
<type>/<description>
```

### 타입별 규칙

#### 1. Feature 브랜치

```
feature/<feature-name>
```

**예시:**
- `feature/dashboard-redesign` - 대시보드 리디자인
- `feature/ai-assistant` - AI 어시스턴트 기능
- `feature/warehouse-map` - 창고 맵 통합

**규칙:**
- 소문자만 사용
- 단어는 하이픈으로 구분
- 기능의 핵심을 명확히 표현
- 가능한 한 짧고 구체적으로 (20자 이내 권장)

#### 2. Fix 브랜치

```
fix/<issue-description>
```

**예시:**
- `fix/404-error-vercel` - Vercel에서 404 에러 수정
- `fix/tooltip-positioning` - 툴팁 위치 조정
- `fix/animation-duration` - 애니메이션 지속 시간 수정

#### 3. Hotfix 브랜치

```
hotfix/<urgent-issue>
```

**예시:**
- `hotfix/critical-crash` - 심각한 크래시 수정
- `hotfix/security-patch` - 보안 패치

**규칙:**
- 프로덕션 이슈 즉시 대응
- 최소한의 변경만 포함
- 수정 후 `main`과 `develop` 모두에 병합 (develop이 있는 경우)

#### 4. Release 브랜치

```
release/<version>
```

**예시:**
- `release/1.0.0` - 1.0.0 버전 릴리스 준비
- `release/2.1.0-beta` - 베타 버전 릴리스

**규칙:**
- 버전 번호는 Semantic Versioning 따름 (major.minor.patch)
- 이 브랜치에서는 버그 수정과 릴리스 준비만 수행
- 새로운 기능은 추가하지 않음

#### 5. Experiment 브랜치

```
experiment/<experiment-name>
```

**예시:**
- `experiment/new-ui-framework` - 새로운 UI 프레임워크 테스트
- `experiment/performance-optimization` - 성능 최적화 실험

**규칙:**
- 검증 완료 후 삭제 또는 `main`에 병합
- 실험이 불필요하면 병합하지 않고 삭제

---

## 커밋 메시지 규칙

### Conventional Commits 스타일

willog-demo는 **Conventional Commits** 사양을 따릅니다. 이는 버전 관리 자동화, 변경사항 추적, 릴리스 노트 생성을 용이하게 합니다.

### 커밋 메시지 형식

```
<type>: <subject>

[optional body]

[optional footer]
```

### 필수 구성요소

#### 1. Type (타입) - 필수

다음 중 하나를 선택:

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: AI 어시스턴트 기능 추가` |
| `fix` | 버그 수정 | `fix: 대시보드 KPI 계산 오류 수정` |
| `refactor` | 코드 리팩토링 (동작 변화 없음) | `refactor: 컴포넌트 구조 개선` |
| `style` | 스타일 변경 (공백, 포맷 등) | `style: 제목 폰트 가중치 조정` |
| `chore` | 빌드, 의존성, 설정 변경 | `chore: 패키지 의존성 업데이트` |
| `docs` | 문서 추가/수정 | `docs: API 문서 작성` |
| `test` | 테스트 추가/수정 | `test: 인증 로직 단위 테스트 추가` |
| `hotfix` | 긴급 버그 수정 | `hotfix: 프로덕션 에러 즉시 수정` |
| `deploy` | 배포 관련 | `deploy: Vercel에 배포` |
| `perf` | 성능 개선 | `perf: 맵 렌더링 성능 최적화` |

#### 2. Subject (주제) - 필수

**형식:**
```
<type>: <명령조 동사> <목적어>
```

**규칙:**
- 첫 글자는 대문자로 시작
- 한국어 또는 영어 선택 (프로젝트 내 일관성 유지)
- 마침표(.)는 사용하지 않음
- 50자 이내로 간결하게 작성
- 명령조 동사 사용: "추가", "수정", "변경", "제거", "업데이트", "개선" 등

**좋은 예:**
```
feat: 대시보드에 AI 어시스턴트 토글 버튼 추가
fix: Vercel SPA 새로고침 시 404 에러 해결
refactor: 상태 관리 로직을 Zustand store로 통합
style: SVG 아이콘 색상 일관성 조정
```

**나쁜 예:**
```
feat: AI 기능                    # 너무 모호함
fix: fixed bugs                  # 구체성 부족
refactor: 리팩토링.              # 마침표 사용, 구체성 부족
style: update styles            # 어떤 스타일인지 불명확
```

#### 3. Body (본문) - 선택사항

**규칙:**
- Subject와 한 줄 띄우고 작성
- 72자를 넘지 않도록 줄바꿈
- "왜" 변경했는지 설명 (무엇을 변경했는지는 커밋 diff로 확인 가능)
- 여러 문단인 경우 각 문단을 한 줄 띄우기

**예시:**
```
feat: 대시보드 KPI 카드에 동향 지표 추가

KPI 카드 하단에 전월 대비 변화율을 표시하여 사용자가
한눈에 지표 추세를 파악할 수 있도록 개선했습니다.

- 상승: 녹색 화살표 표시
- 하락: 빨간색 화살표 표시
- 변화 없음: 회색 대시 표시
```

#### 4. Footer (꼬리말) - 선택사항

**사용 케이스:**

1. 이슈 추적:
```
Closes #123
Fixes #456
Related-To #789
```

2. Breaking Changes:
```
BREAKING CHANGE: API 응답 형식이 변경되었습니다.
이전 버전과 호환되지 않으므로 클라이언트 업데이트가 필요합니다.
```

**예시:**
```
hotfix: 체크박스 선택 상태 초기화 오류 수정

체크박스 언체크 시 선택 상태가 제대로 해제되지 않는 문제를
Zustand store 상태 업데이트 로직 수정으로 해결했습니다.

Closes #567
```

### 커밋 메시지 작성 예시

#### 예시 1: 새로운 기능

```
feat: JourneyDetailPage에 체크 아이콘 추가

여정 상세 페이지에 각 체크포인트마다 체크 아이콘을 추가하여
사용자가 완료 상태를 시각적으로 인지할 수 있게 개선했습니다.

- 체크포인트 왼쪽에 동그란 체크 아이콘 표시
- 완료된 체크포인트는 파란색으로 표시
- 미완료 체크포인트는 회색으로 표시
```

#### 예시 2: 버그 수정

```
fix: Vercel SPA 새로고침 시 404 에러 해결

Vercel에 배포된 SPA에서 특정 라우트 새로고침 시 404 에러가
발생하는 문제를 vercel.json의 rewrites 설정으로 해결했습니다.
```

#### 예시 3: 스타일 변경

```
style: 대시보드 섹션 헤더 폰트 가중치 조정

섹션 헤더의 폰트 가중치를 600에서 500으로 변경하여
시각적 위계를 개선했습니다.
```

#### 예시 4: 리팩토링

```
refactor: 사이드바 전환 애니메이션 로직 개선

CSS 트랜지션만으로 사이드바 열기/닫기 애니메이션을 처리하도록
JavaScript 로직을 단순화했습니다.

- 불필요한 상태 변수 제거
- 성능 향상 (리페인트 감소)
```

#### 예시 5: 긴급 수정

```
hotfix: 그래프 격자선 렌더링 오류 수정

환경 트렌드 차트의 격자선이 잘못된 위치에 표시되는 문제를
수정했습니다. 이 이슈는 프로덕션 대시보드에서 사용자 혼동을
야기하고 있습니다.

Fixes #890
```

---

## Git 워크플로우

### 1. 기능 개발 워크플로우

#### Step 1: 브랜치 생성

```bash
# main에서 최신 코드 가져오기
git checkout main
git pull origin main

# feature 브랜치 생성
git checkout -b feature/dashboard-redesign
```

#### Step 2: 개발 및 커밋

```bash
# 파일 수정 후 변경사항 스테이징
git add src/pages/dashboard/DashboardPage.tsx

# Conventional Commits 형식으로 커밋
git commit -m "feat: 대시보드 레이아웃 재설계

- 좌측 사이드바 너비 조정
- KPI 카드 그리드 개선
- 반응형 디자인 최적화"
```

#### Step 3: 원격 저장소에 푸시

```bash
git push origin feature/dashboard-redesign
```

#### Step 4: Pull Request / Merge Request 생성 (필요 시)

코드 리뷰가 필요한 경우 Git 호스팅 서비스(GitHub, GitLab)에서 PR/MR 생성.

#### Step 5: main 브랜치에 병합

```bash
# main 브랜치로 전환
git checkout main

# 최신 코드 가져오기
git pull origin main

# feature 브랜치 병합
git merge --no-ff feature/dashboard-redesign

# 원격 저장소에 푸시
git push origin main

# (선택사항) feature 브랜치 삭제
git branch -d feature/dashboard-redesign
git push origin --delete feature/dashboard-redesign
```

### 2. 버그 수정 워크플로우

#### 계획된 버그 수정 (fix 브랜치)

```bash
git checkout -b fix/tooltip-positioning

# 수정 작업 진행
git add src/components/AIAssistantTooltip.tsx
git commit -m "fix: AIAssistantTooltip 위치 조정

사용자 마우스 위치에 따라 툴팁이 화면 밖으로 나가는 문제를
수정했습니다. 뷰포트 경계 감지 로직을 추가했습니다."

git push origin fix/tooltip-positioning
# PR 생성 및 병합
```

#### 긴급 버그 수정 (hotfix 브랜치)

```bash
# 프로덕션 이슈 발생 시 즉시 처리
git checkout main
git pull origin main

# hotfix 브랜치 생성
git checkout -b hotfix/critical-crash

# 긴급 수정
git add src/components/WarehouseMap.tsx
git commit -m "hotfix: MutationObserver 무한 루프 수정

Smplrspace 컨테이너의 MutationObserver가 무한 루프를 생성하여
브라우저가 멈추는 문제를 setTimeout 기반 해결책으로 수정했습니다.

Fixes #999"

git push origin hotfix/critical-crash

# hotfix를 main에 병합
git checkout main
git merge hotfix/critical-crash
git push origin main

# (선택사항) develop 브랜치가 있다면 그곳에도 병합
git checkout develop
git merge hotfix/critical-crash
git push origin develop

# hotfix 브랜치 삭제
git branch -d hotfix/critical-crash
git push origin --delete hotfix/critical-crash
```

### 3. 릴리스 워크플로우

```bash
# 릴리스 브랜치 생성
git checkout -b release/1.0.0

# 버전 번호 업데이트
# package.json 등에서 버전 수정
git add package.json
git commit -m "chore: 버전 1.0.0으로 업데이트"

# 릴리스 노트 작성
git add RELEASE_NOTES.md
git commit -m "docs: 1.0.0 릴리스 노트 작성"

# main에 병합
git checkout main
git merge release/1.0.0

# 태그 생성 (배포 시점)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 원격 저장소에 푸시
git push origin main

# develop 브랜치가 있으면 그곳에도 병합
git checkout develop
git merge release/1.0.0
git push origin develop

# 릴리스 브랜치 삭제
git branch -d release/1.0.0
git push origin --delete release/1.0.0
```

---

## 주의사항

### 하지 말아야 할 것들

#### 1. main 브랜치에 직접 커밋하지 마세요

```bash
# ❌ 절대 금지
git checkout main
git add .
git commit -m "긴급 수정"
git push origin main

# ✅ 올바른 방식
git checkout -b hotfix/urgent-fix
git add .
git commit -m "hotfix: 긴급 수정"
git push origin hotfix/urgent-fix
# PR 생성 후 병합
```

#### 2. 병합 시 fast-forward를 피하세요 (중요한 브랜치)

```bash
# ❌ fast-forward 병합 (히스토리 가독성 감소)
git merge feature/dashboard

# ✅ 3-way 병합 (병합 커밋 생성, 히스토리 명확)
git merge --no-ff feature/dashboard
```

#### 3. 강제 푸시(--force) 사용을 피하세요

```bash
# ❌ 절대 금지 (다른 개발자의 작업 손실 위험)
git push -f origin main

# ✅ 필요시 --force-with-lease 사용 (더 안전함)
git push --force-with-lease origin feature-branch
```

#### 4. 여러 기능을 한 커밋에 섞지 마세요

```bash
# ❌ 한 커밋에 여러 기능 포함
git add .
git commit -m "feat: 여러 기능 추가"

# ✅ 기능별로 분리된 커밋
git add src/components/DashboardHeader.tsx
git commit -m "feat: 대시보드 헤더 새로 추가"

git add src/stores/useAuthStore.ts
git commit -m "refactor: 인증 상태 관리 개선"
```

#### 5. 불필요한 병합 커밋 생성하지 마세요

```bash
# ❌ 병합할 때마다 병합 커밋 생성 (히스토리 복잡)
git fetch origin
git merge origin/main

# ✅ 리베이스 사용 (깔끔한 선형 히스토리)
git fetch origin
git rebase origin/main
```

### 실수했을 때

#### 마지막 커밋 수정하기

```bash
# 커밋 메시지 수정
git commit --amend -m "feat: 올바른 메시지"

# 파일 추가/제거
git add forgotten-file.ts
git commit --amend --no-edit

# 원격 저장소에 푸시 (주의: 이미 푸시된 커밋만 수정)
git push origin feature-branch --force-with-lease
```

#### 이전 커밋 되돌리기

```bash
# 특정 커밋 되돌리기
git revert abc123def

# 마지막 커밋 취소 (로컬에만)
git reset --soft HEAD~1

# 마지막 커밋 취소 (파일 변경사항 제거)
git reset --hard HEAD~1
```

#### 실수로 main에 푸시한 경우

```bash
# 로컬에서 되돌리기
git reset --hard HEAD~1

# 강제 푸시 (팀 공지 필수!)
git push origin main --force-with-lease

# 📢 팀에 알림 - 다른 개발자들이 git pull -r 실행해야 함
```

---

## 배포 관련

### 배포 커밋 규칙

배포 시에는 `deploy` 타입의 커밋을 생성합니다:

```bash
git commit --allow-empty -m "deploy: Vercel에 프로덕션 배포

버전: 1.2.3
배포 대상: Vercel Production
배포 시간: 2024-01-30"
```

**규칙:**
- `--allow-empty` 플래그로 빈 커밋 생성 (배포 기록만 남김)
- 배포 환경, 버전, 시간 정보 포함
- 배포 후 즉시 생성

### 버전 태그

```bash
# 태그 생성
git tag -a v1.2.3 -m "Release version 1.2.3"

# 태그 조회
git tag -l

# 특정 태그 확인
git show v1.2.3

# 원격 저장소에 태그 푸시
git push origin v1.2.3

# 모든 태그 푸시
git push origin --tags
```

---

## 정리

### 핵심 원칙

1. **명확한 메시지**: 누가 읽어도 이해할 수 있는 커밋 메시지
2. **작은 단위 커밋**: 한 가지 기능/버그/개선 = 한 커밋
3. **자주 병합**: 장기 브랜치는 피하고, 자주 main과 동기화
4. **팀 소통**: 주요 변경사항은 팀에 공유
5. **히스토리 추적**: 나중에 언제, 왜 변경했는지 추적 가능하도록

### 체크리스트

커밋하기 전에 확인하세요:

- [ ] 커밋 메시지가 Conventional Commits 형식인가?
- [ ] Subject가 50자 이내인가?
- [ ] 한 가지 기능/버그/개선만 포함하는가?
- [ ] 불필요한 파일(node_modules, 로그 등)은 제외했는가?
- [ ] ESLint 오류는 없는가?
- [ ] 로컬에서 테스트했는가?

---

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/) - 커밋 메시지 표준
- [Semantic Versioning](https://semver.org/) - 버전 관리 기준
- [Git 공식 문서](https://git-scm.com/doc) - Git 상세 가이드
- [GitHub Flow](https://guides.github.com/introduction/flow/) - GitHub 워크플로우

---

**마지막 업데이트**: 2026년 1월 30일
**프로젝트**: willog-demo
**적용 대상**: 모든 개발자
