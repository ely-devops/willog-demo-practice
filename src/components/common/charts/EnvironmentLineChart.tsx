import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  Area,
  ComposedChart,
} from 'recharts';
import { ChartGrid } from './ChartGrid';

export interface EnvironmentDataPoint {
  time: string;
  value: number;
  isViolation?: boolean;
}

export interface EnvironmentLineChartProps {
  data: EnvironmentDataPoint[];
  unit?: string;
  minRange?: number;
  maxRange?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
  yTicks?: number[];
  showMinMaxLabels?: boolean;
  xAxisTicks?: number[];  // X축 레이블 표시할 시간 (시 단위, 예: [0, 5, 10, 15, 20, 24])
  autoScale?: boolean;    // Y축 자동 스케일 (데이터+기준범위 기반)
  animationKey?: string;  // 변경 시 차트 재마운트하여 왼쪽→오른쪽 스윕 애니메이션 재생
  verticalLines?: number; // 수직 격자선 개수 (기본값: 13 - 2시간 간격)
}

// 시간 문자열을 숫자(시)로 변환
const timeToHour = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + (minutes || 0) / 60;
};

// 숫자(시)를 시간 문자열로 변환
const hourToTimeLabel = (hour: number): string => {
  const h = Math.floor(hour);
  return `${h.toString().padStart(2, '0')}:00`;
};

// 디자인 토큰 매핑 (recharts는 CSS 변수 미지원으로 HEX 값 사용)
// 피그마 스펙: 정상 라인 #1858B4 (blue-600), 이탈 라인 #DC2D28 (red-600)
const COLORS = {
  lineNormal: '#1858B4',     // 피그마: rgba(24, 88, 180, 1) - blue-600
  lineViolation: '#DC2D28',  // 피그마: rgba(220, 45, 40, 1) - red-600
  rangeArea: 'rgba(65, 125, 247, 0.08)',  // 피그마: rgba(65, 125, 247, 0.08) - 정상 범위 배경
  violationFill: 'rgba(220, 45, 40, 0.08)', // 피그마: 이탈 구간 연한 빨간색 fill
  grid: '#DCDCE0',           // 피그마: gray-300 (격자선)
  gridDashed: '#DCDCE0',     // 피그마: gray-300 (점선 격자)
  text: '#737680',           // 피그마: gray-600 (축 라벨 텍스트)
  dotNormal: '#1858B4',      // 피그마: 정상 점 테두리 (흰색 채움 + 파란 테두리)
  dotViolation: '#DC2D28',   // 피그마: 이탈 점 채움 (빨간색)
} as const;

