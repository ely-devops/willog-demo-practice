import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { BizCase } from '@/stores/useAppStore';
import { celsiusToFahrenheit } from './temperature';

dayjs.extend(customParseFormat);

// 환경 데이터 타입 정의
export type EnvironmentTab = 'temperature' | 'humidity' | 'light' | 'shock';

export interface EnvironmentRawData {
  date: Date;
  temperature: number;
  humidity: number;
  shock: number;
  light: number | null;
}

export interface EnvironmentDataPoint {
  time: string;
  value: number;
  isViolation?: boolean;
}

export interface EnvironmentStats {
  avg: number;
  max: number;
  min: number;
  violations: number;
}

// 충격 막대 그래프용 데이터 구조
export interface ShockBarDataPoint {
  groupIndex: number;  // 그룹 인덱스 (0-19)
  time: string;        // 시간 레이블 (예: "00:00")
  values: number[];    // 4개의 충격 값 (각 막대)
}

export interface EnvironmentConfig {
  label: string;
  unit: string;
  minRange: number;
  maxRange: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
}

// ============================================
// 참고: 이전 피그마 하드코딩 데이터는 제거됨
// 모든 환경 데이터(온도, 습도, 충격, 조도)는 실제 JSON 파일에서 로드
// - semicon: /data/scenario1.json (반도체용)
// - bio/fnb/general: /data/scenario5.json (바이오용)
// ============================================

// 비즈니스 케이스별 탭 설정 (언어에 따라 온도 단위 변환)
export const getEnvironmentConfigs = (bizCase: BizCase, language: string = 'ko'): Record<EnvironmentTab, EnvironmentConfig> => {
  const isEnglish = language === 'en';

  // 섭씨 기준 온도 범위 (바이오: 2-8°C, 반도체: 20-25°C)
  const tempMinRange = bizCase === 'bio' ? 2 : 20;
  const tempMaxRange = bizCase === 'bio' ? 8 : 25;
  const tempYMin = bizCase === 'bio' ? 0 : 10;
  const tempYMax = bizCase === 'bio' ? 12 : 50;
  const tempYTicks = bizCase === 'bio' ? [0, 3, 6, 9, 12] : [10, 20, 30, 40, 50];

  // 습도 Y축 범위 (시나리오별로 다름)
  // - semicon(시나리오1): 30% ~ 45%
  // - bio/fnb/general(시나리오5): 35% ~ 60%
  const humidityYMin = bizCase === 'semicon' ? 30 : 35;
  const humidityYMax = bizCase === 'semicon' ? 45 : 60;
  const humidityYTicks = bizCase === 'semicon' ? [30, 34, 38, 42, 45] : [35, 40, 45, 50, 55, 60];

  return {
    temperature: {
      label: isEnglish ? 'Temperature' : '온도',
      unit: isEnglish ? '°F' : '°C',
      minRange: isEnglish ? Math.round(celsiusToFahrenheit(tempMinRange)) : tempMinRange,
      maxRange: isEnglish ? Math.round(celsiusToFahrenheit(tempMaxRange)) : tempMaxRange,
      yMin: isEnglish ? Math.round(celsiusToFahrenheit(tempYMin)) : tempYMin,
      yMax: isEnglish ? Math.round(celsiusToFahrenheit(tempYMax)) : tempYMax,
      yTicks: isEnglish ? tempYTicks.map(t => Math.round(celsiusToFahrenheit(t))) : tempYTicks,
    },
    humidity: {
      label: isEnglish ? 'Humidity' : '습도',
      unit: '%',
      minRange: 40,
      maxRange: 60,
      yMin: humidityYMin,
      yMax: humidityYMax,
      yTicks: humidityYTicks,
    },
    light: {
      label: isEnglish ? 'Light' : '조도',
      unit: 'lx',
      minRange: 0,
      maxRange: 100,
      yMin: 156.6,
      yMax: 157.4,
      yTicks: [156.6, 156.8, 157.0, 157.2, 157.4],
    },
    shock: {
      label: isEnglish ? 'Shock' : '충격',
      unit: 'G',
      minRange: 0,
      maxRange: 2,
      yMin: 0,
      yMax: 8,
      yTicks: [0, 2, 4, 6, 8],
    },
  };
};

