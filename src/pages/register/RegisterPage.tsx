import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUploadModal } from '@/components/common/FileUploadModal';
import { RegistrationSummaryModal, RegistrationSummaryData } from '@/components/common/RegistrationSummaryModal';
import { SuccessToast } from '@/components/common/SuccessToast';
import { REGISTER_MOCK_DATA, REGISTER_MOCK_DATA_EN, RegisterRowData } from '@/utils/mockData';
import { useLanguageStore } from '@/stores/useLanguageStore';

// SVG 아이콘 import
import SortIcon from '@/assets/common/sort.svg?react';
import ApartmentIcon from '@/assets/register/apartment.svg?react';
import RoomIcon from '@/assets/register/room.svg?react';
import TemperatureIcon from '@/assets/register/temperature.svg?react';
import WaterDamageIcon from '@/assets/register/water_damage.svg?react';
import FlashOnIcon from '@/assets/register/flash_on.svg?react';
import StackedLineChartIcon from '@/assets/register/stacked_line_chart.svg?react';
import SensorDoorIcon from '@/assets/register/sensor_door.svg?react';
import AccessTimeIcon from '@/assets/register/access_time.svg?react';
import LogoutIcon from '@/assets/register/logout.svg?react';
import LoginIcon from '@/assets/register/login.svg?react';
import DirectionsBoatIcon from '@/assets/register/directions_boat.svg?react';
import ModeEditIcon from '@/assets/register/mode_edit.svg?react';
import LocalShippingIcon from '@/assets/register/local_shipping.svg?react';

// Mock data for registration summary modal (Korean)
const REGISTRATION_SUMMARY_MOCK_DATA_KO: RegistrationSummaryData = {
  deviceCount: 10,
  containerCount: 8,
  customerDistribution: [
    { name: 'MediPharm Korea', count: 2 },
    { name: 'MediPharm Global', count: 3 },
    { name: 'BioDiagnostics Inc', count: 5 },
  ],
  routeDistribution: [
    {
      from: '부산',
      to: '용인',
      estimatedHours: 7,
      containerNumber: 'CRN-2025-0045',
      additionalCount: 4,
      count: 2,
    },
    {
      from: '오송',
      to: '뉴욕',
      estimatedHours: 60,
      containerNumber: 'CRN-2025-0062',
      additionalCount: 2,
      count: 3,
    },
    {
      from: '오송',
      to: '상하이',
      estimatedHours: 43,
      containerNumber: 'CRN-2025-0121',
      additionalCount: 1,
      count: 5,
    },
  ],
  warnings: [
    {
      title: '디바이스 D-1024 배터리 부족',
      description: '디바이스 D-1024의 배터리가 45% 미만입니다.',
      deviceId: 'D-1024',
    },
  ],
};

// Mock data for registration summary modal (English)
const REGISTRATION_SUMMARY_MOCK_DATA_EN: RegistrationSummaryData = {
  deviceCount: 10,
  containerCount: 8,
  customerDistribution: [
    { name: 'MediPharm Korea', count: 2 },
    { name: 'MediPharm Global', count: 3 },
    { name: 'BioDiagnostics Inc', count: 5 },
  ],
  routeDistribution: [
    {
      from: 'Busan',
      to: 'Yongin',
      estimatedHours: 7,
      containerNumber: 'CRN-2025-0045',
      additionalCount: 4,
      count: 2,
    },
    {
      from: 'Osong',
      to: 'New York',
      estimatedHours: 60,
      containerNumber: 'CRN-2025-0062',
      additionalCount: 2,
      count: 3,
    },
    {
      from: 'Osong',
      to: 'Shanghai',
      estimatedHours: 43,
      containerNumber: 'CRN-2025-0121',
      additionalCount: 1,
      count: 5,
    },
  ],
  warnings: [
    {
      title: 'Low Battery: Device D-1024',
      description: 'Device D-1024 battery is below 45%.',
      deviceId: 'D-1024',
    },
  ],
};

// 테이블 컬럼 정의
interface TableColumn {
  id: string;
  labelKey: string;
  width: number;
  required?: boolean;
  icon?: 'sort' | 'apartment' | 'room' | 'temperature' | 'humidity' | 'shock' | 'tilt' | 'door' | 'time' | 'logout' | 'login' | 'boat' | 'edit' | 'shipping';
}

