import { useMemo, useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import type { LayerProps, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { useAppStore } from '@/stores/useAppStore';
import { formatTemperature } from '@/utils/temperature';

// Journey Map Marker Icons (출발/도착: 언어별 분기 - line 버전)
import DepartureIconKo from '@/assets/common/departure_ko_line.svg';
import DepartureIconEn from '@/assets/common/departure_en_line.svg';
import ArrivalIconKo from '@/assets/common/arrival_ko_line.svg';
import ArrivalIconEn from '@/assets/common/arrival_en_line.svg';
import WaypointCompleteIcon from '@/assets/journey/경유지_완료.svg';
import WaypointPendingIcon from '@/assets/journey/local-convinience.svg';
import CurrentPositionIcon from '@/assets/journey/current.svg';
import WarningIcon from '@/assets/journey/warning.svg';
import DotIcon from '@/assets/journey/dot.svg';

// Bio domain specific icons
import LocalShippingIcon from '@/assets/common/local_shipping.svg';
import PlaneIcon from '@/assets/journey/plane.svg';
import ConvinienceNewIcon from '@/assets/common/convinience_new.svg';
import SubtractIcon from '@/assets/journey/subtract.svg';
import AlertRedIcon from '@/assets/common/alert_red.svg';
import localConvenienceGreyIcon from '@/assets/common/local_convenience_grey.svg';

// Timeline icons (진행중인 여정과 동일한 아이콘)
import truckBlueIcon from '@/assets/common/truck_blue.svg';
import planeNewIcon from '@/assets/common/plane_new.svg';
import trainBlueIcon from '@/assets/common/train_blue.svg';

// 경로 마커용 outlined 아이콘
import planeOutlinedIcon from '@/assets/journey/journey-icons-new/plane-outlined.svg';
import trainOutlinedIcon from '@/assets/journey/journey-icons-new/train-outlined.svg';
import truckOutlinedIcon from '@/assets/journey/journey-icons-new/truck-outlined.svg';
import subtractOutlinedIcon from '@/assets/journey/journey-icons-new/subtract-outlined.svg';
import shipOutlinedIcon from '@/assets/journey/journey-icons-new/ship-outlined.svg';

// Map Control Button Icons
import MapButton1 from '@/assets/journey/map-buttons/button_1.svg';
import MapButton2 from '@/assets/journey/map-buttons/button_2.svg';
import MapButton3 from '@/assets/journey/map-buttons/button_3.svg';
import MapButton4 from '@/assets/journey/map-buttons/button_4.svg';

// Mapbox Token & Style
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE = import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/peterkwon/cmjmhj8uw007q01sp6lft2pdq';

// ========== 경로 좌표 정의 ==========
// 인천 → 일본 동쪽 → 태평양 → 시애틀 경로
// 날짜변경선을 동쪽으로 넘어갈 때 경도 180 이상 값 사용 (Mapbox가 올바르게 그리도록)

// 경로 라인용 좌표 (180도 이상 값 사용하여 태평양 횡단 표시)
// MARKER_COORDS와 일치하도록 수정됨
const ROUTE_LINE_COORDS: [number, number][] = [
  [126.7, 37.5],   // 인천 (출발지)
  [127.4, 36.35],  // 대전 경유
  [126.5, 34.8],   // 대전-부산 중간 (daejeonToBusan 마커 위치)
  [129.0, 35.1],   // 부산 창고 (busanWarehouse)
  [140.0, 33.0],   // 일본 근처 (경유)
  [154.0, 32.0],   // 경고1 (warning1)
  [170.0, 38.0],   // 태평양 서쪽
  [200.0, 45.0],   // 부산-시애틀 (busanToSeattle)
  [220.0, 46.65],  // 경고2 (warning2)
  [233.0, 48.5],   // 현재 위치 (currentPosition)
  [245.0, 46.0],   // 경유
  [255.0, 44.0],   // 시애틀-시카고 (seattleToChicago)
  [268.0, 41.0],   // 시카고-인디애나폴리스 (chicagoToIndy)
  [272.7, 40.5],   // 시애틀/도착지 (seattle)
];

// 마커용 좌표 (표준 경도 범위 -180~180) - 외부에서 flyTo 시 사용
// eslint-disable-next-line react-refresh/only-export-components
export const MARKER_COORDS = {
  incheon: [126.7, 37.5] as [number, number],
  daejeonToBusan: [126.5, 34.8] as [number, number],   // 대전-부산 중간 구간 (비행기)
  busanWarehouse: [129.0, 35.1] as [number, number],   // 부산 창고
  busanToSeattle: [200.0, 45.0] as [number, number],   // 부산-시애틀 (선박) - 좌표 조정 필요
  seattleToChicago: [255.0, 44.0] as [number, number], // 시애틀-시카고 (기차) - 좌표 조정 필요
  chicagoToIndy: [268.0, 41.0] as [number, number],    // 시카고-인디애나폴리스 (트럭) - 좌표 조정 필요
  completedWaypoint: [126.7, 32.5] as [number, number],
  warning1: [154.0, 32.0] as [number, number],
  warning2: [220.0, 46.65] as [number, number],
  currentPosition: [233.0, 48.5] as [number, number],
  pendingWaypoint: [245.0, 47.5] as [number, number],
  seattle: [272.7, 40.5] as [number, number]
};

// 경로 dot 좌표 (각 마커 위치에 작은 원 표시)
const ROUTE_DOT_POSITIONS = [
  MARKER_COORDS.incheon,
  MARKER_COORDS.seattle
];

// 현재 위치 인덱스 (ROUTE_LINE_COORDS 기준)
// -5 = 뒤에서 5번째 = 인덱스 9 (현재 위치: [233.0, 48.5])
const CURRENT_POSITION_INDEX = -5;

// 경로 구간 인덱스 (아이콘 위치 기준)
// 완료: 인천 ~ ship 이전 (0-7), 진행중: ship ~ train (7-11), 예정: train ~ 도착 (11-end)
const IN_PROGRESS_START_INDEX = 7;  // 부산-시애틀 ship 아이콘 위치 (index 7)
const IN_PROGRESS_END_INDEX = 11;   // 시애틀-시카고 train 아이콘 위치 (index 11)

// 출발지/도착지 좌표 (마커용)
const INCHEON = MARKER_COORDS.incheon;
const SEATTLE = MARKER_COORDS.seattle;

// ========== 바이오 도메인 경로 좌표 정의 ==========
// 오송 (대한) → 태평양 횡단 (대권 곡선 근사) → 뉴욕 병원 경로
// 반도체 도메인과 동일하게 수동 좌표 배열 사용 (turf.greatCircle의 MultiLineString 문제 회피)

// 바이오 경로 라인용 좌표 (대권 곡선을 근사하는 수동 좌표)
// BIO_MARKER_COORDS와 일치하도록 수정됨
const BIO_ROUTE_LINE_COORDS: [number, number][] = [
  [127.3, 36.6],   // 오송 (출발지)
  [135.0, 38.0],   // 일본 근처
  [150.0, 40.0],   // 태평양 서쪽
  [165.0, 41.0],   // 날짜변경선 전
  [180.0, 41.5],   // 인천-LAX (incheonToLax)
  [195.0, 41.7],   // 날짜변경선 후
  [210.0, 42.0],   // 태평양 중앙
  [225.0, 42.0],   // 태평양 동쪽
  [238.0, 42.0],   // 캘리포니아 (plane)
  [255.0, 41.0],   // LAX-시카고 (laxToChicago)
  [262.0, 41.5],   // 시카고-뉴욕 (chicagoToNY)
  [269.0, 42.0],   // dot1
  [275.0, 41.0],   // dot2
  [276.5, 41.3],   // 주의 경고 (warningCaution)
  [280.0, 41.5],   // 위험 경고 (warningDanger)
  [282.0, 42.8],   // subtract
  [285.0, 43.0],   // 뉴욕 부근 (nyArea)
  [286.0, 40.7],   // 뉴욕 병원 (도착지)
];

// 바이오 마커용 좌표 (외부에서 flyTo 시 사용)
// eslint-disable-next-line react-refresh/only-export-components
export const BIO_MARKER_COORDS = {
  osong: [127.3, 36.6] as [number, number],           // 오송/대한 (출발) - 트럭 + 배 아이콘
  incheonToLax: [180.0, 41.5] as [number, number],    // 인천-LAX 구간 (비행기 아이콘) - 좌표 조정 필요
  laxToChicago: [255.0, 41] as [number, number],    // LAX-시카고 구간 (기차 아이콘) - 좌표 조정 필요
  chicagoToNY: [262.0, 41.5] as [number, number],     // 시카고-뉴욕 구간 (트럭 아이콘) - 좌표 조정 필요
  nyArea: [285.0, 43.0] as [number, number],          // 뉴욕 부근 (트럭 아이콘) - 좌표 조정 필요
  plane: [238.0, 42.0] as [number, number],           // 캘리포니아 최북단 (비행기 아이콘)
  dot1: [269.0, 42.0] as [number, number],            // 도착지 직전 dot 1
  dot2: [275.0, 41.0] as [number, number],            // 도착지 직전 dot 2
  subtract: [282, 42.8] as [number, number],        // subtract.svg 아이콘 위치
  warningCaution: [276.5, 41.3] as [number, number],  // 미국 내륙 (주의 - 4/6 04:20)
  warningDanger: [280.0, 41.5] as [number, number],   // 미국 내륙 (위험 - 4/6 04:40)
  newYorkHospital: [286.0, 40.7] as [number, number]  // 뉴욕 병원 (도착)
};

// 바이오 경로 dot 좌표
const BIO_ROUTE_DOT_POSITIONS = [
  BIO_MARKER_COORDS.osong,
  BIO_MARKER_COORDS.dot1,
  BIO_MARKER_COORDS.dot2,
  BIO_MARKER_COORDS.newYorkHospital
];

// Polyline 경로 생성 함수
function createPolylineRoute(waypoints: [number, number][]): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: waypoints
    }
  };
}

