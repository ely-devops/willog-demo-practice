import { BizCase } from '@/stores/useAppStore';

// ========== 현재 사용자 프로필 (Header용) ==========
export interface UserProfile {
  name: string;
  initials: string;
  role: string;
}

export const CURRENT_USER: UserProfile = {
  name: 'Min Jun Kim',
  initials: 'MJ',
  role: 'Supply Chain Director',
};

// ========== 도메인(비즈니스 케이스) 목록 ==========
export interface DomainInfo {
  id: BizCase;
  label: string;
}

export const DOMAIN_LIST: DomainInfo[] = [
  { id: 'semicon', label: '반도체 고가 물류' },
  { id: 'bio', label: '바이오 콜드체인' },
  { id: 'fnb', label: '식음료 콜드체인' },
  { id: 'general', label: '일반 화물' },
];

// 도메인 ID로 라벨 조회
export const getDomainLabel = (id: BizCase): string => {
  return DOMAIN_LIST.find(d => d.id === id)?.label ?? '';
};

// ========== 여정(Journey) 데이터 ==========
export type JourneyStatus = 'shipping' | 'completed' | 'pending' | 'delayed';

export interface JourneyData {
  id: string;
  productName: string;
  customer: string;
  currentLocation: string;
  status: JourneyStatus;
  arrivalEstimate: string;
  // 상세 페이지용 추가 필드
  deviceSN: string;
  transportType: string;
  departureTime: string;
  arrivalTime: string;
  tempRange: string;
  humidityRange: string;
  shockRange: string;
  lightRange: string;
  // 여정 요약 데이터
  riskScore: number;
  avgTemp: string;
  avgHumidity: string;
  eventCount: number;
  description: string;
}

export const JOURNEY_DATA: JourneyData[] = [
  {
    id: 'ID-SC01',
    productName: '고가 반도체',
    customer: 'TechCore Systems',
    currentLocation: '시애틀 터미널 부근',
    status: 'shipping',
    arrivalEstimate: '12일 10시간 1분 후 도착 예정',
    deviceSN: 'VC3928128',
    transportType: '차량, 선박, 기차',
    departureTime: '2025-08-30 10:00',
    arrivalTime: '2025-10-13 10:00',
    tempRange: '20-25°C',
    humidityRange: '40-60%',
    shockRange: '2G 이하',
    lightRange: 'N/A',
    riskScore: 90,
    avgTemp: '23.5°C',
    avgHumidity: '52.3%',
    eventCount: 178,
    description: '시애틀 터미널에서 환적 준비 중이며 최근 24시간 온도는 20~25°C로 안정적으로 유지되었습니다.\n하역 과정에서 2G 초과 충격이 간헐적으로 감지되었으나 이상 징후는 없으며 일정은 정상적으로 10/13 10:00 인디애나폴리스 도착 예정입니다.',
  },
];

// ========== 바이오 콜드체인 여정 상세 데이터 (ID-SC05) ==========
// 피그마 기준 데이터

// 1. 여정 상세 데이터
export interface BioJourneyDetailData extends JourneyData {
  totalDuration: string;
}

export const BIO_JOURNEY_DETAIL_DATA: BioJourneyDetailData = {
  id: 'ID-SC05',
  productName: '바이오 의약품',
  customer: 'Medipharm Global',
  currentLocation: '뉴욕 병원 물류센터',
  status: 'completed',
  arrivalEstimate: 'N/A',
  deviceSN: 'VC1127841',
  transportType: '차량, 항공, 기차',
  departureTime: '2025-04-01 06:00',
  arrivalTime: '2025-04-09 10:00',
  tempRange: '2-8°C',
  humidityRange: '40-60%',
  shockRange: '2G 이하',
  lightRange: 'N/A',
  riskScore: 85,
  avgTemp: '4.5°C',
  avgHumidity: '42%',
  eventCount: 2,
  totalDuration: '8일 3시간',
  description: '총 8일간의 바이오 의약품 운송 여정이 성공적으로 완료되었습니다.\n미국 내륙 구간에서 일시적인 온도 상승이 있었으나 허용 범위 관리 하에 안정적으로 복구되어, 전체 일정에 맞춰 정상 도착했습니다.',
};

// 2. 바이오 여정 디바이스 목록 데이터
// 피그마 기준: 3대 (미사용 0EA, 사용중 0EA, 정지 2EA, 도착 1EA)
export const BIO_JOURNEY_DEVICE_LIST_DATA: DeviceData[] = [
  {
    id: '1',
    deviceId: 'VC1127841',
    shippingCount: 1,
    status: 'arrived',
    batteryPercent: 45,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '5일 전',
    registeredAt: '2025/04/01',
  },
  {
    id: '2',
    deviceId: 'VC1127842',
    shippingCount: 1,
    status: 'stopped',
    batteryPercent: 32,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '5일 전',
    registeredAt: '2025/04/01',
  },
  {
    id: '3',
    deviceId: 'VC1127843',
    shippingCount: 1,
    status: 'stopped',
    batteryPercent: 28,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '5일 전',
    registeredAt: '2025/04/01',
  },
];

// 3. 바이오 여정 이벤트 이력 데이터 (피그마 1178-100637 기준)
export const BIO_JOURNEY_EVENT_DATA: EventHistoryData[] = [
  {
    id: '1',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: '전체 운송 기간 습도 안정 유지, 바이오 보관 환경 적합',
    manager: '정가은',
    attachment: '20260409_Temp_Humidity_Log_VC1127841.xlsx',
  },
  {
    id: '2',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: '전 구간 충격 이벤트 0회 확인, 화물 물리적 안정성 확보',
    manager: '정가은',
    attachment: 'Waybill_ICNY1253177890_Signed.pdf',
  },
  {
    id: '3',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: '전체 운송 기간 중 온도 99.6% 유지, 전반적으로 안정적 운송 완료',
    manager: '최수용',
    attachment: 'Incident_Report_Temp_Excursion_20260406.xlsx',
  },
  {
    id: '4',
    time: '2025-04-06 05:10',
    status: 'warning',
    content: '온도 이탈 종료 및 정상 범위 복귀, 추가 모니터링 권장',
    manager: '이서준',
    attachment: 'Quality_Compliance_Certificate_v2.pdf',
  },
  {
    id: '5',
    time: '2025-04-06 04:20',
    status: 'danger',
    content: '30분간 온도 8°C 초과 지속, 바이오 의약품 품질 점검 필요',
    manager: '이서준',
    attachment: 'Calibration_Cert_Device_VC1127841.xlsx',
  },
  {
    id: '6',
    time: '2026-04-06 04:40',
    status: 'danger',
    content: '미국 내륙 운송 중 온도 9.0°C 감지, 콜드체인 기준 초과 발생',
    manager: '이서준',
    attachment: 'Incheon_Cargo_Loading_Proof_20260402.xlsx',
  },
];

// 4. 바이오 여정 문서 목록 데이터 (피그마 1108-19756 기준)
export const BIO_JOURNEY_DOCUMENT_DATA: DocumentData[] = [
  {
    id: '1',
    name: 'Technical Data Sheet (TDS)',
    type: 'TDS',
    uploadDate: '2025-04-07',
    uploader: '김영희',
    size: '4.0MB',
    version: 'v3',
  },
  {
    id: '2',
    name: 'Certificate of Analysis (CoA)',
    type: 'CoA',
    uploadDate: '2025-03-28',
    uploader: '정가은',
    size: '2.3MB',
    version: 'v1',
  },
  {
    id: '3',
    name: 'Product Specification Sheet',
    type: 'PSS',
    uploadDate: '2025-03-26',
    uploader: '홍길동',
    size: '3.0MB',
    version: 'v1.1',
  },
  {
    id: '4',
    name: 'Safety Data Sheet (SDS)',
    type: 'SDS',
    uploadDate: '2025-03-25',
    uploader: '이수민',
    size: '1.5MB',
    version: 'v2',
  },
  {
    id: '5',
    name: 'Material Safety Data Sheet (MSDS)',
    type: 'MSDS',
    uploadDate: '2025-03-25',
    uploader: '최지민',
    size: '2.0MB',
    version: 'v4',
  },
];