// Scenario 1 raw data 타입 (반도체)
interface Scenario1Raw {
  Date: string;
  Temp: string;
  Humidity: string;
  Shock: string;
  Light: string;
}

// Scenario 5 raw data 타입 (바이오)
interface Scenario5Raw {
  timestamp: string;
  temperature: string;
  humidity: string;
  shock: string;
}

// 캐시된 데이터
let cachedScenario1: EnvironmentRawData[] | null = null;
let cachedScenario5: EnvironmentRawData[] | null = null;

// Scenario 1 날짜 파싱 (Aug/28/2025 16:15 형식)
const parseScenario1Date = (dateStr: string): Date => {
  return dayjs(dateStr, 'MMM/DD/YYYY HH:mm').toDate();
};

// Scenario 5 날짜 파싱 (2025-03-31T21:00:00Z 형식)
const parseScenario5Date = (dateStr: string): Date => {
  return dayjs(dateStr).toDate();
};

// Mock 데이터 로드
export const loadEnvironmentData = async (bizCase: BizCase): Promise<EnvironmentRawData[]> => {
  if (bizCase === 'semicon') {
    if (cachedScenario1) return cachedScenario1;

    const response = await fetch('/data/scenario1.json');
    const rawData: Scenario1Raw[] = await response.json();

    cachedScenario1 = rawData.map((item) => ({
      date: parseScenario1Date(item.Date),
      temperature: parseFloat(item.Temp) || 0,
      humidity: parseFloat(item.Humidity) || 0,
      shock: parseFloat(item.Shock) || 0,
      light: item.Light ? parseFloat(item.Light) : null,
    }));

    return cachedScenario1;
  }

  // bio, fnb, general → Scenario 5
  if (cachedScenario5) return cachedScenario5;

  const response = await fetch('/data/scenario5.json');
  const rawData: Scenario5Raw[] = await response.json();

  cachedScenario5 = rawData.map((item) => ({
    date: parseScenario5Date(item.timestamp),
    temperature: parseFloat(item.temperature) || 0,
    humidity: parseFloat(item.humidity) || 0,
    shock: parseFloat(item.shock) || 0,
    light: null, // Scenario 5에는 조도 데이터 없음
  }));

  return cachedScenario5;
};

// 날짜 범위로 데이터 필터링
export const filterByDateRange = (
  data: EnvironmentRawData[],
  startDate: Date,
  endDate: Date
): EnvironmentRawData[] => {
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).endOf('day');

  return data.filter((item) => {
    const itemDate = dayjs(item.date);
    return itemDate.isAfter(start) && itemDate.isBefore(end);
  });
};

// 최근 24시간 데이터 필터링 (데이터 내 가장 최근 시점 기준)
export const filterLast24Hours = (
  data: EnvironmentRawData[]
): EnvironmentRawData[] => {
  if (data.length === 0) return [];

  // 데이터 내 가장 최근 시점 찾기
  const latestTimestamp = Math.max(...data.map((item) => item.date.getTime()));
  const latestDate = dayjs(latestTimestamp);
  const startDate = latestDate.subtract(24, 'hour');

  return data.filter((item) => {
    const itemDate = dayjs(item.date);
    return itemDate.isAfter(startDate) && itemDate.isBefore(latestDate.add(1, 'minute'));
  });
};

