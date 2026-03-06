import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import {
  type EnvironmentTab,
  type EnvironmentRawData,
  loadEnvironmentData,
  filterLast24Hours,
  generateChartData,
  generateShockBarData,
  calculateStats,
  getEnvironmentConfigs,
  hasValidDataForTab,
} from '@/utils/environmentMockData';
import { celsiusToFahrenheit } from '@/utils/temperature';
import { EnvironmentTrendHeader } from './EnvironmentTrendHeader';
import { EnvironmentTrendStats } from './EnvironmentTrendStats';
import { EnvironmentLineChart } from '@/components/common/charts/EnvironmentLineChart';
import { ShockBarChart } from '@/components/common/charts/ShockBarChart';

interface EnvironmentTrendSectionProps {
  /** 커스텀 제목 (기본값: i18n dashboard.environmentTrend.title) */
  title?: string;
  /** 커스텀 부제목 (기본값: i18n dashboard.environmentTrend.subtitle) */
  subtitle?: string;
  /** 커스텀 기간 라벨 (기본값: i18n dashboard.environmentTrend.viewMode.lastDay) */
  periodLabel?: string;
  /** periodLabel 대신 표시할 커스텀 버튼 */
  actionButton?: React.ReactNode;
  /** 커스텀 설명 텍스트 생성 함수 - stats, config, tab을 받아 설명 문자열 반환 */
  customDescriptionFn?: (
    stats: { avg: number; max: number; min: number; violations: number },
    config: { unit: string; minRange: number; maxRange: number },
    tab: EnvironmentTab
  ) => string;
  /** 설명 텍스트 너비 (기본값: "19.125rem") */
  descriptionWidth?: string;
  /** 통계 영역 레이아웃 (기본값: "center") */
  statsLayout?: 'center' | 'end';
  /** 통계 숫자 font-weight (기본값: display font) */
  statsFontWeight?: 'normal' | 'display';
  /** X축 라벨 시간 배열 (기본값: undefined - 탭별 자동 설정)
   * - 온도: [0, 5, 10, 15, 20, 24] (5시간 간격)
   * - 습도: [0, 3, 6, 9, 12, 15, 18, 21, 24] (3시간 간격)
   * - 충격: [0, 5, 10, 15, 20, 24] (5시간 간격)
   * - 조도: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] (2시간 간격)
   * - 커스텀 값 전달 시 탭별 자동 설정 무시
   */
  xAxisTicks?: number[];
  /** Target Range + Excursion Count 카드 표시 여부 (여정 상세 전용, 기본값: false) */
  showTargetRange?: boolean;
  /** 조도(Light) 데이터 존재 여부를 명시적으로 지정 (기본값: currentCase === 'semicon'으로 자동 결정) */
  hasLightData?: boolean;
}