// 차트 마진 상수 (recharts ComposedChart용)
// 격자가 전체 영역을 채우도록 margin을 최소화
// Y축/X축 라벨은 차트 외부에 absolute로 배치
const CHART_MARGIN = {
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

// 피그마 기준 레이아웃 상수
const Y_AXIS_LABEL_WIDTH_REM = 3.5;   // Y축 라벨 영역 너비 (rem) - 기본값 (°C, %, G 등) (1920px→56px, 2560px→~75px)
const Y_AXIS_LABEL_WIDTH_DECIMAL_REM = 4.25; // 소수점이 포함된 yTicks용 (예: 5.5°C) - 반도체와 동일한 시각적 간격 유지
const Y_AXIS_LABEL_WIDTH_LX_REM = 5; // 조도(lx) 단위: 긴 라벨 (예: 157.4lx)에 맞춘 너비
const X_AXIS_LABEL_HEIGHT = 53;  // X축 라벨 영역 높이 (px) - 피그마: 53px

// Tick label offset 상수 (격자선 기준)
const Y_TICK_OFFSET = 14; // 수평 격자선에서 아래로 14px (0.875rem)
const X_TICK_OFFSET = 11; // 수직 격자선에서 오른쪽으로 11px (피그마 스펙 일치)

// Y축 기본 값 (피그마 기준)
const DEFAULT_Y_MIN = 10;
const DEFAULT_Y_MAX = 50;
const DEFAULT_Y_TICKS = [10, 20, 30, 40, 50];

// ========== 교차점 삽입 및 이탈 영역 데이터 전처리 ==========
interface ProcessedDataPoint {
  hour: number;
  time: string;
  value: number;
  isViolation: boolean;
  isCrossingPoint?: boolean;
  isEdgePoint?: boolean; // 컨테이너 끝단 포인트 (dot 미표시용)
  // 라인 분리 및 채움용 필드
  violationAboveValue: number | null;  // maxRange 초과 시 value
  violationBelowValue: number | null;  // minRange 미만 시 value
  normalValue: number | null;          // 정상 범위 내 value
}

/**
 * 선형 보간으로 교차점 계산
 * 두 점 (h1, v1)과 (h2, v2) 사이에서 value = targetValue인 hour 계산
 */
const interpolateCrossing = (
  h1: number, v1: number,
  h2: number, v2: number,
  targetValue: number
): number => {
  if (v2 === v1) return h1; // 수평선인 경우
  return h1 + (targetValue - v1) * (h2 - h1) / (v2 - v1);
};

/**
 * 데이터에 교차점을 삽입하고 violation/normal 시리즈 생성
 * - 정상→이탈, 이탈→정상 경계에 교차점 삽입
 * - 교차점은 인접한 두 시리즈(예: normal과 violationAbove) 모두에 값을 가짐 -> 라인 연결됨
 */
const preprocessDataWithCrossings = (
  data: EnvironmentDataPoint[],
  minRange: number,
  maxRange: number
): ProcessedDataPoint[] => {
  if (data.length === 0) return [];

  const result: ProcessedDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const curr = data[i];
    const currHour = timeToHour(curr.time);
    
    // 현재 점의 상태 판별
    const isAbove = curr.value > maxRange;
    const isBelow = curr.value < minRange;
    const isNormal = !isAbove && !isBelow;

    // 이전 점과 현재 점 사이의 교차점 삽입
    if (i > 0) {
      const prev = data[i - 1];
      const prevHour = timeToHour(prev.time);
      const prevAbove = prev.value > maxRange;
      const prevBelow = prev.value < minRange;
      const prevNormal = !prevAbove && !prevBelow;

      // 1. maxRange 교차 (Normal <-> Above)
      if ((prevNormal && isAbove) || (prevAbove && isNormal)) {
        const crossHour = interpolateCrossing(prevHour, prev.value, currHour, curr.value, maxRange);
        result.push({
          hour: crossHour,
          time: hourToTimeLabel(crossHour),
          value: maxRange,
          isViolation: false,
          isCrossingPoint: true,
          violationAboveValue: maxRange, // 교차점 포함
          violationBelowValue: null,
          normalValue: maxRange,         // 교차점 포함
        });
      }

      // 2. minRange 교차 (Normal <-> Below)
      if ((prevNormal && isBelow) || (prevBelow && isNormal)) {
        const crossHour = interpolateCrossing(prevHour, prev.value, currHour, curr.value, minRange);
        result.push({
          hour: crossHour,
          time: hourToTimeLabel(crossHour),
          value: minRange,
          isViolation: false,
          isCrossingPoint: true,
          violationAboveValue: null,
          violationBelowValue: minRange, // 교차점 포함
          normalValue: minRange,         // 교차점 포함
        });
      }
      
      // 3. 급격한 변화로 Below <-> Above 직접 교차 (드문 경우지만 처리)
      // minRange와 maxRange 두 번 교차함
      if ((prevBelow && isAbove) || (prevAbove && isBelow)) {
        // 순서는 값의 증감에 따라 다름
        const crossMin = interpolateCrossing(prevHour, prev.value, currHour, curr.value, minRange);
        const crossMax = interpolateCrossing(prevHour, prev.value, currHour, curr.value, maxRange);
        
        const firstCross = prevBelow ? crossMin : crossMax; // 증가 중이면 min 먼저
        const secondCross = prevBelow ? crossMax : crossMin;
        
        const firstVal = prevBelow ? minRange : maxRange;
        const secondVal = prevBelow ? maxRange : minRange;

        result.push({
          hour: firstCross,
          time: hourToTimeLabel(firstCross),
          value: firstVal,
          isViolation: false,
          isCrossingPoint: true,
          violationAboveValue: firstVal === maxRange ? maxRange : null,
          violationBelowValue: firstVal === minRange ? minRange : null,
          normalValue: firstVal,
        });

        result.push({
          hour: secondCross,
          time: hourToTimeLabel(secondCross),
          value: secondVal,
          isViolation: false,
          isCrossingPoint: true,
          violationAboveValue: secondVal === maxRange ? maxRange : null,
          violationBelowValue: secondVal === minRange ? minRange : null,
          normalValue: secondVal,
        });
      }
    }

    // 현재 점 추가
    result.push({
      hour: currHour,
      time: curr.time,
      value: curr.value,
      isViolation: isAbove || isBelow,
      isCrossingPoint: false,
      violationAboveValue: isAbove ? curr.value : null,
      violationBelowValue: isBelow ? curr.value : null,
      normalValue: isNormal ? curr.value : null,
    });
  }

  // hour 기준 정렬 (교차점이 올바른 위치에 오도록)
  result.sort((a, b) => a.hour - b.hour);

  return result;
};

