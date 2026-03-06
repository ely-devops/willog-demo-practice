import { useMemo } from 'react';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { useAppStore, BizCase } from '@/stores/useAppStore';

/** Chart shape types matching each KPI */
export type ChartShape =
  | 'temperature'    // 온도 준수율: trapezoid (low→center→center→center→low)
  | 'quality'        // 품질유지율: peak then drop (low→high→high→middle→low)
  | 'ontime'         // 정시 도착률: upward curve (low→middle→middle→high→high)
  | 'event';         // 이벤트 발생률: upward trend (low→middle→middle→middle→high)

export interface KPIMiniChartProps {
  /** Color scheme: 'positive' for blue, 'negative' for red */
  variant: 'positive' | 'negative';
  /** Chart shape type matching KPI */
  shape?: ChartShape;
  /** Additional CSS classes */
  className?: string;
}

// Design tokens (recharts doesn't support CSS variables, using HEX values)
const COLORS = {
  positive: {
    line: '#1858B4',        // blue-600
    areaStart: 'rgba(24, 88, 180, 0.10)',
    areaEnd: 'rgba(24, 88, 180, 0.00)',
  },
  negative: {
    line: '#DC2D28',        // red-600
    areaStart: 'rgba(220, 45, 40, 0.10)',
    areaEnd: 'rgba(220, 45, 40, 0.00)',
  },
  grid: {
    solid: '#DCDCE0',       // gray-300 (edge lines)
    dashed: '#EBEBEC',      // gray-200 (middle lines)
  },
  dotFill: '#FFFFFF',       // white
} as const;

// Chart dimensions (Figma: 330x123px within 378px card)
// Using 100% width to fill container, fixed height per Figma spec
const HEIGHT = 123;

// Data points configuration per chart shape
// 5 points: start (no dot), 3 middle (with dots), end (no dot)
// Y values: 0 = bottom, 50 = center, 100 = top
// Grid has 3 rows, so: bottom=0, lower-third=33, center=50, upper-third=67, top=100

type ChartDataPoint = { x: number; y: number; hasDot: boolean };
type ChartDataByShape = Record<ChartShape, Array<ChartDataPoint>>;

// 반도체 도메인 (기본) 차트 데이터
const SEMICON_CHART_DATA: ChartDataByShape = {
  // 온도 준수율: trapezoid shape - starts/ends low, middle at center
  temperature: [
    { x: 0, y: 25, hasDot: false },   // Start - lower position
    { x: 1, y: 50, hasDot: true },    // Middle point - center height
    { x: 2, y: 50, hasDot: true },    // Middle point - center height
    { x: 3, y: 50, hasDot: true },    // Middle point - center height
    { x: 4, y: 25, hasDot: false },   // End - lower position
  ],
  // 품질유지율: peak then drop - starts low, peaks high, drops at end
  quality: [
    { x: 0, y: 33 , hasDot: false },   // Start - lower position
    { x: 1, y: 66, hasDot: true },    // Goes up high
    { x: 2, y: 55, hasDot: true },    // Stays high
    { x: 3, y: 66, hasDot: true },    // Drops to middle
    { x: 4, y: 55, hasDot: false },   // End - lower position
  ],
  // 정시 도착률: upward curve - gradual rise from bottom-left to top-right
  ontime: [
    { x: 0, y: 70, hasDot: false },   // Start - lower position
    { x: 1, y: 85, hasDot: true },    // Gradual rise
    { x: 2, y: 83, hasDot: true },    // Continue rising
    { x: 3, y: 80, hasDot: true },    // Higher
    { x: 4, y: 85, hasDot: false },   // End - high position
  ],
  // 이벤트 발생률: upward trend - starts low, rises steadily
  event: [
    { x: 0, y: 33, hasDot: false },   // Start - lower position
    { x: 1, y: 50, hasDot: true },    // Rising
    { x: 2, y: 50, hasDot: true },    // Center
    { x: 3, y: 50, hasDot: true },    // Continue rising
    { x: 4, y: 60, hasDot: false },   // End - high position
  ],
};

