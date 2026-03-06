import { useTranslation } from 'react-i18next';
import type { EnvironmentStats, EnvironmentConfig, EnvironmentTab } from '@/utils/environmentMockData';

interface EnvironmentTrendStatsProps {
  description: string;
  stats: EnvironmentStats;
  config: EnvironmentConfig;
  tab: EnvironmentTab;
  /** 설명 텍스트 너비 (기본값: "19.125rem") */
  descriptionWidth?: string;
  /** 통계 영역 레이아웃 (기본값: "center") */
  statsLayout?: 'center' | 'end';
  /** 통계 숫자 font-weight (기본값: display font) */
  statsFontWeight?: 'normal' | 'display';
  /** 하단 border 표시 여부 (기본값: true) */
  showBorder?: boolean;
  /** 데이터 존재 여부 - false면 통계값 대신 "N/A" 표시 */
  hasData?: boolean;
  /** Target Range + Excursion Count 카드 표시 여부 (여정 상세 전용, 기본값: false) */
  showTargetRange?: boolean;
}

export const EnvironmentTrendStats = ({
  description,
  stats,
  config,
  tab,
  statsLayout = 'center',
  statsFontWeight = 'display',
  showBorder = true,
  hasData = true,
  showTargetRange = false,
}: EnvironmentTrendStatsProps) => {
  const { t } = useTranslation();
  const { unit, minRange, maxRange } = config;
  const { avg, max, min, violations } = stats;

  // 데이터가 없을 때 표시할 값
  const displayValue = (value: number, showUnit = true) => {
    if (!hasData) return 'N/A';
    return showUnit ? `${value}${unit}` : value.toLocaleString();
  };

  // Target Range 표시값 (설정값이므로 항상 표시)
  // 충격(shock) 탭은 "≤2G" 형식, 나머지는 "min-max" 형식
  const targetRangeValue = tab === 'shock'
    ? `≤${maxRange}${unit}`
    : `${minRange}-${maxRange}${unit}`;

  // 카드 너비: 여정 상세(5카드) 150px, 대시보드(4카드) 120px
  const cardWidth = showTargetRange ? 'w-[9.375rem]' : 'w-[7.5rem]';
  // 라벨 line-height: 여정 상세 leading-none, 대시보드 leading-tight
  const labelClass = showTargetRange
    ? 'text-sm leading-none text-gray-600 font-display'
    : 'text-sm leading-tight text-gray-600 font-display';

  // 탭별 i18n 키 매핑 (타입 안전성을 위해 명시적 키 사용)
  const getStatsLabels = (currentTab: EnvironmentTab) => {
    switch (currentTab) {
      case 'temperature':
        return {
          avg: t('dashboard.environmentTrend.stats.avgTemperature'),
          max: t('dashboard.environmentTrend.stats.maxTemperature'),
          min: t('dashboard.environmentTrend.stats.minTemperature'),
        };
      case 'humidity':
        return {
          avg: t('dashboard.environmentTrend.stats.avgHumidity'),
          max: t('dashboard.environmentTrend.stats.maxHumidity'),
          min: t('dashboard.environmentTrend.stats.minHumidity'),
        };
      case 'light':
        return {
          avg: t('dashboard.environmentTrend.stats.avgLight'),
          max: t('dashboard.environmentTrend.stats.maxLight'),
          min: t('dashboard.environmentTrend.stats.minLight'),
        };
      case 'shock':
        return {
          avg: t('dashboard.environmentTrend.stats.avgShock'),
          max: t('dashboard.environmentTrend.stats.maxShock'),
          min: t('dashboard.environmentTrend.stats.minShock'),
        };
    }
  };

  const labels = getStatsLabels(tab);
  const avgLabel = labels.avg;
  const maxLabel = labels.max;
  const minLabel = labels.min;

  // 숫자 스타일 클래스
  const numberClass = statsFontWeight === 'display'
    ? 'text-[2rem] leading-none font-display text-[#0a0a0a]'
    : 'text-[2rem] leading-none font-normal text-[#0a0a0a]';

  // 통계 영역 레이아웃 클래스
  const statsLayoutClass = statsLayout === 'end' ? 'justify-end' : 'justify-center';

  // border 클래스 조건부 적용
  const borderClass = showBorder ? 'border-b border-gray-300' : '';

  return (
    // 피그마: border-b #dcdce0, px-28px(1.75rem), py-32px(2rem), justify-between
    <div className={`flex items-center justify-between px-[1.75rem] py-[2rem] ${borderClass}`}>
      {/* 설명 텍스트 - 피그마: Body/L - 16px, leading 1.48, #17171c */}
      <p
        className="text-base leading-[1.48] text-gray-1000 whitespace-pre-wrap min-w-0 break-keep tracking-tight"
        style={{ maxWidth: "36rem" }}
      >
        {description}
      </p>

      {/* 통계 카드들 - 피그마: gap-16px(1rem), h-80px(5rem) */}
      <div className={`flex items-center ${statsLayoutClass} h-[5rem] shrink-0`}>
        <div className="flex items-center gap-[1rem]">
          {/* 조도 탭 + 여정상세: 피그마 기준 별도 레이아웃 (최대조도, 노출시간, 개봉횟수, 평균조도) */}
          {tab === 'light' && showTargetRange ? (
            <>
              {/* 최대 조도 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{t('dashboard.environmentTrend.stats.maxLight')}</span>
                <span className={numberClass}>
                  {hasData ? `${max.toLocaleString()}lx` : 'N/A'}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 노출 시간 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{t('dashboard.environmentTrend.stats.exposureTime')}</span>
                <span className={numberClass}>
                  {hasData ? '15min' : 'N/A'}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 개봉 횟수 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{t('dashboard.environmentTrend.stats.openCount')}</span>
                <span className={numberClass}>
                  {hasData ? '1' : 'N/A'}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 평균 조도 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{t('dashboard.environmentTrend.stats.avgLight')}</span>
                <span className={numberClass}>
                  {hasData ? `${avg}lx` : 'N/A'}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* 평균 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{avgLabel}</span>
                <span className={numberClass}>
                  {displayValue(avg)}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 최고 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{maxLabel}</span>
                <span className={numberClass}>
                  {displayValue(max)}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 최저 */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>{minLabel}</span>
                <span className={numberClass}>
                  {displayValue(min)}
                </span>
              </div>

              <div className="w-px h-[3.375rem] bg-gray-300" />

              {/* 설정 범위 (Target Range) - 여정 상세 전용 */}
              {showTargetRange && (
                <>
                  <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                    <span className={labelClass}>{t('dashboard.environmentTrend.stats.targetRange')}</span>
                    <span className={numberClass}>
                      {targetRangeValue}
                    </span>
                  </div>

                  <div className="w-px h-[3.375rem] bg-gray-300" />
                </>
              )}

              {/* 이탈 건수 / Excursion Count */}
              <div className={`flex flex-col items-center gap-[0.5rem] ${cardWidth}`}>
                <span className={labelClass}>
                  {showTargetRange
                    ? t('dashboard.environmentTrend.stats.excursionCount')
                    : t('dashboard.environmentTrend.stats.violations')
                  }
                </span>
                <span className={numberClass}>
                  {displayValue(violations, false)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTrendStats;