// ========== Y축 자동 스케일 계산 ==========
interface AutoScaleResult {
  yMin: number;
  yMax: number;
  yTicks: number[];
}

/**
 * "nice number" 방식으로 Y축 범위와 틱 계산
 * 순수 데이터 범위 기반으로 타이트하게 계산
 */
const calculateAutoScale = (
  dataMin: number,
  dataMax: number,
  tickCount: number = 5
): AutoScaleResult => {
  // 순수 데이터 범위만 사용 (타이트하게)
  const range = dataMax - dataMin;
  const padding = Math.max(range * 0.1, 0.5); // 10% 패딩 또는 최소 0.5

  const paddedMin = dataMin - padding;
  const paddedMax = dataMax + padding;

  // Nice number 계산
  const rawInterval = (paddedMax - paddedMin) / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
  const residual = rawInterval / magnitude;

  let niceInterval: number;
  if (residual <= 1.2) niceInterval = 1 * magnitude;
  else if (residual <= 2.5) niceInterval = 2 * magnitude;
  else if (residual <= 6) niceInterval = 5 * magnitude;
  else niceInterval = 10 * magnitude;

  // yMin을 nice number로 조정
  const yMin = Math.floor(paddedMin / niceInterval) * niceInterval;

  // yMax를 정확히 tickCount-1 간격만큼 떨어진 위치로 설정
  const yMax = yMin + niceInterval * (tickCount - 1);

  // 정확히 tickCount 개의 틱 생성
  const yTicks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    const tick = yMin + niceInterval * i;
    yTicks.push(Math.round(tick * 100) / 100);
  }

  return { yMin, yMax, yTicks };
};

/**
 * 백분위수 계산 (정상 범위 밴드용)
 * @param values 정렬되지 않은 숫자 배열
 * @param percentile 0-100 사이의 백분위수
 */
const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  // 선형 보간
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

// ========== 커스텀 데이터 포인트 (dot) ==========
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ProcessedDataPoint;
  minRange: number;
  maxRange: number;
  isEdgePoint?: boolean; // 컨테이너 끝단 포인트 여부
}

const CustomDot = ({ cx, cy, payload, minRange, maxRange, isEdgePoint }: CustomDotProps) => {
  if (!cx || !cy || !payload) return null;

  // 교차점은 dot 표시 안 함
  if (payload.isCrossingPoint) return null;

  // 컨테이너 끝단(좌/우 가장자리)에는 dot 표시 안 함
  if (isEdgePoint || payload.isEdgePoint) return null;

  const isViolation = payload.value < minRange || payload.value > maxRange;

  if (isViolation) {
    // 이탈: 흰색 채움 + 빨간색 테두리 (hollow)
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="white"
        stroke={COLORS.dotViolation}
        strokeWidth={1}
        style={{ pointerEvents: 'none', outline: 'none' }}
      />
    );
  }

  // 정상: 흰색 채움 + 파란색 테두리
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="white"
      stroke={COLORS.dotNormal}
      strokeWidth={1}
      style={{ pointerEvents: 'none', outline: 'none' }}
    />
  );
};