// 경로 레이어 스타일 정의 (진행중인여정 타임라인과 동일한 색상)
const completedRouteLayer: LayerProps = {
  id: 'route-completed',
  type: 'line',
  paint: {
    'line-color': '#8bb9f9', // bg-blue-300 - 완료 구간
    'line-width': 8
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
};

const inProgressRouteLayer: LayerProps = {
  id: 'route-in-progress',
  type: 'line',
  paint: {
    'line-color': '#1e6ee1', // bg-blue-500 - 진행중 구간 (더 진한 파란색)
    'line-width': 8
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
};

const remainingRouteLayer: LayerProps = {
  id: 'route-remaining',
  type: 'line',
  paint: {
    'line-color': '#dcdce0', // bg-gray-300 - 예정 구간
    'line-width': 8
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
};

// 바이오 도메인용 경로 레이어 (gray-400)
const bioRouteLayer: LayerProps = {
  id: 'route-bio',
  type: 'line',
  paint: {
    'line-color': '#B8B8C0', // gray-400
    'line-width': 8
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
};

interface JourneyMapProps {
  className?: string;
  isDetailPage?: boolean;  // 여정상세 페이지 여부 (줌인 + 동쪽 이동된 뷰)
  isBioJourney?: boolean;  // 바이오 여정 여부 (JourneyDetailPage에서 전달)
  onWarehouseClick?: () => void;  // 창고 아이콘 클릭 시 호출 (창고지도로 전환)
}

// 외부에서 호출 가능한 메서드 타입
export interface JourneyMapHandle {
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
}

export const JourneyMap = forwardRef<JourneyMapHandle, JourneyMapProps>(({ className, isDetailPage = false, isBioJourney, onWarehouseClick }, ref) => {
  const { t, i18n } = useTranslation();
  const { currentCase } = useAppStore();
  const mapRef = useRef<MapRef>(null);

  // 외부에서 호출 가능한 flyTo 함수 노출
  useImperativeHandle(ref, () => ({
    flyTo: (longitude: number, latitude: number, zoom: number = 6) => {
      const map = mapRef.current?.getMap();
      if (map) {
        map.flyTo({
          center: [longitude, latitude],
          zoom,
          duration: 1500,
          essential: true
        });
      }
    }
  }), []);

  // 경고 마커 hover 상태 (카드 표시용) - null이면 카드 숨김, 숫자면 해당 인덱스 마커의 카드 표시
  const [hoveredWarningIndex, setHoveredWarningIndex] = useState<number | null>(null);
  // 현재 위치 마커 hover 상태 (향후 카드 표시 기능 추가 시 사용)
  const [_isCurrentPositionHovered, setIsCurrentPositionHovered] = useState(false);
  // 바이오 도착 마커 hover 상태
  const [isBioArrivalHovered, setIsBioArrivalHovered] = useState(false);

  // 원래 text-field 값을 저장하는 ref (커스텀 스타일 복원용)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalTextFields = useRef<Record<string, any>>({});

  // 바이오 도메인 여부 결정: prop이 전달되면 prop 사용, 아니면 store에서 판단
  const isBioDomain = isBioJourney !== undefined ? isBioJourney : currentCase === 'bio';

  // 언어별 출발/도착 아이콘 선택
  const isEnglish = i18n.language === 'en';
  const DepartureIcon = isEnglish ? DepartureIconEn : DepartureIconKo;
  const ArrivalIcon = isEnglish ? ArrivalIconEn : ArrivalIconKo;

  // 경로 데이터 생성 - 도메인별 분기
  const routeData = useMemo(() => {
    if (isBioDomain) {
      // 바이오 도메인: 출발지~첫번째 dot까지 완만한 곡선, 이후는 직선
      // 곡선 구간: 오송(127.3, 36.6) ~ 첫번째 dot(269.0, 42.0)
      const curveEndIndex = BIO_ROUTE_LINE_COORDS.findIndex(
        coord => coord[0] === 269.0 && coord[1] === 42.0
      );

      // 곡선 구간 좌표 (출발지 ~ 첫번째 dot)
      const curveCoords = BIO_ROUTE_LINE_COORDS.slice(0, curveEndIndex + 1);
      // 직선 구간 좌표 (첫번째 dot 이후)
      const straightCoords = BIO_ROUTE_LINE_COORDS.slice(curveEndIndex);

      // bezierSpline으로 곡선 구간을 부드럽게 변환
      const curveLine = turf.lineString(curveCoords);
      const smoothCurve = turf.bezierSpline(curveLine, { resolution: 10000, sharpness: 0.85 });
      const smoothCurveCoords = smoothCurve.geometry.coordinates as [number, number][];

      // 곡선 구간과 직선 구간 연결 (첫번째 dot 중복 제거)
      const fullRouteCoords = [...smoothCurveCoords, ...straightCoords.slice(1)];

      return {
        bioRoute: createPolylineRoute(fullRouteCoords),
        completedRoute: null,
        inProgressRoute: null,
        remainingRoute: null,
        currentPosition: BIO_MARKER_COORDS.plane,
        warningPositions: [BIO_MARKER_COORDS.warningCaution, BIO_MARKER_COORDS.warningDanger],
        isBio: true as const
      };
    }

    // 반도체 도메인: 진행 중 운송 (3구간 색상 분리 - 진행중인여정 타임라인과 동일)
    // 완료 구간: 인천 ~ 부산창고 (0 ~ IN_PROGRESS_START_INDEX) - 연한 파란색
    const completedCoords = ROUTE_LINE_COORDS.slice(0, IN_PROGRESS_START_INDEX + 1);
    // 진행중 구간: 부산창고 ~ 시애틀-시카고 (IN_PROGRESS_START_INDEX ~ IN_PROGRESS_END_INDEX) - 진한 파란색
    const inProgressCoords = ROUTE_LINE_COORDS.slice(IN_PROGRESS_START_INDEX, IN_PROGRESS_END_INDEX + 1);
    // 예정 구간: 시애틀-시카고 ~ 도착지 (IN_PROGRESS_END_INDEX ~ end) - 회색
    const remainingCoords = ROUTE_LINE_COORDS.slice(IN_PROGRESS_END_INDEX);

    return {
      bioRoute: null,
      completedRoute: createPolylineRoute(completedCoords),
      inProgressRoute: createPolylineRoute(inProgressCoords),
      remainingRoute: createPolylineRoute(remainingCoords),
      currentPosition: MARKER_COORDS.currentPosition,
      warningPositions: [MARKER_COORDS.warning1, MARKER_COORDS.warning2],
      isBio: false as const
    };
  }, [isBioDomain]);

  // 지도 레이블 언어 업데이트 함수
  // 영어: name_en (영문만 표시)
  // 한국어: Mapbox Studio에서 설정한 커스텀 스타일 유지 (한국어 + 영어)
  const updateMapLanguage = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    const isEnglish = i18n.language === 'en';
    const style = map.getStyle();

    // 모든 label 레이어에 언어 설정 적용
    style?.layers?.forEach(layer => {
      // symbol 타입이고 label을 포함하는 레이어만 처리
      if (layer.type === 'symbol' && layer.id.includes('label')) {
        try {
          if (isEnglish) {
            // 영어: name_en으로 변경
            map.setLayoutProperty(layer.id, 'text-field', ['get', 'name_en']);
          } else {
            // 한국어: 저장된 원래 값으로 복원 (커스텀 스타일 유지)
            const originalValue = originalTextFields.current[layer.id];
            if (originalValue !== undefined) {
              map.setLayoutProperty(layer.id, 'text-field', originalValue);
            }
          }
        } catch {
          // 일부 레이어는 text-field 속성이 없을 수 있음
        }
      }
    });
  }, [i18n.language]);

  // 언어 변경 시 지도 레이블 업데이트
  useEffect(() => {
    updateMapLanguage();
  }, [updateMapLanguage]);

  // 지도 로드 완료 시 원래 text-field 값 저장 및 언어 설정 적용
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const style = map.getStyle();

    // 원래 text-field 값 저장 (최초 1회만)
    if (Object.keys(originalTextFields.current).length === 0) {
      style?.layers?.forEach(layer => {
        if (layer.type === 'symbol' && layer.id.includes('label')) {
          try {
            const textField = map.getLayoutProperty(layer.id, 'text-field');
            if (textField !== undefined) {
              originalTextFields.current[layer.id] = textField;
            }
          } catch {
            // 일부 레이어는 text-field 속성이 없을 수 있음
          }
        }
      });
    }

    // 현재 언어에 맞게 레이블 업데이트
    updateMapLanguage();
  }, [updateMapLanguage]);

  return (
    <div className={`relative ${className || ''}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={handleMapLoad}
        initialViewState={
          isDetailPage
            ? {
                // 여정상세 페이지: 현재 위치 중심, 줌인
                // 바이오: 뉴욕 병원 근처로 줌인 (완료 상태)
                longitude: routeData.isBio ? 286 : 245,
                latitude: routeData.isBio ? 40 : 45,
                zoom: routeData.isBio ? 5 : 3.5,
              }
            : {
                // 대시보드: 전체 경로가 화면에 맞게 표시 (해상도 독립적)
                bounds: routeData.isBio
                  ? [
                      [BIO_MARKER_COORDS.osong[0] - 5, 25],  // SW: 오송 서쪽
                      [BIO_MARKER_COORDS.newYorkHospital[0] + 5, 50]  // NE: 뉴욕 동쪽
                    ]
                  : [
                      [ROUTE_LINE_COORDS[0][0] - 5, 25],  // SW: 인천 서쪽, 남쪽 여백
                      [ROUTE_LINE_COORDS[ROUTE_LINE_COORDS.length - 1][0] + 5, 55]  // NE: 시애틀 동쪽, 북쪽 여백
                    ],
                fitBoundsOptions: {
                  padding: { top: 40, bottom: 40, left: 40, right: 40 },
                  minZoom: 2.2  // 최소 줌 레벨 제한
                }
              }
        }
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_STYLE}
        projection="mercator"  // 평면도 (3D 지구본 아님)
        attributionControl={false}
        minZoom={2.2}  // 동아시아~미주 대륙까지만 축소 가능하도록 제한
      >
        {/* 바이오 도메인: 전체 경로 (gray-400) */}
        {routeData.bioRoute && (
          <Source id="route-bio" type="geojson" data={routeData.bioRoute}>
            <Layer {...bioRouteLayer} />
          </Source>
        )}

        {/* 반도체 도메인: 완료된 경로 (연한 파란색 #8bb9f9) */}
        {routeData.completedRoute && (
          <Source id="route-completed" type="geojson" data={routeData.completedRoute}>
            <Layer {...completedRouteLayer} />
          </Source>
        )}

        {/* 반도체 도메인: 진행중 경로 (진한 파란색 #1e6ee1) */}
        {routeData.inProgressRoute && (
          <Source id="route-in-progress" type="geojson" data={routeData.inProgressRoute}>
            <Layer {...inProgressRouteLayer} />
          </Source>
        )}

        {/* 반도체 도메인: 예정 경로 (회색 #dcdce0) */}
        {routeData.remainingRoute && (
          <Source id="route-remaining" type="geojson" data={routeData.remainingRoute}>
            <Layer {...remainingRouteLayer} />
          </Source>
        )}

        {/* 경로 dot (마커 아래에 표시되는 작은 원) - 도메인별 분기 */}
        {/* z-index: 1로 설정하여 아이콘 마커(z-index: 10) 아래에 표시 */}
        {/* 피그마: 11x11px (0.6875rem), border 2px → 실제 내부 원 7px */}
        {(routeData.isBio ? BIO_ROUTE_DOT_POSITIONS : ROUTE_DOT_POSITIONS).map((pos, index) => (
          <Marker key={`dot-${index}`} longitude={pos[0]} latitude={pos[1]} anchor="center" style={{ zIndex: 1 }}>
            <img src={DotIcon} alt="dot" className="w-[0.6875rem] h-[0.6875rem]" />
          </Marker>
        ))}

        {/* 도메인별 마커 분기 */}
        {routeData.isBio ? (
          <>
            {/* 바이오: 출발지 - 오송/대한 (출발 핀 아이콘 위, 트럭 아이콘 아래) */}
            <Marker longitude={BIO_MARKER_COORDS.osong[0]} latitude={BIO_MARKER_COORDS.osong[1]} anchor="center" style={{ zIndex: 10 }}>
              <div className="relative flex flex-col items-center" style={{ overflow: 'visible' }}>
                {/* 출발 핀 아이콘 (위) - 언어별 departure 아이콘 사용 */}
                {/* SVG viewBox: 42x42px (그림자 포함) */}
                <img src={DepartureIcon} alt="출발" className="w-[2.625rem] h-[2.625rem]" />
                {/* 트럭 아이콘 (아래) - outlined 아이콘 사용 */}
                <img src={truckOutlinedIcon} alt="트럭" className="w-[2.625rem] h-[2.625rem] -mt-1" />
              </div>
            </Marker>

            {/* 바이오: 인천-LAX 구간 - 비행기 아이콘 (outlined) */}
            {/* 좌표 조정: BIO_MARKER_COORDS.incheonToLax */}
            <Marker longitude={BIO_MARKER_COORDS.incheonToLax[0]} latitude={BIO_MARKER_COORDS.incheonToLax[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={planeOutlinedIcon} alt="인천-LAX" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 바이오: LAX-시카고 구간 - 기차 아이콘 (outlined) */}
            {/* 좌표 조정: BIO_MARKER_COORDS.laxToChicago */}
            <Marker longitude={BIO_MARKER_COORDS.laxToChicago[0]} latitude={BIO_MARKER_COORDS.laxToChicago[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={trainOutlinedIcon} alt="LAX-시카고" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 바이오: 시카고-뉴욕 구간 - 트럭 아이콘 (outlined) */}
            {/* 좌표 조정: BIO_MARKER_COORDS.chicagoToNY */}
            <Marker longitude={BIO_MARKER_COORDS.chicagoToNY[0]} latitude={BIO_MARKER_COORDS.chicagoToNY[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={truckOutlinedIcon} alt="시카고-뉴욕" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 바이오: 뉴욕 부근 - 트럭 아이콘 (outlined) */}
            {/* 좌표 조정: BIO_MARKER_COORDS.nyArea */}
            <Marker longitude={BIO_MARKER_COORDS.nyArea[0]} latitude={BIO_MARKER_COORDS.nyArea[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={truckOutlinedIcon} alt="뉴욕 부근" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 바이오: 창고 아이콘 - 뉴욕 근처 (클릭 시 창고지도로 전환) */}
            <Marker longitude={BIO_MARKER_COORDS.subtract[0]} latitude={BIO_MARKER_COORDS.subtract[1]} anchor="center" style={{ zIndex: 10 }}>
              <img
                src={ConvinienceNewIcon}
                alt="창고"
                className={`w-[2.625rem] h-[2.625rem] ${onWarehouseClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                onClick={onWarehouseClick}
              />
            </Marker>

            {/* 바이오: 도착지 - 뉴욕 병원 (언어별 arrival 아이콘 + 정보 카드) */}
            {/* SVG viewBox: 42x42px (그림자 포함) */}
            <Marker longitude={BIO_MARKER_COORDS.newYorkHospital[0]} latitude={BIO_MARKER_COORDS.newYorkHospital[1]} anchor="center" style={{ zIndex: 10 }}>
              <div
                className="relative cursor-pointer"
                style={{ overflow: 'visible' }}
                onMouseEnter={() => setIsBioArrivalHovered(true)}
                onMouseLeave={() => setIsBioArrivalHovered(false)}
              >
                <img src={ArrivalIcon} alt="도착지" className="w-[2.625rem] h-[2.625rem]" />
                {/* 뉴욕 운송 정보 카드 - 항상 표시 (운송완료 상태) */}
                {/* 영문: 17rem (272px), 한글: 15rem (240px) - 영문 레이블 줄바꿈 방지 */}
                <div className={`absolute top-[2.5rem] right-full mr-2 bg-white border border-[#dcdce0] rounded p-3 flex flex-col gap-4 ${
                  isEnglish ? 'w-[18rem]' : 'w-[15rem]'
                }`}>
                  <div className="flex flex-col gap-1">
                    <span className="text-h4 text-gray-1000">{t('journey.map.bio.deliveryComplete')}</span>
                    <span className="text-label-xs text-gray-600">{t('dashboard.map.updated', { time: t('common.time.minutesAgo', { count: 2 }) })}</span>
                  </div>
                  <div className="h-px bg-[#dcdce0]" />
                  <div className="flex flex-col gap-1.5 text-xs leading-none">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-1000">{t('journey.map.bio.finalDestination')}</span>
                      <span className="font-mono text-gray-1000">{t('journey.map.bio.newYorkHospitalCenter')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-1000">{t('journey.map.bio.totalDuration')}</span>
                      <span className="font-mono text-gray-1000">{t('journey.map.bio.totalDurationValue')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-1000">{t('journey.map.bio.finalTemperature')}</span>
                      <span className="font-mono text-gray-1000">{formatTemperature(2, i18n.language)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Marker>
          </>
        ) : (
          <>
            {/* 반도체: 출발지 - 인천 */}
            {/* SVG viewBox: 42x42px (그림자 포함) */}
            <Marker longitude={INCHEON[0]} latitude={INCHEON[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={DepartureIcon} alt="출발지" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 대전-부산 구간 - 비행기 아이콘 (outlined) */}
            {/* 좌표 조정: MARKER_COORDS.daejeonToBusan */}
            <Marker longitude={MARKER_COORDS.daejeonToBusan[0]} latitude={MARKER_COORDS.daejeonToBusan[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={planeOutlinedIcon} alt="대전-부산" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 부산 창고 - subtract 아이콘 (outlined) */}
            {/* 좌표 조정: MARKER_COORDS.busanWarehouse */}
            <Marker longitude={MARKER_COORDS.busanWarehouse[0]} latitude={MARKER_COORDS.busanWarehouse[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={subtractOutlinedIcon} alt="부산 창고" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 부산-시애틀 구간 - 선박 아이콘 (outlined) */}
            {/* 좌표 조정: MARKER_COORDS.busanToSeattle */}
            <Marker longitude={MARKER_COORDS.busanToSeattle[0]} latitude={MARKER_COORDS.busanToSeattle[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={shipOutlinedIcon} alt="부산-시애틀" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 시애틀-시카고 구간 - 기차 아이콘 (outlined) */}
            {/* 좌표 조정: MARKER_COORDS.seattleToChicago */}
            <Marker longitude={MARKER_COORDS.seattleToChicago[0]} latitude={MARKER_COORDS.seattleToChicago[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={trainOutlinedIcon} alt="시애틀-시카고" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 시카고-인디애나폴리스 구간 - 트럭 아이콘 (outlined) */}
            {/* 좌표 조정: MARKER_COORDS.chicagoToIndy */}
            <Marker longitude={MARKER_COORDS.chicagoToIndy[0]} latitude={MARKER_COORDS.chicagoToIndy[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={truckOutlinedIcon} alt="시카고-인디애나폴리스" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>

            {/* 반도체: 도착지 - 시애틀 */}
            {/* SVG viewBox: 42x42px (그림자 포함) */}
            <Marker longitude={SEATTLE[0]} latitude={SEATTLE[1]} anchor="center" style={{ zIndex: 10 }}>
              <img src={ArrivalIcon} alt="도착지" className="w-[2.625rem] h-[2.625rem]" />
            </Marker>
          </>
        )}

        {/* 현재 위치 마커 + 정보 카드 - 바이오는 완료 상태 */}
        {!routeData.isBio && (
          <Marker longitude={routeData.currentPosition[0]} latitude={routeData.currentPosition[1]} anchor="center" style={{ zIndex: 10 }}>
            <div
              className="relative cursor-pointer"
              style={{ overflow: 'visible' }}
              onMouseEnter={() => setIsCurrentPositionHovered(true)}
              onMouseLeave={() => setIsCurrentPositionHovered(false)}
            >
              {/* 펄스 애니메이션 - Grammarly-inspired box-shadow 파장 효과 */}
              <div
                className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[1.75rem] h-[1.75rem] rounded-full animate-pulse-marker"
                style={{ backgroundColor: 'rgba(95, 139, 250, 0.65)' }}
              />
              {/* 마커 아이콘 - 좌표 중앙에 위치 */}
              <img
                src={CurrentPositionIcon}
                alt="현재 위치"
                className="relative z-10"
                style={{ width: '3.125rem', height: 'auto', maxWidth: 'none' }}
              />
              {/* 해상 운송중 정보 카드 - 마커 오른쪽 아래, 항상 표시 */}
              {/* 영문: 17rem (272px), 한글: 15rem (240px) - 영문 레이블 줄바꿈 방지 */}
              <div className={`absolute top-[3.125rem] bg-white border border-[#dcdce0] rounded p-3 flex flex-col gap-4 ${isEnglish ? 'w-[18rem]' : 'w-[15rem]'}`}>
                <div className="flex flex-col gap-1">
                  <span className="text-h4 text-gray-1000">{t('dashboard.map.inTransit')}</span>
                  <span className="text-label-xs text-gray-600">{t('dashboard.map.updated', { time: t('common.time.minutesAgo', { count: 2 }) })}</span>
                </div>
                <div className="h-px bg-[#dcdce0]" />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-1000">{t('dashboard.map.currentLocation')}</span>
                    <span className="font-mono text-gray-1000">{t('dashboard.map.nearSeattle')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-1000">{t('dashboard.map.eta')}</span>
                    <span className="font-mono text-gray-1000">2025/10/13 10:00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-1000">{t('dashboard.map.currentTemp')}</span>
                    <span className="font-mono text-gray-1000">{formatTemperature(25.1, i18n.language)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-1000">{t('dashboard.map.remainingDistance')}</span>
                    <span className="font-mono text-gray-1000">3218km</span>
                  </div>
                </div>
              </div>
            </div>
          </Marker>
        )}

        {/* 경고 마커들 - dot 중앙이 좌표에 위치, 마커는 dot 바로 위 */}
        {routeData.warningPositions.map((pos, index) => {
          // 반도체: index 0 = 위험 (빨간), index 1 = 주의 (노란)
          // 바이오: index 0 = 주의 (노란), index 1 = 위험 (빨간)
          const isRedIcon = routeData.isBio
            ? index === 1 // 바이오: index 1이 위험 (빨간)
            : index === 0; // 반도체: index 0이 위험 (빨간)

          // 시나리오별 alert 카드 데이터 정의
          interface AlertCardData {
            title: string;
            time: string;
            statusBadge: { text: string; variant: 'danger' | 'warning' };
            location: string;
            measuredValue: string;
            thirdRowLabel: string;
            thirdRowValue: string;
          }

          // 반도체: index 0 = 위험 (빨간), index 1 = 주의 (노란)
          // 바이오: index 0 = 주의 (노란), index 1 = 위험 (빨간)
          const alertCardData: AlertCardData[] = routeData.isBio
            ? [
                // 바이오 시나리오5 - Marker 1 (주의) - index 0
                {
                  title: t('dashboard.map.alertTable.tempExceeded'),
                  time: '4/6 04:20',
                  statusBadge: { text: t('dashboard.map.alertTable.warning'), variant: 'warning' },
                  location: t('dashboard.map.alertTable.usInland'),
                  measuredValue: formatTemperature(8.2, i18n.language),
                  thirdRowLabel: t('dashboard.map.alertTable.duration'),
                  thirdRowValue: t('dashboard.map.alertTable.duration30min')
                },
                // 바이오 시나리오5 - Marker 2 (위험) - index 1
                {
                  title: t('dashboard.map.alertTable.tempExceeded'),
                  time: '4/6 04:40',
                  statusBadge: { text: t('dashboard.map.alertTable.danger'), variant: 'danger' },
                  location: t('dashboard.map.alertTable.usInland'),
                  measuredValue: formatTemperature(9.0, i18n.language),
                  thirdRowLabel: t('dashboard.map.alertTable.duration'),
                  thirdRowValue: t('dashboard.map.alertTable.duration5min')
                }
              ]
            : [
                // 반도체 시나리오1 - Marker 1 (위험) - index 0
                {
                  title: t('dashboard.map.alertTable.tempExceeded'),
                  time: '9/4 12:45',
                  statusBadge: { text: t('dashboard.map.alertTable.danger'), variant: 'danger' },
                  location: t('dashboard.map.alertTable.maritimeTransit'),
                  measuredValue: `${formatTemperature(48.5, i18n.language)} (>${formatTemperature(25, i18n.language, 0)})`,
                  thirdRowLabel: t('dashboard.map.alertTable.duration'),
                  thirdRowValue: t('dashboard.map.alertTable.exceeds30min')
                },
                // 반도체 시나리오1 - Marker 2 (주의) - index 1
                {
                  title: t('dashboard.map.alertTable.shockExceeded'),
                  time: '9/25 18:55',
                  statusBadge: { text: t('dashboard.map.alertTable.warning'), variant: 'warning' },
                  location: t('dashboard.map.alertTable.seattleTerminal'),
                  measuredValue: '9.9G (>2G)',
                  thirdRowLabel: t('dashboard.map.alertTable.shockCountLabel'),
                  thirdRowValue: t('dashboard.map.alertTable.shockCountValue')
                }
              ];

          // 각 마커는 자신의 index에 해당하는 카드만 표시
          const cardData = [alertCardData[index]];

          return (
            <Marker key={`warning-${index}`} longitude={pos[0]} latitude={pos[1]} anchor="center" style={{ zIndex: 10 }}>
              <div
                className="relative cursor-pointer"
                style={{ overflow: 'visible' }}
                onMouseEnter={() => setHoveredWarningIndex(index)}
                onMouseLeave={() => setHoveredWarningIndex(null)}
              >
                {/* dot - 좌표 중앙에 위치 (기준점) */}
                {/* 피그마: 11x11px (0.6875rem) */}
                <img src={DotIcon} alt="dot" className="w-[0.6875rem] h-[0.6875rem]" />
                {/* 경고 아이콘 - dot 바로 위 (간격 0) */}
                {/* 피그마: 32x42px 실제 핀, SVG viewBox 41x52 (그림자 포함) → 41px (2.5625rem) 설정 */}
                <img
                  src={isRedIcon ? AlertRedIcon : WarningIcon}
                  alt="경고"
                  className="absolute left-1/2 -translate-x-1/2 w-[2.5625rem]"
                  style={{ height: 'auto', maxWidth: 'none', bottom: '100%' }}
                />
                {/* 경고 정보 카드 - hover 시에만 표시 */}
                {/* 부드러운 페이드 인/아웃을 위해 항상 렌더링하고 opacity로 제어 */}
                {/* 영문: 17rem (272px), 한글: 15rem (240px) - 영문 레이블 줄바꿈 방지 */}
                {cardData.map((card, cardIndex) => (
                  <div
                    key={cardIndex}
                    className={`absolute bg-white border border-[#dcdce0] rounded p-3 flex flex-col gap-4 transition-opacity duration-200 ease-in-out ${
                      isEnglish ? 'w-[18rem]' : 'w-[15rem]'
                    } ${
                      routeData.isBio
                        ? 'right-full mr-2 bottom-0'
                        : 'left-1/2 -translate-x-6/7 top-[1.625rem]'
                    } ${hoveredWarningIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    {/* Title + Time + Badge */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-h4 text-gray-1000">{card.title}</span>
                        <span className="text-label-xs text-gray-600">{card.time}</span>
                      </div>
                      <span
                        className={`inline-flex items-center justify-center h-5 px-2 text-xs font-mono rounded-full w-fit ${
                          card.statusBadge.variant === 'danger'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {card.statusBadge.text}
                      </span>
                    </div>
                    <div className="h-px bg-[#dcdce0]" />
                    {/* Details */}
                    <div className="flex flex-col gap-1.5 text-xs leading-none">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-1000">{t('dashboard.map.alertTable.eventLocation')}</span>
                        <span className="font-mono text-gray-1000">{card.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-1000">{t('dashboard.map.alertTable.measuredValue')}</span>
                        <span className="font-mono text-gray-1000">{card.measuredValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-1000">{card.thirdRowLabel}</span>
                        <span className="font-mono text-gray-1000">{card.thirdRowValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* 지도 컨트롤 - 우측 하단 (마커/툴팁보다 위에 표시) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        {/* 버튼 1 */}
        <button className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.16)] hover:bg-gray-100">
          <img src={MapButton1} alt="버튼 1" className="w-5 h-5" />
        </button>

        {/* 버튼 2 */}
        <button className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.16)] hover:bg-gray-100">
          <img src={MapButton2} alt="버튼 2" className="w-5 h-5" />
        </button>

        {/* 버튼 3 */}
        <button className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.16)] hover:bg-gray-100">
          <img src={MapButton3} alt="버튼 3" className="w-5 h-5" />
        </button>

        {/* 버튼 4 */}
        <button className="w-9 h-9 bg-white border border-gray-300 rounded flex items-center justify-center shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.16)] hover:bg-gray-100">
          <img src={MapButton4} alt="버튼 4" className="w-5 h-5" />
        </button>

        {/* 줌 컨트롤 */}
        <div className="flex flex-col bg-white border border-gray-300 rounded shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.16)]">
          <button
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 border-b border-gray-300"
            onClick={() => {
              const map = mapRef.current?.getMap();
              if (map) {
                map.zoomIn({ duration: 300 });
              }
            }}
          >
            <svg className="w-5 h-5 text-gray-800" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100"
            onClick={() => {
              const map = mapRef.current?.getMap();
              if (map) {
                map.zoomOut({ duration: 300 });
              }
            }}
          >
            <svg className="w-5 h-5 text-gray-800" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

// displayName 설정 (React DevTools에서 컴포넌트 이름 표시)
JourneyMap.displayName = 'JourneyMap';