// 5. 바이오 여정 협업 메모 데이터 (피그마 941-47024 기준)
export const BIO_JOURNEY_COMMENT_DATA: CommentData[] = [
  {
    id: 'bio-comment-1',
    author: {
      id: 'user-cs',
      name: '김철수',
      initials: 'CS',
      team: '운송 3팀',
      avatarColor: '#e7eede',
      initialsColor: '#727d60',
    },
    content: '온도 상승 이벤트에 대한 냉각 시스템 조치 보고서 공유드립니다.',
    createdAt: '5분 전',
    attachment: {
      id: 'attachment-1',
      name: '조치_보고서.pdf',
      type: 'PDF',
    },
  },
  {
    id: 'bio-comment-2',
    author: {
      id: 'user-yh',
      name: '이영희',
      initials: 'YH',
      team: '운송 담당자',
      avatarColor: '#e1deee',
      initialsColor: '#746c96',
    },
    content: '여정 완료됐습니다. 모든 디바이스 정상 작동 확인했습니다.  @박상아 문서 준비 완료 확인 부탁드립니다.',
    createdAt: '5일 전',
    replies: [
      {
        id: 'bio-comment-2-reply-1',
        author: {
          id: 'user-sa',
          name: '박상아',
          initials: 'SA',
          team: '운송 책임자',
          avatarColor: '#eee0de',
          initialsColor: '#986c66',
        },
        content: '@이영희 네, 모든 문서 업로드 완료했습니다. ',
        createdAt: '5일 전',
      },
    ],
  },
];

// 여정 ID로 여정 데이터 조회
export const getJourneyById = (id: string): JourneyData | undefined => {
  if (id === 'ID-SC05') {
    return BIO_JOURNEY_DETAIL_DATA;
  }
  return JOURNEY_DATA.find(j => j.id === id);
};

// 여정 상태 라벨 조회
export const getJourneyStatusLabel = (status: JourneyStatus): string => {
  const labels: Record<JourneyStatus, string> = {
    shipping: '운송중',
    completed: '완료',
    pending: '대기',
    delayed: '지연',
  };
  return labels[status];
};

// ========== 페이지별 콘텐츠 ==========
interface PageContent {
  title: string;
  description: string;
  stats: { label: string; value: string; status?: 'normal' | 'warning' | 'danger' }[];
}

type MockData = Record<BizCase, {
  dashboard: PageContent;
  register: PageContent;
  management: PageContent;
  intelligence: PageContent;
  history: PageContent;
}>;

export const MOCK_DATA: MockData = {
  bio: {
    dashboard: {
      title: '바이오 콜드체인 대시보드',
      description: '의약품 및 백신 운송 현황을 실시간으로 모니터링합니다. 온도 민감도가 매우 높습니다.',
      stats: [
        { label: '온도 준수율', value: '99.8%', status: 'normal' },
        { label: '이탈 발생', value: '2건', status: 'danger' },
        { label: '배송 중', value: '15건', status: 'normal' },
      ]
    },
    register: {
      title: '바이오 물품 등록',
      description: '백신, 혈액 제제 등 온도 관리가 필수적인 품목을 등록합니다.',
      stats: []
    },
    management: {
      title: '디바이스/운송 관리 (바이오)',
      description: '초저온 냉동고 및 운송 차량의 상태를 관리합니다.',
      stats: []
    },
    intelligence: {
      title: '바이오 데이터 분석',
      description: '온도 이탈 패턴 및 리스크 예측 리포트입니다.',
      stats: []
    },
    history: {
      title: '운송 이력 (바이오)',
      description: '과거 운송 기록 및 온도 로그를 조회합니다.',
      stats: []
    }
  },
  fnb: {
    dashboard: {
      title: '식음료 콜드체인 대시보드',
      description: '신선 식품 및 가공 식품의 운송 환경을 모니터링합니다.',
      stats: [
        { label: '신선도 유지', value: '95%', status: 'normal' },
        { label: '배송 지연', value: '5건', status: 'warning' },
        { label: '배송 중', value: '120건', status: 'normal' },
      ]
    },
    register: {
      title: '식음료 품목 등록',
      description: '유통기한과 보관 온도가 중요한 식품류를 등록합니다.',
      stats: []
    },
    management: {
      title: '차량/창고 관리',
      description: '냉장/냉동 트럭 및 물류 창고 현황입니다.',
      stats: []
    },
    intelligence: {
      title: '수요/폐기 예측',
      description: '계절별 수요 및 폐기율 감소를 위한 인사이트입니다.',
      stats: []
    },
    history: {
      title: '배송 이력 (F&B)',
      description: '납품처별 배송 완료 내역입니다.',
      stats: []
    }
  },
  semicon: {
    dashboard: {
      title: '반도체 고가 물류 대시보드',
      description: '충격 및 진동에 민감한 정밀 기기 운송 현황입니다.',
      stats: [
        { label: '충격 감지', value: '0건', status: 'normal' },
        { label: '도착 예정', value: '3건', status: 'normal' },
        { label: '보안 경보', value: '0건', status: 'normal' },
      ]
    },
    register: {
      title: '정밀 기기 등록',
      description: '웨이퍼, 장비 등 고가 물품 정보를 등록합니다. 시리얼 넘버 필수.',
      stats: []
    },
    management: {
      title: '특수 차량 관리',
      description: '무진동 차량 배차 및 이동 경로 관리입니다.',
      stats: []
    },
    intelligence: {
      title: '충격 리스크 분석',
      description: '운송 경로상 위험 구간 분석 데이터입니다.',
      stats: []
    },
    history: {
      title: '운송 이력 (반도체)',
      description: '구간별 충격 로그 및 인수인계 기록입니다.',
      stats: []
    }
  },
  general: {
    dashboard: {
      title: '일반 화물 대시보드',
      description: '일반 공산품 및 자재 운송 현황입니다.',
      stats: [
        { label: '배송 완료', value: '85%', status: 'normal' },
        { label: '배송 중', value: '340건', status: 'normal' },
        { label: '이슈 발생', value: '1건', status: 'warning' },
      ]
    },
    register: {
      title: '일반 화물 등록',
      description: '표준 규격 화물 정보를 등록합니다.',
      stats: []
    },
    management: {
      title: '통합 물류 관리',
      description: '전체 차량 및 배송 기사 배정 현황입니다.',
      stats: []
    },
    intelligence: {
      title: '운송 효율 분석',
      description: '최적 경로 및 유류비 절감 리포트입니다.',
      stats: []
    },
    history: {
      title: '배송 이력 (일반)',
      description: '월별 배송 실적 및 고객 컴플레인 내역입니다.',
      stats: []
    }
  }
};

// ========== 등록 페이지 테이블 데이터 ==========
export interface RegisterRowData {
  managementNumber: string;      // 관리번호
  productName: string;            // 제품명
  serialNumber: string;           // S/N
  customer: string;               // 고객사
  destination: string;            // 도착지
  tempAlarm: string;              // 온도 알람
  humidityAlarm: string;          // 습도 알람
  shockAlarm: string;             // 충격 알람
  tiltAlarm: string;              // 기울기 알람
  doorAlarm: string;              // 문열림 알람
  startTime: string;              // 시작 시간
  autoRelease: string;            // 자동 출고
  autoArrival: string;            // 자동 도착
  transport: string;              // 운송수단
  departurePort: string;          // 출발항
  arrivalPort: string;            // 도착항
  containerNumber: string;        // 컨테이너 번호
  shipperCode: string;            // 선사코드
  memo: string;                   // 메모
}

