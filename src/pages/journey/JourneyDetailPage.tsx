import { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useAppStore } from '@/stores/useAppStore';
import { useUrlStateSync } from '@/hooks/useUrlStateSync';
import {
  getDeviceStatusCounts,
  getTotalDocumentSize,
  CURRENT_COMMENT_USER,
  // 언어별 데이터 조회 함수
  getJourneyByIdWithLang,
  getDeviceListWithLang,
  getEventHistoryWithLang,
  getDocumentListWithLang,
  getCommentListWithLang,
  type DeviceData,
  type DeviceStatus,
  type SignalStrength,
  type EventHistoryData,
  type EventStatus,
  type DocumentData,
  type CommentData,
  type CommentAuthor,
  type JourneyStatus,
} from '@/utils/mockData';
import { SectionCard } from '@/components/common/SectionCard';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { EnvironmentTrendSection } from '@/components/dashboard/EnvironmentTrendSection';
import { JourneyMap, BIO_MARKER_COORDS, MARKER_COORDS, type JourneyMapHandle } from '@/components/map/JourneyMap';
import { WarehouseMap } from '@/components/warehouse/WarehouseMap';
import { WAREHOUSE_MARKERS } from '@/utils/warehouseMapData';
import type { ViewMode } from '@/types/warehouse.types';
import type { EnvironmentTab } from '@/utils/environmentMockData';
import { formatTemperature } from '@/utils/temperature';

// 지도 탭 타입
type MapTab = 'journey' | 'warehouse';

// Journey 페이지 아이콘
import downloadIcon from '@/assets/journey/download.png';
import openInNewIcon from '@/assets/journey/open_in_new.png';
import checkIcon from '@/assets/journey/check.png';

// 타임라인 구간별 아이콘 (32x32 with bg-[rgba(65,125,247,0.08)] baked in)
import planeBlueIcon from '@/assets/common/plane_blue.svg';
import planeNewIcon from '@/assets/common/plane_new.svg';
import localConvinienceBlueIcon from '@/assets/common/local_convinience_blue.svg';
import convinienceNewIcon from '@/assets/common/convinience_new.svg';
import shipBlueIcon from '@/assets/common/ship_blue.svg';
import trainBlueIcon from '@/assets/common/train_blue.svg';
import truckBlueIcon from '@/assets/common/truck_blue.svg';
// 완료 마커용 (drop shadow, white border 포함)
import planeMarkerIcon from '@/assets/journey/plane.svg';
// 현재 위치 마커 (경로 및 현재 위치 맵과 동일)
import CurrentPositionIcon from '@/assets/journey/current.svg';
// 영문 출발/도착 아이콘
import departureEnIcon from '@/assets/common/departure_en.svg';
import arrivalEnIcon from '@/assets/common/arrival_en.svg';

// 공통 아이콘 (버튼, 테이블 헤더용)
import uploadIcon from '@/assets/common/upload.svg';
import downloadCommonIcon from '@/assets/common/download.svg';
import fileIcon from '@/assets/common/file.svg';
import fileBlueIcon from '@/assets/common/file-blue.svg';
import accessTimeIcon from '@/assets/common/access_time.svg';
import removeRedEyeIcon from '@/assets/common/remove_red_eye.svg';
import sortIcon from '@/assets/common/sort.svg';
import roomIcon from '@/assets/common/room.svg';
import temperatureIcon from '@/assets/common/temperature-02.svg';
import waterDamageIcon from '@/assets/common/water_damage.svg';
import warningIcon from '@/assets/common/warning.svg';
import personIcon from '@/assets/common/person.svg';
import attachmentIcon from '@/assets/common/attatchment-01.svg';
import localShippingGreyIcon from '@/assets/common/local_shipping_grey.svg';
// 구간별 요약 테이블용 회색 아이콘 (16x16)
import planeGreyIcon from '@/assets/common/plane_grey.svg';
import localConvenienceGreyIcon from '@/assets/common/local_convenience_grey.svg';
import shipGreyIcon from '@/assets/common/ship_grey.svg';
import trainGreyIcon from '@/assets/common/train_grey.svg';
import batteryStdIcon from '@/assets/common/battery_std.svg';
import signalCellularAltIcon from '@/assets/common/signal_cellular_alt.svg';
import todayIcon from '@/assets/common/today.svg';
import stickyNote2Icon from '@/assets/common/sticky_note_2.svg';
import switchCameraIcon from '@/assets/common/switch_camera.svg';
import looksOneIcon from '@/assets/common/looks_one.svg';
import searchLargeIcon from '@/assets/common/search_large.svg';
import csvDownloadIcon from '@/assets/common/csv-download.svg';
import smileyHappyPlusIcon from '@/assets/common/smiley-happy-plus.svg';
import pdfIcon from '@/assets/common/pdf-icon.svg';
import infoOutlineIcon from '@/assets/common/info_outline.svg';

// ========== 환경 데이터 설명 함수 타입 정의 ==========
type EnvironmentDescriptionFn = (
  stats: { avg: number; max: number; min: number; violations: number },
  config: { unit: string; minRange: number; maxRange: number },
  tab: EnvironmentTab
) => string;

// ========== 환경 데이터 설명 텍스트 생성 함수 (지난 18시간 동안~) ==========
// 피그마 기준 고정 텍스트 반환 (i18n 키 사용)
const createJourneyEnvironmentDescription = (translate: (key: string, options?: Record<string, unknown>) => string): EnvironmentDescriptionFn => {
  return (
    stats: { avg: number; max: number; min: number; violations: number },
    config: { unit: string; minRange: number; maxRange: number },
    tab: EnvironmentTab
  ): string => {
    const { avg, violations } = stats;
    const { unit, minRange, maxRange } = config;
    const isAvgViolation = avg < minRange || avg > maxRange;

    if (tab === 'temperature') {
      if (isAvgViolation || violations > 0) {
        return translate('journey.environment.descriptions.temperature', { avg, unit, count: violations.toLocaleString() });
      }
      const label = translate(`dashboard.environmentTrend.tabs.${tab}`);
      return translate('journey.environment.descriptions.stable', { label });
    }

    if (tab === 'humidity') {
      return translate('journey.environment.descriptions.humidity', { minRange, maxRange });
    }

    if (tab === 'shock') {
      return translate('journey.environment.descriptions.shock', { maxRange, unit });
    }

    if (tab === 'light') {
      return translate('journey.environment.descriptions.light');
    }

    const label = translate(`dashboard.environmentTrend.tabs.${tab}`);
    return translate('journey.environment.descriptions.stable', { label });
  };
};

// ========== 바이오 여정용 환경 데이터 설명 텍스트 생성 함수 ==========
// 피그마 기준 고정 텍스트 반환 (i18n 키 사용)
const createBioJourneyEnvironmentDescription = (translate: (key: string, options?: Record<string, unknown>) => string): EnvironmentDescriptionFn => {
  return (
    stats: { avg: number; max: number; min: number; violations: number },
    config: { unit: string; minRange: number; maxRange: number },
    tab: EnvironmentTab
  ): string => {
    const { avg, violations } = stats;
    const { unit, minRange, maxRange } = config;

    // 바이오 여정은 피그마 기준 텍스트 사용 (동적 값 포함)
    if (tab === 'temperature') {
      return translate('journey.environment.bio.temperature', { avg, unit, count: violations });
    }
    if (tab === 'humidity') {
      return translate('journey.environment.bio.humidity', { minRange, maxRange });
    }
    if (tab === 'shock') {
      return translate('journey.environment.bio.shock', { maxRange, unit });
    }
    if (tab === 'light') {
      return translate('journey.environment.bio.light');
    }
    // 기타 탭은 일반 메시지 사용 (i18n 키 사용)
    const tabLabel = translate(`dashboard.environmentTrend.tabs.${tab}`);
    return tabLabel + ' ' + translate('journey.environment.descriptions.dataStable');
  };
};

