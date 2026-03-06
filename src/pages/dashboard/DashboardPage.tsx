import { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/useAppStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useUrlStateSync } from '@/hooks/useUrlStateSync';
import {
  JOURNEY_DATA,
  BIO_KPI_DATA,
  BIO_AI_INSIGHTS,
  BIO_NOTIFICATIONS,
  BIO_JOURNEY_TABLE_DATA,
  BIO_DEVICE_DATA,
  BIO_DEVICE_SUMMARY,
} from '@/utils/mockData';
import { KPIMiniChart, type ChartShape } from '@/components/common/KPIMiniChart';
import { DateRangePicker, YearSelector } from '@/components/common/DateRangePicker';
import { EnvironmentTrendSection } from '@/components/dashboard/EnvironmentTrendSection';
import { WarehouseMap } from '@/components/warehouse/WarehouseMap';
import { JourneyMap } from '@/components/map/JourneyMap';
import { WAREHOUSE_MARKERS } from '@/utils/warehouseMapData';
import type { ViewMode } from '@/types/warehouse.types';

// Arrow Icons from assets/common
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SortIcon,
  ApartmentIcon as TableApartmentIcon,
  RoomIcon as TableRoomIcon,
  RemoveRedEyeIcon,
  TodayIcon,
  BatteryStdIcon,
  AccessTimeIcon,
} from '@/assets/common';

// Table Icons aliases
const TableRemoveRedEyeIcon = RemoveRedEyeIcon;
const TableTodayIcon = TodayIcon;

// Device Icons aliases (디바이스 통합 관리 테이블용)
const DeviceEyeIcon = RemoveRedEyeIcon;
const DeviceBatteryIcon = BatteryStdIcon;
const DeviceClockIcon = AccessTimeIcon;
const DeviceCalendarIcon = TodayIcon;

// Common Icons
import searchLargeIcon from '@/assets/common/search_large.svg';
import csvDownloadIcon from '@/assets/common/csv-download.svg';

// Dashboard Edit Icon (16x16) - 대시보드 편집 버튼용
const DashboardEditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.30793 8.16432H14M12.5203 14H3.29481C2.57971 14 2 13.4112 2 12.6849L2 3.31507C2 2.58878 2.57971 2 3.29481 2L12.5203 2C13.2354 2 13.8151 2.58878 13.8151 3.31507V12.6849C13.8151 13.4112 13.2354 14 12.5203 14Z" stroke="white" strokeWidth="1.2"/>
  </svg>
);

// Stars Icon (16x16) - AI 신뢰도 뱃지용
const StarsIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9.88196 1.6001L11.1021 4.89757L14.3996 6.11774L11.1021 7.33792L9.88196 10.6354L8.66179 7.33792L5.36432 6.11774L8.66179 4.89757L9.88196 1.6001Z" fill="#5494F3"/>
    <path d="M4.2349 9.12951L5.30079 10.6989L6.8702 11.7648L5.30079 12.8307L4.2349 14.4001L3.16902 12.8307L1.59961 11.7648L3.16902 10.6989L4.2349 9.12951Z" fill="#5494F3"/>
  </svg>
);


// Notification Types
type NotificationStatus = 'danger' | 'warning' | 'normal';
type NotificationFilter = 'all' | NotificationStatus;

interface Notification {
  id: string;
  title: string;
  status: NotificationStatus;
  description: string;
  timeAgo: string;
  date: string;
}

// Notification Data (Mock) - i18n keys for dynamic translation
interface NotificationDataItem {
  id: string;
  titleKey: string;
  status: NotificationStatus;
  descriptionKey: string;
  timeAgo: string;
  date: string;
}

// 반도체 도메인용 알림 데이터
const semiconNotificationData: NotificationDataItem[] = [
  {
    id: 'alert-001',
    titleKey: 'dashboard.alerts.items.temperature119.title',
    status: 'danger',
    descriptionKey: 'dashboard.alerts.items.temperature119.description',
    timeAgo: '3',
    date: '2025.09.04 12:45'
  },
  {
    id: 'alert-002',
    titleKey: 'dashboard.alerts.items.shock99G.title',
    status: 'danger',
    descriptionKey: 'dashboard.alerts.items.shock99G.description',
    timeAgo: '3',
    date: '2025.09.04 12:45'
  },
  {
    id: 'alert-003',
    titleKey: 'dashboard.alerts.items.prolongedTemp.title',
    status: 'warning',
    descriptionKey: 'dashboard.alerts.items.prolongedTemp.description',
    timeAgo: '3',
    date: '2025.09.04 12:45'
  },
  {
    id: 'alert-004',
    titleKey: 'dashboard.alerts.items.shocksSeattle.title',
    status: 'warning',
    descriptionKey: 'dashboard.alerts.items.shocksSeattle.description',
    timeAgo: '3',
    date: '2025.09.04 12:45'
  },
  {
    id: 'alert-005',
    titleKey: 'dashboard.alerts.items.humidity80.title',
    status: 'normal',
    descriptionKey: 'dashboard.alerts.items.humidity80.description',
    timeAgo: '3',
    date: '2025.09.04 12:45'
  }
];

// 바이오 도메인용 알림 i18n 키 맵핑
const bioAlertKeyMap: Record<string, string> = {
  'bio-alert-1': 'finalDelivery',
  'bio-alert-2': 'coldChainRate',
  'bio-alert-3': 'noShockEvent',
  'bio-alert-4': 'usInlandConcentrated',
  'bio-alert-5': 'tempNormalRecovery',
  'bio-alert-6': 'tempDeviationPersist',
  'bio-alert-7': 'temp9Detected',
  'bio-alert-8': 'tempExceed30min',
};