export const REGISTER_MOCK_DATA: RegisterRowData[] = [
  {
    managementNumber: '2025Q1201-01',
    productName: '바이오 의약품 mRNA-1273',
    serialNumber: '7148291',
    customer: 'MediPharm Global',
    destination: 'NYC',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-01 08:38',
    autoRelease: '10분 후',
    autoArrival: '',
    transport: '항공+철도',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE12345KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1201-02',
    productName: '단클론 항체 항암제',
    serialNumber: '7148292',
    customer: 'MediPharm Global',
    destination: 'NYC',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-01 08:38',
    autoRelease: '10분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE56790OZ',
    shipperCode: 'OZ',
    memo: '',
  },
  {
    managementNumber: '2025Q1202-01',
    productName: '유전자치료 벡터',
    serialNumber: '7148293',
    customer: 'BioDiagnostics Inc.',
    destination: 'PVG',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-02 06:15',
    autoRelease: '5분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKN33421KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1202-02',
    productName: '세포치료제 중간물',
    serialNumber: '7148294',
    customer: 'MediPharm Global',
    destination: 'NYC',
    tempAlarm: '-25°C / -15°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-02 11:48',
    autoRelease: '10분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE00210KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1203-01',
    productName: '백신 보조제',
    serialNumber: '7148295',
    customer: 'BioDiagnostics Inc.',
    destination: 'PVG',
    tempAlarm: '15°C / 25°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-03 09:00',
    autoRelease: '10분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE77110CX',
    shipperCode: 'CX',
    memo: '',
  },
  {
    managementNumber: '2025Q1203-02',
    productName: '임상시료 카트',
    serialNumber: '7148296',
    customer: 'MediPharm Korea',
    destination: '광인 물류센터',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-03 22:18',
    autoRelease: '10분 후',
    autoArrival: '',
    transport: '차량',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'N/A',
    shipperCode: 'N/A',
    memo: '',
  },
  {
    managementNumber: '2025Q1204-01',
    productName: '임상시료 카트',
    serialNumber: '7148297',
    customer: 'MediPharm Korea',
    destination: '광인 물류센터',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-04 07:20',
    autoRelease: '20분 후',
    autoArrival: '',
    transport: '차량',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'N/A',
    shipperCode: 'N/A',
    memo: '',
  },
  {
    managementNumber: '2025Q1204-02',
    productName: '인슐린 바이오시밀러',
    serialNumber: '7148298',
    customer: 'BioDiagnostics Inc.',
    destination: 'PVG',
    tempAlarm: '2°C / 8°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '1.5G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-04 13:45',
    autoRelease: '25분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE3002150',
    shipperCode: 'SQ',
    memo: '',
  },
  {
    managementNumber: '2025Q1205-03',
    productName: '혈장 단백질 원료',
    serialNumber: '7148299',
    customer: 'BioDiagnostics Inc.',
    destination: 'PVG',
    tempAlarm: '-25°C / -15°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-05 05:30',
    autoRelease: '20분 후',
    autoArrival: '',
    transport: '항공',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE55061JL',
    shipperCode: 'JL',
    memo: '',
  },
  {
    managementNumber: '2025Q1205-01',
    productName: '혈장 단백질 원료',
    serialNumber: '7148300',
    customer: 'BioDiagnostics Inc.',
    destination: 'PVG',
    tempAlarm: '-25°C / -15°C',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-05 18:00',
    autoRelease: '20분 후',
    autoArrival: '',
    transport: '해상',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'MSCU1234567',
    shipperCode: 'MSC',
    memo: '',
  },
];

// 영문 버전 등록 페이지 테이블 데이터
export const REGISTER_MOCK_DATA_EN: RegisterRowData[] = [
  {
    managementNumber: '2025Q1201-01',
    productName: 'Biopharmaceuti...',
    serialNumber: '7148291',
    customer: 'MediPharm Glob...',
    destination: 'NYC',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-01 08:00',
    autoRelease: 'In 10 min',
    autoArrival: '',
    transport: 'Air+Rail',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE12345KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1201-02',
    productName: 'Monoclonal Ant...',
    serialNumber: '7148292',
    customer: 'MediPharm Glob...',
    destination: 'NYC',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-01 08:30',
    autoRelease: 'In 10 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE56790OZ',
    shipperCode: 'OZ',
    memo: '',
  },
  {
    managementNumber: '2025Q1202-01',
    productName: 'Gene Therapy V...',
    serialNumber: '7148293',
    customer: 'BioDiagnostics...',
    destination: 'PVG',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-02 06:15',
    autoRelease: 'In 5 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKN33421KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1202-02',
    productName: 'Cell Therapy I...',
    serialNumber: '7148294',
    customer: 'MediPharm Glob...',
    destination: 'NYC',
    tempAlarm: '-13°F / 5°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-02 11:48',
    autoRelease: 'In 10 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE00210KE',
    shipperCode: 'KE',
    memo: '',
  },
  {
    managementNumber: '2025Q1203-01',
    productName: 'Vaccine Adjuva...',
    serialNumber: '7148295',
    customer: 'BioDiagnostics...',
    destination: 'PVG',
    tempAlarm: '59°F / 77°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-03 09:00',
    autoRelease: 'In 20 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE77110CX',
    shipperCode: 'CX',
    memo: '',
  },
  {
    managementNumber: '2025Q1203-02',
    productName: 'Clinical Trial...',
    serialNumber: '7148296',
    customer: 'MediPharm Korea',
    destination: 'Yongin Logistics',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-03 22:18',
    autoRelease: 'In 10 min',
    autoArrival: '',
    transport: 'Road',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'N/A',
    shipperCode: 'N/A',
    memo: '',
  },
  {
    managementNumber: '2025Q1204-01',
    productName: 'Clinical Trial...',
    serialNumber: '7148297',
    customer: 'MediPharm Korea',
    destination: 'Yongin Logistics',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-04 07:28',
    autoRelease: 'In 20 min',
    autoArrival: '',
    transport: 'Road',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'N/A',
    shipperCode: 'N/A',
    memo: '',
  },
  {
    managementNumber: '2025Q1204-02',
    productName: 'Insulin Biosim...',
    serialNumber: '7148298',
    customer: 'BioDiagnostics...',
    destination: 'PVG',
    tempAlarm: '36°F / 46°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '1.5G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-04 13:45',
    autoRelease: 'In 20 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE3002150',
    shipperCode: 'SQ',
    memo: '',
  },
  {
    managementNumber: '2025Q1205-03',
    productName: 'Plasma-Derived...',
    serialNumber: '7148299',
    customer: 'BioDiagnostics...',
    destination: 'PVG',
    tempAlarm: '-13°F / 5°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-05 05:38',
    autoRelease: 'In 20 min',
    autoArrival: '',
    transport: 'Air',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'AKE55061JL',
    shipperCode: 'JL',
    memo: '',
  },
  {
    managementNumber: '2025Q1205-01',
    productName: 'Plasma-Derived...',
    serialNumber: '7148300',
    customer: 'BioDiagnostics...',
    destination: 'PVG',
    tempAlarm: '-13°F / 5°F',
    humidityAlarm: '38% / 68%',
    shockAlarm: '2G',
    tiltAlarm: '2G',
    doorAlarm: '2G',
    startTime: '2025-12-05 10:00',
    autoRelease: 'In 20 min',
    autoArrival: '',
    transport: 'Sea',
    departurePort: '',
    arrivalPort: '',
    containerNumber: 'MSCU1234567',
    shipperCode: 'MSC',
    memo: '',
  },
];

