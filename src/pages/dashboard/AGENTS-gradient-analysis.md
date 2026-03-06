# 환경 데이터 트렌드 차트 - 그라데이션 분석

## 피그마 참조
- **URL**: https://www.figma.com/design/tcsRC2qQIa1We1qY1QN0bw/Willog-Development?node-id=311-35894
- **차트 영역 노드**: 311:35951

---

## 1. 피그마 차트 구조 분석

### 1.1 레이어 구성 (위에서 아래 순서)
```
311:35951 (Frame - 차트 영역)
├── 311:35952 (Frame) - 기준 범위 배경 영역 (연한 파란색)
├── 311:35953 (Frame) - 수평 격자선들
│   ├── Vector 184 - 상단 실선 (50°C)
│   ├── Vector 186 - 점선 (40°C)
│   ├── Vector 189 - 점선 (30°C)
│   ├── Vector 190 - 점선 (20°C)
│   ├── Vector 192 - 점선 (10°C)
│   └── Vector 185 - 하단 실선 (0°C)
├── 311:35960 (Frame) - X축 라벨들 (00:00 ~ 24:00)
├── 311:35967 (Frame) - Y축 라벨들 (50°C ~ 10°C)
├── 311:35973 (Vector 250) - 파란색 라인 + 그라데이션 영역 (정상 범위, 우측)
├── 311:35974 (Vector 257) - 빨간색 그라데이션 영역 (이탈 범위, 고온 구간)
├── 311:35975 (Vector 256) - 빨간색 라인 스트로크 (이탈 범위, 고온 구간)
├── 311:35976 (Vector 252) - 파란색 라인 + 그라데이션 영역 (정상 범위, 전환 구간)
├── 311:35977 (Vector 254) - 빨간색 그라데이션 영역 (이탈 범위, 저온 구간)
├── 311:35978 (Vector 253) - 빨간색 라인 스트로크 (이탈 범위, 저온 구간)
├── Ellipse 2584~2595 - 데이터 포인트들 (원형 마커)
└── Frame - 최저/최고 온도 라벨 (10.7°C, 48.5°C)
```

### 1.2 핵심 발견 사항

#### A. 그라데이션 영역은 **별도의 벡터 도형**으로 구성됨
- 피그마에서는 라인과 그라데이션 영역이 **분리된 벡터 요소**임
- 각 온도 구간(이탈/정상)마다 개별적인 fill 도형이 있음
- 그라데이션 영역은 **데이터 라인의 윤곽을 따라** 생성됨

#### B. 그라데이션 fill 구성
| 벡터 ID | 이름 | 위치 | 용도 | 색상 |
|---------|------|------|------|------|
| 311:35974 | Vector 257 | x:320, y:29, 382×133.5px | 고온 이탈 구간 fill | 연한 빨강 → 투명 |
| 311:35977 | Vector 254 | x:0.5, y:191, 239.5×65px | 저온 이탈 구간 fill | 연한 빨강 → 투명 |
| 311:35973 | Vector 250 | x:702, y:162, 345×29px | 정상 구간 라인 | 파란색 #1858B4 |
| 311:35976 | Vector 252 | x:240, y:164.5, 80×25.5px | 전환 구간 라인 | 파란색 #1858B4 |

#### C. 기준 범위 배경 영역
```css
/* 311:35952 */
background-color: rgba(65, 125, 247, 0.08);  /* 연한 파란색, 8% 투명도 */
height: 30px;  /* 20°C ~ 25°C 범위에 해당 */
position: absolute;
top: 162px;  /* Y축 기준 20~25°C 위치 */
```

---

## 2. 그라데이션 시각적 분석

### 2.1 빨간색 이탈 구간 그라데이션 (Vector 257, 254)
피그마 스크린샷 분석 결과:

```
┌─────────────────────────────────────┐
│ ■ 데이터 라인 근처: 연한 분홍/살구색    │
│   - 베이스 색상: #DC2D28 (red-600)   │
│   - 추정 투명도: 약 4~6%              │
│                                      │
│ ▼ 아래로 갈수록 점점 투명해짐          │
│                                      │
│ □ 차트 하단: 거의 완전 투명            │
│   - 추정 투명도: 0~2%                 │
└─────────────────────────────────────┘
```

### 2.2 파란색 정상 구간 그라데이션
피그마에서 파란색 정상 구간은 **라인만 표시**되고 별도의 그라데이션 fill 영역이 **매우 옅거나 없음**.

