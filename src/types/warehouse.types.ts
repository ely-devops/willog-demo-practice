/**
 * Types for Smplrspace Warehouse Map integration
 */

export type ViewMode = '2d' | '3d';
export type MarkerStatus = 'danger' | 'warning' | 'normal';

export interface WarehouseMarkerPosition {
  levelIndex: number; // Zero-based floor index (0 = L1)
  x: number; // Horizontal position in space
  z: number; // Depth position in space
  elevation: number; // Height above floor
}

export interface WarehouseMarker {
  id: string;
  name: string;
  status: MarkerStatus;
  position: WarehouseMarkerPosition;
  description?: string;
}

export interface WarehouseMapProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  markers: WarehouseMarker[];
}

export interface WarehouseMapControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}
