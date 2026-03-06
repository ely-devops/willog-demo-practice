import type { WarehouseMapControlsProps } from '@/types/warehouse.types';

/**
 * 2D/3D view mode toggle and zoom controls for the warehouse map
 * Position: Bottom-right corner (right-[23px] bottom-[23px])
 * Design: Figma node 311-50932
 */
export const WarehouseMapControls = ({
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
}: WarehouseMapControlsProps) => {
  const buttonBaseClass =
    'w-9 h-9 bg-white border border-gray-300 rounded shadow-[0px_4px_8px_0px_rgba(0,0,0,0.16)]';

  return (
    <div className="absolute right-[23px] bottom-[23px] flex flex-col gap-2">
      {/* 2D Button */}
      <button
        onClick={() => onViewModeChange('2d')}
        className={buttonBaseClass}
        title="2D View"
        aria-label="Switch to 2D view"
        aria-pressed={viewMode === '2d'}
      >
        {viewMode === '2d' ? (
          <div className="m-0.5 bg-primary-transparent-selected rounded-sm w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center">
            <span className="text-[13px] font-medium text-primary">2D</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[13px] font-medium text-gray-800">2D</span>
          </div>
        )}
      </button>

      {/* 3D Button */}
      <button
        onClick={() => onViewModeChange('3d')}
        className={buttonBaseClass}
        title="3D View"
        aria-label="Switch to 3D view"
        aria-pressed={viewMode === '3d'}
      >
        {viewMode === '3d' ? (
          <div className="m-0.5 bg-primary-transparent-selected rounded-sm w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center">
            <span className="text-[13px] font-medium text-primary">3D</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[13px] font-medium text-gray-800">3D</span>
          </div>
        )}
      </button>

      {/* Zoom Controls - Single container with divider */}
      <div
        className={`${buttonBaseClass} h-auto flex flex-col items-center py-2`}
      >
        <button
          onClick={onZoomIn}
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <span className="text-base font-medium text-gray-800">+</span>
        </button>
        <div className="w-5 border-t border-gray-300 my-2" />
        <button
          onClick={onZoomOut}
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <span className="text-base font-medium text-gray-800">−</span>
        </button>
      </div>
    </div>
  );
};