// ========== 디바이스 사용 목록 데이터 (Phase 6) ==========
export type DeviceStatus = 'unused' | 'in_use' | 'stopped' | 'arrived';
export type SignalStrength = 'excellent' | 'good' | 'weak' | 'poor' | 'none';

export interface DeviceData {
  id: string;
  deviceId: string;           // VC3928128 형태
  shippingCount: number;      // 운송횟수
  status: DeviceStatus;       // 상태
  batteryPercent: number;     // 배터리 잔량 (0-100)
  signalStrength: SignalStrength; // 신호 강도 레벨
  signalBars: number;         // 신호 바 개수 (1-5)
  lastCommunication: string;  // "1분 전", "3일 전" 등
  registeredAt: string;       // "2025/04/01" 형식
}

export const DEVICE_LIST_DATA: DeviceData[] = [
  {
    id: '1',
    deviceId: 'VC3928128',
    shippingCount: 1,
    status: 'in_use',
    batteryPercent: 85,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '1분 전',
    registeredAt: '2025/04/01',
  },
  {
    id: '2',
    deviceId: 'VC3928129',
    shippingCount: 2,
    status: 'arrived',
    batteryPercent: 96,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '3일 전',
    registeredAt: '2025/04/02',
  },
  {
    id: '3',
    deviceId: 'VC3928138',
    shippingCount: 3,
    status: 'arrived',
    batteryPercent: 45,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '4일 전',
    registeredAt: '2025/04/03',
  },
  {
    id: '4',
    deviceId: 'VC3928131',
    shippingCount: 4,
    status: 'arrived',
    batteryPercent: 67,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '4일 전',
    registeredAt: '2025/04/04',
  },
  {
    id: '5',
    deviceId: 'VC3928132',
    shippingCount: 5,
    status: 'arrived',
    batteryPercent: 24,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '5일 전',
    registeredAt: '2025/04/06',
  },
];

// 디바이스 상태 라벨 조회
export const getDeviceStatusLabel = (status: DeviceStatus): string => {
  const labels: Record<DeviceStatus, string> = {
    unused: '미사용',
    in_use: '운송중',
    stopped: '정지',
    arrived: '도착',
  };
  return labels[status];
};

// 디바이스 상태별 개수 계산
export const getDeviceStatusCounts = (devices: DeviceData[]) => {
  return {
    unused: devices.filter(d => d.status === 'unused').length,
    in_use: devices.filter(d => d.status === 'in_use').length,
    stopped: devices.filter(d => d.status === 'stopped').length,
    arrived: devices.filter(d => d.status === 'arrived').length,
  };
};

// 신호 강도 라벨 조회
export const getSignalStrengthLabel = (strength: SignalStrength): string => {
  const labels: Record<SignalStrength, string> = {
    excellent: '정상',
    good: '정상',
    weak: '약함',
    poor: '약함',
    none: '없음',
  };
  return labels[strength];
};

// ========== 이벤트 및 알람 이력 데이터 (Phase 7) ==========
export type EventStatus = 'warning' | 'normal' | 'danger';

export interface EventHistoryData {
  id: string;
  time: string;           // "2025-09-10 15:00" 형식
  status: EventStatus;    // 상태 (주의/정상/위험)
  content: string;        // 이벤트 내용
  manager: string;        // 담당자
  attachment: string;     // 첨부파일명
}

export const EVENT_HISTORY_DATA: EventHistoryData[] = [
  {
    id: '1',
    time: '2025-09-10 15:00',
    status: 'warning',
    content: '해상 구간 25°C 초과 상태 24시간 지속, 냉각 성능 점검 권장',
    manager: '최수용',
    attachment: 'Incident_Report_Temp_Excursion_20260406.xlsx',
  },
  {
    id: '2',
    time: '2025-09-08 10:00',
    status: 'normal',
    content: '해상 운송(부산→시애틀) 출발, 센서/로그 정상 작동',
    manager: '이서준',
    attachment: 'Quality_Compliance_Certificate_v2.pdf',
  },
  {
    id: '3',
    time: '2025-09-04 12:45',
    status: 'danger',
    content: '해상 구간 온도 48.5°C 기록(상한 25°C 초과), 즉시 냉각 필요',
    manager: '이서준',
    attachment: 'Calibration_Cert_Device_VC1127841.xlsx',
  },
  {
    id: '4',
    time: '2025-08-30 16:25',
    status: 'warning',
    content: '출고 시 문열림 감지(조도 2,251 lx)',
    manager: '이서준',
    attachment: 'Incheon_Cargo_Loading_Proof_20260402.xlsx',
  },
];

// 이벤트 상태 라벨 조회
export const getEventStatusLabel = (status: EventStatus): string => {
  const labels: Record<EventStatus, string> = {
    warning: '주의',
    normal: '정상',
    danger: '위험',
  };
  return labels[status];
};

// ========== 관련 문서 관리 데이터 (Phase 8) ==========
export interface DocumentData {
  id: string;
  name: string;           // 문서명
  type: string;           // 유형 (LOG, PACK, ESD, MSL)
  uploadDate: string;     // 업로드일 "2025-09-30" 형식
  uploader: string;       // 업로드자
  size: string;           // 크기 "4.1MB" 형식
  version: string;        // 버전 "v1" 형식
}

export const DOCUMENT_DATA: DocumentData[] = [
  {
    id: '1',
    name: 'Transport Env. Log & Cal Cert',
    type: 'LOG',
    uploadDate: '2025-09-30',
    uploader: '정가은',
    size: '4.1MB',
    version: 'v1',
  },
  {
    id: '2',
    name: 'Semiconductor Packaging Spec & Seal Evidence',
    type: 'PACK',
    uploadDate: '2025-08-31',
    uploader: '이수민',
    size: '3.4MB',
    version: 'v2',
  },
  {
    id: '3',
    name: 'ESD Handling Plan & Compliance (IEC 61340)',
    type: 'ESD',
    uploadDate: '2025-08-30',
    uploader: '홍길동',
    size: '1.2MB',
    version: 'v1.1',
  },
  {
    id: '4',
    name: 'MSL & Bake Record (JEDEC J-STD-033)',
    type: 'MSL',
    uploadDate: '2025-08-30',
    uploader: '김영희',
    size: '1.6MB',
    version: 'v3',
  },
];

// 문서 용량 합계 계산 헬퍼
export const getTotalDocumentSize = (documents: DocumentData[]): string => {
  const total = documents.reduce((sum, doc) => {
    const num = parseFloat(doc.size.replace('MB', ''));
    return sum + num;
  }, 0);
  return `${total.toFixed(1)}MB`;
};

// ========== 협업 메모 및 커뮤니케이션 데이터 (Phase 9) ==========
export interface CommentAuthor {
  id: string;
  name: string;           // "김철수"
  initials: string;       // "CS"
  team: string;           // "운송 3팀"
  avatarColor: string;    // "#e7eede" (배경색)
  initialsColor: string;  // "#727d60" (이니셜 색상)
}

// 첨부파일 타입 (피그마 기준: PDF 파일 표시용)
export interface CommentAttachment {
  id: string;
  name: string;      // "조치_보고서.pdf"
  type: string;      // "PDF"
}

export interface CommentData {
  id: string;
  author: CommentAuthor;
  content: string;        // "@박상아 문서 준비 완료 확인 부탁드립니다."
  createdAt: string;      // "5분 전", "25일 전"
  attachment?: CommentAttachment;  // 첨부파일 (선택)
  replies?: CommentData[]; // 답글 (중첩)
}