// 바이오 콜드체인 도메인 차트 데이터
const BIO_CHART_DATA: ChartDataByShape = {
  // 온도 준수율 (99.6%): 높은 수준 유지
  temperature: [
    { x: 0, y: 60, hasDot: false },
    { x: 1, y: 80, hasDot: true },
    { x: 2, y: 78, hasDot: true },
    { x: 3, y: 75, hasDot: true },
    { x: 4, y: 85, hasDot: false },
  ],
  // 품질 유지율 (99.8%): 매우 높은 수준 유지
  quality: [
    { x: 0, y: 70, hasDot: false },
    { x: 1, y: 85, hasDot: true },
    { x: 2, y: 82, hasDot: true },
    { x: 3, y: 85, hasDot: true },
    { x: 4, y: 90, hasDot: false },
  ],
  // 정시 도착률 (100%): 최상위 수준
  ontime: [
    { x: 0, y: 65, hasDot: false },
    { x: 1, y: 85, hasDot: true },
    { x: 2, y: 82, hasDot: true },
    { x: 3, y: 78, hasDot: true },
    { x: 4, y: 88, hasDot: false },
  ],
  // 이벤트 발생률 (0.4%): 낮은 수준에서 더 낮아지는 추세
  event: [
    { x: 0, y: 70, hasDot: false },
    { x: 1, y: 65, hasDot: true },
    { x: 2, y: 57, hasDot: true },
    { x: 3, y: 52, hasDot: true },
    { x: 4, y: 45, hasDot: false },
  ],
};

// 도메인별 차트 데이터 매핑
const CHART_DATA_BY_DOMAIN: Partial<Record<BizCase, ChartDataByShape>> = {
  semicon: SEMICON_CHART_DATA,
  bio: BIO_CHART_DATA,
};

// 차트 데이터 가져오기 함수
const getChartDataByShape = (domain: BizCase, shape: ChartShape): ChartDataPoint[] => {
  const domainData = CHART_DATA_BY_DOMAIN[domain];
  if (domainData) {
    return domainData[shape];
  }
  // 기본값: 반도체 도메인 데이터 사용
  return SEMICON_CHART_DATA[shape];
};

// Custom dot component - only render for middle points
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
  stroke?: string;
}

const CustomDot = ({ cx, cy, payload, stroke }: CustomDotProps) => {
  if (!cx || !cy || !payload || !payload.hasDot) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={COLORS.dotFill}
      stroke={stroke}
      style={{
        strokeWidth: '0.0625rem',
        pointerEvents: 'none',
        outline: 'none',
      }}
    />
  );
};

/**
 * KPIMiniChart - A mini chart for KPI cards using Recharts
 *
 * Features:
 * - Recharts implementation (consistent with EnvironmentLineChart)
 * - 4x3 grid (4 columns, 3 rows)
 * - 5 data points: start/end without dots, 3 middle with dots at center height
 * - Left-to-right animation on render
 * - Two color variants: positive (blue) and negative (red)
 * - Edge lines solid, middle lines dashed (matching Figma)
 */
export const KPIMiniChart = ({
  variant,
  shape = 'temperature',
  className,
}: KPIMiniChartProps) => {
  const { currentCase } = useAppStore();
  const colors = COLORS[variant];
  const gradientId = `kpi-area-gradient-${variant}-${shape}`;
  const chartData = getChartDataByShape(currentCase, shape);

  // Grid configuration for custom rendering
  // Only middle dashed lines (no edge border lines per Figma design)
  const gridConfig = useMemo(() => ({
    // Horizontal lines: middle dashed only (no edge lines)
    horizontal: [
      { y: 33.33 },
      { y: 66.67 },
    ],
    // Vertical lines: middle dashed only (no edge lines)
    vertical: [
      { x: 1 },
      { x: 2 },
      { x: 3 },
    ],
  }), []);

  return (
    <div
      className={clsx('overflow-visible w-full', className)}
      style={{ height: HEIGHT }}
      role="img"
      aria-label="KPI mini chart showing trend"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.areaStart} />
              <stop offset="100%" stopColor={colors.areaEnd} />
            </linearGradient>
          </defs>

          {/* Hidden X axis */}
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            hide={true}
          />

          {/* Hidden Y axis */}
          <YAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 33.33, 66.67, 100]}
            hide={true}
          />

          {/* Custom horizontal grid lines - dashed only */}
          {gridConfig.horizontal.map((line, index) => (
            <ReferenceLine
              key={`h-${index}`}
              y={line.y}
              stroke={COLORS.grid.dashed}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ))}

          {/* Custom vertical grid lines - dashed only */}
          {gridConfig.vertical.map((line, index) => (
            <ReferenceLine
              key={`v-${index}`}
              x={line.x}
              stroke={COLORS.grid.dashed}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ))}

          {/* Area fill with gradient */}
          <Area
            type="linear"
            dataKey="y"
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            baseLine={0}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* Line with custom dots */}
          <Line
            type="linear"
            dataKey="y"
            stroke={colors.line}
            strokeWidth={1}
            dot={<CustomDot stroke={colors.line} />}
            activeDot={<CustomDot stroke={colors.line} />}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KPIMiniChart;
