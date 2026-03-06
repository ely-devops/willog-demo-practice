# Willog SaaS 디자인 시스템

이 문서는 Willog SaaS 프로젝트의 디자인 토큰 및 스타일링 가이드라인을 설명합니다.

## 목차

1. [개요](#개요)
2. [디자인 토큰 구조](#디자인-토큰-구조)
3. [색상 (Colors)](#색상-colors)
4. [타이포그래피 (Typography)](#타이포그래피-typography)
5. [간격 및 크기 (Spacing & Sizing)](#간격-및-크기-spacing--sizing)
6. [컴포넌트 가이드](#컴포넌트-가이드)
7. [토큰 업데이트 방법](#토큰-업데이트-방법)

---

## 개요

### 기술 스택
- **Tailwind CSS v4**: CSS-in-JS 대신 `@theme` 블록 기반 CSS 변수 사용
- **디자인 토큰**: Figma Tokens Studio에서 내보낸 JSON 파일 기반
- **자동 변환**: `npm run tokens` 명령어로 JSON → CSS 자동 변환

### 파일 구조
```
willog-saas/
  design-tokens/           # Figma 토큰 원본 (JSON)
    Primitives.json        # 원시 토큰 (색상, 간격, 타이포그래피)
    Semantic.json          # 시맨틱 토큰 (용도 기반)
  scripts/
    build-tokens.ts        # 토큰 변환 스크립트
  src/
    styles/
      generated/           # 자동 생성된 CSS
        fonts.css          # 폰트 import
        theme.css          # @theme 블록 (CSS 변수)
        utilities.css      # @utility 클래스 (타이포그래피)
    index.css              # 메인 CSS
```

---

## 디자인 토큰 구조

### Primitives (원시 토큰)
기본 디자인 값들로, 직접 사용보다는 Semantic 토큰의 기반으로 활용합니다.

- `color.*`: 색상 팔레트 (blue, red, orange, green, gray)
- `radius.*`: Border radius 값
- `dimension.*`: 간격(spacing) 값
- `Title.*`, `Body.*`, `Label.*`, `Mono.*`, `Display.*`: 타이포그래피

### Semantic (시맨틱 토큰)
용도 기반 토큰으로, 실제 개발에서 주로 사용합니다.

- `background.*`: 배경색 (`--bg-primary`, `--bg-error` 등)
- `text.*`: 텍스트 색상 (`--text-black`, `--text-primary` 등)
- `border.*`: 테두리 색상
- `button.*`: 버튼 상태별 색상
- `status.*`: 상태 표시 색상 (danger, warning, success)

---

## 색상 (Colors)

### 원시 색상 팔레트

#### Blue (Primary)
| 토큰 | 값 | Tailwind 클래스 |
|------|-----|-----------------|
| `--color-blue-500` | `#417DF7` | `bg-blue-500`, `text-blue-500` |
| `--color-blue-600` | `#2563EB` | `bg-blue-600`, `text-blue-600` |
| `--color-blue-700` | `#1D4ED8` | `bg-blue-700`, `text-blue-700` |

#### Gray
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-gray-1000` | `#17171C` | 메인 텍스트 |
| `--color-gray-800` | `#45454F` | 서브 텍스트 |
| `--color-gray-600` | `#737680` | 비활성 텍스트/아이콘 |
| `--color-gray-400` | `#B8B8C0` | 활성 테두리 |
| `--color-gray-300` | `#DCDCE0` | 기본 테두리 |
| `--color-gray-100` | `#F2F2F4` | 배경 |
| `--color-gray-00` | `#FFFFFF` | 카드 배경 |

### 시맨틱 색상

#### 배경 (Background)
```css
--bg-primary: #417DF7;           /* 메인 버튼 배경 */
--bg-error: #EF4444;             /* 에러 배경 */
--bg-primary-tonel: #DBEAFE;     /* 연한 파란색 배경 */
```

#### 텍스트 (Text)
```css
--text-black: #17171C;           /* 메인 텍스트 */
--text-primary: #2563EB;         /* 링크, 강조 텍스트 */
--text-error: #DC2D28;           /* 에러 메시지 */
--text-black-disabled: #737680;  /* 비활성 텍스트 */
```

#### 상태 (Status)
| 상태 | 배경 | 텍스트/아이콘 | 사용 예시 |
|------|------|---------------|----------|
| Success | `--status-success-bg-subtle` | `--color-green-600` | 정상, 완료 |
| Warning | `--status-warning-bg-subtle` | `--color-orange-600` | 주의, 경고 |
| Danger | `--status-danger-bg-subtle` | `--status-danger-fg` | 에러, 위험 |

**사용 예시:**
```jsx
{/* 상태 뱃지 */}
<span className="bg-status-success-bg-subtle text-green-600 px-2 py-0.5 rounded-full text-label-xs">
  정상
</span>
<span className="bg-status-danger-bg-subtle text-status-danger-fg px-2 py-0.5 rounded-full text-label-xs">
  위험
</span>
```

---

## 타이포그래피 (Typography)

### 폰트 패밀리

| 용도 | CSS 변수 | 폰트 |
|------|----------|------|
| 기본 (Sans) | `--font-sans` | SUIT Variable |
| 코드/숫자 (Mono) | `--font-mono` | JetBrains Mono |
| 디스플레이 | `--font-display` | SUIT Variable |

### 타이포그래피 유틸리티 클래스

#### Headings (제목)
| 클래스 | 크기 | Weight | Line Height | 용도 |
|--------|------|--------|-------------|------|
| `text-h1` | 32px | 500 | 1.3 | 페이지 제목 |
| `text-h2` | 24px | 500 | 1.3 | 섹션 제목 |
| `text-h3` | 16px | 500 | 1.3 | 카드 제목 |
| `text-h4` | 14px | 500 | 1.3 | 소제목 |

#### Body (본문)
| 클래스 | 크기 | Weight | Line Height | 용도 |
|--------|------|--------|-------------|------|
| `text-body-l` | 16px | 400 | 1.48 | 리드 텍스트 |
| `text-body-m` | 14px | 400 | 1.48 | 일반 본문 |
| `text-body-s` | 13px | 400 | 1.48 | 보조 텍스트 |
| `text-body-xs` | 12px | 400 | 1.48 | 작은 텍스트 |

#### Labels (라벨)
| 클래스 | 크기 | Weight | 용도 |
|--------|------|--------|------|
| `text-label-m` | 14px | 400 | 버튼, 라벨 |
| `text-label-m-strong` | 14px | 500 | 강조 라벨 |
| `text-label-s` | 13px | 400 | 작은 라벨 |
| `text-label-xs` | 12px | 400 | 뱃지, 태그 |

#### Mono (코드/숫자)
| 클래스 | 크기 | 용도 |
|--------|------|------|
| `text-mono-xl` | 14px | 큰 코드/ID |
| `text-mono-l` | 13px | 일반 코드 |
| `text-mono-m` | 12px | 작은 코드 |
| `text-mono-s` | 11px | 매우 작은 코드 |

#### Display (대형 숫자)
| 클래스 | 크기 | 용도 |
|--------|------|------|
| `text-display-xxxl` | 72px | 대시보드 메인 KPI |
| `text-display-xxl` | 60px | 대형 통계 |
| `text-display-xl` | 48px | 중형 통계 |
| `text-display-l` | 32px | 카드 내 주요 수치 |
| `text-display-m` | 24px | 소형 수치 |

**사용 예시:**
```jsx
<h1 className="text-h1 text-black">페이지 제목</h1>
<p className="text-body-m text-gray-600">본문 텍스트입니다.</p>
<span className="text-mono-m text-gray-800">DEV-2024-001</span>
<div className="text-display-xl text-primary">1,234</div>
```

---

## 간격 및 크기 (Spacing & Sizing)

### Spacing Scale
기본 단위는 4px입니다.

| 토큰 | 값 | Tailwind |
|------|-----|----------|
| `--spacing-0.5` | 2px | `p-0.5`, `m-0.5` |
| `--spacing-1` | 4px | `p-1`, `m-1` |
| `--spacing-2` | 8px | `p-2`, `m-2` |
| `--spacing-3` | 12px | `p-3`, `m-3` |
| `--spacing-4` | 16px | `p-4`, `m-4` |
| `--spacing-5` | 20px | `p-5`, `m-5` |
| `--spacing-6` | 24px | `p-6`, `m-6` |
| `--spacing-8` | 32px | `p-8`, `m-8` |

### Border Radius
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-1` | 4px | 체크박스, 작은 버튼 |
| `--radius-1.5` | 6px | 입력 필드, 기본 버튼 |
| `--radius-2` | 8px | 카드, 컨테이너 |
| `--radius-3` | 12px | 큰 카드, 모달 |
| `--radius-full` | 999px | 뱃지, 원형 아이콘 |

---

## 컴포넌트 가이드

### Buttons

#### 크기 (Size)
| Size | Height | Padding X | 용도 |
|------|--------|-----------|------|
| Large | 36~40px | 16px | 주요 액션 버튼 |
| Medium | 32px | 12px | 일반 버튼 |

#### 스타일 (Style)
```jsx
{/* Primary Button */}
<button className="bg-btn-primary-active hover:bg-btn-primary-hover active:bg-btn-primary-pressed text-white text-label-m h-9 px-4 rounded-[6px]">
  확인
</button>

{/* Secondary/Outline Button */}
<button className="border border-gray-300 text-gray-800 bg-white text-label-m h-9 px-4 rounded-[6px] hover:bg-gray-50">
  취소
</button>

{/* Ghost Button */}
<button className="text-gray-600 text-label-m h-9 px-4 rounded-[6px] hover:bg-gray-100">
  더보기
</button>
```

### Cards

```jsx
<div className="bg-white border border-gray-200 rounded-[12px] p-5">
  <h3 className="text-h3 text-black mb-2">카드 제목</h3>
  <p className="text-body-m text-gray-600">카드 내용</p>
</div>
```

### Status Badges

```jsx
{/* Success */}
<span className="bg-status-success-bg-subtle text-green-600 text-label-xs px-2 py-0.5 rounded-full">
  정상
</span>

{/* Warning */}
<span className="bg-status-warning-bg-subtle text-orange-600 text-label-xs px-2 py-0.5 rounded-full">
  주의
</span>

{/* Danger */}
<span className="bg-status-danger-bg-subtle text-status-danger-fg text-label-xs px-2 py-0.5 rounded-full">
  위험
</span>
```

### Tables

```jsx
<table className="w-full">
  <thead>
    <tr className="bg-gray-50 h-10">
      <th className="text-label-s text-gray-500 text-left px-4">컬럼명</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200 h-12">
      <td className="text-body-m text-black px-4">데이터</td>
    </tr>
  </tbody>
</table>
```

---

## 토큰 업데이트 방법

### 1. Figma 토큰 업데이트

디자인 팀에서 새로운 토큰 JSON을 받으면:

1. `design-tokens/` 폴더의 파일들을 교체
2. 토큰 빌드 스크립트 실행:
   ```bash
   npm run tokens
   ```
3. 변경 사항 확인 및 테스트

### 2. 스크립트 명령어

```bash
# 토큰 1회 빌드
npm run tokens

# 토큰 파일 변경 감지 및 자동 빌드
npm run tokens:watch

# 전체 빌드 (토큰 포함)
npm run build
```

### 3. 커스텀 토큰 추가

Figma 토큰에 없는 프로젝트 전용 토큰은 `src/index.css`의 `@theme` 블록에 추가:

```css
@theme {
  /* 커스텀 토큰 */
  --my-custom-color: #ff0000;
}
```

---

## 주의사항

1. **하드코딩 금지**: 색상/간격 값을 직접 입력하지 마세요. 항상 CSS 변수나 Tailwind 클래스를 사용하세요.
   ```jsx
   {/* ❌ 잘못된 예 */}
   <div style={{ color: '#17171C' }}>

   {/* ✅ 올바른 예 */}
   <div className="text-black">
   ```

2. **시맨틱 토큰 우선**: 가능한 시맨틱 토큰(`--text-primary`, `--bg-error`)을 사용하세요.

3. **Generated 파일 수정 금지**: `src/styles/generated/` 내 파일은 자동 생성됩니다. 직접 수정하지 마세요.

4. **폰트 라이센스**:
   - SUIT: 오픈소스 (SIL OFL)
   - JetBrains Mono: 오픈소스 (SIL OFL)
   - Akkurat-Mono, ABC Social: 상용 폰트 (라이센스 확보 후 교체 필요)