// ========== 배터리 바 컴포넌트 ==========
const BatteryBar = ({ percent }: { percent: number }) => {
  // 색상: 60%+ 녹색, 30-60% 주황, <30% 빨간색
  const getColor = () => {
    if (percent >= 60) return 'bg-green-500';
    if (percent >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-[9.375rem] h-[0.5rem] bg-gray-200 rounded-[0.375rem] overflow-hidden border border-gray-300">
        <div
          className={`h-full ${getColor()} rounded-[0.375rem]`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-body-s text-gray-1000">{percent}%</span>
    </div>
  );
};

// ========== 신호 강도 바 컴포넌트 ==========
const SignalBars = ({ bars, strength }: { bars: number; strength: SignalStrength }) => {
  const { t } = useTranslation();
  // 4개 바, bars 수에 따라 색상 결정
  // 4: 녹색, 2-3: 주황, 1: 빨간색
  const getColor = (active: boolean, totalBars: number) => {
    if (!active) return 'bg-gray-200';
    if (totalBars >= 4) return 'bg-green-500';
    if (totalBars >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[0.125rem] h-[1rem]">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-[0.25rem] rounded-[0.0625rem] ${getColor(level <= bars, bars)}`}
            style={{ height: `${4 + level * 3}px` }}
          />
        ))}
      </div>
      <span className="text-body-s text-gray-1000">
        {t(`journey.devices.signalLabels.${strength}`)}
      </span>
    </div>
  );
};

// ========== 상태 뱃지 컴포넌트 ==========
const StatusBadge = ({ status }: { status: DeviceStatus }) => {
  const { t } = useTranslation();
  const getStyle = () => {
    switch (status) {
      case 'in_use':
        return 'bg-primary-transparent-selected text-primary';
      case 'arrived':
        return 'bg-black-transparent-selected text-gray-1000';
      case 'stopped':
        return 'bg-red-100 text-red-600';
      case 'unused':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <span className={`px-2 h-[1.25rem] flex items-center justify-center text-[0.75rem] rounded-full ${getStyle()}`}>
      {t(`journey.devices.statusLabels.${status}`)}
    </span>
  );
};

// ========== 이벤트 상태 뱃지 컴포넌트 ==========
const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const { t } = useTranslation();
  const getStyle = () => {
    switch (status) {
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      case 'normal':
        return 'bg-green-100 text-green-700';
      case 'danger':
        return 'bg-red-100 text-red-600';
    }
  };

  return (
    <span className={`px-2 h-5 flex items-center justify-center text-xs rounded-full ${getStyle()}`}>
      {t(`journey.events.statusLabels.${status}`)}
    </span>
  );
};

// ========== 문서 유형 뱃지 컴포넌트 ==========
const DocumentTypeBadge = ({ type }: { type: string }) => (
  <span className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center justify-center font-mono text-xs text-gray-600">
    {type}
  </span>
);

// ========== 준수 항목 컴포넌트 ==========
interface ComplianceItemProps {
  label: string;
  value: string;
}

const ComplianceItem = ({ label, value }: ComplianceItemProps) => (
  <div className="flex flex-col items-center gap-2 w-[9.5rem]">
    <span className="text-label-m text-gray-600">{label}</span>
    <div className="flex items-center gap-1">
      <span className="text-display-m text-gray-1000">{value}</span>
      {/* 녹색 체크 아이콘 */}
      <img src={checkIcon} alt="check" className="w-5 h-5" />
    </div>
  </div>
);

// ========== 디바이스 테이블 컬럼 정의 (i18n 지원) ==========
const useDeviceColumns = (): TableColumn<DeviceData>[] => {
  const { t } = useTranslation();
  return useMemo(() => [
    {
      id: 'deviceId',
      label: t('journey.devices.deviceId'),
      width: 200,
      icon: <img src={sortIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-[0.8125rem] text-primary underline cursor-pointer">
          {row.deviceId}
        </span>
      ),
    },
    {
      id: 'shippingCount',
      label: t('journey.devices.shippingCount'),
      width: 200,
      icon: <img src={localShippingGreyIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-[0.8125rem] text-gray-1000">{row.shippingCount}</span>
      ),
    },
    {
      id: 'status',
      label: t('journey.devices.status'),
      width: 200,
      icon: <img src={removeRedEyeIcon} alt="" className="w-4 h-4" />,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'batteryPercent',
      label: t('journey.devices.batteryLevel'),
      width: 'flex-1',
      icon: <img src={batteryStdIcon} alt="" className="w-4 h-4" />,
      render: (row) => <BatteryBar percent={row.batteryPercent} />,
    },
    {
      id: 'signalBars',
      label: t('journey.devices.signalStrength'),
      width: 200,
      icon: <img src={signalCellularAltIcon} alt="" className="w-4 h-4" />,
      render: (row) => <SignalBars bars={row.signalBars} strength={row.signalStrength} />,
    },
    {
      id: 'lastCommunication',
      label: t('journey.devices.lastCommunication'),
      width: 200,
      icon: <img src={accessTimeIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="text-[0.8125rem] text-gray-1000">{row.lastCommunication}</span>
      ),
    },
    {
      id: 'registeredAt',
      label: t('journey.devices.registeredDate'),
      width: 200,
      icon: <img src={todayIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-[0.8125rem] text-gray-1000">{row.registeredAt}</span>
      ),
    },
  ], [t]);
};

// ========== 디바이스 사용 목록 섹션 ==========
interface DeviceListSectionProps {
  devices: DeviceData[];
}

const DeviceListSection = ({ devices }: DeviceListSectionProps) => {
  const { t } = useTranslation();
  const deviceColumns = useDeviceColumns();
  const statusCounts = getDeviceStatusCounts(devices);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 섹션 헤더 액션 (검색창 + CSV 버튼)
  const headerActions = (
    <>
      {/* 검색창 */}
      <div className="w-[16.25rem] h-[2.25rem] flex items-center gap-1.5 px-3 bg-white border border-gray-300 rounded-[0.25rem]">
        <img src={searchLargeIcon} alt="" className="w-5 h-5 shrink-0" />
        <input
          type="text"
          placeholder={t('common.keywordSearch')}
          className="flex-1 h-full bg-transparent text-body-s placeholder:text-gray-600 focus:outline-none"
        />
      </div>
      {/* CSV 다운로드 버튼 */}
      <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-[0.25rem] h-[2.25rem] px-4 text-gray-800">
        <img src={csvDownloadIcon} alt="" className="w-4 h-4" />
        <span className="text-label-m font-medium">{t('dashboard.deviceManagement.downloadCsv')}</span>
      </button>
    </>
  );

  return (
    <SectionCard
      title={t('journey.devices.title')}
      subtitle={t('journey.devices.subtitle', { count: devices.length })}
      actions={headerActions}
    >
      {/* 통계 섹션 */}
      <div className="flex items-center justify-between px-7 py-8 border-b border-gray-300">
        {/* 좌측: 설명 텍스트 */}
        <div className="w-[34.9375rem] text-[1rem] leading-[1.48] text-gray-1000 whitespace-pre-line">
          {t('journey.devices.description', {
            total: devices.length,
            inUse: statusCounts.in_use,
            arrived: statusCounts.arrived,
            activeCount: statusCounts.in_use
          })}
        </div>

        {/* 우측: 통계 */}
        <div className="flex items-center gap-3">
          {/* 미사용 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-gray-600">{t('journey.devices.statusLabels.unused')}</span>
            <span className="text-display-l text-gray-1000">
              {statusCounts.unused}EA
            </span>
          </div>

          {/* 구분선 */}
          <div className="w-px h-[3.375rem] bg-gray-300" />

          {/* 사용중 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-gray-600">{t('journey.devices.statusLabels.in_use')}</span>
            <span className="text-display-l text-gray-1000">
              {statusCounts.in_use}EA
            </span>
          </div>

          {/* 구분선 */}
          <div className="w-px h-[3.375rem] bg-gray-300" />

          {/* 정지 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-gray-600">{t('journey.devices.statusLabels.stopped')}</span>
            <span className="text-display-l text-gray-1000">
              {statusCounts.stopped}EA
            </span>
          </div>

          {/* 구분선 */}
          <div className="w-px h-[3.375rem] bg-gray-300" />

          {/* 도착 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-gray-600">{t('journey.devices.statusLabels.arrived')}</span>
            <span className="text-display-l text-gray-1000">
              {statusCounts.arrived}EA
            </span>
          </div>
        </div>
      </div>

      {/* 테이블 - DataTable 컴포넌트 사용 */}
      <DataTable<DeviceData>
        columns={deviceColumns}
        data={devices}
        rowKey="id"
        selectable
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />
    </SectionCard>
  );
};