// 특정 날짜의 24시간 데이터로 집계 (5시간 간격)
export const aggregateTo24Hours = (
  data: EnvironmentRawData[],
  tab: EnvironmentTab
): EnvironmentDataPoint[] => {
  if (data.length === 0) return [];

  // 시간별로 그룹화 (5시간 간격: 0, 5, 10, 15, 20, 24)
  const hourGroups: Map<number, number[]> = new Map();
  const intervals = [0, 5, 10, 15, 20, 24];

  intervals.forEach((hour) => hourGroups.set(hour, []));

  data.forEach((item) => {
    const hour = dayjs(item.date).hour();
    const value = tab === 'temperature' ? item.temperature :
                  tab === 'humidity' ? item.humidity :
                  tab === 'shock' ? item.shock :
                  item.light ?? 0;

    // 가장 가까운 시간대에 할당
    let closestInterval = 0;
    for (let i = 0; i < intervals.length - 1; i++) {
      if (hour >= intervals[i] && hour < intervals[i + 1]) {
        closestInterval = intervals[i];
        break;
      }
    }
    if (hour >= 20) closestInterval = 20;

    const values = hourGroups.get(closestInterval);
    if (values) values.push(value);
  });

  // 각 시간대의 평균값 계산
  return intervals.map((hour) => {
    const values = hourGroups.get(hour) || [];
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return {
      time: hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`,
      value: Math.round(avg * 10) / 10,
    };
  });
};

// 특정 탭에 유효한 데이터가 있는지 확인
export const hasValidDataForTab = (
  data: EnvironmentRawData[],
  tab: EnvironmentTab
): boolean => {
  if (data.length === 0) return false;

  return data.some((item) => {
    switch (tab) {
      case 'temperature': return item.temperature !== null && item.temperature !== undefined;
      case 'humidity': return item.humidity !== null && item.humidity !== undefined;
      case 'shock': return item.shock !== null && item.shock !== undefined;
      case 'light': return item.light !== null && item.light !== undefined;
    }
  });
};

// 세분화된 차트 데이터 생성 (12개 포인트)
// 모든 환경 데이터는 실제 JSON 파일에서 로드됨
export const generateChartData = (
  data: EnvironmentRawData[],
  tab: EnvironmentTab,
  config: EnvironmentConfig
): EnvironmentDataPoint[] => {
  if (data.length === 0) return [];

  // 해당 탭에 유효한 데이터가 없으면 빈 배열 반환
  if (!hasValidDataForTab(data, tab)) return [];

  // 2시간 간격으로 12개 포인트 (00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22, 24)
  const intervals = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
  const hourGroups: Map<number, number[]> = new Map();

  intervals.forEach((hour) => hourGroups.set(hour, []));

  data.forEach((item) => {
    const hour = dayjs(item.date).hour();
    let value: number | null = null;

    switch (tab) {
      case 'temperature': value = item.temperature; break;
      case 'humidity': value = item.humidity; break;
      case 'shock': value = item.shock; break;
      case 'light': value = item.light; break;
    }

    // null 값은 건너뛰기
    if (value === null || value === undefined) return;

    // 가장 가까운 2시간 간격에 할당
    const closestInterval = Math.round(hour / 2) * 2;
    const finalInterval = closestInterval > 24 ? 24 : closestInterval;

    const values = hourGroups.get(finalInterval);
    if (values) values.push(value);
  });

  return intervals.map((hour) => {
    const values = hourGroups.get(hour) || [];
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const isViolation = avg < config.minRange || avg > config.maxRange;

    return {
      time: hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`,
      value: Math.round(avg * 10) / 10,
      isViolation,
    };
  });
};