export const EnvironmentTrendSection = ({
  title,
  subtitle,
  periodLabel,
  actionButton,
  customDescriptionFn,
  descriptionWidth,
  statsLayout,
  statsFontWeight,
  xAxisTicks,
  showTargetRange,
  hasLightData: hasLightDataProp,
}: EnvironmentTrendSectionProps = {}) => {
  const { t, i18n } = useTranslation();
  const { currentCase } = useAppStore();
  const [activeTab, setActiveTab] = useState<EnvironmentTab>('temperature');
  const [rawData, setRawData] = useState<EnvironmentRawData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 비즈니스 케이스별 설정 (언어에 따라 온도 단위 변환)
  const configs = useMemo(() => getEnvironmentConfigs(currentCase, i18n.language), [currentCase, i18n.language]);
  const config = configs[activeTab];

  // semicon에서만 조도 데이터 사용 가능 (Scenario 5는 조도 데이터 없음)
  // prop으로 명시적 지정 시 그 값 사용, 아니면 currentCase 기반 자동 결정
  const hasLightData = hasLightDataProp !== undefined ? hasLightDataProp : currentCase === 'semicon';

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadEnvironmentData(currentCase);
        setRawData(data);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentCase]);

  // 최근 24시간 데이터로 필터링
  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];
    return filterLast24Hours(rawData);
  }, [rawData]);

  // 차트 데이터 생성 (JSON 파일에서 로드된 데이터 사용)
  // 영어일 때 온도 탭은 화씨로 변환
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const data = generateChartData(filteredData, activeTab, config);
    // 영어 + 온도 탭: 화씨로 변환
    if (i18n.language === 'en' && activeTab === 'temperature') {
      return data.map(d => ({
        ...d,
        value: Math.round(celsiusToFahrenheit(d.value) * 10) / 10,
      }));
    }
    return data;
  }, [filteredData, activeTab, config, i18n.language]);

  // 충격 막대 그래프 데이터 생성
  const shockBarData = useMemo(() => {
    if (filteredData.length === 0 || activeTab !== 'shock') return [];
    return generateShockBarData(filteredData);
  }, [filteredData, activeTab]);

  // 통계 계산 (JSON 파일에서 로드된 데이터 사용)
  // 영어일 때 온도 탭은 화씨로 변환
  const stats = useMemo(() => {
    const rawStats = calculateStats(filteredData, activeTab, config);
    // 영어 + 온도 탭: 화씨로 변환
    if (i18n.language === 'en' && activeTab === 'temperature') {
      return {
        avg: Math.round(celsiusToFahrenheit(rawStats.avg) * 10) / 10,
        max: Math.round(celsiusToFahrenheit(rawStats.max) * 10) / 10,
        min: Math.round(celsiusToFahrenheit(rawStats.min) * 10) / 10,
        violations: rawStats.violations,
      };
    }
    return rawStats;
  }, [filteredData, activeTab, config, i18n.language]);

  // 설명 텍스트 생성 (커스텀 함수 또는 i18n)
  const description = useMemo(() => {
    // 커스텀 설명 함수가 제공된 경우 사용
    if (customDescriptionFn) {
      return customDescriptionFn(stats, config, activeTab);
    }

    // 바이오 도메인 + 온도 탭: 피그마 지정 텍스트 사용 (stats 값으로 동적 생성)
    if (currentCase === 'bio' && activeTab === 'temperature') {
      return t('dashboard.bio.environmentTrend.description', {
        value: stats.avg,
        unit: config.unit,
        violations: stats.violations.toLocaleString(),
      });
    }

    const { avg, violations } = stats;
    const { unit, minRange, maxRange } = config;
    const isAvgViolation = avg < minRange || avg > maxRange;

    // 온도 탭 vs 기타 탭 분기
    const prefix = activeTab === 'temperature' ? 'temperature' : 'other';

    // 상태에 따른 키 결정: Violation (이탈 있음) / Stable (안정)
    const suffix = (isAvgViolation || violations > 0) ? 'Violation' : 'Stable';

    const translationKey = `dashboard.environmentTrend.description.${prefix}${suffix}` as const;
    const tabLabelKey = `dashboard.environmentTrend.tabs.${activeTab}` as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t as any)(translationKey, {
      value: avg,
      unit,
      violations: violations.toLocaleString(),
      label: t(tabLabelKey as 'dashboard.environmentTrend.tabs.temperature'),
      minRange,
      maxRange,
    });
  }, [activeTab, stats, config, t, customDescriptionFn, currentCase]);

  // 탭 변경 시 조도 탭 처리 (바이오 케이스에서 조도 선택 시 온도로 변경)
  const handleTabChange = (tab: EnvironmentTab) => {
    if (tab === 'light' && !hasLightData) {
      setActiveTab('temperature');
      return;
    }
    setActiveTab(tab);
  };

  // 비즈니스 케이스 변경 시 탭 리셋
  useEffect(() => {
    if (activeTab === 'light' && !hasLightData) {
      setActiveTab('temperature');
    }
  }, [currentCase, hasLightData, activeTab]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center h-[32.8125rem]">
          <div className="text-gray-500">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center h-[32.8125rem]">
          <div className="text-red-500">{t('common.error')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden h-[32.8125rem] flex flex-col">
      {/* 헤더: 제목 + 탭 + 기간 표시 */}
      <EnvironmentTrendHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasLightData={hasLightData}
        title={title ?? t('dashboard.environmentTrend.title')}
        subtitle={subtitle ?? t('dashboard.environmentTrend.subtitle')}
        periodLabel={periodLabel ?? t('dashboard.environmentTrend.viewMode.lastDay')}
        actionButton={actionButton}
      />

      {/* 통계 섹션 */}
      <EnvironmentTrendStats
        description={description}
        stats={stats}
        config={config}
        tab={activeTab}
        descriptionWidth={descriptionWidth}
        statsLayout={statsLayout}
        statsFontWeight={statsFontWeight}
        showBorder={chartData.length > 0}
        hasData={hasValidDataForTab(filteredData, activeTab)}
        showTargetRange={showTargetRange}
      />

      {/* 차트 영역 - 피그마: 그리드가 전체 너비 차지, flex-1로 남은 공간 채움 */}
      <div className="relative flex-1">
        {activeTab === 'shock' ? (
          <ShockBarChart
            data={shockBarData}
            unit={config.unit}
            threshold={1.0}
            yMin={config.yMin}
            yMax={config.yMax}
            yTicks={config.yTicks}
            xAxisTicks={xAxisTicks ?? [0, 4, 8, 12, 16, 20, 24]}
          />
        ) : (
          <EnvironmentLineChart
            data={chartData}
            unit={config.unit}
            minRange={config.minRange}
            maxRange={config.maxRange}
            yMin={config.yMin}
            yMax={config.yMax}
            yTicks={config.yTicks}
            showMinMaxLabels={chartData.length > 0}
            animationKey={activeTab}
            xAxisTicks={xAxisTicks ?? (
              activeTab === 'temperature' ? [0, 4, 8, 12, 16, 20, 24] :
              activeTab === 'humidity' ? [0, 4, 8, 12, 16, 20, 24] :
              [0, 4, 8, 12, 16, 20, 24]
            )}
            autoScale={activeTab !== 'light' && activeTab !== 'humidity'}
          />
        )}
      </div>
    </div>
  );
};

export default EnvironmentTrendSection;
