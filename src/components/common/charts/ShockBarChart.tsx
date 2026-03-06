import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ShockBarDataPoint } from '@/utils/environmentMockData';
import { ChartGrid } from './ChartGrid';

export interface ShockBarChartProps {
  data: ShockBarDataPoint[];
  unit?: string;
  threshold?: number;  // 임계치 (기본값: 1.0G)
  height?: number;
  yMin?: number;
  yMax?: number;
  yTicks?: number[];
  xAxisTicks?: number[];  // X축 레이블 표시할 시간 (시 단위)
}

// 색상 상수 (Recharts는 CSS 변수 미지원)
const COLORS = {
  barAboveThreshold: '#F87171',  // red-400
  barBelowThreshold: '#DCDCE0',  // gray-300
  grid: '#DCDCE0',               // gray-300
  text: '#737680',               // gray-600
  labelBg: '#FFFFFF',            // white
  labelBorder: '#DCDCE0',        // gray-300
  labelText: '#17171C',          // gray-1000
} as const;

// Y축 라벨 영역 너비 (rem 기반) - EnvironmentLineChart와 동일
const Y_AXIS_LABEL_WIDTH_REM = 3.5; // 1920px → 56px, 2560px → ~75px

// Tick label offset 상수 (격자선 기준) - EnvironmentLineChart와 동일
const Y_TICK_OFFSET = 14; // 수평 격자선에서 아래로 14px (0.875rem)
const X_TICK_OFFSET = 11; // 수직 격자선에서 오른쪽으로 11px (피그마 스펙 일치)

// X축 라벨 영역 높이 - EnvironmentLineChart와 동일
const X_AXIS_LABEL_HEIGHT = 53;

// 기본 X축 틱 (4시간 간격 - Dashboard용, 2시간 격자선과 정렬됨)
const DEFAULT_X_TICKS = [0, 4, 8, 12, 16, 20, 24];

// 숫자(시)를 시간 문자열로 변환
const hourToTimeLabel = (hour: number): string => {
  const h = Math.floor(hour);
  return `${h.toString().padStart(2, '0')}:00`;
};

// 커스텀 툴팁
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  value: number;
}

