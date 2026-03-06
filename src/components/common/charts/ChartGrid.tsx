/**
 * ChartGrid - 피그마 디자인과 100% 일치하는 커스텀 SVG 격자선 컴포넌트
 *
 * 피그마 스펙 (node-id: 311-51865):
 * - 수직선: 13개, gap 80px (5rem), 모두 dashed
 * - 수평선: justify-between 균등 배치, 상하단 solid, 중간 dashed
 * - 색상: #DCDCE0 (gray-300)
 * - 선 두께: 1px
 */

// 피그마 디자인 토큰 (recharts는 CSS 변수 미지원으로 HEX 값 사용)
const GRID_COLOR = '#DCDCE0'; // gray-300

export interface ChartGridProps {
  /** SVG 컨테이너 너비 */
  width: number;
  /** SVG 컨테이너 높이 */
  height: number;
  /** 수평선 개수 (기본값: 5) - Y축 눈금 수와 동일 */
  horizontalLines?: number;
  /** 수직선 개수 (기본값: 13) - 0시~24시, 2시간 간격 */
  verticalLines?: number;
  /** 상하단 수평선을 실선으로 표시할지 여부 (기본값: true) */
  edgeSolid?: boolean;
  /** 차트 영역 좌측 여백 - 수직선 시작 위치 (기본값: 0) */
  paddingLeft?: number;
  /** 차트 영역 우측 여백 (기본값: 0) */
  paddingRight?: number;
  /** 차트 영역 상단 여백 - 수평선 시작 위치 (기본값: 0) */
  paddingTop?: number;
  /** 차트 영역 하단 여백 (기본값: 0) */
  paddingBottom?: number;
  /** 맨 오른쪽 수직 격자선 숨김 - 컨테이너 border와 겹침 방지 (기본값: false) */
  hideRightEdgeLine?: boolean;
  /** 맨 위쪽 수평 격자선 숨김 - 컨테이너 border와 겹침 방지 (기본값: false) */
  hideTopEdgeLine?: boolean;
}

export const ChartGrid = ({
  width,
  height,
  horizontalLines = 5,
  verticalLines = 13,
  edgeSolid = true,
  paddingLeft = 0,
  paddingRight = 0,
  paddingTop = 0,
  paddingBottom = 0,
  hideRightEdgeLine = false,
  hideTopEdgeLine = false,
}: ChartGridProps) => {
  // 유효한 크기 체크
  if (width <= 0 || height <= 0) return null;

  // 실제 격자 영역 계산
  const gridWidth = width - paddingLeft - paddingRight;
  const gridHeight = height - paddingTop - paddingBottom;

  // 수평선 Y 좌표 계산 (균등 배치)
  const horizontalLinePositions: number[] = [];
  for (let i = 0; i < horizontalLines; i++) {
    const y = paddingTop + (gridHeight * i) / (horizontalLines - 1);
    horizontalLinePositions.push(y);
  }

  // 수직선 X 좌표 계산 (균등 배치)
  const verticalLinePositions: number[] = [];
  for (let i = 0; i < verticalLines; i++) {
    const x = paddingLeft + (gridWidth * i) / (verticalLines - 1);
    verticalLinePositions.push(x);
  }

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* 수평 격자선 - 피그마: 상하단 실선, 중간 점선 */}
      {horizontalLinePositions.map((y, index) => {
        // 맨 위쪽 수평선 숨김 (컨테이너 border와 겹침 방지)
        if (hideTopEdgeLine && index === 0) return null;

        const isEdge = index === 0 || index === horizontalLines - 1;
        const strokeDasharray = edgeSolid && isEdge ? '0' : '3 3';

        return (
          <line
            key={`h-${index}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={GRID_COLOR}
            strokeWidth={1}
            strokeDasharray={strokeDasharray}
          />
        );
      })}

      {/* 수직 격자선 - 피그마: 모두 점선, 전체 높이로 연장 */}
      {verticalLinePositions.map((x, index) => {
        // 맨 오른쪽 수직선 숨김 (컨테이너 border와 겹침 방지)
        if (hideRightEdgeLine && index === verticalLines - 1) return null;

        return (
          <line
            key={`v-${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke={GRID_COLOR}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        );
      })}
    </svg>
  );
};

export default ChartGrid;