// 현재 로그인 사용자 (코멘트 입력용)
export const CURRENT_COMMENT_USER: CommentAuthor = {
  id: 'user-oh',
  name: '오현진',
  initials: 'OH',
  team: '운송 관리팀',
  avatarColor: '#dee6ee',
  initialsColor: '#748897',
};

export const COMMENT_DATA: CommentData[] = [
  {
    id: 'comment-1',
    author: {
      id: 'user-cs',
      name: '김철수',
      initials: 'CS',
      team: '운송 3팀',
      avatarColor: '#e7eede',
      initialsColor: '#727d60',
    },
    content: '시애틀 터미널에서 환적 준비 중입니다. 세관 신고 관련 서류 첨부 요청드립니다.',
    createdAt: '5분 전',
  },
  {
    id: 'comment-2',
    author: {
      id: 'user-jm',
      name: '홍지민',
      initials: 'JM',
      team: '운송 1팀',
      avatarColor: '#dee7ee',
      initialsColor: '#7e8f9c',
    },
    content: '여정 시작합니다. 모든 디바이스 정상 작동 확인했습니다. @박상아 문서 준비 완료 확인 부탁드립니다.',
    createdAt: '25일 전',
    replies: [
      {
        id: 'comment-2-reply-1',
        author: {
          id: 'user-sa',
          name: '박상아',
          initials: 'SA',
          team: '운송 책임자',
          avatarColor: '#eee0de',
          initialsColor: '#986c66',
        },
        content: '@이영희 네, 모든 문서 업로드 완료했습니다.',
        createdAt: '25일 전',
      },
    ],
  },
];

// ========== 바이오 콜드체인 도메인 데이터 ==========

// 바이오 KPI 데이터 (피그마 311:36551 기준)
export interface BioKpiData {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  change: number;
  isPositiveChange: boolean;
  description: string;
}

export const BIO_KPI_DATA: BioKpiData[] = [
  {
    id: 'temperatureCompliance',
    title: '온도 준수율',
    subtitle: '목표치(95%) 대비 초과 달성',
    value: '99.6%',
    change: 1.5,
    isPositiveChange: true,
    description: '전체 운송의 99.6%에서 온도 범위를 유지했습니다.',
  },
  {
    id: 'qualityRetention',
    title: '품질 유지율',
    subtitle: '목표치(98%) 대비 초과 달성',
    value: '99.8%',
    change: 1.8,
    isPositiveChange: true,
    description: '손상이나 오염 없이 초기 품질 상태 그대로 도착했습니다.',
  },
  {
    id: 'onTimeArrival',
    title: '정시 도착률',
    subtitle: '목표치(90%) 대비 초과 달성',
    value: '100%',
    change: 3.5,
    isPositiveChange: true,
    description: '모든 화물이 예정 시간보다 평균 30분 조기 도착했습니다.',
  },
  {
    id: 'eventRate',
    title: '이벤트 발생률',
    subtitle: '목표치(0%) 대비 초과 달성',
    value: '0.4%',
    change: -2.1,
    isPositiveChange: true, // 이벤트 발생률은 낮을수록 좋음
    description: '발생 빈도는 낮으나 품질 영향도가 높습니다.',
  },
];

// 바이오 AI 인사이트 데이터 (피그마 311:37638 기준)
export type BioInsightStatus = 'danger' | 'warning' | 'suggestion';

export interface BioAiInsight {
  id: string;
  status: BioInsightStatus;
  confidence: number;
  title: string;
  description: string;
  actions: { label: string; type: 'primary' | 'secondary' | 'tertiary' }[];
}

export const BIO_AI_INSIGHTS: BioAiInsight[] = [
  {
    id: 'bio-insight-1',
    status: 'danger',
    confidence: 78,
    title: '새벽 시간대 온도 관리 취약, 콜드체인 모니터링 사각지대 감지',
    description: '온도 일탈이 총 4회 연속 발생했으나 즉각적인 대응이 이뤄지지 않은 것으로 확인되었습니다. 야간 운송 모니터링 및 프로세스 보완이 필요합니다.',
    actions: [
      { label: '긴급조치', type: 'primary' },
      { label: '상세보기', type: 'secondary' },
      { label: '무시하기', type: 'tertiary' },
    ],
  },
  {
    id: 'bio-insight-2',
    status: 'warning',
    confidence: 76,
    title: '미국 내륙 운송 구간에서 온도 일탈 발생',
    description: '미국 내륙 복합 운송 중 온도가 최대 9.0°C까지 상승하며 권장 범위를 약 30분간 초과했습니다.',
    actions: [
      { label: '상세보기', type: 'secondary' },
      { label: '무시하기', type: 'tertiary' },
    ],
  },
  {
    id: 'bio-insight-3',
    status: 'warning',
    confidence: 71,
    title: '오송 출발 경로 운송 소요 시간 증가 관측, 대체 경로 검토 권장',
    description: '과거 이력 및 시뮬레이션 결과, 수도권 주요 간선 대체 경로 이용 시 최대 1.5시간 단축과 유류비 절감이 예상됩니다.',
    actions: [
      { label: '상세보기', type: 'secondary' },
      { label: '무시하기', type: 'tertiary' },
    ],
  },
  {
    id: 'bio-insight-4',
    status: 'suggestion',
    confidence: 87,
    title: '인천 - LAX 전 구간 온도 100% 준수, 우수한 품질 성과 확인',
    description: '과거 동일 항공 루트 운송 이력에서도 일관되게 높은 온도 관리 안정성이 확인되었습니다. 온도 리스크가 높은 노선의 개선에 활용을 권장합니다.',
    actions: [
      { label: '경로 적용', type: 'primary' },
      { label: '상세보기', type: 'secondary' },
      { label: '무시하기', type: 'tertiary' },
    ],
  },
];

// 바이오 실시간 알림 데이터 (피그마 311:37497 기준)
export type BioAlertStatus = 'normal' | 'warning' | 'danger';

export interface BioNotification {
  id: string;
  status: BioAlertStatus;
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
}

export const BIO_NOTIFICATIONS: BioNotification[] = [
  {
    id: 'bio-alert-1',
    status: 'normal',
    title: '최종 인도 완료 (뉴욕 병원)',
    description: '냉장 검수 및 수령 서명이 완료되었습니다.',
    timeAgo: '5일 전',
    timestamp: '04.09.2025 10:00',
  },
  {
    id: 'bio-alert-2',
    status: 'normal',
    title: '콜드체인 유지율 99.6% 달성',
    description: '전체 운송 기간 중 온도 기준을 99.6% 충족했습니다.',
    timeAgo: '6일 전',
    timestamp: '04.08.2025 07:50',
  },
  {
    id: 'bio-alert-3',
    status: 'normal',
    title: '충격 이벤트 0회 확인',
    description: '전 구간에서 충격 없이 안정적으로 운송되었습니다.',
    timeAgo: '6일 전',
    timestamp: '04.08.2025 07:50',
  },
  {
    id: 'bio-alert-4',
    status: 'warning',
    title: '미국 내륙 구간 집중 이탈',
    description: '전체 온도 이탈이 미국 내륙 운송 구간에 집중되었습니다.',
    timeAgo: '8일 전',
    timestamp: '04.06.2025 06:00',
  },
  {
    id: 'bio-alert-5',
    status: 'warning',
    title: '온도 정상 범위 복귀',
    description: '온도가 정상 범위로 복귀하여 추가 모니터링이 필요합니다.',
    timeAgo: '8일 전',
    timestamp: '04.06.2025 05:10',
  },
  {
    id: 'bio-alert-6',
    status: 'danger',
    title: '30분 연속 온도 초과 (8.2~9.0°C)',
    description: '04:20~04:50 동안 4회 연속 온도 이탈이 발생했습니다.\n즉시 확인이 필요합니다.',
    timeAgo: '8일 전',
    timestamp: '04.06.2025 04:50',
  },
  {
    id: 'bio-alert-7',
    status: 'danger',
    title: '온도 9.0°C 감지',
    description: '미국 내륙 운송 중 온도가 허용 범위(2~8°C)를 초과했으며,\n즉시 확인이 필요합니다.',
    timeAgo: '8일 전',
    timestamp: '04.06.2025 04:40',
  },
  {
    id: 'bio-alert-8',
    status: 'danger',
    title: '온도 이탈 지속 감지',
    description: '설정 온도 초과 상태가 30분간 지속되고 있습니다.\n즉시 확인이 필요합니다.',
    timeAgo: '8일 전',
    timestamp: '04.06.2025 04:30',
  },
];

