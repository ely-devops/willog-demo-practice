import type { WarehouseMarker } from '@/types/warehouse.types';

/**
 * Mock warehouse marker data
 * Coordinates obtained from Smplrspace enablePickingMode
 * Building coordinate range: x ≈ 50-70, z ≈ -60 to -100
 * Based on Figma design: https://www.figma.com/design/tcsRC2qQIa1We1qY1QN0bw/?node-id=311-50932
 *
 * Layout (Figma reference):
 * - 1 red marker at top
 * - 3 green markers at bottom (2 on left side, 1 in middle)
 */
export const WAREHOUSE_MARKERS: WarehouseMarker[] = [
  // Red marker - top right area (Figma: top-right section with danger glow)
  // elevation을 4m로 설정하여 벽 위에 표시되도록 함
  {
    id: 'marker-danger-1',
    name: 'Zone A-1',
    status: 'danger',
    position: { levelIndex: 1, x: 40, z: -43, elevation: 4 },
    description: '온도 이상 감지 - 48.5C',
  },
  // Green marker - left upper (Figma: left side, upper area)
  {
    id: 'marker-normal-1',
    name: 'Zone B-1',
    status: 'normal',
    position: { levelIndex: 1, x: 28, z: -63, elevation: 4 },
  },
  // Green marker - left lower (Figma: left side, lower area)
  {
    id: 'marker-normal-2',
    name: 'Zone B-2',
    status: 'normal',
    position: { levelIndex: 1, x: 54, z: -78, elevation: 6 },
  },
  // Green marker - center (Figma: center of warehouse)
  {
    id: 'marker-normal-3',
    name: 'Zone C-1',
    status: 'normal',
    position: { levelIndex: 1, x: 62, z: -83, elevation: 6 },
  },
];
