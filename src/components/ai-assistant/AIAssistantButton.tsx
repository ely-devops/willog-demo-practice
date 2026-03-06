import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIAssistantTooltip } from './AIAssistantTooltip';
import assistantIcon from '@/assets/ai-assistant/assistant-icon.svg';

interface AIAssistantButtonProps {
  onClick: () => void;
}

export const AIAssistantButton = ({ onClick }: AIAssistantButtonProps) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Always show tooltip on mount
  useEffect(() => {
    setShowTooltip(true);
  }, []);

  const handleDismissTooltip = () => {
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      {/* Tooltip Component */}
      <AIAssistantTooltip show={showTooltip} onDismiss={handleDismissTooltip} />

      {/* AI Assistant Button */}
      <button
        ref={buttonRef}
        onClick={onClick}
        aria-label={t('aiAssistant.buttonLabel')}
      >
        <img src={assistantIcon} alt="AI Assistant" className="w-12 h-12 hover:scale-105 transition-all duration-200 cursor-pointer" />
      </button>
    </div>
  );
};