// 바이오 환경 데이터 트렌드 (피그마 311:36551 기준)
export interface BioEnvironmentTrend {
  title: string;
  subtitle: string;
  description: string;
  stats: {
    avgTemp: string;
    maxTemp: string;
    minTemp: string;
    deviationCount: number;
  };
}

export const BIO_ENVIRONMENT_TREND: BioEnvironmentTrend = {
  title: '환경 데이터 트렌드',
  subtitle: '각 운송 구간의 성과 및 리스크 평가',
  description: '지난 24시간 동안 평균 온도는 4.5℃로 안정적이나, 온도 이탈이 총 4회 감지되었습니다',
  stats: {
    avgTemp: '4.5°C',
    maxTemp: '9.0°C',
    minTemp: '2.0°C',
    deviationCount: 4,
  },
};

// 바이오 진행 중인 작업 테이블 데이터 (피그마 311:36551 기준)
export interface BioJourneyTableData {
  id: string;
  productName: string;
  customer: string;
  currentLocation: string;
  status: 'completed' | 'shipping' | 'pending';
  arrivalEstimate: string;
}

export const BIO_JOURNEY_TABLE_DATA: BioJourneyTableData[] = [
  {
    id: 'ID-SC05',
    productName: '바이오 의약품',
    customer: 'Medipharm Global',
    currentLocation: '뉴욕 병원 도착',
    status: 'completed',
    arrivalEstimate: 'N/A',
  },
];

// 바이오 진행 중인 작업 요약 (피그마 311:36551 기준)
export interface BioJourneySummary {
  title: string;
  subtitle: string;
  description: string;
}

export const BIO_JOURNEY_SUMMARY: BioJourneySummary = {
  title: '진행 중인 작업',
  subtitle: '전체 5개의 작업',
  description: '등록된 총 5대의 디바이스 중 1대가 운송을 완료하였으며, 나머지 4대는 정지 상태입니다. 현재 활성화된 운송 건은 없으며, 도착한 기기의 데이터 회수가 가능합니다.',
};

// 바이오 디바이스 통합 관리 데이터 (피그마 311:36551 기준)
export type BioDeviceStatus = 'danger' | 'warning' | 'normal';

export interface BioDeviceData {
  id: string;
  journeyId: string;
  status: BioDeviceStatus;
  batteryPercent: number;
  lastCommunicationMinutes: number; // 분 단위 숫자값 (i18n 처리용)
  registeredAt: string;
}

export const BIO_DEVICE_DATA: BioDeviceData[] = [
  {
    id: 'D-1024',
    journeyId: 'SC05',
    status: 'danger',
    batteryPercent: 14,
    lastCommunicationMinutes: 1,
    registeredAt: '2025/04/01',
  },
  {
    id: 'D-2048',
    journeyId: 'SC06',
    status: 'danger',
    batteryPercent: 8,
    lastCommunicationMinutes: 2,
    registeredAt: '2025/04/02',
  },
  {
    id: 'D-3072',
    journeyId: 'SC07',
    status: 'danger',
    batteryPercent: 11,
    lastCommunicationMinutes: 5,
    registeredAt: '2025/04/03',
  },
  {
    id: 'D-2112',
    journeyId: 'SC08',
    status: 'danger',
    batteryPercent: 18,
    lastCommunicationMinutes: 3,
    registeredAt: '2025/04/04',
  },
  {
    id: 'D-2132',
    journeyId: 'SC09',
    status: 'warning',
    batteryPercent: 22,
    lastCommunicationMinutes: 1,
    registeredAt: '2025/04/06',
  },
  {
    id: 'D-4156',
    journeyId: 'SC10',
    status: 'danger',
    batteryPercent: 19,
    lastCommunicationMinutes: 10,
    registeredAt: '2025/04/07',
  },
  {
    id: 'D-5201',
    journeyId: 'SC11',
    status: 'warning',
    batteryPercent: 23,
    lastCommunicationMinutes: 15,
    registeredAt: '2025/04/08',
  },
  {
    id: 'D-6328',
    journeyId: 'SC12',
    status: 'warning',
    batteryPercent: 20,
    lastCommunicationMinutes: 8,
    registeredAt: '2025/04/09',
  },
  {
    id: 'D-7445',
    journeyId: 'SC13',
    status: 'warning',
    batteryPercent: 24,
    lastCommunicationMinutes: 12,
    registeredAt: '2025/04/10',
  },
];

// 바이오 디바이스 통합 관리 요약 (피그마 311:36551 기준)
export interface BioDeviceSummary {
  title: string;
  subtitle: string;
  actionRequired: number;
  description: string;
  statusBar: {
    danger: number;
    warning: number;
    normal: number;
  };
  warningMessage: string;
}

export const BIO_DEVICE_SUMMARY: BioDeviceSummary = {
  title: '디바이스 통합 관리',
  subtitle: '전체 250개의 디바이스',
  actionRequired: 9,
  description: '전체 디바이스 중 9대에서 위험 또는 주의 상태입니다. 주요 원인은 배터리 잔량 부족(15% 미만) 및 온도 관리 이슈이며, 데이터 유실 방지를 위해 즉시 조치가 필요합니다',
  statusBar: {
    danger: 3,
    warning: 6,
    normal: 249,
  },
  warningMessage: '위험 (3개): D-1024 배터리가 15% 미만입니다. 즉시 교체하세요.',
};

// 바이오 지도 경로 데이터
export interface BioRouteData {
  coordinates: {
    osong: [number, number];          // 오송
    incheon: [number, number];        // 인천공항(ICN)
    lax: [number, number];            // LAX
    usInland: [number, number];       // 미국 내륙 (경고 위치)
    newYorkHospital: [number, number]; // 뉴욕 병원
  };
  currentLocation: {
    name: string;
    speed: string;
    remainingDistance: string;
  };
  warningMarker: {
    location: string;
    duration: string;
    avgSpeed: string;
  };
}

export const BIO_ROUTE_DATA: BioRouteData = {
  coordinates: {
    osong: [127.3, 36.6],
    incheon: [126.4, 37.5],
    lax: [-118.4, 33.9],
    usInland: [-95.0, 38.0],
    newYorkHospital: [-74.0, 40.7],
  },
  currentLocation: {
    name: '뉴욕 병원',
    speed: '0km/h',
    remainingDistance: '0km',
  },
  warningMarker: {
    location: '뉴욕 병원 인근',
    duration: '25min',
    avgSpeed: '116km/h',
  },
};

// ========== 영문 데이터 (English Data) ==========
// 피그마 영문 버전 기준

