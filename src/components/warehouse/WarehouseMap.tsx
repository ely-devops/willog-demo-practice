import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSmplrJs } from '@smplrspace/smplr-loader';
import type {
  WarehouseMapProps,
  WarehouseMarker,
  MarkerStatus,
} from '@/types/warehouse.types';
import { WarehouseMapControls } from './WarehouseMapControls';

// Smplrspace configuration
const SMPLR_SPACE_ID = 'spc_grg5vkri';
const SMPLR_CLIENT_TOKEN = 'pub_2dcc3e4ce8aa4ce89b9f7dd45dfc3f46';

// Marker colors matching the SVG designs
const MARKER_COLORS: Record<MarkerStatus, string> = {
  danger: '#EF4444', // red-500
  warning: '#EF4444', // red-500 (warning uses red too)
  normal: '#22C55E', // green-500
};

// Cache for generated marker PNG data URLs
const markerImageCache: Record<string, string> = {};

/**
 * Generate a marker PNG image using canvas
 * Smplrspace only supports PNG/JPEG, not SVG
 */
const generateMarkerImage = (color: string): string => {
  if (markerImageCache[color]) {
    return markerImageCache[color];
  }

  const size = 50;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get canvas context');
    return '';
  }

  // Draw circle with shadow effect
  const centerX = size / 2;
  const centerY = size / 2 - 4; // Offset to leave room for shadow
  const radius = 16;

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Main circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // White border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Reset shadow for icon
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw phone/device icon (simplified version of the SVG icon)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  // Device body
  const iconX = centerX - 4;
  const iconY = centerY - 7;
  const iconW = 8;
  const iconH = 14;
  const cornerRadius = 1;

  // Rounded rectangle for device
  ctx.moveTo(iconX + cornerRadius, iconY);
  ctx.lineTo(iconX + iconW - cornerRadius, iconY);
  ctx.quadraticCurveTo(iconX + iconW, iconY, iconX + iconW, iconY + cornerRadius);
  ctx.lineTo(iconX + iconW, iconY + iconH - cornerRadius);
  ctx.quadraticCurveTo(
    iconX + iconW,
    iconY + iconH,
    iconX + iconW - cornerRadius,
    iconY + iconH
  );
  ctx.lineTo(iconX + cornerRadius, iconY + iconH);
  ctx.quadraticCurveTo(iconX, iconY + iconH, iconX, iconY + iconH - cornerRadius);
  ctx.lineTo(iconX, iconY + cornerRadius);
  ctx.quadraticCurveTo(iconX, iconY, iconX + cornerRadius, iconY);
  ctx.closePath();
  ctx.fill();

  // Inner screen area (colored rectangle)
  ctx.fillStyle = color;
  ctx.fillRect(iconX + 1, iconY + 2, iconW - 2, iconH - 4);

  // Top indicator line (white)
  ctx.fillStyle = 'white';
  ctx.fillRect(iconX + 1, iconY + 3, iconW - 2, 1.5);

  const dataUrl = canvas.toDataURL('image/png');
  markerImageCache[color] = dataUrl;
  return dataUrl;
};

/**
 * Hide Smplrspace default UI elements (badge and buttons)
 * Runs once after a delay - no MutationObserver to avoid infinite loops
 */
const hideSmplrspaceUI = (container: HTMLElement | null) => {
  if (!container) return;

  const hideElements = () => {
    // Hide "Powered by Smplrspace" badge - look for links to smplrspace
    const links = container.querySelectorAll('a[href*="smplrspace"]');
    links.forEach((link) => {
      // Walk up to find the badge container
      let parent = link.parentElement;
      for (let i = 0; i < 4 && parent; i++) {
        const style = window.getComputedStyle(parent);
        if (style.position === 'absolute' || style.position === 'fixed') {
          (parent as HTMLElement).style.display = 'none';
          break;
        }
        parent = parent.parentElement;
      }
    });

    // Hide annotation toggle buttons - look for buttons with specific SVG patterns
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      // Check if button contains SVG with annotation-like icons
      const svg = button.querySelector('svg');
      if (svg) {
        const parent = button.parentElement;
        if (parent) {
          const style = window.getComputedStyle(parent);
          // If parent is positioned absolutely and contains only this button
          if (
            (style.position === 'absolute' || style.position === 'fixed') &&
            parent.children.length <= 2
          ) {
            (parent as HTMLElement).style.display = 'none';
          }
        }
      }
    });
  };

  // Run multiple times with increasing delays to catch dynamically added elements
  // No MutationObserver - it caused infinite loops due to style changes
  setTimeout(hideElements, 500);
  setTimeout(hideElements, 1500);
  setTimeout(hideElements, 3000);
};

/**
 * Warehouse Map component using Smplrspace SDK
 * Renders a 3D/2D floor plan with status markers
 */