// 통계 계산
// 모든 환경 데이터는 실제 JSON 파일에서 로드됨
export const calculateStats = (
  data: EnvironmentRawData[],
  tab: EnvironmentTab,
  config: EnvironmentConfig
): EnvironmentStats => {
  if (data.length === 0) {
    return { avg: 0, max: 0, min: 0, violations: 0 };
  }

  // null 값 제외하고 유효한 값만 추출
  const values = data
    .map((item) => {
      switch (tab) {
        case 'temperature': return item.temperature;
        case 'humidity': return item.humidity;
        case 'shock': return item.shock;
        case 'light': return item.light;
      }
    })
    .filter((v): v is number => v !== null && v !== undefined);

  // 유효한 값이 없으면 빈 통계 반환
  if (values.length === 0) {
    return { avg: 0, max: 0, min: 0, violations: 0 };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // 이탈 건수 계산
  const violations = values.filter(
    (v) => v < config.minRange || v > config.maxRange
  ).length;

  return {
    avg: Math.round(avg * 10) / 10,
    max: Math.round(max * 10) / 10,
    min: Math.round(min * 10) / 10,
    violations,
  };
};

// 데이터 존재 날짜 범위 가져오기
export const getDataDateRange = (data: EnvironmentRawData[]): { start: Date; end: Date } | null => {
  if (data.length === 0) return null;

  const dates = data.map((item) => item.date.getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return { start: minDate, end: maxDate };
};

// 비즈니스 케이스별 기본 날짜 범위
export const getDefaultDateRange = (bizCase: BizCase): { start: Date; end: Date } => {
  if (bizCase === 'semicon') {
    // Scenario 1: Aug 28, 2025부터
    return {
      start: new Date('2025-08-28'),
      end: new Date('2025-09-30'),
    };
  }

  // Scenario 5: Mar 31, 2025부터
  return {
    start: new Date('2025-03-31'),
    end: new Date('2025-04-30'),
  };
};

// 충격 막대 그래프용 데이터 생성 (20개 그룹, 각 그룹 4개 막대)
// 피그마 디자인: 24시간 동안 20개 그룹으로 나누어 표시
export const generateShockBarData = (
  data: EnvironmentRawData[]
): ShockBarDataPoint[] => {
  if (data.length === 0) return [];

  // 20개 그룹 생성 (시간 간격: 약 1.2시간)
  const numGroups = 20;
  const hoursPerGroup = 24 / numGroups; // 1.2시간

  const groups: ShockBarDataPoint[] = [];

  for (let i = 0; i < numGroups; i++) {
    const startHour = i * hoursPerGroup;
    const endHour = (i + 1) * hoursPerGroup;

    // 해당 시간대의 데이터 필터링
    const groupData = data.filter((item) => {
      const hour = dayjs(item.date).hour() + dayjs(item.date).minute() / 60;
      return hour >= startHour && hour < endHour;
    });

    // 4개의 서브그룹으로 나누기
    const subGroupSize = Math.ceil(groupData.length / 4) || 1;
    const values: number[] = [];

    for (let j = 0; j < 4; j++) {
      const subGroupStart = j * subGroupSize;
      const subGroupEnd = Math.min((j + 1) * subGroupSize, groupData.length);
      const subGroupData = groupData.slice(subGroupStart, subGroupEnd);

      if (subGroupData.length > 0) {
        // 서브그룹의 평균 충격값
        const avg = subGroupData.reduce((sum, item) => sum + item.shock, 0) / subGroupData.length;
        values.push(Math.round(avg * 10) / 10);
      } else {
        // 데이터가 없으면 랜덤 시뮬레이션 값 생성 (0.5~3.5G 범위)
        values.push(Math.round((Math.random() * 3 + 0.5) * 10) / 10);
      }
    }

    // 시간 레이블 생성
    const hour = Math.floor(startHour);
    const minute = Math.round((startHour - hour) * 60);
    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    groups.push({
      groupIndex: i,
      time: timeLabel,
      values,
    });
  }

  return groups;
};

// 설명 텍스트 생성
export const generateDescription = (
  tab: EnvironmentTab,
  stats: EnvironmentStats,
  config: EnvironmentConfig
): string => {
  const { avg, violations } = stats;
  const { label, unit, minRange, maxRange } = config;

  const isAvgViolation = avg < minRange || avg > maxRange;

  if (tab === 'temperature') {
    if (isAvgViolation) {
      return `지난 24시간 동안 급격한 온도 변화 관측 및 평균 온도가 ${avg}${unit}로 기준 범위를 초과하였습니다.`;
    }
    return `지난 24시간 동안 평균 온도는 ${avg}${unit}로 안정적이나, 온도 이탈이 총 ${violations.toLocaleString()}회 감지되었습니다.`;
  }

  if (isAvgViolation) {
    return `지난 24시간 동안 평균 ${label}가 ${avg}${unit}로 기준 범위(${minRange}-${maxRange}${unit})를 초과하였습니다.`;
  }

  if (violations > 0) {
    return `지난 24시간 동안 평균 ${label}는 ${avg}${unit}로 안정적이나, ${label} 이탈이 총 ${violations.toLocaleString()}회 감지되었습니다.`;
  }

  return `지난 24시간 동안 평균 ${label}는 ${avg}${unit}로 기준 범위 내에서 안정적으로 유지되었습니다.`;
};