// ========== 커스텀 툴팁 ==========
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ProcessedDataPoint }>;
  unit?: string;
}

const CustomTooltip = ({ active, payload, unit = '' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // payload[0]는 마우스에 가장 가까운 Line의 데이터일 수 있음.
    // 하지만 우리는 동일한 x축의 원본 값을 보여주고 싶음.
    // dataKey="value"는 사용하지 않으므로, payload의 원본 객체에서 value를 찾아야 함.
    const data = payload[0].payload;

    // 소수점 제거: 정수로 반올림하여 표시
    const displayValue = Math.round(data.value);

    // key를 사용하여 값이 변경될 때마다 애니메이션 재생
    // hour와 displayValue를 조합하여 고유 키 생성
    const tooltipKey = `${data.hour}-${displayValue}`;

    return (
      <div
        key={tooltipKey}
        className="bg-white border border-gray-300 rounded px-[0.375rem] py-1 shadow-sm animate-fade-in"
      >
        <p className="font-mono text-[0.8125rem] text-gray-1000">
          {displayValue}{unit}
        </p>
      </div>
    );
  }
  return null;
};

// 피그마 기준 기본 X축 틱 (4시간 간격 - Dashboard용, 2시간 격자선과 정렬됨)
const DEFAULT_X_TICKS = [0, 4, 8, 12, 16, 20, 24];

