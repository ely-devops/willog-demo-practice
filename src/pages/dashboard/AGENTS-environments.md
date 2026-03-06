# 환경 데이터 트렌드 - 피그마 일치 수정 계획

## 목표
'환경 데이터 트렌드' 컴포넌트를 피그마 디자인과 100% 동일하게 수정

## 피그마 참조
- **URL**: https://www.figma.com/design/tcsRC2qQIa1We1qY1QN0bw/Willog-Development?node-id=311-35894

---

## 수정 항목 체크리스트

### 1. EnvironmentLineChart.tsx
- [x] 격자선 색상 수정: `#EBEBEC` → `#DCDCE0`
- [x] Y축 라벨 위치 수정: `left: 8px` → `left: 16px`
- [x] X축 라벨 시작 위치 수정: `paddingLeft: 50px` → `paddingLeft: 91px`

### 2. EnvironmentTrendHeader.tsx
- [x] 헤더 제목 font-weight: `font-medium` → `font-normal`
- [x] 활성 탭 font-weight: `font-medium` 제거
- [x] 기간 드롭다운 font-weight: `font-medium` 제거

---

## 진행 상황

### 2026-01-12

#### Step 1: 차이점 분석 완료 ✅
- 피그마 디자인과 현재 구현 비교 완료
- 주요 차이점 6개 식별
- 상세 분석 문서: `/Users/handalus-dev/.claude/plans/quizzical-hopping-fog.md`

#### Step 2: 코드 수정 완료 ✅
- EnvironmentLineChart.tsx 수정 완료
  - COLORS.gridDashed: `#EBEBEC` → `#DCDCE0` (gray-300)
  - Y축 라벨 left: `8px` → `16px`
  - X축 라벨 paddingLeft: `50px` → `91px`
- EnvironmentTrendHeader.tsx 수정 완료
  - 헤더 제목: `font-medium` → `font-normal`
  - 활성 탭: `font-medium` 제거
  - 기간 드롭다운: `font-medium` 제거

#### Step 3: 검증 완료 ✅
- Playwright로 반도체 케이스 대시보드 접속
- 환경 데이터 트렌드 섹션 스크린샷 캡처
- 변경 사항 시각적 확인 완료

---

## 수정 대상 파일

| 파일 | 경로 | 상태 |
|------|------|------|
| EnvironmentLineChart.tsx | `src/components/common/charts/` | ✅ 완료 |
| EnvironmentTrendHeader.tsx | `src/components/dashboard/` | ✅ 완료 |

---

## 검증 방법

1. `npm run dev`로 개발 서버 실행
2. 반도체 케이스 선택
3. 환경 데이터 트렌드 섹션 확인
4. Playwright로 스크린샷 캡처 후 피그마와 비교
