import { useTranslation } from 'react-i18next';
import type { EnvironmentTab } from '@/utils/environmentMockData';

// 탭 키 목록 (label은 i18n으로 처리)
const TAB_KEYS: EnvironmentTab[] = ['temperature', 'humidity', 'light', 'shock'];

// 아이콘 컴포넌트 - 피그마: 16x16
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={`w-4 h-4 ${className || ''}`}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface EnvironmentTrendHeaderProps {
  activeTab: EnvironmentTab;
  onTabChange: (tab: EnvironmentTab) => void;
  hasLightData?: boolean; // 조도 데이터 존재 여부 (Scenario 5에는 없음)
  title: string; // 제목 (i18n 적용)
  subtitle: string; // 부제목 (i18n 적용)
  periodLabel: string; // 기간 라벨 (i18n 적용)
  actionButton?: React.ReactNode; // periodLabel 대신 표시할 커스텀 버튼 (제공시 periodLabel 무시)
}

export const EnvironmentTrendHeader = ({
  activeTab,
  onTabChange,
  hasLightData = true,
  title,
  subtitle,
  periodLabel,
  actionButton,
}: EnvironmentTrendHeaderProps) => {
  const { t } = useTranslation();

  const filteredTabs = hasLightData
    ? TAB_KEYS
    : TAB_KEYS.filter((key) => key !== 'light');

  return (
    // 피그마: bg-gray-50, border-b #dbdbe0, px-28px py-20px, rounded-t-16px
    <div className="bg-gray-50 border-b border-gray-300 px-[1.75rem] py-[1.25rem] flex items-center justify-between rounded-t-[1rem] min-w-0">
      {/* 제목 영역 - 피그마: gap-4px */}
      <div className="flex flex-col gap-1 min-w-0 shrink">
        {/* 피그마: Title/H3 - 16px, leading 1.3, font-normal, #17171c */}
        <h2 className="text-base leading-[1.3] font-normal text-gray-1000 truncate">
          {title}
        </h2>
        {/* 피그마: Label/S - 13px, leading-tight(descender 보호), #737680 */}
        <p className="text-[0.8125rem] leading-tight text-gray-600 truncate">
          {subtitle}
        </p>
      </div>

      {/* 컨트롤 영역 - 피그마: gap-8px */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 탭 버튼 그룹 - 피그마: bg-#fbfbfb, border #dcdce0, h-36px(2.25rem), p-4px(0.25rem), rounded-4px(0.25rem) */}
        <div className="bg-[#fbfbfb] border border-gray-300 h-[2.25rem] rounded-[0.25rem] p-[0.25rem] flex items-center">
          {filteredTabs.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => onTabChange(tabKey)}
              className={`
                h-full px-[1rem] rounded-[0.25rem] text-sm leading-none transition-colors
                ${
                  activeTab === tabKey
                    ? 'bg-gray-200 text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {t(`dashboard.environmentTrend.tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        {/* 액션 버튼 또는 기간 표시 */}
        {actionButton || (
          <div className="bg-[#fbfbfb] border border-gray-300 h-[2.25rem] px-[1rem] rounded-[0.25rem] flex items-center gap-[0.375rem] overflow-hidden">
            {/* 피그마: Label/M Strong - 14px, leading-none, #45454f */}
            <span className="text-sm leading-none text-gray-800">
              {periodLabel}
            </span>
            <ChevronDownIcon className="text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentTrendHeader;