// 1. 여정 데이터 (영문) - ID-SC01 반도체
export const JOURNEY_DATA_EN: JourneyData[] = [
  {
    id: 'ID-SC01',
    productName: 'High-Value Semiconductor',
    customer: 'TechCore Systems',
    currentLocation: 'Near Seattle Terminal',
    status: 'shipping',
    arrivalEstimate: 'Arriving in 12d 10h 1m',
    deviceSN: 'VC3928128',
    transportType: 'Road, Ocean, Rail',
    departureTime: '2025-08-30 10:00',
    arrivalTime: '2025-10-13 10:00',
    tempRange: '68.0–77.0°F',
    humidityRange: '40-60%',
    shockRange: '< 2G',
    lightRange: 'N/A',
    riskScore: 90,
    avgTemp: '74.3°F',
    avgHumidity: '52.3%',
    eventCount: 178,
    description: 'Currently preparing for transshipment at Seattle Terminal. Temperature remained stable (68.0–77.0°F) over the past 24 hours.\nIntermittent shocks (>2G) detected during unloading showed no anomalies. Shipment is on schedule for arrival in Indianapolis on Oct 13, 10:00.',
  },
];

// 2. 바이오 여정 상세 데이터 (영문) - ID-SC05
export const BIO_JOURNEY_DETAIL_DATA_EN: BioJourneyDetailData = {
  id: 'ID-SC05',
  productName: 'Biopharmaceutical',
  customer: 'Medipharm Global',
  currentLocation: 'New York Hospital Logistics Center',
  status: 'completed',
  arrivalEstimate: 'N/A',
  deviceSN: 'VC1127841',
  transportType: 'Road, Air, Rail',
  departureTime: '2025-04-01 06:00',
  arrivalTime: '2025-04-09 10:00',
  tempRange: '35.6–46.4°F',
  humidityRange: '40-60%',
  shockRange: '< 2G',
  lightRange: 'N/A',
  riskScore: 85,
  avgTemp: '40.1°F',
  avgHumidity: '42%',
  eventCount: 2,
  totalDuration: '8d 3h',
  description: '8-day biopharmaceutical journey successfully completed. A temporary temperature excursion occurred\nduring the U.S. inland segment but was stabilized within tolerance limits. Shipment arrived on schedule.',
};

// 3. 디바이스 목록 데이터 (영문) - ID-SC01
export const DEVICE_LIST_DATA_EN: DeviceData[] = [
  {
    id: '1',
    deviceId: 'VC3928128',
    shippingCount: 1,
    status: 'in_use',
    batteryPercent: 85,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '1 min ago',
    registeredAt: '2025/09/10',
  },
  {
    id: '2',
    deviceId: 'VC3928129',
    shippingCount: 2,
    status: 'arrived',
    batteryPercent: 96,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '3 days ago',
    registeredAt: '2025/09/09',
  },
  {
    id: '3',
    deviceId: 'VC3928130',
    shippingCount: 3,
    status: 'arrived',
    batteryPercent: 45,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '4 days ago',
    registeredAt: '2025/09/08',
  },
  {
    id: '4',
    deviceId: 'VC3928131',
    shippingCount: 4,
    status: 'arrived',
    batteryPercent: 67,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '4 days ago',
    registeredAt: '2025/09/07',
  },
  {
    id: '5',
    deviceId: 'VC3928132',
    shippingCount: 5,
    status: 'arrived',
    batteryPercent: 24,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '5 days ago',
    registeredAt: '2025/09/06',
  },
];

// 4. 바이오 여정 디바이스 목록 (영문) - ID-SC05
export const BIO_JOURNEY_DEVICE_LIST_DATA_EN: DeviceData[] = [
  {
    id: '1',
    deviceId: 'VC1127841',
    shippingCount: 1,
    status: 'arrived',
    batteryPercent: 45,
    signalStrength: 'good',
    signalBars: 4,
    lastCommunication: '5 days ago',
    registeredAt: '2025/04/01',
  },
  {
    id: '2',
    deviceId: 'VC1127842',
    shippingCount: 1,
    status: 'stopped',
    batteryPercent: 32,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '5 days ago',
    registeredAt: '2025/04/01',
  },
  {
    id: '3',
    deviceId: 'VC1127843',
    shippingCount: 1,
    status: 'stopped',
    batteryPercent: 28,
    signalStrength: 'weak',
    signalBars: 2,
    lastCommunication: '5 days ago',
    registeredAt: '2025/04/01',
  },
];

// 5. 이벤트 및 알람 이력 (영문) - ID-SC01
export const EVENT_HISTORY_DATA_EN: EventHistoryData[] = [
  {
    id: '1',
    time: '2025-09-10 15:00',
    status: 'warning',
    content: 'Temperature > 77°F for 24h during ocean segment. Cooling system check recommended.',
    manager: 'Suyong Choi',
    attachment: 'Incident_Report_Temp_Excursion_20260406.xlsx',
  },
  {
    id: '2',
    time: '2025-09-08 10:00',
    status: 'normal',
    content: 'Departed Busan–Seattle (Ocean). Sensors/Logs normal.',
    manager: 'Seojun Lee',
    attachment: 'Quality_Compliance_Certificate_v2.pdf',
  },
  {
    id: '3',
    time: '2025-09-04 12:45',
    status: 'danger',
    content: 'Temperature 119.3°F recorded (exceeds 77°F limit). Immediate cooling required.',
    manager: 'Seojun Lee',
    attachment: 'Calibration_Cert_Device_VC1127841.xlsx',
  },
  {
    id: '4',
    time: '2025-08-30 16:25',
    status: 'warning',
    content: 'Door opening detected at gate-out (Light: 2,251 lx).',
    manager: 'Seojun Lee',
    attachment: 'Incheon_Cargo_Loading_Proof_20260402.xlsx',
  },
];

// 6. 바이오 여정 이벤트 이력 (영문) - ID-SC05 (피그마 1178-100637 기준)
export const BIO_JOURNEY_EVENT_DATA_EN: EventHistoryData[] = [
  {
    id: '1',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: 'Humidity stable throughout transport. Bio storage conditions met.',
    manager: 'Gaeun Jeong',
    attachment: '20260409_Temp_Humidity_Log_VC1127841.xlsx',
  },
  {
    id: '2',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: 'Zero shock events confirmed across all segments. Physical stability secured.',
    manager: 'Gaeun Jeong',
    attachment: 'Waybill_ICNY1253177890_Signed.pdf',
  },
  {
    id: '3',
    time: '2025-04-08 07:50',
    status: 'normal',
    content: '99.6% temperature compliance maintained. Stable transport completed.',
    manager: 'Suyong Choi',
    attachment: 'Incident_Report_Temp_Excursion_20260406.xlsx',
  },
  {
    id: '4',
    time: '2025-04-06 05:10',
    status: 'warning',
    content: 'Temperature excursion ended and returned to normal range. Additional monitoring recommended.',
    manager: 'Seojun Lee',
    attachment: 'Quality_Compliance_Certificate_v2.pdf',
  },
  {
    id: '5',
    time: '2025-04-06 04:20',
    status: 'danger',
    content: 'Temperature exceeded 46.4°F for 30 minutes. Bio pharmaceutical quality inspection required.',
    manager: 'Seojun Lee',
    attachment: 'Calibration_Cert_Device_VC1127841.xlsx',
  },
  {
    id: '6',
    time: '2026-04-06 04:40',
    status: 'danger',
    content: 'Temperature 48.2°F detected during U.S. inland transport. Cold chain limit exceeded.',
    manager: 'Seojun Lee',
    attachment: 'Incheon_Cargo_Loading_Proof_20260402.xlsx',
  },
];