// Device Data (Mock) - lastComm stores unit type and count for i18n
const deviceData = [
  { id: 'E-1824', journeyId: 'SC01', status: 'danger' as const, battery: 14, lastComm: { unit: 'days', count: 1 }, registDate: '2025/04/01' },
  { id: 'D-2626', journeyId: 'SC86', status: 'warning' as const, battery: 25, lastComm: { unit: 'minutes', count: 2 }, registDate: '2025/04/02' },
  { id: 'D-3872', journeyId: 'SC87', status: 'warning' as const, battery: 28, lastComm: { unit: 'minutes', count: 5 }, registDate: '2025/04/03' },
  { id: 'D-2112', journeyId: 'SC88', status: 'warning' as const, battery: 22, lastComm: { unit: 'minutes', count: 3 }, registDate: '2025/04/04' },
  { id: 'D-2132', journeyId: 'SC89', status: 'warning' as const, battery: 32, lastComm: { unit: 'minutes', count: 1 }, registDate: '2025/04/05' },
];

// AI Insight Card Types
type AIInsightStatus = 'danger' | 'warning' | 'suggestion';

// AI Insight Data (Mock) - i18n keys for dynamic translation
interface AIInsightDataItem {
  id: string;
  status: AIInsightStatus;
  aiConfidence: number;
  titleKey: string;
  descriptionKey: string;
  primaryActionKey?: string;
  primaryActionVariant?: 'danger' | 'primary';
}

// 반도체 도메인용 AI 인사이트 데이터
const semiconAiInsightData: AIInsightDataItem[] = [
  {
    id: 'ai-001',
    status: 'danger',
    aiConfidence: 82,
    titleKey: 'dashboard.aiInsights.cards.heatExposure.title',
    descriptionKey: 'dashboard.aiInsights.cards.heatExposure.description',
    primaryActionKey: 'dashboard.aiInsights.emergencyAction',
    primaryActionVariant: 'danger'
  },
  {
    id: 'ai-002',
    status: 'danger',
    aiConfidence: 85,
    titleKey: 'dashboard.aiInsights.cards.shockUnloading.title',
    descriptionKey: 'dashboard.aiInsights.cards.shockUnloading.description',
    primaryActionKey: 'dashboard.aiInsights.emergencyAction',
    primaryActionVariant: 'danger'
  },
  {
    id: 'ai-003',
    status: 'warning',
    aiConfidence: 76,
    titleKey: 'dashboard.aiInsights.cards.temperatureFluctuation.title',
    descriptionKey: 'dashboard.aiInsights.cards.temperatureFluctuation.description'
  },
  {
    id: 'ai-004',
    status: 'suggestion',
    aiConfidence: 71,
    titleKey: 'dashboard.aiInsights.cards.minorShocks.title',
    descriptionKey: 'dashboard.aiInsights.cards.minorShocks.description',
    primaryActionKey: 'dashboard.aiInsights.reroute',
    primaryActionVariant: 'primary'
  }
];

// 바이오 도메인용 AI 인사이트 i18n 키 맵핑
const bioAiInsightKeyMap: Record<string, string> = {
  'bio-insight-1': 'nightMonitoring',
  'bio-insight-2': 'usInlandDeviation',
  'bio-insight-3': 'osongRoute',
  'bio-insight-4': 'icnLaxExcellent',
};

// KPI Card Component
interface KPICardProps {
  title: string;
  subtitle: string;
  value: string;
  change: number;
  isPositiveChange: boolean; // Whether the change value going up is good (true) or bad (false)
  description: string;
  shape: ChartShape; // Chart line shape matching each KPI
}