// ========== 이벤트 이력 테이블 컬럼 정의 (i18n 지원) ==========
const useEventHistoryColumns = (): TableColumn<EventHistoryData>[] => {
  const { t } = useTranslation();
  return useMemo(() => [
    {
      id: 'time',
      label: t('journey.events.time'),
      width: 240,
      icon: <img src={accessTimeIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-body-s text-gray-1000">{row.time}</span>
      ),
    },
    {
      id: 'status',
      label: t('journey.events.status'),
      width: 200,
      icon: <img src={removeRedEyeIcon} alt="" className="w-4 h-4" />,
      render: (row) => <EventStatusBadge status={row.status} />,
    },
    {
      id: 'content',
      label: t('journey.events.content'),
      width: 'flex-1',
      icon: <img src={sortIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="text-body-s text-gray-1000 truncate">{row.content}</span>
      ),
    },
    {
      id: 'manager',
      label: t('journey.events.manager'),
      width: 200,
      icon: <img src={personIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="text-body-s text-gray-1000">{row.manager}</span>
      ),
    },
    {
      id: 'attachment',
      label: t('journey.events.attachment'),
      width: 'flex-1',
      icon: <img src={attachmentIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-[0.8125rem] text-blue-600 underline cursor-pointer truncate">
          {row.attachment}
        </span>
      ),
    },
  ], [t]);
};

// ========== 이벤트 및 알람 이력 섹션 ==========
interface EventHistorySectionProps {
  events: EventHistoryData[];
}

const EventHistorySection = ({ events }: EventHistorySectionProps) => {
  const { t } = useTranslation();
  const eventHistoryColumns = useEventHistoryColumns();
  // 섹션 헤더 액션 (검색창 + 필터 드롭다운)
  const headerActions = (
    <>
      {/* 검색창 */}
      <div className="w-[16.25rem] h-[2.25rem] flex items-center gap-1.5 px-3 bg-white border border-gray-300 rounded-[0.25rem]">
        <img src={searchLargeIcon} alt="" className="w-5 h-5 shrink-0" />
        <input
          type="text"
          placeholder={t('common.keywordSearch')}
          className="flex-1 h-full bg-transparent text-body-s placeholder:text-gray-600 focus:outline-none"
        />
      </div>
      {/* 필터 드롭다운 */}
      <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-[0.25rem] h-[2.25rem] px-4 text-gray-800">
        <span className="text-label-m">{t('journey.events.all')}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  );

  return (
    <SectionCard
      title={t('journey.events.title')}
      subtitle={t('journey.events.subtitle', { count: events.length })}
      actions={headerActions}
    >
      {/* 테이블 - DataTable 컴포넌트 사용 */}
      <DataTable<EventHistoryData>
        columns={eventHistoryColumns}
        data={events}
        rowKey="id"
      />
    </SectionCard>
  );
};

// ========== 관련 문서 테이블 컬럼 정의 (i18n 지원) ==========
const useDocumentColumns = (): TableColumn<DocumentData>[] => {
  const { t } = useTranslation();
  return useMemo(() => [
    {
      id: 'name',
      label: t('journey.documents.name'),
      width: 'flex-1',
      icon: <img src={sortIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-body-s text-gray-1000">{row.name}</span>
      ),
    },
    {
      id: 'type',
      label: t('journey.documents.type'),
      width: 200,
      icon: <img src={stickyNote2Icon} alt="" className="w-4 h-4" />,
      render: (row) => <DocumentTypeBadge type={row.type} />,
    },
    {
      id: 'uploadDate',
      label: t('journey.documents.uploadDate'),
      width: 200,
      icon: <img src={todayIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-body-s text-gray-1000">{row.uploadDate}</span>
      ),
    },
    {
      id: 'uploader',
      label: t('journey.documents.uploader'),
      width: 200,
      icon: <img src={personIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="text-body-s text-gray-1000">{row.uploader}</span>
      ),
    },
    {
      id: 'size',
      label: t('journey.documents.size'),
      width: 200,
      icon: <img src={switchCameraIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-body-s text-gray-1000">{row.size}</span>
      ),
    },
    {
      id: 'version',
      label: t('journey.documents.version'),
      width: 200,
      icon: <img src={looksOneIcon} alt="" className="w-4 h-4" />,
      render: (row) => (
        <span className="font-mono text-body-s text-gray-1000">{row.version}</span>
      ),
    },
  ], [t]);
};

// ========== 관련 문서 관리 섹션 ==========
interface DocumentManagementSectionProps {
  documents: DocumentData[];
  isBioJourney?: boolean;
}

const DocumentManagementSection = ({ documents, isBioJourney = false }: DocumentManagementSectionProps) => {
  const { t } = useTranslation();
  const documentColumns = useDocumentColumns();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const totalSize = getTotalDocumentSize(documents);

  // 섹션 헤더 액션 (3개 버튼)
  const headerActions = (
    <>
      <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-[0.25rem] h-[2.25rem] px-4 text-gray-800">
        <img src={uploadIcon} alt="" className="w-4 h-4" />
        <span className="text-label-m font-medium">{t('journey.documents.upload')}</span>
      </button>
      <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-[0.25rem] h-[2.25rem] px-4 text-gray-800">
        <img src={downloadCommonIcon} alt="" className="w-4 h-4" />
        <span className="text-label-m font-medium">{t('journey.documents.download')}</span>
      </button>
      <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-[0.25rem] h-[2.25rem] px-4 text-gray-800">
        <img src={fileBlueIcon} alt="" className="w-4 h-4" />
        <span className="text-label-m font-medium">{t('journey.documents.generateTempReport')}</span>
        <img src={infoOutlineIcon} alt="" className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <SectionCard
      title={t('journey.documents.title')}
      subtitle={t('journey.documents.subtitle', { count: documents.length, size: totalSize })}
      actions={headerActions}
    >
      {/* 준수 현황 섹션 */}
      <div className="flex items-center justify-between px-7 py-8 border-b border-gray-300">
        {/* 좌측: 설명 텍스트 */}
        <p className="text-[1rem] leading-[1.48] text-gray-1000 whitespace-pre-line shrink-0">
          {isBioJourney ? t('journey.documents.complianceDescriptionBio') : t('journey.documents.complianceDescription')}
        </p>

        {/* 우측: 준수 현황 - 도메인별 분기 */}
        <div className="flex items-center h-[3.375rem] shrink-0">
          {isBioJourney ? (
            /* 바이오 준수 현황 (피그마 1108-19756 기준: 5개 항목) */
            <>
              <ComplianceItem label={t('journey.compliance.bio.gdp')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.compliance.bio.coldchain')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.compliance.bio.coa')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.compliance.bio.tds')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.compliance.bio.customs')} value={t('journey.documents.compliance.compliant')} />
            </>
          ) : (
            /* 반도체 준수 현황 */
            <>
              <ComplianceItem label={t('journey.documents.compliance.eccn')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.documents.compliance.rohs')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.documents.compliance.msl')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.documents.compliance.esd')} value={t('journey.documents.compliance.compliant')} />
              <div className="w-px h-full bg-gray-300 mx-3" />
              <ComplianceItem label={t('journey.documents.compliance.envLog')} value={t('journey.documents.compliance.compliant')} />
            </>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <DataTable<DocumentData>
        columns={documentColumns}
        data={documents}
        rowKey="id"
        selectable
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />
    </SectionCard>
  );
};

