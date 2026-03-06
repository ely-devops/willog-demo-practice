import { useTranslation } from 'react-i18next';

interface AIAssistantTooltipProps {
  show: boolean;
  onDismiss: () => void;
}

export const AIAssistantTooltip = ({ show, onDismiss }: AIAssistantTooltipProps) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="absolute bottom-[3.75rem] right-0 animate-fade-in-up">
      {/* Wrapper with drop-shadow applied to entire shape (bubble + tail) */}
      <div
        className="flex flex-col items-end"
        style={{ filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))' }}
      >
        {/* Speech bubble body - Figma: p-12px outer, gap-16px between text and close button */}
        <div className="bg-[#1e6ee1] rounded-2 flex items-start gap-4 p-3">
          {/* Text Content - Figma: p-8px, gap-8px */}
          <div className="flex flex-col gap-2 p-2">
            {/* Figma: Label/S Strong 13px, color white */}
            <p className="text-[0.8125rem] font-normal text-white leading-none whitespace-nowrap">
              {t('aiAssistant.tooltipTitle')}
            </p>
            {/* Figma: Body/XS 12px, line-height 1.48, color white opacity 70% */}
            <p className="text-[0.75rem] text-white/70 leading-[1.48] whitespace-nowrap">
              {t('aiAssistant.tooltipMessage')}
            </p>
          </div>

          {/* Close Button - 24x24 */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white hover:text-white/80 transition-colors cursor-pointer"
            aria-label={t('aiAssistant.closeButton')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Tooltip tail - Figma: 20x8, positioned right with margin */}
        {/* -mt-px ensures overlap with bubble to prevent shadow gap */}
        <svg
          className="mr-3 -mt-px"
          width="20"
          height="10"
          viewBox="0 0 20 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.121 7.87868C10.95 9.05025 9.05 9.05025 7.879 7.87868L0 0H20L12.121 7.87868Z"
            fill="#1E6EE1"
          />
        </svg>
      </div>
    </div>
  );
};