// 19개 컬럼 (초기 상태 + 등록 완료 후)
const FULL_COLUMNS: TableColumn[] = [
  { id: 'checkbox', labelKey: '', width: 80 },
  { id: 'managementNumber', labelKey: 'register.columns.referenceNo', width: 160, required: true, icon: 'sort' },
  { id: 'productName', labelKey: 'register.columns.productName', width: 160, required: true, icon: 'sort' },
  { id: 'serialNumber', labelKey: 'register.columns.serialNo', width: 240, required: true, icon: 'sort' },
  { id: 'customer', labelKey: 'register.columns.client', width: 160, icon: 'apartment' },
  { id: 'destination', labelKey: 'register.columns.destination', width: 160, required: true, icon: 'room' },
  { id: 'tempAlarm', labelKey: 'register.columns.temperature', width: 140, icon: 'temperature' },
  { id: 'humidityAlarm', labelKey: 'register.columns.humidityAlarm', width: 142, icon: 'humidity' },
  { id: 'shockAlarm', labelKey: 'register.columns.shockAlarm', width: 140, icon: 'shock' },
  { id: 'tiltAlarm', labelKey: 'register.columns.tiltAlarm', width: 140, icon: 'tilt' },
  { id: 'doorAlarm', labelKey: 'register.columns.doorOpenAlarm', width: 142, icon: 'door' },
  { id: 'startTime', labelKey: 'register.columns.departureTime', width: 165, icon: 'time' },
  { id: 'autoRelease', labelKey: 'register.columns.autoDepart', width: 112, icon: 'logout' },
  { id: 'autoArrival', labelKey: 'register.columns.autoArrival', width: 112, icon: 'login' },
  { id: 'transport', labelKey: 'register.columns.transport', width: 112, icon: 'shipping' },
  { id: 'departurePort', labelKey: 'register.columns.departurePort', width: 160, icon: 'boat' },
  { id: 'arrivalPort', labelKey: 'register.columns.arrivalPort', width: 160, icon: 'boat' },
  { id: 'containerNumber', labelKey: 'register.columns.containerNo', width: 160, icon: 'sort' },
  { id: 'shipperCode', labelKey: 'register.columns.shipperCode', width: 160, icon: 'sort' },
  { id: 'memo', labelKey: 'register.columns.memo', width: 160, icon: 'edit' },
];

// 13개 컬럼 (파일 업로드 후)
const UPLOAD_COLUMNS: TableColumn[] = [
  { id: 'checkbox', labelKey: '', width: 80 },
  { id: 'managementNumber', labelKey: 'register.columns.referenceNo', width: 160, required: true, icon: 'sort' },
  { id: 'productName', labelKey: 'register.columns.productName', width: 160, required: true, icon: 'sort' },
  { id: 'serialNumber', labelKey: 'register.columns.serialNo', width: 240, required: true, icon: 'sort' },
  { id: 'customer', labelKey: 'register.columns.client', width: 160, icon: 'apartment' },
  { id: 'destination', labelKey: 'register.columns.destination', width: 160, required: true, icon: 'room' },
  { id: 'tempAlarm', labelKey: 'register.columns.temperature', width: 140, icon: 'temperature' },
  { id: 'humidityAlarm', labelKey: 'register.columns.humidityAlarm', width: 142, icon: 'humidity' },
  { id: 'shockAlarm', labelKey: 'register.columns.shockAlarm', width: 140, icon: 'shock' },
  { id: 'startTime', labelKey: 'register.columns.departureTime', width: 165, icon: 'time' },
  { id: 'autoRelease', labelKey: 'register.columns.autoDepart', width: 112, icon: 'logout' },
  { id: 'transport', labelKey: 'register.columns.transport', width: 112, icon: 'shipping' },
  { id: 'containerNumber', labelKey: 'register.columns.containerNo', width: 160, icon: 'sort' },
  { id: 'shipperCode', labelKey: 'register.columns.shipperCode', width: 160, icon: 'sort' },
];

// 행 데이터 타입
interface RowData {
  id: number;
  selected: boolean;
  values: Partial<RegisterRowData>;
}

// 초기 빈 행 데이터 생성
const generateEmptyRows = (count: number): RowData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    selected: false,
    values: {},
  }));
};


const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" fill="none">
  <g clip-path="url(#clip0_311_41579)">
    <path d="M20 32.0004H28C29.1 32.0004 30 31.1004 30 30.0004V20.0004H33.18C34.96 20.0004 35.86 17.8404 34.6 16.5804L25.42 7.40043C24.64 6.62043 23.38 6.62043 22.6 7.40043L13.42 16.5804C12.16 17.8404 13.04 20.0004 14.82 20.0004H18V30.0004C18 31.1004 18.9 32.0004 20 32.0004ZM12 36.0004H36C37.1 36.0004 38 36.9004 38 38.0004C38 39.1004 37.1 40.0004 36 40.0004H12C10.9 40.0004 10 39.1004 10 38.0004C10 36.9004 10.9 36.0004 12 36.0004Z" fill="#45454F"/>
  </g>
  <defs>
    <clipPath id="clip0_311_41579">
      <rect width="48" height="48" fill="white"/>
    </clipPath>
  </defs>
</svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M7.44667 0H1.33333C0.6 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V4.55333C12 4.2 11.86 3.86 11.6067 3.61333L8.38667 0.393333C8.14 0.14 7.8 0 7.44667 0ZM3.33333 8H8.66667C9.03333 8 9.33333 8.3 9.33333 8.66667C9.33333 9.03333 9.03333 9.33333 8.66667 9.33333H3.33333C2.96667 9.33333 2.66667 9.03333 2.66667 8.66667C2.66667 8.3 2.96667 8 3.33333 8ZM3.33333 5.33333H8.66667C9.03333 5.33333 9.33333 5.63333 9.33333 6C9.33333 6.36667 9.03333 6.66667 8.66667 6.66667H3.33333C2.96667 6.66667 2.66667 6.36667 2.66667 6C2.66667 5.63333 2.96667 5.33333 3.33333 5.33333ZM3.33333 2.66667H6.66667C7.03333 2.66667 7.33333 2.96667 7.33333 3.33333C7.33333 3.7 7.03333 4 6.66667 4H3.33333C2.96667 4 2.66667 3.7 2.66667 3.33333C2.66667 2.96667 2.96667 2.66667 3.33333 2.66667Z" fill="#45454F"/>
</svg>
);

const ColumnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M4 11.6787H7.33333V0H4V11.6787ZM0 11.6787H3.33333V0H0V11.6787ZM8 0V11.6787H11.3333V0H8Z" fill="#45454F"/>
</svg>
);


const getColumnIcon = (icon?: string) => {
  switch (icon) {
    case 'sort': return <SortIcon className="w-4 h-4" />;
    case 'apartment': return <ApartmentIcon className="w-4 h-4" />;
    case 'room': return <RoomIcon className="w-4 h-4" />;
    case 'temperature': return <TemperatureIcon className="w-4 h-4" />;
    case 'humidity': return <WaterDamageIcon className="w-4 h-4" />;
    case 'shock': return <FlashOnIcon className="w-4 h-4" />;
    case 'tilt': return <StackedLineChartIcon className="w-4 h-4" />;
    case 'door': return <SensorDoorIcon className="w-4 h-4" />;
    case 'time': return <AccessTimeIcon className="w-4 h-4" />;
    case 'logout': return <LogoutIcon className="w-4 h-4" />;
    case 'login': return <LoginIcon className="w-4 h-4" />;
    case 'boat': return <DirectionsBoatIcon className="w-4 h-4" />;
    case 'edit': return <ModeEditIcon className="w-4 h-4" />;
    case 'shipping': return <LocalShippingIcon className="w-4 h-4" />;
    default: return null;
  }
};