### 2.3 그라데이션 방향
- **피그마**: 데이터 라인에서 **차트 하단 방향**으로 투명도 감소
- **핵심**: 그라데이션이 Y축 전체가 아닌, **각 데이터 영역의 형태를 따름**

---

## 3. 현재 구현 코드 분석

### 3.1 현재 그라데이션 정의 (EnvironmentLineChart.tsx)
```typescript
// 라인 색상 그라데이션 (Y값 기반)
<linearGradient id="lineColorGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor={COLORS.lineViolation} />
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineViolation} />
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineNormal} />
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineNormal} />
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineViolation} />
  <stop offset="100%" stopColor={COLORS.lineViolation} />
</linearGradient>

// 영역 그라데이션 (Y값 기반 색상 변화 + 투명도)
<linearGradient id="areaColorGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor={COLORS.lineViolation} stopOpacity={0.06} />
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineNormal} stopOpacity={0.04} />
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineNormal} stopOpacity={0.02} />
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
  <stop offset="100%" stopColor={COLORS.lineViolation} stopOpacity={0} />
</linearGradient>
```

### 3.2 색상 상수
```typescript
const COLORS = {
  lineNormal: '#1858B4',     // 파란색 (정상 범위)
  lineViolation: '#DC2D28',  // 빨간색 (이탈 범위)
  rangeArea: 'rgba(65, 125, 247, 0.08)',  // 기준 범위 배경
  // ...
} as const;
```

---

## 4. 피그마 vs 현재 구현 차이점

### 4.1 핵심 차이점 요약

| 구분 | 피그마 | 현재 구현 |
|------|--------|----------|
| **그라데이션 구조** | 각 구간별 개별 벡터 도형 | 단일 Area 컴포넌트 |
| **그라데이션 방향** | 데이터 라인 → 하단 (형태 추종) | Y축 수직 그라데이션 |
| **색상 변화** | 구간별 단일 색상 | Y축 위치에 따른 색상 변화 |
| **투명도** | 라인 근처 진하고 하단으로 옅어짐 | Y축 전체에 균일하게 적용 |
| **정상 구간 fill** | 거의 없음 (라인만) | 연한 파란색 fill 있음 |

### 4.2 시각적 차이

```
피그마 디자인:
                    48.5°C ●
                   ╱        ╲
              ████/██████████\████  ← 이탈 구간만 연한 fill
             ╱                    ╲
────────────●─────────────────────●──────  20-25°C 기준선
           ╱                        ╲
     █████/                          ────────●────  ← 정상 구간은 라인만
    ╱
●──/  10.7°C
└── 이탈 구간 연한 fill

현재 구현:
                    48.5°C ●
                   ╱████████╲
              ████/██████████\████████████
             ╱████████████████████████████╲
────────────●────────────────────────────●──────
           ╱██████████████████████████████╲
     █████/████████████████████████────────●────
    ╱█████████████████████████████████████████
●──/████  10.7°C
└── 전체 영역에 그라데이션 fill
```

---

## 5. 피그마 그라데이션 상세 스펙

### 5.1 이탈 구간 그라데이션 (빨간색)
```css
/* 추정 스펙 */
.violation-area-gradient {
  /* 방향: 데이터 라인에서 차트 하단으로 */
  background: linear-gradient(
    to bottom,
    rgba(220, 45, 40, 0.06) 0%,    /* 라인 근처: 6% 투명도 */
    rgba(220, 45, 40, 0.03) 50%,   /* 중간: 3% 투명도 */
    rgba(220, 45, 40, 0) 100%      /* 하단: 완전 투명 */
  );
}
```

### 5.2 정상 구간 그라데이션 (파란색)
```css
/* 피그마에서는 정상 구간 fill이 거의 없음 */
/* 라인만 표시되고 아래 fill은 매우 옅거나 없음 */
.normal-area-gradient {
  background: linear-gradient(
    to bottom,
    rgba(24, 88, 180, 0.02) 0%,    /* 라인 근처: 2% 투명도 (매우 옅음) */
    rgba(24, 88, 180, 0) 100%      /* 하단: 완전 투명 */
  );
}
```

### 5.3 기준 범위 배경 (Reference Area)
```css
.reference-area {
  background-color: rgba(65, 125, 247, 0.08);  /* #417DF7, 8% 투명도 */
  /* 위치: Y축 20°C ~ 25°C 범위 */
}
```