export const WarehouseMap = ({
  viewMode,
  onViewModeChange,
  markers,
}: WarehouseMapProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spaceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get marker icon based on status (generates PNG from canvas)
  const getMarkerIcon = useCallback((status: MarkerStatus) => {
    const color = MARKER_COLORS[status];
    const url = generateMarkerImage(color);
    return { url };
  }, []);

  // Zoom handlers for custom controls
  const handleZoomIn = useCallback(() => {
    spaceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    spaceRef.current?.zoomOut();
  }, []);

  // Add marker data layer
  const addMarkerLayer = useCallback(() => {
    if (!spaceRef.current) return;

    // Remove existing layer if any
    if (dataLayerRef.current) {
      dataLayerRef.current.remove();
      dataLayerRef.current = null;
    }

    const markerData = markers.map((marker: WarehouseMarker) => ({
      id: marker.id,
      position: marker.position,
    }));

    // Create icon data layer for markers
    // Using canvas-generated PNG images (Smplrspace only supports PNG/JPEG, not SVG)
    dataLayerRef.current = spaceRef.current.addDataLayer({
      id: 'warehouse-markers',
      type: 'icon',
      data: markerData,
      image: (element: { id: string }) => {
        const marker = markers.find((m) => m.id === element.id);
        return getMarkerIcon(marker?.status || 'normal');
      },
      width: 3, // meters
      height: 3, // meters
    });
  }, [markers, getMarkerIcon]);

  // Initialize Smplrspace viewer - runs once on mount
  useEffect(() => {
    let isMounted = true;

    const initViewer = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const smplr = await loadSmplrJs();

        if (!isMounted) return;

        spaceRef.current = new smplr.Space({
          spaceId: SMPLR_SPACE_ID,
          clientToken: SMPLR_CLIENT_TOKEN,
          container: containerRef.current,
        });

        await spaceRef.current.startViewer({
          mode: '3d',
          allowModeChange: false,
          hideNavigationButtons: true,
          hideLevelPicker: true,
          renderOptions: {
            backgroundColor: '#f5f5f5',
          },
          onError: (errorMessage: string) => {
            console.error('Smplrspace viewer error:', errorMessage);
            if (isMounted) {
              setError(t('warehouse.map.error'));
              setIsLoading(false);
            }
          },
        });

        // Promise resolves when viewer is ready
        if (!isMounted) return;

        // Hide Smplrspace branding (using setTimeout instead of MutationObserver to avoid infinite loop)
        hideSmplrspaceUI(containerRef.current);

        // Set to show only L1 (level index 1)
        // Note: This space uses L1 = index 1 (not 0-based)
        spaceRef.current.includeLevels([1]);

        // Zoom in 200% - get current camera placement and reduce radius by half
        // radius is the distance from camera to target point (in meters)
        // Smaller radius = camera closer to target = appears larger
        // 0.5 multiplier = half distance = 200% zoom (2x closer)
        // NOTE: Must use animate option to avoid timing issues after startViewer()
        const currentPlacement = spaceRef.current.getCameraPlacement();
        console.log('📷 Smplrspace Camera Placement:', currentPlacement);
        if (currentPlacement && currentPlacement.radius) {
          spaceRef.current.setCameraPlacement({
            // ...currentPlacement,
            // radius: currentPlacement.radius * 0.6, // 50% of original distance = 200% zoom
            alpha: -1.5704317027714592,
            beta: 0.7852211004091669,
            radius: 63.47084154883256,
            target: {
              x: 58.267674833569856,
              y: 6.165755690828274,
              z: -71.82517028233859,
            },
            animate: true,
            animationDuration: 0.9, // 0.8초에 걸쳐 부드럽게 줌인
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Smplrspace:', err);
        if (isMounted) {
          setError('창고 지도를 초기화하는 중 오류가 발생했습니다.');
          setIsLoading(false);
        }
      }
    };

    initViewer();

    // Cleanup - only on unmount
    return () => {
      isMounted = false;
      if (dataLayerRef.current) {
        dataLayerRef.current.remove();
        dataLayerRef.current = null;
      }
      if (spaceRef.current?.remove) {
        spaceRef.current.remove();
        spaceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - initialize only once

  // Handle view mode changes using setMode API (no viewer reinit)
  useEffect(() => {
    if (spaceRef.current && !isLoading) {
      spaceRef.current.setMode(viewMode);
    }
  }, [viewMode, isLoading]);

  // DEV: Press 'P' to log current camera placement (for finding ideal position)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (spaceRef.current) {
          const placement = spaceRef.current.getCameraPlacement();
          console.log('📷 Current Camera Placement (press P):', placement);
          console.log('📋 Copy this to code:', JSON.stringify(placement, null, 2));
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Add markers when viewer is ready
  useEffect(() => {
    if (spaceRef.current && !isLoading) {
      addMarkerLayer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Run once when loading completes

  // Update markers when data changes (without reinitializing viewer)
  useEffect(() => {
    if (spaceRef.current && !isLoading && markers.length > 0) {
      addMarkerLayer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]); // Only when markers change

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">
              {t('warehouse.map.loading')}
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              {t('warehouse.map.refresh')}
            </button>
          </div>
        </div>
      )}

      {/* Smplrspace container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 2D/3D Toggle and Zoom Controls */}
      {!isLoading && !error && (
        <WarehouseMapControls
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
    </div>
  );
};