// ========== 사용자 아바타 컴포넌트 ==========
interface UserAvatarProps {
  initials: string;
  bgColor: string;
  textColor: string;
  size?: 'sm' | 'md';  // sm: 32px, md: 48px
}

const UserAvatar = ({ initials, bgColor, textColor, size = 'md' }: UserAvatarProps) => (
  <div
    className={`rounded-full flex items-center justify-center font-normal shrink-0 ${
      size === 'sm' ? 'w-8 h-8 text-[0.75rem]' : 'w-12 h-12 text-[1rem]'
    }`}
    style={{ backgroundColor: bgColor, color: textColor }}
  >
    {initials}
  </div>
);

// ========== 코멘트 내용 컴포넌트 (멘션 하이라이트) ==========
const CommentContent = ({ content }: { content: string }) => {
  // @멘션을 파란색으로 표시
  const parts = content.split(/(@\S+)/g);
  return (
    <p className="text-body-l text-gray-1000">
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span key={i} className="text-primary">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
};

// ========== 코멘트 아이템 컴포넌트 ==========
interface CommentItemProps {
  comment: CommentData;
  isReply?: boolean;
}

// 더보기 버튼 아이콘 컴포넌트
const MoreIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

// 답글 전용 컴포넌트 (Figma 구조: 부모 콘텐츠 영역 내 중첩)
const ReplyItem = ({ comment }: { comment: CommentData }) => (
  <div className="flex gap-4 items-start w-full">
    {/* 답글 아바타: 32px */}
    <UserAvatar
      initials={comment.author.initials}
      bgColor={comment.author.avatarColor}
      textColor={comment.author.initialsColor}
      size="sm"
    />

    {/* 콘텐츠 + 더보기 버튼 */}
    <div className="flex-1 flex items-start justify-between">
      <div className="flex flex-col gap-2">
        {/* 헤더: 이름 · 팀 · 시간 - Figma: gap-[2px] */}
        <div className="flex items-center gap-[0.125rem] text-label-m">
          <span className="font-normal text-gray-1000">{comment.author.name}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-600">{comment.author.team}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-600">{comment.createdAt}</span>
        </div>

        {/* 본문 - 18px, line-height 1.48 */}
        <CommentContent content={comment.content} />
      </div>

      {/* 더보기 버튼: 24x24 */}
      <button className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
        <MoreIcon />
      </button>
    </div>
  </div>
);

// 부모 코멘트 컴포넌트 (답글 포함)
const CommentItem = ({ comment, isReply = false }: CommentItemProps) => {
  const { t } = useTranslation();

  // 답글인 경우 ReplyItem 사용
  if (isReply) {
    return <ReplyItem comment={comment} />;
  }

  return (
    <div className="flex gap-4 items-start w-full">
      {/* 아바타: 48px */}
      <UserAvatar
        initials={comment.author.initials}
        bgColor={comment.author.avatarColor}
        textColor={comment.author.initialsColor}
        size="md"
      />

      {/* 콘텐츠 영역: Figma - flex-col gap-6 (24px) for replies */}
      <div className="flex-1 flex flex-col gap-6">
        {/* 부모 코멘트 본문: gap-4 (16px) */}
        <div className="flex flex-col gap-4">
          {/* 헤더 + 본문 + 더보기 버튼 */}
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2">
              {/* 헤더: 이름 · 팀 · 시간 - Figma: gap-[2px] */}
              <div className="flex items-center gap-[0.125rem] text-label-m">
                <span className="font-normal text-gray-1000">{comment.author.name}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-600">{comment.author.team}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-600">{comment.createdAt}</span>
              </div>

              {/* 본문 - 18px, line-height 1.48 */}
              <CommentContent content={comment.content} />
            </div>

            {/* 더보기 버튼: 24x24 */}
            <button className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
              <MoreIcon />
            </button>
          </div>

          {/* 첨부파일 (피그마: 배경 gray-50, border, rounded-4px, p-16px) */}
          {comment.attachment && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition-colors">
              <img src={pdfIcon} alt="" className="w-12 h-12 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <span className="text-label-m font-medium text-gray-1000">
                  {comment.attachment.name}
                </span>
                <span className="text-label-m text-gray-600">
                  {comment.attachment.type}
                </span>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 반응 버튼: Figma - border 있음, px-12, py-8, rounded-4px */}
            <button className="flex items-center gap-1.5 bg-white border border-gray-300 rounded px-3 py-2">
              <img src={smileyHappyPlusIcon} alt="" className="w-5 h-5" />
              <span className="text-[0.875rem] text-gray-800">{t('journey.collaboration.addReaction')}</span>
            </button>
            {/* 답글 버튼: Figma - border 없음, bg-transparent, h-36px, px-16px */}
            <button className="flex items-center gap-1.5 bg-transparent h-[2.25rem] px-4 rounded">
              <span className="text-[0.875rem] font-medium text-gray-800">{t('journey.collaboration.reply')}</span>
            </button>
          </div>
        </div>

        {/* 답글들: gap-6 (24px)으로 부모 콘텐츠와 분리 */}
        {comment.replies?.map(reply => (
          <ReplyItem key={reply.id} comment={reply} />
        ))}
      </div>
    </div>
  );
};

// ========== 코멘트 입력 컴포넌트 ==========
// 패딩 제거 - 부모 컨테이너에서 처리
const CommentInput = ({ currentUser }: { currentUser: CommentAuthor }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4 items-start w-full">
      {/* 현재 사용자 아바타: 48px */}
      <UserAvatar
        initials={currentUser.initials}
        bgColor={currentUser.avatarColor}
        textColor={currentUser.initialsColor}
        size="md"
      />

      {/* 입력 영역: Figma - gap-16px */}
      <div className="flex-1 flex flex-col gap-4">
        {/* 텍스트 입력 필드: Figma - h-44px, px-12, rounded-6px */}
        <input
          type="text"
          placeholder={t('journey.collaboration.inputPlaceholder')}
          className="w-full h-[2.75rem] px-3 bg-white border border-gray-300 rounded-md text-[0.875rem] placeholder:text-gray-600 focus:outline-none focus:border-primary"
        />

        {/* 버튼 영역 */}
        <div className="flex items-center justify-between">
          {/* 파일 첨부 버튼: Figma - h-36px, px-16px, border */}
          <button className="flex items-center gap-1.5 h-[2.25rem] px-4 border border-gray-300 rounded text-gray-800 hover:bg-gray-50">
            <img src={fileIcon} alt="" className="w-4 h-4" />
            <span className="text-[0.875rem] font-medium">{t('journey.collaboration.attachFile')}</span>
          </button>

          {/* 우측 버튼들: Figma - gap-8px */}
          <div className="flex items-center gap-2">
            {/* 취소 버튼: Figma - bg-transparent, h-36px, px-16px */}
            <button className="bg-transparent h-[2.25rem] px-4 text-[0.875rem] font-medium text-gray-800">
              {t('journey.collaboration.cancel')}
            </button>
            {/* 작성 버튼: Figma - bg-primary, h-36px, px-16px */}
            <button className="h-[2.25rem] px-4 bg-primary rounded text-[0.875rem] font-medium text-white">
              {t('journey.collaboration.post')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 협업 메모 및 커뮤니케이션 섹션 ==========
interface CollaborationSectionProps {
  comments: CommentData[];
}

const CollaborationSection = ({ comments }: CollaborationSectionProps) => {
  const { t } = useTranslation();
  return (
    <SectionCard
      title={t('journey.collaboration.title')}
      subtitle={t('journey.collaboration.subtitle')}
    >
      {/* 콘텐츠 영역: Figma - px-28px, py-32px, gap-24px */}
      <div className="flex flex-col gap-6 px-7 py-8">
        {/* 새 코멘트 입력 */}
        <CommentInput currentUser={CURRENT_COMMENT_USER} />

        {/* 구분선 - 입력창과 코멘트 목록 사이 */}
        <div className="border-b border-gray-300" />

        {/* 코멘트 목록 */}
        {comments.map((comment, index) => (
          <Fragment key={comment.id}>
            {/* 부모 코멘트 (답글 포함) */}
            <CommentItem comment={comment} />
            {/* 구분선 (마지막 코멘트 제외) */}
            {index < comments.length - 1 && <div className="border-b border-gray-300" />}
          </Fragment>
        ))}

        {/* 더보기 버튼 위 구분선 */}
        <div className="border-b border-gray-300" />

        {/* 더보기 버튼 영역: Figma - 컨테이너 기준 가운데 정렬, h-36px */}
        <div className="flex justify-center w-full">
          <button className="h-9 px-4 border border-gray-300 rounded text-body-m font-normal text-gray-800 hover:bg-gray-50 transition-colors">
            {t('journey.collaboration.loadMore')}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

// ========== 구간별 요약 데이터 타입 ==========
type SegmentIconType = 'plane' | 'truck' | 'ship' | 'train' | 'warehouse';

interface SectionSummaryData {
  id: string;
  leg: string;
  iconType: SegmentIconType;
  riskScore: number;
  elapsedTime: string;
  avgTemperature: string;
  avgHumidity: string;
  eventsDetected: string; // Changed to string to support "N/A"
  hasWarehouseIcon?: boolean; // 구간 열 오른쪽에 room 아이콘 표시
}

// ========== 구간별 요약 테이블 컴포넌트 ==========
interface SectionSummaryTableProps {
  isExpanded: boolean;
  isBioJourney: boolean;
}

// 구간 아이콘 매핑
const segmentIconMap: Record<SegmentIconType, string> = {
  plane: planeGreyIcon,
  truck: localShippingGreyIcon,
  ship: shipGreyIcon,
  train: trainGreyIcon,
  warehouse: localConvenienceGreyIcon,
};

const SectionSummaryTable = ({ isExpanded, isBioJourney }: SectionSummaryTableProps) => {
  const { t, i18n } = useTranslation();
  const { language } = useLanguageStore();

  // 바이오 여정 구간별 요약 데이터 (피그마 기준)
  const bioSectionData: SectionSummaryData[] = [
    {
      id: 'leg1',
      leg: t('journey.summary.sectionTable.bio.leg1'),
      iconType: 'truck',
      riskScore: 5,
      elapsedTime: '2H',
      avgTemperature: formatTemperature(5.4, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '0EA',
    },
    {
      id: 'leg2',
      leg: t('journey.summary.sectionTable.bio.leg2'),
      iconType: 'plane',
      riskScore: 3,
      elapsedTime: '12H',
      avgTemperature: formatTemperature(3.4, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '0EA',
    },
    {
      id: 'leg3',
      leg: t('journey.summary.sectionTable.bio.leg3'),
      iconType: 'train',
      riskScore: 40,
      elapsedTime: '2D',
      avgTemperature: formatTemperature(5.0, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '4EA',
    },
    {
      id: 'leg4',
      leg: t('journey.summary.sectionTable.bio.leg4'),
      iconType: 'truck',
      riskScore: 15,
      elapsedTime: '1D 8H',
      avgTemperature: formatTemperature(4.8, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '0EA',
    },
    {
      id: 'leg5',
      leg: t('journey.summary.sectionTable.bio.leg5'),
      iconType: 'truck',
      riskScore: 5,
      elapsedTime: '2H',
      avgTemperature: formatTemperature(4.2, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '0EA',
      hasWarehouseIcon: true,
    },
  ];

  // 반도체 여정 구간별 요약 데이터 (피그마 기준)
  const semiconSectionData: SectionSummaryData[] = [
    {
      id: 'leg1',
      leg: t('journey.summary.sectionTable.semicon.leg1'),
      iconType: 'plane',
      riskScore: 45,
      elapsedTime: '1D',
      avgTemperature: formatTemperature(30.5, i18n.language),
      avgHumidity: '52.3%',
      eventsDetected: '1EA',
    },
    {
      id: 'leg2',
      leg: t('journey.summary.sectionTable.semicon.leg2'),
      iconType: 'warehouse',
      riskScore: 75,
      elapsedTime: '6H',
      avgTemperature: formatTemperature(4.8, i18n.language),
      avgHumidity: '41%',
      eventsDetected: '0EA',
    },
    {
      id: 'leg3',
      leg: t('journey.summary.sectionTable.semicon.leg3'),
      iconType: 'ship',
      riskScore: 95,
      elapsedTime: '8H',
      avgTemperature: formatTemperature(5.4, i18n.language),
      avgHumidity: '43%',
      eventsDetected: '0EA',
      hasWarehouseIcon: true, // 현재 위치 표시
    },
    {
      id: 'leg4',
      leg: t('journey.summary.sectionTable.semicon.leg4'),
      iconType: 'train',
      riskScore: 75,
      elapsedTime: '6H',
      avgTemperature: formatTemperature(4.8, i18n.language),
      avgHumidity: '41%',
      eventsDetected: '0EA',
    },
    {
      id: 'leg5',
      leg: t('journey.summary.sectionTable.semicon.leg5'),
      iconType: 'truck',
      riskScore: 95,
      elapsedTime: '8H',
      avgTemperature: formatTemperature(5.4, i18n.language),
      avgHumidity: '43%',
      eventsDetected: '0EA',
    },
  ];

  const sectionData = isBioJourney ? bioSectionData : semiconSectionData;

  if (!isExpanded) return null;

  return (
    <div className="flex flex-col w-full border-t border-[#DBDBE0]">
      {/* 헤더 행 */}
      <div className="flex items-center w-full bg-white border-b border-gray-300">
        {/* 구간 */}
        <div className="flex-1 flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3 border-r border-gray-300">
          <img src={roomIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.leg')}
          </span>
        </div>
        {/* 리스크 스코어 */}
        <div className="w-[12.5rem] flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3 border-r border-gray-300">
          <img src={sortIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.riskScore')}
          </span>
        </div>
        {/* 소요 시간 */}
        <div className="w-[12.5rem] flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3 border-r border-gray-300">
          <img src={accessTimeIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.elapsedTime')}
          </span>
        </div>
        {/* 평균 온도 */}
        <div className="w-[12.5rem] flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3 border-r border-gray-300">
          <img src={temperatureIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.avgTemperature')}
          </span>
        </div>
        {/* 평균 습도 */}
        <div className="w-[12.5rem] flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3 border-r border-gray-300">
          <img src={waterDamageIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.avgHumidity')}
          </span>
        </div>
        {/* 이벤트 발생 */}
        <div className="w-[12.5rem] flex items-center gap-1 h-full min-h-[2.625rem] px-3 py-3">
          <img src={warningIcon} alt="" className="w-4 h-4 shrink-0" />
          <span className={`text-[0.875rem] leading-tight text-gray-600 ${language === 'en' ? 'font-mono' : ''}`}>
            {t('journey.summary.sectionTable.eventsDetected')}
          </span>
        </div>
      </div>

      {/* 데이터 행 */}
      {sectionData.map((row, index) => (
        <div
          key={row.id}
          className={`flex items-center w-full h-12 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        >
          {/* 구간 */}
          <div className="flex-1 flex items-center justify-between h-full px-3 border-r border-gray-300 overflow-hidden">
            <div className="flex items-center gap-2">
              <img src={segmentIconMap[row.iconType]} alt="" className="w-4 h-4 shrink-0" />
              <span className="text-[0.875rem] leading-normal text-gray-1000 truncate">
                {row.leg}
              </span>
            </div>
            {row.hasWarehouseIcon && (
              <img src={roomIcon} alt="" className="w-5 h-5 shrink-0 ml-2" />
            )}
          </div>
          {/* 리스크 스코어 */}
          <div className="w-[12.5rem] flex items-center h-full px-3 border-r border-gray-300">
            <span className={`text-[0.875rem] text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>
              {row.riskScore}
            </span>
          </div>
          {/* 소요 시간 */}
          <div className="w-[12.5rem] flex items-center h-full px-3 border-r border-gray-300">
            <span className={`text-[0.875rem] text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>
              {row.elapsedTime}
            </span>
          </div>
          {/* 평균 온도 */}
          <div className="w-[12.5rem] flex items-center h-full px-3 border-r border-gray-300">
            <span className={`text-[0.875rem] text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>
              {row.avgTemperature}
            </span>
          </div>
          {/* 평균 습도 */}
          <div className="w-[12.5rem] flex items-center h-full px-3 border-r border-gray-300">
            <span className={`text-[0.875rem] text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>
              {row.avgHumidity}
            </span>
          </div>
          {/* 이벤트 발생 */}
          <div className="w-[12.5rem] flex items-center h-full px-3">
            <span className={`text-[0.875rem] text-gray-1000 ${language === 'en' ? 'font-mono' : ''}`}>
              {row.eventsDetected}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface JourneyDetailPageProps {
  bizCase?: 'semicon' | 'bio';
}

export const JourneyDetailPage = ({ bizCase }: JourneyDetailPageProps) => {
  const { t, i18n } = useTranslation();
  const { journeyId } = useParams<{ journeyId: string }>();
  const { currentCase, setCase } = useAppStore();

  // URL 경로에서 전달받은 bizCase로 스토어 동기화
  useEffect(() => {
    if (bizCase && bizCase !== currentCase) {
      setCase(bizCase);
    }
  }, [bizCase, currentCase, setCase]);

  // URL Query Parameter 동기화 (case)
  useUrlStateSync();

  // 현재 언어 (ko 또는 en)
  const currentLang = (i18n.language?.startsWith('en') ? 'en' : 'ko') as 'ko' | 'en';

  // 언어별 여정 데이터 조회
  const journey = journeyId ? getJourneyByIdWithLang(journeyId, currentLang) : undefined;

  // 바이오 여정 여부 판별 (use prop if provided, otherwise detect from journeyId)
  const isBioJourney = bizCase ? bizCase === 'bio' : journeyId === 'ID-SC05';

  // 언어별 데이터 선택
  const deviceData = getDeviceListWithLang(isBioJourney, currentLang);
  const eventData = getEventHistoryWithLang(isBioJourney, currentLang);
  const documentData = getDocumentListWithLang(isBioJourney, currentLang);
  const commentData = getCommentListWithLang(isBioJourney, currentLang);

  // 지도 탭 상태
  const [mapTab, setMapTab] = useState<MapTab>('journey');
  const [warehouseViewMode, setWarehouseViewMode] = useState<ViewMode>('3d');

  // JourneyMap ref (타임라인 아이콘 클릭 시 해당 좌표로 이동)
  const journeyMapRef = useRef<JourneyMapHandle>(null);

  // 구간별 요약 테이블 토글 상태 (기본: 접힌 상태)
  const [showSectionSummary, setShowSectionSummary] = useState(false);

  // i18n helper for journey status
  const getJourneyStatusLabel = (status: JourneyStatus): string => {
    return t(`journey.status.${status}`);
  };


  if (!journey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">{t('journey.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* con_1: 헤더 섹션 */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 text-gray-1000">{t('nav.journeyDetail')}</h1>
            <div className="flex items-center gap-[0.375rem]">
              <span className="bg-[rgba(23,23,28,0.08)] rounded-full h-[1.5rem] px-[0.5rem] font-mono text-[0.8125rem] text-gray-800 flex items-center">
                {journey.id}
              </span>
              <span className={`rounded-full h-[1.5rem] px-[0.5rem] font-mono text-[0.8125rem] flex items-center ${
                journey.status === 'completed'
                  ? 'bg-[rgba(23,23,28,0.08)] text-gray-800'
                  : 'bg-[rgba(65,125,247,0.08)] text-[#1858b4]'
              }`}>
                {getJourneyStatusLabel(journey.status)}
              </span>
            </div>
          </div>
          <p className="text-[1rem] leading-[1.48] text-gray-600 whitespace-pre-wrap">
            {journey.description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 h-9 px-4 bg-blue-100 rounded text-label-m-strong text-blue-600">
            <img src={openInNewIcon} alt="share" className="w-4 h-4" />
            {t('journey.actions.share')}
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 bg-primary rounded text-label-m-strong text-white">
            <img src={downloadIcon} alt="download" className="w-4 h-4" />
            {t('journey.actions.savePdf')}
          </button>
        </div>
      </div>

      {/* con_2: 기본 정보 카드 */}
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
        <div className="flex flex-col gap-6 px-[3.75rem] py-[1.75rem]">
          {/* 상단 정보 */}
          <div className="flex items-center gap-4 px-[4.5rem]">
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.deviceSN')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.deviceSN}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.transportMode')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.transportType}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.departureTime')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.departureTime}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.arrivalTime')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.arrivalTime}</span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-b border-gray-300" />

          {/* 하단 정보 (설정 범위) */}
          <div className="flex items-center gap-4 px-[4.5rem]">
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.tempThreshold')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.tempRange}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.humidityThreshold')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.humidityRange}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.shockThreshold')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.shockRange}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-label-m text-gray-600">{t('journey.info.lightThreshold')}</span>
              <span className="font-display text-[1.5rem] font-normal leading-none text-[#0A0A0A]">{journey.lightRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* con_3: 여정 요약 */}
      <SectionCard
        title={t('journey.summary.title')}
        subtitle={t('journey.summary.subtitle')}
      >
        {/* 콘텐츠 */}
        <div className="px-7 py-8">
          {/* 현재 위치 + 통계 */}
          <div className="flex items-start justify-between mb-8">
            {/* 좌측: 현재 위치 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {isBioJourney ? (
                  <>
                    <h3 className="text-[1.5rem] leading-[1.3] text-gray-1000">{t('journey.summary.bio.completed')}</h3>
                    <p className="text-sm text-gray-600">{t('journey.summary.bio.allCompleted')}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-[1.5rem] leading-[1.3] text-gray-1000">{journey.currentLocation}</h3>
                    <p className="text-sm text-gray-600">{t('journey.summary.arrivingIn', { location: t('journey.locations.seattleTerminal'), time: t('journey.summary.time15mins') })}</p>
                  </>
                )}
              </div>
              {isBioJourney ? (
                <div className="flex items-center gap-[0.375rem]">
                  <span className="bg-[rgba(23,23,28,0.08)] text-gray-800 font-mono text-[0.8125rem] px-[0.75rem] h-[1.5rem] flex items-center rounded-full">
                    04/09/2025 10:00&nbsp;{t('journey.summary.bio.completedLabel')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-[0.375rem]">
                  <span className="bg-[rgba(23,23,28,0.08)] text-gray-800 font-mono text-[0.8125rem] px-[0.75rem] h-[1.5rem] flex items-center rounded-full">
                    ETA: 10/13/2025 10:00
                  </span>
                  <span className="bg-[rgba(65,125,247,0.08)] text-[#1858b4] font-mono text-[0.8125rem] px-[0.75rem] h-[1.5rem] flex items-center rounded-full">
                    {t('journey.summary.onSchedule')}
                  </span>
                </div>
              )}
            </div>

            {/* 우측: 통계 */}
            <div className="flex items-center gap-3 h-[3.375rem]">
              <div className="flex flex-col items-center gap-2 w-[9.5rem]">
                <span className="text-label-m text-gray-600">{t('journey.summary.riskScore')}</span>
                <span className="text-display-l text-gray-1000">{journey.riskScore}</span>
              </div>
              <div className="w-px h-full bg-gray-300" />
              <div className="flex flex-col items-center gap-2 w-[9.5rem]">
                <span className="text-label-m text-gray-600">{t('journey.summary.avgTemperature')}</span>
                <span className="text-display-l text-gray-1000">{journey.avgTemp}</span>
              </div>
              <div className="w-px h-full bg-gray-300" />
              <div className="flex flex-col items-center gap-2 w-[9.5rem]">
                <span className="text-label-m text-gray-600">{t('journey.summary.avgHumidity')}</span>
                <span className="text-display-l text-gray-1000">{journey.avgHumidity}</span>
              </div>
              <div className="w-px h-full bg-gray-300" />
              <div className="flex flex-col items-center gap-2 w-[9.5rem]">
                <span className="text-label-m text-gray-600">{t('journey.summary.eventsDetected')}</span>
                <span className="text-display-l text-gray-1000">{journey.eventCount}</span>
              </div>
            </div>
          </div>

          {/* 타임라인 - 피그마 디자인 일치 (node-id=1185-21421 바이오, node-id=1185-21510 반도체) */}
          {isBioJourney ? (
            /* 바이오 콜드체인 타임라인 (모두 완료) - 피그마 node-id=1185-21421 */
            <div className="flex items-start gap-1 mb-5">
              {/* 출발 버튼 - 영문: departure_en.svg, 한글: 텍스트 버튼 */}
              {currentLang === 'en' ? (
                <img src={departureEnIcon} alt="DEP" className="size-8 shrink-0" />
              ) : (
                <div className="flex items-center justify-center size-8 bg-gray-800 rounded shrink-0">
                  <span className="text-white text-xs font-medium">{t('journey.timeline.departure')}</span>
                </div>
              )}

              {/* 구간 1: 오송 바이오단지 - 인천 공항 (완료) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-400" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={truckBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(BIO_MARKER_COORDS.osong[0], BIO_MARKER_COORDS.osong[1], 5)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.bio.osongToIncheonAirport')}</p>
                    <p className="font-mono text-gray-600">2025/04/01 06:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 2: 인천 국제공항 - LAX (완료) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-400" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={planeNewIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(BIO_MARKER_COORDS.incheonToLax[0], BIO_MARKER_COORDS.incheonToLax[1], 4)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.bio.incheonAirportToLax')}</p>
                    <p className="font-mono text-gray-600">2025/04/02 22:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 3: LAX - 시카고 (완료) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-400" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={trainBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(BIO_MARKER_COORDS.laxToChicago[0], BIO_MARKER_COORDS.laxToChicago[1], 5)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.bio.laxToChicago')}</p>
                    <p className="font-mono text-gray-600">2025/04/07 06:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 4: 시카고 - 뉴욕 (완료) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-400" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={truckBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(BIO_MARKER_COORDS.chicagoToNY[0], BIO_MARKER_COORDS.chicagoToNY[1], 5)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.bio.chicagoToNewYork')}</p>
                    <p className="font-mono text-gray-600">2025/04/08 14:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 5: 뉴욕 물류 창고 - 뉴욕 병원 (완료) - 완료 마커 포함 */}
              <div className="flex-1 flex flex-col gap-6 py-3 relative">
                <div className="h-2 w-full bg-gray-400" />
                {/* 완료 마커 - 바 위에 위치 */}
                <div className="absolute top-[1rem] left-[5%] -translate-x-1/2 -translate-y-1/2">
                  <img src={convinienceNewIcon} alt="" className="w-[2.625rem] h-[2.625rem]" />
                </div>
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={truckBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(BIO_MARKER_COORDS.newYorkHospital[0], BIO_MARKER_COORDS.newYorkHospital[1], 6)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.bio.newYorkWarehouseToHospital')}</p>
                    <p className="font-mono text-gray-600">2025/04/09 10:00</p>
                  </div>
                </div>
              </div>

              {/* 도착 버튼 - 영문: arrival_en.svg, 한글: 텍스트 버튼 */}
              {currentLang === 'en' ? (
                <img src={arrivalEnIcon} alt="ARR" className="size-8 shrink-0" />
              ) : (
                <div className="flex items-center justify-center size-8 bg-gray-800 rounded shrink-0">
                  <span className="text-white text-xs font-medium">{t('journey.timeline.arrival')}</span>
                </div>
              )}
            </div>
          ) : (
            /* 반도체 타임라인 - 피그마 node-id=1185-21510 */
            <div className="flex items-start gap-1 mb-5">
              {/* 출발 버튼 - 영문: departure_en.svg, 한글: 텍스트 버튼 */}
              {currentLang === 'en' ? (
                <img src={departureEnIcon} alt="DEP" className="size-8 shrink-0" />
              ) : (
                <div className="flex items-center justify-center size-8 bg-gray-800 rounded shrink-0">
                  <span className="text-white text-xs font-medium">{t('journey.timeline.departure')}</span>
                </div>
              )}

              {/* 구간 1: 대전 - 부산 (완료) - bg-blue-300 (#8bb9f9) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-blue-300" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={planeNewIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(MARKER_COORDS.daejeonToBusan[0], MARKER_COORDS.daejeonToBusan[1], 5)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.semicon.daejeonBusan')}</p>
                    <p className="font-mono text-gray-600">2025/08/31 10:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 2: 부산 창고 (완료) - bg-blue-300 (#8bb9f9) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-blue-300" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={localConvinienceBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(MARKER_COORDS.busanWarehouse[0], MARKER_COORDS.busanWarehouse[1], 6)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.semicon.busanWarehouse')}</p>
                    <p className="font-mono text-gray-600">2025/09/08 10:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 3: 부산 - 시애틀 (진행중) - bg-blue-500 (#1e6ee1) - 현재 위치 마커 */}
              <div className="flex-1 flex flex-col gap-6 py-3 relative">
                <div className="h-2 w-full bg-blue-500" />
                {/* 현재 위치 마커 - 경로 및 현재 위치 맵과 동일한 아이콘 사용 */}
                <div className="absolute top-[1.2rem] left-[75%] -translate-x-1/2 -translate-y-1/2">
                  {/* 펄스 애니메이션 - Grammarly-inspired box-shadow 파장 효과 (마커 정중앙 기준) */}
                  <div
                    className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[1.75rem] h-[1.75rem] rounded-full animate-pulse-marker"
                    style={{ backgroundColor: 'rgba(95, 139, 250, 0.65)' }}
                  />
                  <img
                    src={CurrentPositionIcon}
                    alt=""
                    className="relative z-10 w-[3.125rem] h-auto"
                  />
                </div>
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={shipBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(MARKER_COORDS.busanToSeattle[0], MARKER_COORDS.busanToSeattle[1], 4)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.semicon.busanSeattle')}</p>
                    <p className="font-mono text-gray-600">2025/09/25 10:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 4: 시애틀 - 시카고 (예정) - bg-gray-300 (#dcdce0) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-300" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={trainBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(MARKER_COORDS.seattleToChicago[0], MARKER_COORDS.seattleToChicago[1], 4)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.semicon.seattleChicago')}</p>
                    <p className="font-mono text-gray-600">2025/10/12 10:00</p>
                  </div>
                </div>
              </div>

              {/* 구간 5: 시카고 - 인디애나폴리스 (예정) - bg-gray-300 (#dcdce0) */}
              <div className="flex-1 flex flex-col gap-6 py-3">
                <div className="h-2 w-full bg-gray-300" />
                <div className="flex gap-3 items-start w-[16rem]">
                  <img
                    src={truckBlueIcon}
                    alt=""
                    className="size-8 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => journeyMapRef.current?.flyTo(MARKER_COORDS.chicagoToIndy[0], MARKER_COORDS.chicagoToIndy[1], 5)}
                  />
                  <div className="flex-1 flex flex-col gap-1 text-[0.8125rem]">
                    <p className="text-neutral-800 leading-none">{t('journey.timeline.semicon.chicagoIndianapolis')}</p>
                    <p className="font-mono text-gray-600">2025/10/13 10:00</p>
                  </div>
                </div>
              </div>

              {/* 도착 버튼 - 영문: arrival_en.svg, 한글: 텍스트 버튼 */}
              {currentLang === 'en' ? (
                <img src={arrivalEnIcon} alt="ARR" className="size-8 shrink-0" />
              ) : (
                <div className="flex items-center justify-center size-8 bg-gray-800 rounded shrink-0">
                  <span className="text-white text-xs font-medium">{t('journey.timeline.arrival')}</span>
                </div>
              )}
            </div>
          )}

          {/* 구간별 요약 버튼 - Figma node 1339:12142 */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowSectionSummary(prev => !prev)}
              className="flex items-center gap-[0.375rem] h-[2.25rem] px-4 border border-gray-300 rounded text-[0.875rem] font-normal leading-none text-gray-800"
            >
              {t('journey.summary.sectionSummary')}
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${showSectionSummary ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 구간별 요약 테이블 */}
        {/* 테이블은 컨테이너 전체 너비를 차지 */}
        <SectionSummaryTable isExpanded={showSectionSummary} isBioJourney={isBioJourney} />
      </SectionCard>

      {/* con_4: 경로 및 현재 위치 (지도) - Dashboard와 동일한 UI 구조 */}
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden h-[37.5rem] relative">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-[1] bg-transparent px-6 py-5 flex items-center justify-between">
          {/* Title & Subtitle */}
          <div className="flex flex-col gap-1">
            <h2 className="text-base leading-130 font-medium text-gray-1000">
              {t('dashboard.map.title')}
            </h2>
            <p className="text-label-s font-normal text-gray-600">
              {t('dashboard.map.subtitle')}
            </p>
          </div>

          {/* Tab Buttons & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Journey/Warehouse Toggle */}
            <div className="flex h-9 bg-white border border-gray-300 rounded p-1 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.16)]">
              <button
                onClick={() => setMapTab('journey')}
                className={`flex items-center justify-center px-4 h-7 rounded text-sm transition-colors ${
                  mapTab === 'journey'
                    ? 'bg-gray-200 font-medium text-gray-800'
                    : 'font-normal text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard.map.journeyMap')}
              </button>
              <button
                onClick={() => setMapTab('warehouse')}
                className={`flex items-center justify-center px-4 h-7 rounded text-sm transition-colors ${
                  mapTab === 'warehouse'
                    ? 'bg-gray-200 font-medium text-gray-800'
                    : 'font-normal text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard.map.warehouseMap')}
              </button>
            </div>

            {/* Fullscreen Button (placeholder) */}
            <button className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 rounded text-sm font-medium text-gray-800 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.16)]">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.66663 5.99992V3.99992C2.66663 3.6463 2.80710 3.30716 3.05715 3.05711C3.30720 2.80706 3.64634 2.66659 3.99996 2.66659H5.99996M10 2.66659H12C12.3536 2.66659 12.6927 2.80706 12.9428 3.05711C13.1928 3.30716 13.3333 3.6463 13.3333 3.99992V5.99992M13.3333 9.99992V11.9999C13.3333 12.3535 13.1928 12.6927 12.9428 12.9427C12.6927 13.1928 12.3536 13.3333 12 13.3333H10M5.99996 13.3333H3.99996C3.64634 13.3333 3.30720 13.1928 3.05715 12.9427C2.80710 12.6927 2.66663 12.3535 2.66663 11.9999V9.99992" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('dashboard.map.fullscreen')}
            </button>
          </div>
        </div>

        {/* Conditional Map Rendering */}
        {mapTab === 'journey' ? (
          <JourneyMap
            ref={journeyMapRef}
            className="h-full"
            isDetailPage
            isBioJourney={isBioJourney}
            onWarehouseClick={() => setMapTab('warehouse')}
          />
        ) : (
          <WarehouseMap
            viewMode={warehouseViewMode}
            onViewModeChange={setWarehouseViewMode}
            markers={WAREHOUSE_MARKERS}
          />
        )}
      </div>

      {/* con_5: 환경 데이터 모니터링 - Dashboard와 동일한 컴포넌트 사용 */}
      <EnvironmentTrendSection
        title={t('journey.environment.title')}
        subtitle={t('journey.environment.updatedAgo', { time: t('common.time.minutesAgo', { count: 1 }) })}
        actionButton={
          <button className="flex items-center gap-1.5 h-[2.25rem] px-4 bg-white border border-gray-300 rounded text-sm font-medium text-gray-800">
            <img src={downloadCommonIcon} alt="" className="w-4 h-4" />
            {t('dashboard.deviceManagement.downloadCsv')}
          </button>
        }
        customDescriptionFn={isBioJourney ? createBioJourneyEnvironmentDescription(t as (key: string, options?: Record<string, unknown>) => string) : createJourneyEnvironmentDescription(t as (key: string, options?: Record<string, unknown>) => string)}
        descriptionWidth="34.9375rem"
        statsLayout="end"
        statsFontWeight="display"
        showTargetRange
      />

      {/* con_6: 디바이스 사용 목록 */}
      <DeviceListSection devices={deviceData} />

      {/* con_7: 이벤트 및 알람 이력 */}
      <EventHistorySection events={eventData} />

      {/* con_8: 관련 문서 관리 */}
      <DocumentManagementSection documents={documentData} isBioJourney={isBioJourney} />

      {/* con_9: 협업 메모 및 커뮤니케이션 */}
      <CollaborationSection comments={commentData} />
    </div>
  );
};