export const ShockBarChart = ({
  data,
  unit = 'G',
  threshold = 1.0,
  height,  // undefined면 부모 컨테이너 높이로 채움 (h-full)
  yMin = 0,
  yMax = 8,
  yTicks = [0, 2, 4, 6, 8],
  xAxisTicks = DEFAULT_X_TICKS,
}: ShockBarChartProps) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, value: 0 });
  const [chartSize, setChartSize] = useState({ width: 0, height: 0, remSize: 16 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver로 컨테이너 크기 변화 감지 (2560x1440 등 다양한 화면 대응)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height: h } = container.getBoundingClientRect();
      const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setChartSize({ width, height: h, remSize });
    };

    // 초기 크기 설정
    updateSize();

    // ResizeObserver로 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Y축 라벨 영역 너비: rem 기반으로 뷰포트 스케일링(1920→2560 등)에 비례 대응
  const yAxisLabelWidth = Y_AXIS_LABEL_WIDTH_REM * chartSize.remSize;

  // X축 라벨 영역 높이 (EnvironmentLineChart와 동일)
  const xAxisLabelHeight = X_AXIS_LABEL_HEIGHT;

  // 차트 영역 계산 (격자선 영역과 일치)
  const chartArea = useMemo(() => {
    const width = chartSize.width - yAxisLabelWidth;
    const chartHeight = chartSize.height - xAxisLabelHeight;
    return { width, height: chartHeight };
  }, [chartSize, yAxisLabelWidth, xAxisLabelHeight]);

  // Y값을 픽셀 위치로 변환
  const yToPixel = useCallback((value: number): number => {
    const yRange = yMax - yMin;
    return ((yMax - value) / yRange) * chartArea.height;
  }, [yMin, yMax, chartArea.height]);

  // 데이터에서 최저/최고 값 계산
  const { dataMin, dataMax, minPos, maxPos } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let minPosition = { groupIndex: 0, barIndex: 0 };
    let maxPosition = { groupIndex: 0, barIndex: 0 };

    data.forEach((group, gIdx) => {
      group.values.forEach((v, bIdx) => {
        if (v < min) {
          min = v;
          minPosition = { groupIndex: gIdx, barIndex: bIdx };
        }
        if (v > max) {
          max = v;
          maxPosition = { groupIndex: gIdx, barIndex: bIdx };
        }
      });
    });

    return {
      dataMin: min === Infinity ? 0 : min,
      dataMax: max === -Infinity ? 0 : max,
      minPos: minPosition,
      maxPos: maxPosition,
    };
  }, [data]);

  // 막대 렌더링 데이터 계산
  const barRenderData = useMemo(() => {
    if (chartArea.width <= 0 || data.length === 0) return [];

    const numGroups = data.length;
    const groupWidth = chartArea.width / numGroups;
    const barGap = 4;  // 막대 간 간격
    const numBars = 4;
    const barWidth = Math.max(1, (groupWidth - (numBars - 1) * barGap - 8) / numBars);  // 그룹 양쪽 4px 여백, 최소 1px

    const zeroY = yToPixel(0);  // 0G 라인의 Y 위치
    const pixelsPerG = chartArea.height / (yMax - yMin);

    return data.flatMap((group, groupIndex) => {
      const groupStartX = yAxisLabelWidth + groupIndex * groupWidth + 4;  // 4px 왼쪽 여백

      return group.values.map((value, barIndex) => {
        const x = groupStartX + barIndex * (barWidth + barGap);

        // 막대 높이 계산 (0G 기준으로)
        const barHeight = Math.abs(value) * pixelsPerG;

        // 임계치 기준 색상 결정
        const isAboveThreshold = value >= threshold;

        // 그레이 부분 (0G부터 임계치까지)
        const grayHeight = Math.min(value, threshold) * pixelsPerG;

        // 레드 부분 (임계치 초과분)
        const redHeight = Math.max(0, value - threshold) * pixelsPerG;

        return {
          groupIndex,
          barIndex,
          x,
          y: zeroY - barHeight,
          width: barWidth,
          height: barHeight,
          value,
          isAboveThreshold,
          grayY: zeroY - grayHeight,
          grayHeight,
          redY: zeroY - barHeight,
          redHeight,
          zeroY,
        };
      });
    });
  }, [chartArea, data, yMin, yMax, yToPixel, threshold, yAxisLabelWidth]);

  // 최소/최대 라벨 위치 계산
  const labelPositions = useMemo(() => {
    if (barRenderData.length === 0) return { min: null, max: null };

    const minBar = barRenderData.find(
      (b) => b.groupIndex === minPos.groupIndex && b.barIndex === minPos.barIndex
    );
    const maxBar = barRenderData.find(
      (b) => b.groupIndex === maxPos.groupIndex && b.barIndex === maxPos.barIndex
    );

    return {
      min: minBar ? { x: minBar.x + minBar.width / 2, y: minBar.y + minBar.height + 8 } : null,
      max: maxBar ? { x: maxBar.x + maxBar.width / 2, y: maxBar.y - 24 } : null,
    };
  }, [barRenderData, minPos, maxPos]);

  // 마우스 이벤트 핸들러
  const handleBarMouseEnter = (bar: typeof barRenderData[0]) => {
    setTooltip({
      visible: true,
      x: bar.x + bar.width / 2,
      y: bar.y - 8,
      value: bar.value,
    });
  };

  const handleBarMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  // 차트 영역 높이 (X축 라벨 영역 제외) - EnvironmentLineChart와 동일
  const chartAreaHeight = chartSize.height > xAxisLabelHeight ? chartSize.height - xAxisLabelHeight : 0;

  // 수직 격자선 개수 (데이터 포인트와 동일: 13개, 2시간 간격)
  const verticalGridLines = 13;

  if (chartSize.width === 0) {
    return <div ref={containerRef} className="w-full h-full" style={height ? { height } : undefined} />;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full" style={height ? { height } : undefined}>
      {/* 피그마 100% 일치 커스텀 격자선 - 수직선은 전체 높이, 수평선은 차트 영역에 균등 배치 */}
      {chartSize.width > 0 && chartSize.height > 0 && (
        <ChartGrid
          width={chartSize.width}
          height={chartSize.height}
          horizontalLines={yTicks.length}
          verticalLines={verticalGridLines}
          edgeSolid={false}
          paddingLeft={yAxisLabelWidth}
          paddingRight={0}
          paddingTop={0}
          paddingBottom={xAxisLabelHeight}
          hideRightEdgeLine={true}
          hideTopEdgeLine={true}
        />
      )}

      <svg width={chartSize.width} height={chartSize.height} className="overflow-visible">

        {/* 그레이 막대 (임계치 이하 부분) - 50% 투명도 */}
        <g opacity={0.5}>
          {barRenderData.map((bar, idx) => (
            <rect
              key={`gray-${idx}`}
              x={bar.x}
              y={bar.grayY}
              width={bar.width}
              height={bar.grayHeight}
              fill={COLORS.barBelowThreshold}
            />
          ))}
        </g>

        {/* 레드 막대 (임계치 초과 부분) */}
        {barRenderData.map((bar, idx) => (
          bar.redHeight > 0 && (
            <rect
              key={`red-${idx}`}
              x={bar.x}
              y={bar.redY}
              width={bar.width}
              height={bar.redHeight}
              fill={COLORS.barAboveThreshold}
              onMouseEnter={() => handleBarMouseEnter(bar)}
              onMouseLeave={handleBarMouseLeave}
              style={{ cursor: 'pointer' }}
            />
          )
        ))}

        {/* 투명 히트박스 (마우스 이벤트용) */}
        {barRenderData.map((bar, idx) => (
          <rect
            key={`hitbox-${idx}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill="transparent"
            onMouseEnter={() => handleBarMouseEnter(bar)}
            onMouseLeave={handleBarMouseLeave}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>

      {/* Y축 라벨 - 격자선 기준 개별 absolute 배치 */}
      {chartAreaHeight > 0 && [...yTicks].reverse().map((tick, index) => {
        // 수평 격자선과 동일한 Y 좌표 계산 + offset (14px 아래)
        const y = (chartAreaHeight * index) / (yTicks.length - 1) + Y_TICK_OFFSET;
        return (
          <span
            key={tick}
            className="absolute font-mono text-[0.75rem] text-gray-600"
            style={{
              left: '1rem',
              top: y,
            }}
          >
            {tick}{unit}
          </span>
        );
      })}

      {/* X축 라벨 - 격자선 기준 개별 absolute 배치 */}
      {chartSize.width > 0 && xAxisTicks.map((hour) => {
        // 수직 격자선과 동일한 X 좌표 계산 + offset (오른쪽으로)
        const gridWidth = chartSize.width - yAxisLabelWidth;
        const x = yAxisLabelWidth + (gridWidth * hour) / 24 + X_TICK_OFFSET;
        return (
          <span
            key={hour}
            className="absolute font-mono text-[0.75rem] text-gray-600"
            style={{
              left: x,
              top: chartAreaHeight + 12,
            }}
          >
            {hourToTimeLabel(hour)}
          </span>
        );
      })}

      {/* 최소값 라벨 */}
      {labelPositions.min && dataMin < threshold && (
        <div
          className="absolute bg-white border border-gray-300 rounded px-[0.375rem] py-1 flex items-center justify-center z-10"
          style={{
            left: `${labelPositions.min.x - 25}px`,
            top: `${labelPositions.min.y}px`,
            height: '1.25rem',
          }}
        >
          <span className="font-mono text-[0.8125rem] text-gray-1000 whitespace-nowrap">
            {dataMin}{unit}
          </span>
        </div>
      )}

      {/* 최대값 라벨 */}
      {labelPositions.max && (
        <div
          className="absolute bg-white border border-gray-300 rounded px-[0.375rem] py-1 flex items-center justify-center z-10"
          style={{
            left: `${labelPositions.max.x - 25}px`,
            top: `${labelPositions.max.y}px`,
            height: '1.25rem',
          }}
        >
          <span className="font-mono text-[0.8125rem] text-gray-1000 whitespace-nowrap">
            {dataMax}{unit}
          </span>
        </div>
      )}

      {/* 툴팁 */}
      {tooltip.visible && (
        <div
          key={`${tooltip.x}-${tooltip.y}-${tooltip.value}`}
          className="absolute bg-white border border-gray-300 rounded px-[0.375rem] py-1 shadow-sm z-20 pointer-events-none animate-fade-in"
          style={{
            left: `${tooltip.x - 20}px`,
            top: `${tooltip.y - 24}px`,
          }}
        >
          <span className="font-mono text-[0.8125rem] text-gray-1000">
            {tooltip.value}{unit}
          </span>
        </div>
      )}
    </div>
  );
};

export default ShockBarChart;