// 7. 문서 목록 (영문) - ID-SC01
export const DOCUMENT_DATA_EN: DocumentData[] = [
  {
    id: '1',
    name: 'Transport Env. Log & Cal Cert',
    type: 'LOG',
    uploadDate: '2025-09-30',
    uploader: 'Gaeun Jeong',
    size: '4.1MB',
    version: 'v1',
  },
  {
    id: '2',
    name: 'Semiconductor Packaging Spec & Seal Evidence',
    type: 'PACK',
    uploadDate: '2025-08-31',
    uploader: 'Sumin Lee',
    size: '3.4MB',
    version: 'v2',
  },
  {
    id: '3',
    name: 'ESD Handling Plan & Compliance (IEC 61340)',
    type: 'ESD',
    uploadDate: '2025-08-30',
    uploader: 'Gildong Hong',
    size: '1.2MB',
    version: 'v1.1',
  },
  {
    id: '4',
    name: 'MSL & Bake Record (JEDEC J-STD-033)',
    type: 'MSL',
    uploadDate: '2025-08-30',
    uploader: 'Younghee Kim',
    size: '1.6MB',
    version: 'v3',
  },
];

// 8. 바이오 여정 문서 목록 (영문) - ID-SC05
export const BIO_JOURNEY_DOCUMENT_DATA_EN: DocumentData[] = [
  {
    id: '1',
    name: 'Technical Data Sheet (TDS)',
    type: 'TDS',
    uploadDate: '2025-04-07',
    uploader: 'Younghee Kim',
    size: '4.0MB',
    version: 'v3',
  },
  {
    id: '2',
    name: 'Certificate of Analysis (CoA)',
    type: 'CoA',
    uploadDate: '2025-03-28',
    uploader: 'Gaeun Jeong',
    size: '2.3MB',
    version: 'v1',
  },
  {
    id: '3',
    name: 'Product Specification Sheet',
    type: 'PSS',
    uploadDate: '2025-03-26',
    uploader: 'Gildong Hong',
    size: '3.0MB',
    version: 'v1.1',
  },
  {
    id: '4',
    name: 'Safety Data Sheet (SDS)',
    type: 'SDS',
    uploadDate: '2025-03-25',
    uploader: 'Sumin Lee',
    size: '1.5MB',
    version: 'v2',
  },
  {
    id: '5',
    name: 'Material Safety Data Sheet (MSDS)',
    type: 'MSDS',
    uploadDate: '2025-03-25',
    uploader: 'Jimin Choi',
    size: '2.0MB',
    version: 'v4',
  },
];

// 9. 협업 메모 (영문) - ID-SC01
export const COMMENT_DATA_EN: CommentData[] = [
  {
    id: 'comment-1',
    author: {
      id: 'user-cs',
      name: 'Chulsoo Kim',
      initials: 'CS',
      team: 'Operations Team 3',
      avatarColor: '#e7eede',
      initialsColor: '#727d60',
    },
    content: 'Preparing for transshipment at Seattle Terminal. Please upload required customs declaration docs.',
    createdAt: '5 mins ago',
  },
  {
    id: 'comment-2',
    author: {
      id: 'user-jm',
      name: 'Jimin Hong',
      initials: 'JM',
      team: 'Operations Team 1',
      avatarColor: '#dee7ee',
      initialsColor: '#7e8f9c',
    },
    content: 'Journey started. All devices confirmed operational. @Sangah Park, please confirm docs are ready.',
    createdAt: '25 days ago',
    replies: [
      {
        id: 'comment-2-reply-1',
        author: {
          id: 'user-sa',
          name: 'Sangah Park',
          initials: 'SA',
          team: 'Logistics Manager',
          avatarColor: '#eee0de',
          initialsColor: '#986c66',
        },
        content: '@Younghee Lee, noted. All documents uploaded.',
        createdAt: '25 days ago',
      },
    ],
  },
];

// 10. 바이오 여정 협업 메모 (영문) - ID-SC05 (피그마 941-47024 기준)
export const BIO_JOURNEY_COMMENT_DATA_EN: CommentData[] = [
  {
    id: 'bio-comment-1',
    author: {
      id: 'user-cs',
      name: 'Chulsoo Kim',
      initials: 'CS',
      team: 'Operations Team 3',
      avatarColor: '#e7eede',
      initialsColor: '#727d60',
    },
    content: 'Sharing Cooling System Action Report regarding the temperature excursion.',
    createdAt: '5 mins ago',
    attachment: {
      id: 'attachment-1',
      name: 'Action_Report.pdf',
      type: 'PDF',
    },
  },
  {
    id: 'bio-comment-2',
    author: {
      id: 'user-yh',
      name: 'Younghee Lee',
      initials: 'YH',
      team: 'Operations Specialist',
      avatarColor: '#e1deee',
      initialsColor: '#746c96',
    },
    content: 'Journey completed. All devices confirmed operational.  @Sangah Park, please verify docs.',
    createdAt: '5 days ago',
    replies: [
      {
        id: 'bio-comment-2-reply-1',
        author: {
          id: 'user-sa',
          name: 'Sangah Park',
          initials: 'SA',
          team: 'Logistics Manager',
          avatarColor: '#eee0de',
          initialsColor: '#986c66',
        },
        content: '@Younghee Lee Noted. All documents uploaded. ',
        createdAt: '5 days ago',
      },
    ],
  },
];

// ========== 언어별 데이터 조회 함수 ==========

// 여정 ID로 여정 데이터 조회 (언어 지원)
export const getJourneyByIdWithLang = (id: string, lang: 'ko' | 'en' = 'ko'): JourneyData | undefined => {
  if (lang === 'en') {
    if (id === 'ID-SC05') {
      return BIO_JOURNEY_DETAIL_DATA_EN;
    }
    return JOURNEY_DATA_EN.find(j => j.id === id);
  }
  // 한국어 (기본)
  if (id === 'ID-SC05') {
    return BIO_JOURNEY_DETAIL_DATA;
  }
  return JOURNEY_DATA.find(j => j.id === id);
};

// 디바이스 목록 조회 (언어 지원)
export const getDeviceListWithLang = (isBioJourney: boolean, lang: 'ko' | 'en' = 'ko'): DeviceData[] => {
  if (lang === 'en') {
    return isBioJourney ? BIO_JOURNEY_DEVICE_LIST_DATA_EN : DEVICE_LIST_DATA_EN;
  }
  return isBioJourney ? BIO_JOURNEY_DEVICE_LIST_DATA : DEVICE_LIST_DATA;
};

// 이벤트 이력 조회 (언어 지원)
export const getEventHistoryWithLang = (isBioJourney: boolean, lang: 'ko' | 'en' = 'ko'): EventHistoryData[] => {
  if (lang === 'en') {
    return isBioJourney ? BIO_JOURNEY_EVENT_DATA_EN : EVENT_HISTORY_DATA_EN;
  }
  return isBioJourney ? BIO_JOURNEY_EVENT_DATA : EVENT_HISTORY_DATA;
};

// 문서 목록 조회 (언어 지원)
export const getDocumentListWithLang = (isBioJourney: boolean, lang: 'ko' | 'en' = 'ko'): DocumentData[] => {
  if (lang === 'en') {
    return isBioJourney ? BIO_JOURNEY_DOCUMENT_DATA_EN : DOCUMENT_DATA_EN;
  }
  return isBioJourney ? BIO_JOURNEY_DOCUMENT_DATA : DOCUMENT_DATA;
};

// 협업 메모 조회 (언어 지원)
export const getCommentListWithLang = (isBioJourney: boolean, lang: 'ko' | 'en' = 'ko'): CommentData[] => {
  if (lang === 'en') {
    return isBioJourney ? BIO_JOURNEY_COMMENT_DATA_EN : COMMENT_DATA_EN;
  }
  return isBioJourney ? BIO_JOURNEY_COMMENT_DATA : COMMENT_DATA;
};