export const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'transport' | 'vehicle' | 'warehouse'>('transport');
  const [rows, setRows] = useState<RowData[]>(generateEmptyRows(25));
  const [allSelected, setAllSelected] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isRegistrationSummaryModalOpen, setIsRegistrationSummaryModalOpen] = useState(false);
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [hasData, setHasData] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  // 현재 표시할 컬럼 (업로드 후: 13개, 그 외: 19개)
  const activeColumns = isUploadView ? UPLOAD_COLUMNS : FULL_COLUMNS;

  // 탭별 카운터 (Mock - 기본값 0)
  const tabCounts = {
    transport: 0,
    vehicle: 0,
    warehouse: 0,
  };

  // 상태 카운터 (등록 완료 시 10개로 표시)
  const statusCounts = {
    completed: isRegistrationComplete ? 10 : 0,
    warning: 0,
    error: 0,
  };

  // 전체 선택 토글
  const handleSelectAll = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    setRows(rows.map(row => ({ ...row, selected: newValue })));
  };

  // 개별 행 선택
  const handleRowSelect = (id: number) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, selected: !row.selected } : row
    ));
  };

  // 셀 값 변경
  const handleCellChange = (rowId: number, columnId: string, value: string) => {
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, values: { ...row.values, [columnId]: value } }
        : row
    ));
  };

  // 파일 업로드 모달 핸들러
  const handleOpenFileUpload = () => {
    setIsFileUploadModalOpen(true);
  };

  const handleCloseFileUpload = () => {
    setIsFileUploadModalOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    // TODO: Process file (parse Excel, populate rows, etc.)
    console.log('Selected file:', file.name);
  };

  const handleSaveUploadedFile = () => {
    if (uploadedFile) {
      // 현재 언어에 따라 적절한 mock 데이터 선택
      const currentLang = i18n.language;
      const mockData = currentLang === 'en' ? REGISTER_MOCK_DATA_EN : REGISTER_MOCK_DATA;

      // Populate table with mock data (first 10 rows)
      const populatedRows = mockData.map((data, index) => ({
        id: index + 1,
        selected: false,
        values: data,
      }));

      // Add 15 empty rows after the 10 populated rows (for a total of 25)
      const emptyRows = Array.from({ length: 15 }, (_, i) => ({
        id: i + 11,
        selected: false,
        values: {},
      }));

      setRows([...populatedRows, ...emptyRows]);
      setHasData(true);
      setIsUploadView(true); // 13개 컬럼으로 전환
      setIsFileUploadModalOpen(false);
    }
  };

  // Reset 버튼 클릭 핸들러
  const handleReset = () => {
    setRows(generateEmptyRows(25));
    setHasData(false);
    setIsUploadView(false);
    setUploadedFile(null);
    setAllSelected(false);
  };

  // 등록하기 버튼 클릭 핸들러
  const handleOpenRegistrationSummary = () => {
    setIsRegistrationSummaryModalOpen(true);
  };

  const handleCloseRegistrationSummary = () => {
    setIsRegistrationSummaryModalOpen(false);
  };

  const handleConfirmRegistration = () => {
    // 모달 닫기
    setIsRegistrationSummaryModalOpen(false);
    // Toast 표시
    setIsSuccessToastVisible(true);
    // 5초 후 자동 닫기
    setTimeout(() => setIsSuccessToastVisible(false), 5000);
    // 19개 컬럼으로 전환 (데이터는 유지, 새로고침 시 초기화됨)
    setIsUploadView(false);
    // 등록 완료 상태로 설정
    setIsRegistrationComplete(true);
  };


  return (
    <div className="h-full flex flex-col">
      {/* ========== 섹션 1: 페이지 타이틀 & 상태 카운터 ========== */}
      <div className="flex items-start justify-between shrink-0 px-10">
        {/* 좌측: 타이틀 영역 */}
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-gray-1000">
            {t('register.title')}
          </h1>
          <p className="text-[1rem] leading-[1.48] text-gray-600">
            {t('register.description')}
          </p>
        </div>

        {/* 우측: 상태 카운터 */}
        <div className="flex items-center gap-3">
          {/* 입력 완료 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-black-disabled">{t('register.status.done')}</span>
            <span className="text-display-xxl text-black">{statusCounts.completed}</span>
          </div>

          {/* 구분선 */}
          <div className="w-px h-[4.625rem] bg-gray-300" />

          {/* 주의 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-black-disabled">{t('register.status.warning')}</span>
            <span className="text-display-xxl text-black">{statusCounts.warning}</span>
          </div>

          {/* 구분선 */}
          <div className="w-px h-[4.625rem] bg-gray-300" />

          {/* 오류 */}
          <div className="flex flex-col items-center gap-2 w-[9.5rem]">
            <span className="text-label-m text-black-disabled">{t('register.status.error')}</span>
            <span className="text-display-xxl text-black">{statusCounts.error}</span>
          </div>
        </div>
      </div>

      {/* ========== 섹션 2: 탭 & 액션 버튼 ========== */}
      <div className="flex flex-col gap-5 shrink-0 px-10 mt-4">
        {/* 탭 영역 */}
        <div className="flex items-center border-b border-gray-300">
          <button
            onClick={() => setActiveTab('transport')}
            className={`h-9 px-4 text-label-l-strong transition-colors relative ${
              activeTab === 'transport'
                ? 'text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('register.tabs.transport')} {tabCounts.transport}
            {activeTab === 'transport' && (
              <div className="absolute -bottom-px left-0 right-0 h-[0.1875rem] bg-primary" />
            )}
          </button>
          <button
            // onClick={() => setActiveTab('vehicle')}
            className={`h-9 px-4 text-label-l-strong transition-colors relative ${
              activeTab === 'vehicle'
                ? 'text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('register.tabs.road')} 16
            {activeTab === 'vehicle' && (
              <div className="absolute -bottom-px left-0 right-0 h-[0.1875rem] bg-primary" />
            )}
          </button>
          <button
            // onClick={() => setActiveTab('warehouse')}
            className={`h-9 px-4 text-label-l-strong transition-colors relative ${
              activeTab === 'warehouse'
                ? 'text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('register.tabs.warehouse')} 8
            {activeTab === 'warehouse' && (
              <div className="absolute -bottom-px left-0 right-0 h-[0.1875rem] bg-primary" />
            )}
          </button>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="flex items-center justify-between">
          {/* 좌측 버튼 그룹 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFileUpload}
              className="h-9 px-4 bg-white border border-gray-300 rounded flex items-center gap-1.5 text-label-m-strong text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <UploadIcon />
              <span>{t('register.actions.uploadFile')}</span>
            </button>
            <button className="h-9 px-4 bg-white border border-gray-300 rounded flex items-center gap-1.5 text-label-m-strong text-gray-800 hover:bg-gray-50 transition-colors">
              <FileIcon />
              <span>{t('register.actions.autoFill')}</span>
            </button>
            <button className="h-9 px-4 bg-white border border-gray-300 rounded flex items-center gap-1.5 text-label-m-strong text-gray-800 hover:bg-gray-50 transition-colors">
              <ColumnIcon />
              <span>{t('register.actions.columnSettings')}</span>
            </button>
          </div>

          {/* 우측 버튼 그룹 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-9 px-4 bg-transparent rounded text-label-m-strong text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {t('register.actions.reset')}
            </button>
            <button className="h-9 px-4 bg-blue-100 rounded text-label-m-strong text-blue-600 hover:bg-blue-200 transition-colors">
              {t('register.actions.saveDraft')}
            </button>
            <button
              disabled={!hasData}
              onClick={handleOpenRegistrationSummary}
              className={`h-9 px-4 rounded text-label-m-strong transition-colors ${
                hasData
                  ? 'bg-primary text-white hover:bg-[var(--btn-primary-hover)] cursor-pointer'
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
            >
              {t('register.actions.submit')}
            </button>
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 데이터 테이블 (edge-to-edge) ========== */}
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain mt-5">
        <div className="min-w-max">
          {/* 테이블 헤더 - 스크롤 시 테이블 상단에 고정 */}
          <div className="flex bg-white border-t border-b border-gray-300 sticky top-0 z-[5]">
            {activeColumns.map((column) => (
              <div
                key={column.id}
                className="flex items-center px-3 h-11 border-r border-gray-300"
                style={{ width: column.width }}
              >
                {column.id === 'checkbox' ? (
                  <div className="flex items-center justify-center w-full">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 overflow-hidden min-w-0">
                    {column.icon && (
                      <span className="text-gray-400 shrink-0">
                        {getColumnIcon(column.icon)}
                      </span>
                    )}
                    <span className={`text-label-m text-gray-600 whitespace-nowrap overflow-hidden ${language === 'en' ? 'font-mono' : ''}`}>
                      {column.labelKey ? t(column.labelKey as never) : ''}
                    </span>
                    {column.required && (
                      <span className="text-primary text-label-m shrink-0">*</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 테이블 바디 */}
          <div className="flex flex-col">
            {rows.map((row, rowIndex) => (
              <div 
                key={row.id} 
                className={`flex h-12 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                {activeColumns.map((column) => (
                  <div
                    key={`${row.id}-${column.id}`}
                    className="flex items-center px-3 border-r border-gray-300"
                    style={{ width: column.width }}
                  >
                    {column.id === 'checkbox' ? (
                      <div className="flex items-center justify-center w-full">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleRowSelect(row.id)}
                          className="w-5 h-5 border border-gray-400 rounded-none bg-white appearance-none cursor-pointer"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={(row.values as Record<string, string | undefined>)[column.id] || ''}
                        onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
                        placeholder={column.labelKey ? t(column.labelKey as never) : ''}
                        className={`w-full h-full bg-transparent text-label-m text-gray-1000 placeholder:text-gray-400 focus:outline-none ${
                          language === 'en' ? 'font-mono' : ''
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== 파일 업로드 모달 ========== */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={handleCloseFileUpload}
        onFileSelect={handleFileSelect}
        onSave={handleSaveUploadedFile}
      />

      {/* ========== 등록 요약 모달 ========== */}
      <RegistrationSummaryModal
        isOpen={isRegistrationSummaryModalOpen}
        onClose={handleCloseRegistrationSummary}
        onConfirm={handleConfirmRegistration}
        data={i18n.language === 'en' ? REGISTRATION_SUMMARY_MOCK_DATA_EN : REGISTRATION_SUMMARY_MOCK_DATA_KO}
      />

      {/* ========== 등록 완료 Toast ========== */}
      <SuccessToast
        isVisible={isSuccessToastVisible}
        onClose={() => setIsSuccessToastVisible(false)}
        deviceCount={REGISTRATION_SUMMARY_MOCK_DATA_KO.deviceCount}
      />
    </div>
  );
};
