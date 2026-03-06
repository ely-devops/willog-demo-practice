import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

type TrendType = 'increase' | 'decrease' | 'recovery';

interface Period {
  dateRange: string;
  trend: TrendType;
  description: string;
}

interface AIPeriodTimelineProps {
  periods: Period[];
}

// Bullet icon for date rows - 16x16 with 6px circle
const TimelineBullet = () => (
  <div className="w-4 h-4 flex items-center justify-center shrink-0">
    <div className="w-[0.375rem] h-[0.375rem] rounded-full bg-gray-500" />
  </div>
);

// Connector line for description rows - stretches to full height
const TimelineConnector = () => (
  <div className="w-4 flex justify-center self-stretch shrink-0">
    <div className="w-px h-full bg-gray-300" />
  </div>
);

const TrendBadge = ({ trend, label }: { trend: TrendType; label: string }) => {
  const badgeStyles: Record<TrendType, string> = {
    increase: 'bg-primary-transparent-selected text-[#1858b4]',
    decrease: 'bg-red-100 text-red-600',
    recovery: 'bg-green-100 text-green-700',
  };

  return (
    <div
      className={clsx(
        'h-[1.125rem] flex items-center justify-center px-1.5 rounded text-[0.75rem] leading-none whitespace-nowrap',
        badgeStyles[trend]
      )}
    >
      {label}
    </div>
  );
};

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AIPeriodTimeline = ({ periods }: AIPeriodTimelineProps) => {
  const { t } = useTranslation();

  const trendLabels: Record<TrendType, string> = {
    increase: t('aiAssistant.response.period.increase'),
    decrease: t('aiAssistant.response.period.decrease'),
    recovery: t('aiAssistant.response.period.recovery'),
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2.5 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] leading-none text-gray-1000">
          {t('aiAssistant.response.timelineTitle')}
        </span>
        <button className="flex items-center gap-1 text-[0.75rem] leading-none text-gray-600 hover:text-gray-800 transition-colors">
          {t('aiAssistant.response.viewDetails')}
          <ChevronDownIcon />
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-300" />

      {/* Timeline Items - all rows as siblings with gap-2 */}
      <div className="flex flex-col gap-2">
        {periods.flatMap((period, index) => [
          /* Date Row */
          <div key={`date-${index}`} className="flex gap-1 items-center w-full">
            <TimelineBullet />
            <div className="flex-1 flex items-start justify-between">
              <div className="flex-1 flex flex-col">
                <span className="text-[0.75rem] leading-[1.48] text-gray-1000">{period.dateRange}</span>
              </div>
              <TrendBadge trend={period.trend} label={trendLabels[period.trend]} />
            </div>
          </div>,

          /* Description Row */
          <div key={`desc-${index}`} className="flex gap-1 items-center">
            <TimelineConnector />
            <p className="text-[0.75rem] leading-[1.48] text-gray-600 whitespace-pre-line">{period.description}</p>
          </div>
        ])}
      </div>
    </div>
  );
};