const KPICard = ({ title, subtitle, value, change, isPositiveChange, description, shape }: KPICardProps) => {
  // value에서 숫자와 % 분리
  const numericPart = value.replace('%', '');
  const hasPercent = value.includes('%');

  // Determine if the change is an increase or decrease
  const isIncrease = change > 0;

  // Determine the badge style based on whether the change is good or bad
  // If isPositiveChange is true: increase = good (blue), decrease = bad (red)
  // If isPositiveChange is false: increase = bad (red), decrease = good (blue)
  const isGoodChange = isPositiveChange ? isIncrease : !isIncrease;

  // Determine chart variant based on whether the current state is good or bad
  const chartVariant = isGoodChange ? 'positive' : 'negative';

  return (
    <div className="flex-1 min-w-0 aspect-square bg-white border border-gray-300 rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] p-[1.5rem] flex flex-col justify-between overflow-hidden">
      {/* Title & Value Section */}
      <div className="flex flex-col gap-[0.75rem]">
        {/* Title Section */}
        <div className="flex flex-col gap-[0.125rem]">
          <span className="text-h3 text-gray-1000 line-clamp-1">{title}</span>
          <span className="text-body-m text-gray-600 line-clamp-1">{subtitle}</span>
        </div>

        {/* Value Section */}
        <div className="flex items-start gap-[0.75rem]">
          <span className="font-display text-gray-1000 leading-none">
            <span className="text-display-xxxl">{numericPart}</span>
            {hasPercent && <span className="text-display-l">%</span>}
          </span>
          <div className={`flex items-center gap-1 px-2 h-5 rounded-full ${isGoodChange ? 'bg-blue-100' : 'bg-red-100'}`}>
            {isIncrease ? (
              <ArrowUpIcon className={isGoodChange ? 'text-blue-600' : 'text-red-600'} />
            ) : (
              <ArrowDownIcon className={isGoodChange ? 'text-blue-600' : 'text-red-600'} />
            )}
            <span className={`font-mono text-xs ${isGoodChange ? 'text-blue-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0 flex items-center">
        <KPIMiniChart variant={chartVariant} shape={shape} />
      </div>

      {/* Description */}
      <p className="text-sm leading-[1.48] font-normal text-gray-1000 line-clamp-1">{description}</p>
    </div>
  );
};

interface DashboardPageProps {
  bizCase?: 'semicon' | 'bio';
}

export const DashboardPage = ({ bizCase }: DashboardPageProps) => {
  const { t } = useTranslation();
  const { dateRange, setDateRange, currentCase, setCase } = useAppStore();
  const { language } = useLanguageStore();
  // Note: AI fullscreen and alert are handled by query params via AIAssistant component and useUrlStateSync hook

  // URL 경로에서 전달받은 bizCase로 스토어 동기화
  useEffect(() => {
    if (bizCase && bizCase !== currentCase) {
      setCase(bizCase);
    }
  }, [bizCase, currentCase, setCase]);

  // URL Query Parameter 동기화 (case, ai, alert)
  useUrlStateSync();

  // Helper function to get journey URL based on current domain
  const getJourneyUrl = (journeyIdParam: string) => {
    const domain = currentCase === 'bio' ? 'lifesciences' : 'hightech';
    return `/journey/${domain}/${journeyIdParam}`;
  };

  // Real-time alerts filter state
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('all');

  // 지도 탭 상태 (여정 지도 / 창고 지도)
  type MapTab = 'journey' | 'warehouse';
  const [mapTab, setMapTab] = useState<MapTab>('journey');
  const [warehouseViewMode, setWarehouseViewMode] = useState<ViewMode>('3d');

  // StatusBar 애니메이션 상태
  const statusBarRef = useRef<HTMLDivElement>(null);
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(false);

  // StatusBar Intersection Observer - 뷰포트 진입 시 애니메이션 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isStatusBarVisible) {
          setIsStatusBarVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statusBarRef.current) {
      observer.observe(statusBarRef.current);
    }

    return () => observer.disconnect();
  }, [isStatusBarVisible]);

  // 연도 상태 (날짜 범위의 시작 연도 기준)
  const selectedYear = dayjs(dateRange.start).year();

  // Filtered notification list with translated content - 도메인별 분기
  const filteredNotifications = useMemo(() => {
    let notifications: Notification[];

    if (currentCase === 'bio') {
      // 바이오 도메인: BIO_NOTIFICATIONS 사용
      notifications = BIO_NOTIFICATIONS.map(item => {
        const keyName = bioAlertKeyMap[item.id];
        // Extract numeric value from Korean timeAgo string (e.g., '5일 전' -> 5)
        const timeCount = parseInt(item.timeAgo.replace(/[^0-9]/g, ''), 10);
        return {
          id: item.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: t(`dashboard.bio.alerts.items.${keyName}.title` as any),
          status: item.status as NotificationStatus,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          description: t(`dashboard.bio.alerts.items.${keyName}.description` as any),
          timeAgo: t('common.time.daysAgo', { count: timeCount }),
          date: item.timestamp
        };
      });
    } else {
      // 반도체 도메인: 기존 데이터 사용
      notifications = semiconNotificationData.map(item => ({
        id: item.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t(item.titleKey as any),
        status: item.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: t(item.descriptionKey as any),
        timeAgo: t('common.time.minutesAgo', { count: parseInt(item.timeAgo, 10) }),
        date: item.date
      }));
    }

    if (notificationFilter === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.status === notificationFilter);
  }, [notificationFilter, t, currentCase]);

  // Total notification count (unfiltered) for header description
  const totalNotificationCount = useMemo(() => {
    if (currentCase === 'bio') {
      return BIO_NOTIFICATIONS.length;
    }
    return semiconNotificationData.length;
  }, [currentCase]);

  // KPI Data with i18n translations - each KPI has its own chart shape matching Figma design
  const kpiData: KPICardProps[] = useMemo(() => {
    if (currentCase === 'bio') {
      // 바이오 도메인: mockData의 BIO_KPI_DATA 사용
      return BIO_KPI_DATA.map((kpi, index) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t(`dashboard.bio.kpi.${kpi.id}.title` as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subtitle: t(`dashboard.bio.kpi.${kpi.id}.subtitle` as any),
        value: kpi.value,
        change: kpi.change,
        isPositiveChange: kpi.isPositiveChange,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: t(`dashboard.bio.kpi.${kpi.id}.description` as any),
        shape: (['temperature', 'quality', 'ontime', 'event'] as ChartShape[])[index],
      }));
    }
    // 반도체 도메인 (기본값)
    return [
      {
        title: t('dashboard.kpi.temperatureCompliance.title'),
        subtitle: t('dashboard.kpi.temperatureCompliance.aboveTarget', { target: 95 }),
        value: '61.4%',
        change: -1.2,
        isPositiveChange: true,
        description: t('dashboard.kpi.temperatureCompliance.description'),
        shape: 'temperature' as ChartShape,
      },
      {
        title: t('dashboard.kpi.productIntegrity.title'),
        subtitle: t('dashboard.kpi.productIntegrity.belowTarget', { target: 98 }),
        value: '85.2%',
        change: -3.6,
        isPositiveChange: true,
        description: t('dashboard.kpi.productIntegrity.description'),
        shape: 'quality' as ChartShape,
      },
      {
        title: t('dashboard.kpi.onTimePerformance.title'),
        subtitle: t('dashboard.kpi.onTimePerformance.aboveTarget', { target: 90 }),
        value: '98.1%',
        change: 2.1,
        isPositiveChange: true,
        description: t('dashboard.kpi.onTimePerformance.description'),
        shape: 'ontime' as ChartShape,
      },
      {
        title: t('dashboard.kpi.incidentRate.title'),
        subtitle: t('dashboard.kpi.incidentRate.belowTarget', { target: 5 }),
        value: '5.8%',
        change: 1.2,
        isPositiveChange: false,
        description: t('dashboard.kpi.incidentRate.description'),
        shape: 'event' as ChartShape,
      },
    ];
  }, [currentCase, t]);

  return (
    <div className="flex flex-col gap-7">
      {/* Page Title & Filter Section (con_1) */}
      <div className="flex items-start justify-between w-dfull">
        {/* Left: Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-gray-1000">
            {t(`dashboard.title.${currentCase}`)}
          </h1>
          <p className="text-body-l text-gray-600">
            {t('dashboard.lastUpdated', { time: t('common.time.minutesAgo', { count: 5 }) })}
          </p>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-2">
          {/* Year Dropdown */}
          <YearSelector
            value={selectedYear}
            onChange={(year) => {
              const currentStart = dayjs(dateRange.start);
              const currentEnd = dayjs(dateRange.end);
              const yearDiff = year - currentStart.year();
              setDateRange({
                start: currentStart.add(yearDiff, 'year').toDate(),
                end: currentEnd.add(yearDiff, 'year').toDate(),
              });
            }}
            disabled
          />

          {/* Date Range */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            disabled
          />

          {/* Dashboard Edit Button */}
          <button className="flex items-center gap-1.5 h-9 px-4 bg-primary rounded">
            <DashboardEditIcon />
            <span className="text-sm leading-none font-medium text-white">{t('dashboard.editDashboard')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section (con_2) */}
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[1.25rem] font-normal leading-130 text-gray-1000">
            {t('dashboard.kpiSummary.title')}
          </h2>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* AI Prediction Insights Section (con_7) - Phase 4 */}
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[1.25rem] font-normal leading-130 text-gray-1000">
            {t('dashboard.aiInsights.title')}
          </h2>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Cards Grid - 도메인별 분기 */}
        <div className="grid grid-cols-4 gap-4">
          {currentCase === 'bio' ? (
            // 바이오 도메인: BIO_AI_INSIGHTS 사용
            BIO_AI_INSIGHTS.map((insight) => {
              const keyName = bioAiInsightKeyMap[insight.id];
              const statusLabel = insight.status === 'danger'
                ? t('dashboard.aiInsights.critical')
                : insight.status === 'warning'
                ? t('dashboard.aiInsights.warning')
                : t('dashboard.aiInsights.suggestion');

              return (
                <div
                  key={insight.id}
                  className="bg-white border border-gray-300 rounded-xl overflow-hidden p-6 pb-[1.5rem] flex flex-col"
                >
                  {/* Content Area - flex-1로 남은 공간 채움 */}
                  <div className="flex flex-col gap-2 flex-1">
                    {/* Badges */}
                    <div className="flex gap-1.5 items-start flex-wrap">
                      <span
                        className={`font-mono text-xs px-2 h-5 flex items-center justify-center rounded-full whitespace-nowrap ${
                          insight.status === 'danger'
                            ? 'bg-red-100 text-red-600'
                            : insight.status === 'warning'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {statusLabel}
                      </span>
                      <span className="bg-gray-100 text-gray-600 font-mono text-xs px-1.5 h-5 flex items-center justify-center gap-0.5 rounded-full whitespace-nowrap">
                        <StarsIcon className="w-4 h-4" />
                        {t('dashboard.aiInsights.aiConfidence', { value: insight.confidence })}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-base leading-130 font-normal text-gray-1000 whitespace-pre-line tracking-tight">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`dashboard.bio.aiInsights.cards.${keyName}.title` as any)}
                      </p>
                      <p className="text-sm leading-[1.48] font-normal text-gray-600 whitespace-pre-line tracking-tight">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`dashboard.bio.aiInsights.cards.${keyName}.description` as any)}
                      </p>
                    </div>
                  </div>
                  {/* Action Buttons - 항상 하단에 위치 */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {insight.actions.filter(a => a.type === 'primary').map((action) => {
                      // Map action labels to i18n keys
                      const actionLabelKey = action.label === '긴급조치'
                        ? 'dashboard.aiInsights.emergencyAction'
                        : action.label === '경로 적용'
                        ? 'dashboard.aiInsights.reroute'
                        : null;
                      if (!actionLabelKey) return null;
                      return (
                        <button
                          key={action.label}
                          className={`h-8 px-3 text-label-s font-medium rounded whitespace-nowrap ${
                            insight.status === 'danger'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {t(actionLabelKey)}
                        </button>
                      );
                    })}
                    <button className="h-8 px-3 border border-gray-300 text-gray-800 text-label-s font-medium rounded whitespace-nowrap">
                      {t('dashboard.aiInsights.viewDetails')}
                    </button>
                    <button className="h-8 px-3 text-gray-800 text-label-s font-medium rounded whitespace-nowrap">
                      {t('dashboard.aiInsights.dismiss')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // 반도체 도메인: 기존 데이터 사용
            semiconAiInsightData.map((insight) => (
              <div
                key={insight.id}
                className="bg-white border border-gray-300 rounded-xl overflow-hidden p-6 pb-[1.5rem] flex flex-col"
              >
                {/* Content Area - flex-1로 남은 공간 채움 */}
                <div className="flex flex-col gap-2 flex-1">
                  {/* Badges */}
                  <div className="flex gap-1.5 items-start flex-wrap">
                    <span
                      className={`font-mono text-xs px-2 h-5 flex items-center justify-center rounded-full whitespace-nowrap ${
                        insight.status === 'danger'
                          ? 'bg-red-100 text-red-600'
                          : insight.status === 'warning'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {insight.status === 'danger'
                        ? t('dashboard.aiInsights.critical')
                        : insight.status === 'warning'
                        ? t('dashboard.aiInsights.warning')
                        : t('dashboard.aiInsights.suggestion')}
                    </span>
                    <span className="bg-gray-100 text-gray-600 font-mono text-xs px-1.5 h-5 flex items-center justify-center gap-0.5 rounded-full whitespace-nowrap">
                      <StarsIcon className="w-4 h-4" />
                      {t('dashboard.aiInsights.aiConfidence', { value: insight.aiConfidence })}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-base leading-130 font-normal text-gray-1000">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(insight.titleKey as any)}
                    </p>
                    <p className="text-sm leading-[1.48] font-normal text-gray-600 tracking-tight">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(insight.descriptionKey as any)}
                    </p>
                  </div>
                </div>
                {/* Action Buttons - 항상 하단에 위치 */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {insight.primaryActionKey && (
                    <button
                      className={`h-8 px-3 text-label-s font-medium rounded whitespace-nowrap ${
                        insight.primaryActionVariant === 'danger'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(insight.primaryActionKey as any)}
                    </button>
                  )}
                  <button className="h-8 px-3 border border-gray-300 text-gray-800 text-label-s font-medium rounded whitespace-nowrap">
                    {t('dashboard.aiInsights.viewDetails')}
                  </button>
                  <button className="h-8 px-3 text-gray-800 text-label-s font-medium rounded whitespace-nowrap">
                    {t('dashboard.aiInsights.dismiss')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Realtime Alerts + Environment Data Trend Section (Phase 5) */}
      <div className="flex gap-4">
        {/* Realtime Alerts - Left Side (expanded width for full title display) */}
        <div className="w-[35rem] shrink-0 bg-white rounded-[1rem] flex flex-col h-[32.8125rem]">
          {/* Header */}
          <div className="bg-gray-50 border border-gray-300 px-7 py-5 flex items-center justify-between rounded-t-[1rem]">
            <div className="flex flex-col gap-1">
              <h2 className="text-[1rem] font-normal leading-130 text-black">
                {t('dashboard.alerts.title')}
              </h2>
              <p className="text-label-s text-black-disabled">
                {t('dashboard.alerts.newNotifications', { count: totalNotificationCount })}
              </p>
            </div>
            {/* Filter Tabs - text-label-m으로 기본 폰트 설정 (14px, 400, line-height 1) */}
            <div className="flex h-9 bg-white border border-gray-300 rounded p-1 text-label-m">
              <button
                onClick={() => setNotificationFilter('all')}
                className={`px-4 h-full ${
                  notificationFilter === 'all'
                    ? 'bg-gray-200 rounded text-gray-800'
                    : 'text-black-disabled'
                }`}
              >
                {t('dashboard.alerts.all')}
              </button>
              <button
                onClick={() => setNotificationFilter('danger')}
                className={`px-4 h-full ${
                  notificationFilter === 'danger'
                    ? 'bg-gray-200 rounded text-gray-800'
                    : 'text-black-disabled'
                }`}
              >
                {t('dashboard.alerts.critical')}
              </button>
              <button
                onClick={() => setNotificationFilter('warning')}
                className={`px-4 h-full ${
                  notificationFilter === 'warning'
                    ? 'bg-gray-200 rounded text-gray-800'
                    : 'text-black-disabled'
                }`}
              >
                {t('dashboard.alerts.warning')}
              </button>
              <button
                onClick={() => setNotificationFilter('normal')}
                className={`px-4 h-full ${
                  notificationFilter === 'normal'
                    ? 'bg-gray-200 rounded text-gray-800'
                    : 'text-black-disabled'
                }`}
              >
                {t('dashboard.alerts.normal')}
              </button>
            </div>
          </div>
          {/* Alert List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide border-x border-b border-gray-300 rounded-b-[1rem] px-6 py-6 flex flex-col gap-4">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                {/* Alert Item */}
                <div className="flex gap-7 items-end justify-end">
                  {/* Content Area */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex flex-col gap-1">
                      {/* Title + Badge Row */}
                      <div className="flex items-center gap-2">
                        <span className="text-[0.875rem] font-normal leading-130 text-black whitespace-nowrap">
                          {notification.title}
                        </span>
                        <span
                          className={`shrink-0 text-label-xs px-2 h-5 flex items-center rounded-full ${
                            notification.status === 'danger'
                              ? 'bg-status-danger-subtle text-error'
                              : notification.status === 'warning'
                              ? 'bg-status-warning-subtle text-orange-700'
                              : 'bg-status-success-subtle text-green-700'
                          }`}
                        >
                          {notification.status === 'danger'
                            ? t('dashboard.alerts.critical')
                            : notification.status === 'warning'
                            ? t('dashboard.alerts.warning')
                            : t('dashboard.alerts.normal')}
                        </span>
                      </div>
                      {/* Description */}
                      <p className="text-body-s text-black whitespace-pre-wrap">
                        {notification.description}
                      </p>
                    </div>
                    {/* DateTime - Combined format with monospace numbers */}
                    <div className="flex items-center gap-0.5 text-label-xs text-black-disabled ">
                      <span>
                        <span className="font-mono">{notification.timeAgo.replace(/[^0-9]/g, '')}</span>
                        {notification.timeAgo.replace(/[0-9]/g, '')}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{notification.date}</span>
                    </div>
                  </div>
                  {/* Button Area - 모든 알림에 동일한 상세보기 버튼 표시 */}
                  <button
                    onClick={() => {
                      // bio-alert-4 (미국 내륙 구간 집중 이탈) and bio-alert-6 (온도 이탈 지속 감지) triggers AI Assistant alert response
                      if (notification.id === 'bio-alert-4' || notification.id === 'bio-alert-6') {
                        window.dispatchEvent(
                          new CustomEvent('openAIAssistant', {
                            detail: { responseType: 'alert' },
                          })
                        );
                      }
                    }}
                    className={`shrink-0 h-8 px-3 rounded text-label-s-strong ${
                      notification.id === 'bio-alert-6'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white border border-gray-300 text-gray-800'
                    }`}
                  >
                    {t('dashboard.alerts.viewDetails')}
                  </button>
                </div>
                {/* Divider */}
                {index < filteredNotifications.length - 1 && (
                  <div className="border-t border-gray-300 mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Environment Data Trend - Right Side (Flexible width) */}
        <div className="flex-1 min-w-0">
          <EnvironmentTrendSection />
        </div>
      </div>

      {/* Route & Current Location Section (Phase 6) */}
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden h-[37.5rem] relative">
        {/* Section Header */}
        <div className="absolute top-0 left-0 right-0 z-1 bg-transparent px-6 py-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base leading-130 font-normal text-gray-1000">
              {t('dashboard.map.title')}
            </h2>
            <p className="text-label-s font-normal text-gray-600">
              {t('dashboard.map.subtitle')}
            </p>
          </div>
          {/* Tabs + Fullscreen Button */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 bg-white border border-gray-300 rounded p-1 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.16)]">
              <button
                onClick={() => setMapTab('journey')}
                className={`px-4 h-full rounded text-sm ${
                  mapTab === 'journey'
                    ? 'bg-gray-200 font-medium text-gray-800'
                    : 'font-normal text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard.map.journeyMap')}
              </button>
              <button
                onClick={() => setMapTab('warehouse')}
                className={`px-4 h-full rounded text-sm ${
                  mapTab === 'warehouse'
                    ? 'bg-gray-200 font-medium text-gray-800'
                    : 'font-normal text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard.map.warehouseMap')}
              </button>
            </div>
            <button className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 rounded text-sm font-medium text-gray-800 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.16)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-800">
                <path d="M2.66667 5.33333V2.66667H5.33333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 2.66667H13.3333V5.33333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.3333 10.6667V13.3333H10.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.33333 13.3333H2.66667V10.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('dashboard.map.fullscreen')}
            </button>
          </div>
        </div>

        {/* Map Container - Conditional Rendering */}
        {mapTab === 'journey' ? (
          <JourneyMap className="h-full" onWarehouseClick={() => setMapTab('warehouse')} />
        ) : (
          <WarehouseMap
            viewMode={warehouseViewMode}
            onViewModeChange={setWarehouseViewMode}
            markers={WAREHOUSE_MARKERS}
          />
        )}

      </div>

      {/* Phase 7: 진행 중인 작업 테이블 (con_5) - 도메인별 분기 */}
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
        {/* Section Header */}
        <div className="bg-gray-50 border-b border-gray-300 px-7 py-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-gray-1000">
              {t('dashboard.activeTasks.title')}
            </h2>
            <p className="text-label-s text-gray-600">
              {t('dashboard.activeTasks.totalTasks', {
                count: currentCase === 'bio' ? BIO_JOURNEY_TABLE_DATA.length : 1
              })}
            </p>
          </div>
          {/* Search Field */}
          <div className="w-[16.25rem] h-9 flex items-center gap-1.5 px-3 bg-white border border-gray-300 rounded">
            <img src={searchLargeIcon} alt="" className="w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder={t('common.keywordSearch')}
              className="flex-1 h-full bg-transparent text-sm text-gray-800 placeholder:text-gray-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-7 py-8 border-b border-gray-200">
          <p className="text-base leading-[1.48] text-gray-1000 whitespace-pre-wrap">
            {currentCase === 'bio'
              ? t('dashboard.bio.activeTasks.description')
              : t('dashboard.activeTasks.description', { total: 5, inTransit: 1, stationary: 4, active: 1 })}
          </p>
        </div>

        {/* Table Header */}
        <div className="flex items-center bg-white">
          <div className="w-[5rem] flex items-center justify-center p-3 border-r border-gray-200">
            <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" />
          </div>
          <div className="w-[12.5rem] flex items-center gap-1 p-3 border-r border-gray-200">
            <SortIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.journeyId')}</span>
          </div>
          <div className="w-[12.5rem] flex items-center gap-1 p-3 border-r border-gray-200">
            <SortIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.productName')}</span>
          </div>
          <div className="w-[18.75rem] flex items-center gap-1 p-3 border-r border-gray-200">
            <TableApartmentIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.client')}</span>
          </div>
          <div className="w-[16.25rem] flex items-center gap-1 p-3 border-r border-gray-200">
            <TableRoomIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.location')}</span>
          </div>
          <div className="w-[12.5rem] flex items-center gap-1 p-3 border-r border-gray-200">
            <TableRemoveRedEyeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.status')}</span>
          </div>
          <div className="flex-1 flex items-center gap-1 p-3">
            <TableTodayIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-normal text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.activeTasks.columns.eta')}</span>
          </div>
        </div>

        {/* Table Rows - 도메인별 분기 */}
        {currentCase === 'bio' ? (
          // 바이오 도메인: BIO_JOURNEY_TABLE_DATA 사용
          BIO_JOURNEY_TABLE_DATA.map((journey, index) => (
            <div key={journey.id} className={`flex items-center h-12 bg-gray-50 ${index < BIO_JOURNEY_TABLE_DATA.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="w-[5rem] flex items-center justify-center p-3 border-r border-gray-200">
                <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" checked={false} readOnly />
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <Link
                  to={getJourneyUrl(journey.id)}
                  className="text-sm font-mono text-primary underline truncate hover:text-blue-700"
                >
                  {journey.id}
                </Link>
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.bio.journeyTable.productName')}</span>
              </div>
              <div className="w-[18.75rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.bio.journeyTable.customer')}</span>
              </div>
              <div className="w-[16.25rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.bio.journeyTable.currentLocation')}</span>
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <span className={`text-xs h-5 px-2 rounded-full inline-flex items-center whitespace-nowrap ${language === 'en' ? 'font-mono' : ''} ${
                  journey.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[rgba(65,125,247,0.08)] text-primary'
                }`}>
                  {t('dashboard.bio.journeyTable.status')}
                </span>
              </div>
              <div className="flex-1 p-3">
                <span className={`text-sm text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.bio.journeyTable.arrivalEstimate')}</span>
              </div>
            </div>
          ))
        ) : (
          // 반도체 도메인: JOURNEY_DATA 사용
          JOURNEY_DATA.map((journey, index) => (
            <div key={journey.id} className={`flex items-center h-12 bg-gray-50 ${index < JOURNEY_DATA.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="w-[5rem] flex items-center justify-center p-3 border-r border-gray-200">
                <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" checked={false} readOnly />
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <Link
                  to={getJourneyUrl(journey.id)}
                  className="text-sm font-mono text-primary underline truncate hover:text-blue-700"
                >
                  {journey.id}
                </Link>
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.journeyTable.productName')}</span>
              </div>
              <div className="w-[18.75rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.journeyTable.customer')}</span>
              </div>
              <div className="w-[16.25rem] p-3 border-r border-gray-200">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.journeyTable.currentLocation')}</span>
              </div>
              <div className="w-[12.5rem] p-3 border-r border-gray-200">
                <span className={`bg-[rgba(65,125,247,0.08)] text-primary text-xs h-5 px-2 rounded-full inline-flex items-center whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                  {t('dashboard.journeyTable.status')}
                </span>
              </div>
              <div className="flex-1 p-3">
                <span className={`text-sm text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.journeyTable.arrivalEstimate')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phase 8: 디바이스 통합 관리 (con_7) */}
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
        {/* Section Header */}
        <div className="bg-gray-50 border-b border-gray-300 px-7 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-gray-1000">
              {t('dashboard.deviceManagement.title')}
            </h2>
            <p className="text-label-s text-gray-600">
              {t('dashboard.deviceManagement.totalDevices', { count: currentCase === 'bio' ? 250 : 254 })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center h-9 bg-white border border-gray-300 rounded p-1">
              <button className="h-full px-4 rounded bg-gray-200 text-sm font-medium text-gray-800">
                {t('dashboard.deviceManagement.all')}
              </button>
              <button className="h-full px-4 text-sm text-gray-600 rounded">
                {t('dashboard.deviceManagement.critical')}
              </button>
              <button className="h-full px-4 text-sm text-gray-600  rounded">
                {t('dashboard.deviceManagement.warning')}
              </button>
              <button className="h-full px-4 text-sm text-gray-600  rounded">
                {t('dashboard.deviceManagement.normal')}
              </button>
            </div>
            {/* Search Field */}
            <div className="w-[16.25rem] h-9 flex items-center gap-1.5 px-3 bg-white border border-gray-300 rounded">
              <img src={searchLargeIcon} alt="" className="w-5 h-5 shrink-0" />
              <input
                type="text"
                placeholder={t('common.keywordSearch')}
                className="flex-1 h-full bg-transparent text-sm text-gray-800 placeholder:text-gray-600 focus:outline-none"
              />
            </div>
            {/* CSV Download Button */}
            <button className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 rounded text-sm font-medium text-gray-800 hover:bg-gray-50">
              <img src={csvDownloadIcon} alt="" className="w-4 h-4" />
              <span>{t('dashboard.deviceManagement.downloadCsv')}</span>
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="px-7 py-8 border-b border-gray-300">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-h4 text-gray-500">
                {t('dashboard.deviceManagement.devicesRequiringAction')}
              </p>
              <span className="text-display-xxxl text-gray-1000 font-display">
                {currentCase === 'bio' ? BIO_DEVICE_SUMMARY.actionRequired : 5}
              </span>
              <p className="text-base leading-[1.48] text-gray-1000 whitespace-pre-wrap">
                {currentCase === 'bio'
                  ? t('dashboard.bio.deviceManagement.description')
                  : t('dashboard.deviceManagement.summaryDescription', { count: 5 })}
              </p>
            </div>

            {/* Status Bar - 도메인별 분기 */}
            <div ref={statusBarRef} className="flex items-center h-12 gap-1 text-sm">
              {/* Critical - 고정 너비, 위치 고정 */}
              <div className="relative h-full w-[6.25rem] rounded-l-[0.625rem] overflow-hidden">
                {/* 배경 - width 애니메이션 */}
                <div
                  className="absolute inset-0 bg-[#fecaca]"
                  style={{
                    width: isStatusBarVisible ? '100%' : '0',
                    transition: 'width 1.4s ease-out',
                  }}
                />
                {/* 텍스트 - clip-path로 reveal */}
                <div
                  className="relative h-full flex items-center justify-between p-4 text-[#b91c1c] whitespace-nowrap"
                  style={{
                    clipPath: isStatusBarVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                    transition: 'clip-path 1.4s ease-out',
                  }}
                >
                  <span>{t('dashboard.deviceManagement.statusBar.critical')}</span>
                  <span className="font-mono">{currentCase === 'bio' ? BIO_DEVICE_SUMMARY.statusBar.danger : 1}</span>
                </div>
              </div>
              {/* Warning - 고정 너비, 위치 고정 */}
              <div className="relative h-full w-[8.75rem] overflow-hidden">
                {/* 배경 - width 애니메이션 */}
                <div
                  className="absolute inset-0 bg-[#fde68a]"
                  style={{
                    width: isStatusBarVisible ? '100%' : '0',
                    transition: 'width 1.2s ease-out',
                  }}
                />
                {/* 텍스트 - clip-path로 reveal */}
                <div
                  className="relative h-full flex items-center justify-between p-4 text-[#b45309] whitespace-nowrap"
                  style={{
                    clipPath: isStatusBarVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                    transition: 'clip-path 1.2s ease-out',
                  }}
                >
                  <span>{t('dashboard.deviceManagement.statusBar.warning')}</span>
                  <span className="font-mono">{currentCase === 'bio' ? BIO_DEVICE_SUMMARY.statusBar.warning : 4}</span>
                </div>
              </div>
              {/* Normal - flex-1, 위치 고정 */}
              <div className="relative h-full flex-1 rounded-r-[0.625rem] overflow-hidden">
                {/* 배경 - width 애니메이션 */}
                <div
                  className="absolute inset-0 bg-[#bbf7d0]"
                  style={{
                    width: isStatusBarVisible ? '100%' : '0',
                    transition: 'width 0.8s ease-out',
                  }}
                />
                {/* 텍스트 - clip-path로 reveal */}
                <div
                  className="relative h-full flex items-center justify-between p-4 text-[#15803d] whitespace-nowrap"
                  style={{
                    clipPath: isStatusBarVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                    transition: 'clip-path 0.8s ease-out',
                  }}
                >
                  <span>{t('dashboard.deviceManagement.statusBar.normal')}</span>
                  <span className="font-mono">{currentCase === 'bio' ? BIO_DEVICE_SUMMARY.statusBar.normal : 249}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Box - 도메인별 분기 */}
          <div className="mt-7 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1 flex gap-2 items-start">
              {/* Error Icon */}
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="currentColor"/>
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-base leading-[1.48] text-gray-1000 flex-1">
                {currentCase === 'bio' ? (
                  t('dashboard.bio.deviceManagement.warningMessage')
                ) : (
                  <>
                    <span>{t('dashboard.deviceManagement.alertBox.criticalPrefix', { count: 1 })}</span>
                    <button type="button" className="text-[#1858b4] underline cursor-pointer">E-1824</button>
                    <span> {t('dashboard.deviceManagement.alertBox.batteryWarning', { threshold: 15 })}</span>
                  </>
                )}
              </p>
            </div>
            <button className="w-9 h-9 bg-black/8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[5rem_12.5rem_12.5rem_12.5rem_1fr_12.5rem_12.5rem] items-center bg-white h-11">
          <div className="flex items-center justify-center border-r border-gray-300 h-full">
            <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" />
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-gray-300 h-full">
            <SortIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.deviceId')}</span>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-gray-300 h-full">
            <SortIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.journeyId')}</span>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-gray-300 h-full">
            <DeviceEyeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.status')}</span>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-gray-300 h-full">
            <DeviceBatteryIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.battery')}</span>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-gray-300 h-full">
            <DeviceClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.lastComm')}</span>
          </div>
          <div className="flex items-center gap-1 px-3 h-full">
            <DeviceCalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm text-gray-600 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('dashboard.deviceManagement.columns.regDate')}</span>
          </div>
        </div>

        {/* Table Rows - 도메인별 분기 */}
        {currentCase === 'bio' ? (
          // 바이오 도메인: BIO_DEVICE_DATA 사용
          BIO_DEVICE_DATA.map((device, idx) => (
            <div key={device.id} className={`grid grid-cols-[5rem_12.5rem_12.5rem_12.5rem_1fr_12.5rem_12.5rem] items-center h-12 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center justify-center border-r border-gray-300 h-full">
                <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" />
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <button type="button" className="text-sm font-mono text-primary underline truncate cursor-pointer">{device.id}</button>
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <span className="text-sm font-mono text-black truncate">{device.journeyId}</span>
              </div>

              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                {device.status === 'danger' ? (
                  <span className={`bg-red-100 text-red-600 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.critical')}
                  </span>
                ) : device.status === 'warning' ? (
                  <span className={`bg-orange-100 text-orange-600 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.warning')}
                  </span>
                ) : (
                  <span className={`bg-green-100 text-green-700 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.normal')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 border-r border-gray-300 h-full">
                <div className="flex-1 max-w-[9.375rem] h-2 bg-gray-300 border border-gray-300 rounded-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-1.5 ${device.status === 'danger' ? 'bg-red-500' : device.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${device.batteryPercent}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-1000 whitespace-nowrap">{device.batteryPercent}%</span>
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>{t('common.time.minutesAgo', { count: device.lastCommunicationMinutes })}</span>
              </div>
              <div className="px-3 h-full flex items-center">
                <span className="text-sm font-mono text-gray-1000 truncate">{device.registeredAt}</span>
              </div>
            </div>
          ))
        ) : (
          // 반도체 도메인: deviceData 사용
          deviceData.map((device, idx) => (
            <div key={device.id} className={`grid grid-cols-[5rem_12.5rem_12.5rem_12.5rem_1fr_12.5rem_12.5rem] items-center h-12 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center justify-center border-r border-gray-300 h-full">
                <input type="checkbox" className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer" />
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <button type="button" className="text-sm font-mono text-primary underline truncate cursor-pointer">{device.id}</button>
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <span className="text-sm font-mono text-black truncate">{device.journeyId}</span>
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                {device.status === 'danger' ? (
                  <span className={`bg-red-100 text-red-600 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.critical')}
                  </span>
                ) : device.status === 'warning' ? (
                  <span className={`bg-orange-100 text-orange-600 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.warning')}
                  </span>
                ) : (
                  <span className={`bg-green-100 text-green-700 text-xs px-2 h-5 inline-flex items-center rounded-full whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                    {t('dashboard.deviceManagement.normal')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 border-r border-gray-300 h-full">
                <div className="flex-1 max-w-[9.375rem] h-2 bg-gray-300 border border-gray-300 rounded-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-1.5 ${device.status === 'danger' ? 'bg-red-500' : device.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${device.battery}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-1000 whitespace-nowrap">{device.battery}%</span>
              </div>
              <div className="px-3 border-r border-gray-300 h-full flex items-center">
                <span className={`text-sm text-gray-1000 truncate ${language === 'en' ? 'font-mono' : ''}`}>
                  {device.lastComm.unit === 'days'
                    ? t('common.time.daysAgo', { count: device.lastComm.count })
                    : device.lastComm.unit === 'hours'
                    ? t('common.time.hoursAgo', { count: device.lastComm.count })
                    : t('common.time.minutesAgo', { count: device.lastComm.count })}
                </span>
              </div>
              <div className="px-3 h-full flex items-center">
                <span className="text-sm font-mono text-gray-1000 truncate">{device.registDate}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