---

## 6. 결론 및 수정 방향

### 6.1 기술적 한계
Recharts의 `<Area>` 컴포넌트는 **단일 영역**에 대한 fill만 지원하며, 피그마처럼 **데이터 라인 형태를 따르는 개별 그라데이션 영역**을 구현하기 어려움.

### 6.2 가능한 접근 방식

#### 옵션 A: 현재 방식 유지 + 투명도 조정
- 현재 구현의 투명도 값을 피그마와 더 유사하게 조정
- 정상 구간의 fill을 더 옅게 하거나 제거

#### 옵션 B: 커스텀 SVG 렌더링
- Recharts 대신 커스텀 SVG로 그라데이션 영역 직접 구현
- 각 구간(이탈/정상)별로 별도의 path와 gradient 적용

#### 옵션 C: 다중 Area 컴포넌트 사용
- 이탈 구간과 정상 구간을 별도의 Area로 분리
- 각각 다른 그라데이션 적용

### 6.3 권장 수정 사항 (현재 구현 기준)
```typescript
// 수정된 영역 그라데이션
<linearGradient id="areaColorGradient" x1="0" y1="0" x2="0" y2="1">
  {/* 이탈 구간 (maxRange 위) - 더 진한 빨간색 */}
  <stop offset="0%" stopColor={COLORS.lineViolation} stopOpacity={0.08} />
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineViolation} stopOpacity={0.04} />

  {/* 정상 구간 - 거의 투명하게 */}
  <stop offset={`${maxRangePercent}%`} stopColor={COLORS.lineNormal} stopOpacity={0.01} />
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineNormal} stopOpacity={0.01} />

  {/* 이탈 구간 (minRange 아래) - 더 진한 빨간색 */}
  <stop offset={`${minRangePercent}%`} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
  <stop offset="100%" stopColor={COLORS.lineViolation} stopOpacity={0} />
</linearGradient>
```

---

## 7. 수정 이력

### 2026-01-12 그라데이션 투명도 조정

**선택된 방식**: 옵션 A - 현재 구현 투명도 조정

**변경 내용** (`EnvironmentLineChart.tsx`):
```typescript
// Before (기존)
<stop offset="0%" stopColor={COLORS.lineViolation} stopOpacity={0.06} />
<stop offset={maxRangePercent} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
<stop offset={maxRangePercent} stopColor={COLORS.lineNormal} stopOpacity={0.04} />
<stop offset={minRangePercent} stopColor={COLORS.lineNormal} stopOpacity={0.02} />
<stop offset={minRangePercent} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
<stop offset="100%" stopColor={COLORS.lineViolation} stopOpacity={0} />

// After (수정)
<stop offset="0%" stopColor={COLORS.lineViolation} stopOpacity={0.08} />  // 6% → 8%
<stop offset={maxRangePercent} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
<stop offset={maxRangePercent} stopColor={COLORS.lineNormal} stopOpacity={0.01} />  // 4% → 1%
<stop offset={minRangePercent} stopColor={COLORS.lineNormal} stopOpacity={0.01} />  // 2% → 1%
<stop offset={minRangePercent} stopColor={COLORS.lineViolation} stopOpacity={0.04} />
<stop offset="100%" stopColor={COLORS.lineViolation} stopOpacity={0} />
```

**변경 요약**:
- 이탈 구간 상단 투명도: 6% → 8% (더 진하게)
- 정상 구간 투명도: 4%/2% → 1%/1% (거의 투명하게)

**검증 결과**:
- ✅ 정상 구간(20-25°C)의 fill이 훨씬 옅어짐
- ✅ 이탈 구간의 fill이 더 명확하게 표시됨
- ⚠️ 완벽한 피그마 일치는 기술적 한계로 불가 (Recharts 단일 Area vs 피그마 개별 벡터)

**스크린샷**: `.playwright-mcp/gradient-full-chart-view.png`

---

## 8. 다음 단계

1. [x] ~~사용자에게 접근 방식 확인~~ → 옵션 A 선택됨
2. [x] ~~선택된 방식으로 그라데이션 수정~~ → 완료
3. [x] ~~Playwright로 수정 결과 검증~~ → 완료
4. [ ] 추가 미세 조정 필요 시 진행

---

*작성일: 2026-01-12*
*수정일: 2026-01-12*
*분석 도구: Figma MCP (get_design_context, get_metadata, get_screenshot)*
