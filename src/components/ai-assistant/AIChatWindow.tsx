import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SettingsIcon,
  CloseIcon,
  CompassIcon16,
  MicIcon,
  ArrowUpIcon,
} from '@/assets/ai-assistant';

export type ResponseType = 'logistics-90d' | 'prompt2' | 'prompt3' | 'alert' | null;

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMaximize?: (responseType?: ResponseType) => void;
}

// Maximize Icon (20x20px icon inside 36x36px button)
const MaximizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.3333 2.5H17.5V6.66667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.6667 8.33333L17.5 2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.66667 17.5H2.5V13.3333"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.33333 11.6667L2.5 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AIChatWindow = ({ isOpen, onClose, onMaximize }: AIChatWindowProps) => {
  const { t } = useTranslation();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // TODO: Implement send message logic
      console.log('Sending message:', inputMessage);
      setInputMessage('');
    }
  };

  const handlePromptClick = (responseType: ResponseType) => {
    // When prompt is clicked, maximize the window with the response type
    onMaximize?.(responseType);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Chat Window - 500x820px, 24px border radius, border, double shadow */}
      {/* Positioned above the AI Assistant button (bottom-10 right-10) */}
      <div
        className="fixed bottom-[7.5rem] right-10 w-[31.25rem] h-[51.25rem] bg-white z-50 rounded-[1.5rem] flex flex-col animate-slide-up border border-gray-300"
        style={{
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08), 0px 10px 100px rgba(0, 0, 0, 0.24)'
        }}
      >
        {/* Header - gray-50 background, h-60px, p-12px, 3 icon buttons with circular bg */}
        <div className="bg-gray-50 rounded-t-[1.5rem] h-[3.75rem] px-3 flex items-center justify-end gap-2 border-b border-gray-300">
          <button
            onClick={() => onMaximize?.()}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
            aria-label={t('aiAssistant.maximizeButton')}
          >
            <MaximizeIcon />
          </button>
          <button
            onClick={() => {
              // TODO: Implement settings functionality
              console.log('Settings clicked');
            }}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
            aria-label={t('aiAssistant.settingsButton')}
          >
            <SettingsIcon />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
            aria-label={t('aiAssistant.closeButton')}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content Area - 760px height, white background, relative positioning */}
        <div className="h-[47.5rem] bg-white relative overflow-hidden rounded-b-[1.5rem]">
          {/* Welcome Message - Absolutely positioned at top:300px, left:24px */}
          <div className="absolute top-[18.75rem] left-[1.5rem] flex flex-col gap-1">
            <p className="text-[0.875rem] text-gray-1000 leading-none">
              {t('aiAssistant.chatHeader')}
            </p>
            <h2
              className="text-[2rem] font-medium leading-[1.3] bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(103.53deg, #93C5FD 1.92%, #417DF7 70.82%)'
              }}
            >
              {t('aiAssistant.chatTitle')}
            </h2>
          </div>

          {/* Bottom Section - Absolutely positioned at bottom:24px, left:24px, width:452px */}
          <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[28.25rem] flex flex-col gap-4">
            {/* Vertical Pill-shaped Suggested Prompts */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePromptClick('logistics-90d')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors w-fit"
              >
                <div className="flex-shrink-0 text-gray-1000">
                  <CompassIcon16 />
                </div>
                <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                  {t('aiAssistant.prompt1')}
                </span>
              </button>
              <button
                onClick={() => handlePromptClick('prompt2')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors w-fit"
              >
                <div className="flex-shrink-0 text-gray-1000">
                  <CompassIcon16 />
                </div>
                <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                  {t('aiAssistant.prompt2')}
                </span>
              </button>
              <button
                onClick={() => handlePromptClick('prompt3')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors w-fit"
              >
                <div className="flex-shrink-0 text-gray-1000">
                  <CompassIcon16 />
                </div>
                <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                  {t('aiAssistant.prompt3')}
                </span>
              </button>
            </div>

            {/* Input Area Container - white bg, border, rounded-[0.625rem], shadow */}
            <div
              className="bg-white border border-[#dbdbe0] rounded-[0.625rem] p-4"
              style={{
                boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="flex items-center justify-between">
                {/* Input */}
                <div className="flex-1 py-1.5">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('aiAssistant.inputPlaceholder')}
                    className="w-full text-[1rem] text-gray-1000 placeholder:text-gray-600 focus:outline-none bg-transparent caret-primary"
                  />
                </div>

                {/* Right buttons */}
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      // TODO: Implement voice input
                      console.log('Voice input clicked');
                    }}
                    className="w-[2.75rem] h-[2.25rem] flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    aria-label={t('aiAssistant.voiceInput')}
                  >
                    <MicIcon />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="w-[2.75rem] h-[2.25rem] bg-primary hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-[0.375rem] flex items-center justify-center transition-colors"
                    aria-label={t('aiAssistant.sendButton')}
                  >
                    <ArrowUpIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