export const EnvironmentLineChart = ({
  data,
  unit = '',
  minRange = 20,
  maxRange = 25,
  height,  // undefined면 부모 컨테이너 높이로 채움 (h-full)
  yMin: propYMin,
  yMax: propYMax,
  yTicks: propYTicks,
  showMinMaxLabels = true,
  xAxisTicks = DEFAULT_X_TICKS,
  autoScale = true, // 기본값: 자동 스케일 활성화
  animationKey,     // 변경 시 차트 재마운트
  verticalLines = 13, // 기본값: 2시간 간격 격자선
}: EnvironmentLineChartProps) => {
  // 데이터에서 최저/최고 값 계산 (원본 데이터 기준)
  const { dataMin, dataMax, minIndex, maxIndex } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let minIdx = 0;
    let maxIdx = 0;

    data.forEach((d, idx) => {
      if (d.value < min) {
        min = d.value;
        minIdx = idx;
      }
      if (d.value > max) {
        max = d.value;
        maxIdx = idx;
      }
    });

    return { dataMin: min, dataMax: max, minIndex: minIdx, maxIndex: maxIdx };
  }, [data]);

  // Y축 범위/틱 결정 (자동 스케일 또는 props) - 순수 데이터 기반
  const { yMin, yMax, yTicks } = useMemo(() => {
    if (autoScale && data.length > 0) {
      return calculateAutoScale(dataMin, dataMax);
    }
    return {
      yMin: propYMin ?? DEFAULT_Y_MIN,
      yMax: propYMax ?? DEFAULT_Y_MAX,
      yTicks: propYTicks ?? DEFAULT_Y_TICKS,
    };
  }, [autoScale, data.length, dataMin, dataMax, propYMin, propYMax, propYTicks]);

  // 동적 정상 범위 계산 (30th~70th 백분위수 기반)
  const { dynamicMinRange, dynamicMaxRange } = useMemo(() => {
    if (data.length === 0) {
      return { dynamicMinRange: minRange, dynamicMaxRange: maxRange };
    }
    const values = data.map(d => d.value);
    return {
      dynamicMinRange: calculatePercentile(values, 40),
      dynamicMaxRange: calculatePercentile(values, 60),
    };
  }, [data, minRange, maxRange]);

  // 차트 컨테이너 크기 상태 (먼저 정의해야 gridWidth 계산 가능)
  // remSize: 뷰포트 반응형 스케일링 대응 (1920px→16px, 2560px→~21.3px)
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
  // - 조도(lx): 단위 텍스트가 길어 가장 넓게 설정
  // - 소수점 포함 yTicks: 라벨이 길어지므로 (예: 5.5°C vs 20°C) 중간 너비 사용
  // - 기본값: 정수 라벨용
  const hasDecimalTicks = yTicks.some(tick => !Number.isInteger(tick));
  const yAxisLabelWidthRem = unit === 'lx'
    ? Y_AXIS_LABEL_WIDTH_LX_REM
    : hasDecimalTicks
      ? Y_AXIS_LABEL_WIDTH_DECIMAL_REM
      : Y_AXIS_LABEL_WIDTH_REM;
  const yAxisLabelWidth = yAxisLabelWidthRem * chartSize.remSize;

  // 격자 영역 크기 계산
  // - gridWidth: Y축 라벨 영역 제외
  // - gridFullHeight: 전체 높이 (수직 격자선이 X축 라벨 영역까지 뻗어야 함)
  // - chartAreaHeight: 차트 플로팅 영역 높이 (X축 라벨 영역 제외)
  const gridWidth = chartSize.width > yAxisLabelWidth ? chartSize.width - yAxisLabelWidth : 0;
  const gridFullHeight = chartSize.height; // 피그마: 수직선이 컨테이너 끝까지 연장
  const chartAreaHeight = chartSize.height > X_AXIS_LABEL_HEIGHT ? chartSize.height - X_AXIS_LABEL_HEIGHT : 0;

  // 확장된 X축 도메인 계산 (라인이 컨테이너 끝까지 뻗도록)
  // Y축 라벨 영역만큼 왼쪽으로 도메인 확장
  const extendedDomain = useMemo(() => {
    if (gridWidth <= 0) return { min: 0, max: 24 };
    // Y축 라벨 영역에 해당하는 시간 계산
    const leftExtension = (24 * yAxisLabelWidth) / gridWidth;
    return { min: -leftExtension, max: 24 };
  }, [gridWidth, yAxisLabelWidth]);

  // 데이터 전처리: 교차점 삽입 + 분리된 시리즈 생성 + 끝단 포인트 추가
  // 동적 정상 범위(30th~70th 백분위수) 사용
  const processedData = useMemo(() => {
    const baseData = preprocessDataWithCrossings(data, dynamicMinRange, dynamicMaxRange);
    if (baseData.length === 0) return baseData;

    // 첫 번째와 마지막 데이터 포인트
    const firstPoint = baseData[0];
    const lastPoint = baseData[baseData.length - 1];

    // 왼쪽 끝단 포인트 (컨테이너 x=0에 해당)
    const leftEdgePoint: ProcessedDataPoint = {
      hour: extendedDomain.min,
      time: '',
      value: firstPoint.value,
      isViolation: firstPoint.isViolation,
      isEdgePoint: true,
      violationAboveValue: firstPoint.violationAboveValue,
      violationBelowValue: firstPoint.violationBelowValue,
      normalValue: firstPoint.normalValue,
    };

    // 오른쪽 끝단 포인트 (컨테이너 x=width에 해당)
    const rightEdgePoint: ProcessedDataPoint = {
      hour: 24,
      time: '',
      value: lastPoint.value,
      isViolation: lastPoint.isViolation,
      isEdgePoint: true,
      violationAboveValue: lastPoint.violationAboveValue,
      violationBelowValue: lastPoint.violationBelowValue,
      normalValue: lastPoint.normalValue,
    };

    return [leftEdgePoint, ...baseData, rightEdgePoint];
  }, [data, dynamicMinRange, dynamicMaxRange, extendedDomain.min]);

  // 최저/최고값 라벨의 동적 위치 계산
  const labelPositions = useMemo(() => {
    if (gridWidth === 0 || chartAreaHeight === 0 || data.length === 0) {
      return { min: null, max: null };
    }

    // 차트 영역: Y축 라벨 영역 이후부터 끝까지
    const chartAreaLeft = yAxisLabelWidth;
    const chartAreaWidth = gridWidth;
    const yRange = yMax - yMin;

    // 최저값 위치 계산
    const minDataPoint = data[minIndex];
    const minHour = timeToHour(minDataPoint.time);
    const minX = chartAreaLeft + (minHour / 24) * chartAreaWidth;
    const minY = ((yMax - dataMin) / yRange) * chartAreaHeight;

    // 최고값 위치 계산
    const maxDataPoint = data[maxIndex];
    const maxHour = timeToHour(maxDataPoint.time);
    const maxX = chartAreaLeft + (maxHour / 24) * chartAreaWidth;
    const maxY = ((yMax - dataMax) / yRange) * chartAreaHeight;

    // 라벨 오프셋 (라벨이 데이터 포인트에서 약간 떨어지도록)
    const labelOffsetX = -30;
    const labelOffsetYMin = 10;
    const labelOffsetYMax = -25;

    return {
      min: {
        left: Math.max(8, minX + labelOffsetX),
        top: Math.min(chartAreaHeight - 20, minY + labelOffsetYMin),
      },
      max: {
        left: Math.min(chartSize.width - 70, maxX + labelOffsetX),
        top: Math.max(8, maxY + labelOffsetYMax),
      },
    };
  }, [chartSize, chartAreaHeight, data, minIndex, maxIndex, dataMin, dataMax, yMin, yMax, yAxisLabelWidth, gridWidth]);

  return (
    <div ref={containerRef} className="relative w-full h-full" style={height ? { height } : undefined}>
      {/* 격자선 - 피그마: 수직선/수평선 모두 컨테이너 끝까지 연장 */}
      {chartSize.width > 0 && gridFullHeight > 0 && (
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: chartSize.width,
            height: gridFullHeight,
          }}
        >
          <ChartGrid
            width={chartSize.width}
            height={gridFullHeight}
            horizontalLines={yTicks.length}
            verticalLines={verticalLines}
            edgeSolid={false}
            paddingLeft={yAxisLabelWidth}  // 수직선은 Y축 라벨 영역 이후부터
            paddingBottom={X_AXIS_LABEL_HEIGHT} // 수평선은 X축 라벨 영역 위까지
            hideRightEdgeLine={true} // 맨 오른쪽 수직선 숨김 (컨테이너 border와 겹침 방지)
            hideTopEdgeLine={true} // 맨 위쪽 수평선 숨김 (섹션 border 실선과 겹침 방지)
          />
        </div>
      )}

      {/* 차트 영역 - 전체 컨테이너 너비 (라인이 끝까지 뻗도록) */}
      {/* key를 사용하여 animationKey 변경 시 차트 재마운트 → 왼쪽→오른쪽 스윕 애니메이션 재생 */}
      {chartSize.width > 0 && chartAreaHeight > 0 && (
        <div
          key={animationKey}
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: chartSize.width,
            height: chartAreaHeight,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={CHART_MARGIN}
            accessibilityLayer={false}
          >
            {/* 그라데이션 정의 - 이탈 영역용 (userSpaceOnUse로 절대 좌표 기준 적용) */}
            <defs>
              {/* 상단 이탈 영역 그라데이션 (objectBoundingBox: 각 영역의 바운딩 박스 기준 위→아래) */}
              <linearGradient id="violationAboveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2D28" stopOpacity={0.06} />
                <stop offset="25%" stopColor="#DC2D28" stopOpacity={0} />
              </linearGradient>
              {/* 하단 이탈 영역 그라데이션 (objectBoundingBox: 각 영역의 바운딩 박스 기준 위→아래) */}
              <linearGradient id="violationBelowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2D28" stopOpacity={0.06} />
                <stop offset="80%" stopColor="#DC2D28" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* X축 - 확장된 도메인 (라인이 컨테이너 끝까지 뻗도록) */}
            <XAxis
              dataKey="hour"
              type="number"
              domain={[extendedDomain.min, extendedDomain.max]}
              ticks={xAxisTicks}
              axisLine={false}
              tickLine={false}
              tick={false}
              height={0}
            />

            {/* Y축 - 숨김 (데이터 스케일링에만 사용) */}
            <YAxis
              domain={[yMin, yMax]}
              ticks={yTicks}
              axisLine={false}
              tickLine={false}
              tick={false}
              width={0}
            />

            {/* 툴팁 - isAnimationActive={false}로 왼쪽에서 날아오는 애니메이션 비활성화 */}
            <Tooltip
              content={<CustomTooltip unit={unit} />}
              cursor={{ stroke: COLORS.grid, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />

            {/* 1. 정상 범위 영역 (연한 파란색 배경 밴드) - 30th~70th 백분위수 */}
            <ReferenceArea
              y1={dynamicMinRange}
              y2={dynamicMaxRange}
              fill={COLORS.rangeArea}
              fillOpacity={1}
            />

            {/* 2. 이탈 영역 채움 (dynamicMaxRange 초과) - 그라데이션 (위→아래 페이드) */}
            <Area
              type="linear"
              dataKey="violationAboveValue"
              stroke="none"
              fill="url(#violationAboveGradient)"
              fillOpacity={1}
              baseLine={dynamicMaxRange}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* 3. 이탈 영역 채움 (dynamicMinRange 미만) - 그라데이션 (아래→위 페이드) */}
            <Area
              type="linear"
              dataKey="violationBelowValue"
              stroke="none"
              fill="url(#violationBelowGradient)"
              fillOpacity={1}
              baseLine={dynamicMinRange}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* 4. 데이터 라인 - 3개로 분리하여 렌더링 (그라데이션 대신) */}

            {/* 4-1. 상단 이탈 라인 (빨강) */}
            <Line
              type="linear"
              dataKey="violationAboveValue"
              stroke={COLORS.lineViolation}
              strokeWidth={2}
              dot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              activeDot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* 4-2. 하단 이탈 라인 (빨강) */}
            <Line
              type="linear"
              dataKey="violationBelowValue"
              stroke={COLORS.lineViolation}
              strokeWidth={2}
              dot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              activeDot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* 4-3. 정상 라인 (파랑) */}
            <Line
              type="linear"
              dataKey="normalValue"
              stroke={COLORS.lineNormal}
              strokeWidth={2}
              dot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              activeDot={<CustomDot minRange={dynamicMinRange} maxRange={dynamicMaxRange} />}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Y축 라벨 - 격자선 기준 개별 absolute 배치 */}
      {[...yTicks].reverse().map((tick, index) => {
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
      {xAxisTicks.map((hour) => {
        // 수직 격자선과 동일한 X 좌표 계산 + offset (8px 오른쪽)
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

      {/* 최저값 라벨 */}
      {showMinMaxLabels && labelPositions.min && (
        <div
          className="absolute bg-white border border-gray-300 rounded px-[0.375rem] py-1 flex items-center justify-center z-10"
          style={{
            left: `${labelPositions.min.left}px`,
            top: `${labelPositions.min.top}px`,
            height: '1.25rem',
          }}
        >
          <span className="font-mono text-[0.8125rem] text-gray-1000 whitespace-nowrap">{dataMin}{unit}</span>
        </div>
      )}

      {/* 최고값 라벨 */}
      {showMinMaxLabels && labelPositions.max && (
        <div
          className="absolute bg-white border border-gray-300 rounded px-[0.375rem] py-1 flex items-center justify-center z-10"
          style={{
            left: `${labelPositions.max.left}px`,
            top: `${labelPositions.max.top}px`,
            height: '1.25rem',
          }}
        >
          <span className="font-mono text-[0.8125rem] text-gray-1000 whitespace-nowrap">{dataMax}{unit}</span>
        </div>
      )}
    </div>
  );
};

export default EnvironmentLineChart;
