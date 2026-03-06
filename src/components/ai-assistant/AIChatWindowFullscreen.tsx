import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { type ResponseType } from './AIChatWindow';
import {
  AssistantIcon,
  AddSquareIcon,
  HomeIcon,
  LightningIcon,
  CompassIcon24,
  InboxIcon,
  BookIcon,
  LayoutIcon,
  MinimizeIcon,
  SettingsIcon,
  CloseIcon,
  AttachmentIcon,
  ChevronDownIcon,
  CompassIcon16,
  MicIcon,
  ArrowUpIcon,
} from '@/assets/ai-assistant';
import { AIResponseView } from './AIResponseView';
import attachmentIconSvg from '@/assets/common/attatchment-01.svg';
import microphoneIconSvg from '@/assets/common/microphone-01.svg';

interface AIChatWindowFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  initialResponse?: ResponseType;
}

type MenuItemType = 'home' | 'actions' | 'topics' | 'save' | 'help';

export const AIChatWindowFullscreen = ({ isOpen, onClose, onMinimize, initialResponse }: AIChatWindowFullscreenProps) => {
  const { t } = useTranslation();
  const { isSidebarCollapsed } = useAppStore();
  const sidebarWidth = isSidebarCollapsed ? '4.5rem' : '17.5rem';
  const [inputMessage, setInputMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState<MenuItemType>('home');

  // Track user-initiated navigation (null = user hasn't navigated, use initialResponse)
  // This allows initialResponse to control display until user clicks a prompt or back button
  const [userSelectedResponse, setUserSelectedResponse] = useState<ResponseType | 'not-set'>('not-set');

  // Determine what to display:
  // - If user has made a selection, use that
  // - Otherwise, use the initialResponse prop directly
  const activeResponse: ResponseType = userSelectedResponse !== 'not-set'
    ? userSelectedResponse
    : (initialResponse ?? null);

  console.log('[AIChatWindowFullscreen] userSelectedResponse:', userSelectedResponse, 'activeResponse:', activeResponse);

  // Reset user selection when initialResponse changes (e.g., reopening with different response)
  useEffect(() => {
    console.log('[AIChatWindowFullscreen] useEffect triggered - initialResponse changed to:', initialResponse);
    setUserSelectedResponse('not-set');
  }, [initialResponse]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      console.log('Sending message:', inputMessage);
      setInputMessage('');
    }
  };

  const handlePromptClick = (responseType: ResponseType) => {
    if (responseType) {
      setUserSelectedResponse(responseType);
    }
  };

  const handleBackToHome = () => {
    setUserSelectedResponse(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const historyItems = [
    t('aiAssistant.historyItem1'),
    t('aiAssistant.historyItem2'),
    t('aiAssistant.historyItem3'),
    t('aiAssistant.historyItem4'),
    t('aiAssistant.historyItem5'),
    t('aiAssistant.historyItem6'),
    t('aiAssistant.historyItem7'),
  ];

  const menuItems: { id: MenuItemType; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <HomeIcon className="w-6 h-6" />, label: t('aiAssistant.home') },
    { id: 'actions', icon: <LightningIcon className="w-6 h-6" />, label: t('aiAssistant.actions') },
    { id: 'topics', icon: <CompassIcon24 className="w-6 h-6" />, label: t('aiAssistant.topics') },
    { id: 'save', icon: <InboxIcon className="w-6 h-6" />, label: t('aiAssistant.save') },
    { id: 'help', icon: <BookIcon className="w-6 h-6" />, label: t('aiAssistant.help') },
  ];

  return (
    <>
      {/* Backdrop - doesn't close on click */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 bg-white/70 backdrop-blur-[0.125rem] flex items-center justify-center animate-modal-fade-in"
        style={{ left: sidebarWidth }}
      >
        {/* Modal Container - responsive sizing with border and shadow */}
        <div
          className="w-[85rem] h-[50rem] max-w-[calc(100vw-7.5rem)] max-h-[calc(100vh-5rem)] bg-white rounded-[1.5rem] overflow-hidden flex animate-modal-fade-in border border-gray-300"
          style={{
            boxShadow: '0px 4px 32px 4px rgba(0, 0, 0, 0.16)'
          }}
        >
          {/* Left Icon Bar - 64px width, Figma: px-12px py-16px */}
          <div className="w-16 bg-gray-50 flex flex-col items-center px-3 py-4 border-r border-gray-300">
            {/* Assistant Icon */}
            <div className="flex-shrink-0">
              <AssistantIcon className="w-8 h-8" />
            </div>

            {/* Add Button - gap-6 (24px) from assistant icon */}
            <button
              onClick={handleBackToHome}
              className="mt-6 w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-[rgba(120,120,128,0.08)] text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
              aria-label="Add new"
            >
              <AddSquareIcon className="w-5 h-5" />
            </button>

            {/* Menu Items - gap-6 (24px) from add, gap-3 (12px) between items */}
            <div className="flex flex-col items-center gap-3 mt-6 w-full">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id === 'home') {
                      handleBackToHome();
                    }
                  }}
                  className="flex flex-col items-center gap-1 w-full"
                >
                  {/* Icon wrapper - only icon gets background when selected */}
                  <div className={`w-full flex justify-center px-5 py-2 rounded-[0.3125rem] ${
                    activeMenu === item.id ? 'bg-primary-transparent' : ''
                  }`}>
                    <div className={activeMenu === item.id ? 'text-primary' : 'text-gray-500'}>
                      {item.icon}
                    </div>
                  </div>
                  {/* Text - no background, only color changes */}
                  <span className={`text-[0.75rem] leading-none ${
                    activeMenu === item.id ? 'text-primary' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Side Panel - 224px width */}
          <div className="w-56 bg-gray-50 border-r border-gray-300 flex flex-col">
            {/* Panel Header - height matches main header (60px) */}
            <div className="h-[3.75rem] flex items-center justify-between px-2 border-b border-gray-300">
              <span className="text-[0.875rem] font-medium text-gray-1000 px-2">{t('aiAssistant.home')}</span>
              <button className="text-gray-500 hover:text-gray-800 transition-colors px-2">
                <LayoutIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area - scrollable, includes Recent, History Items and View All */}
            <div className="flex-1 flex flex-col gap-3 px-2 py-5 overflow-y-auto">
              {/* Recent Label */}
              <p className="text-[0.75rem] text-gray-600 px-2 leading-none">{t('aiAssistant.recent')}</p>

              {/* History Items */}
              <div className="flex flex-col gap-0.5">
                {historyItems.map((item, index) => (
                  <button
                    key={index}
                    className="text-left text-[0.8125rem] text-gray-1000 px-2 py-2 rounded hover:bg-gray-100 transition-colors truncate"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* View All Button - right after history items with gap-3 spacing */}
              <button className="text-[0.75rem] text-gray-600 hover:text-gray-800 transition-colors px-2 text-left leading-none">
                {t('aiAssistant.viewAll')}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header - 60px height */}
            <div className="h-[3.75rem] px-3 flex items-center justify-end gap-2 bg-gray-50 border-b border-gray-300">
              <button
                onClick={onMinimize}
                className="w-[2.25rem] h-[2.25rem] flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
                aria-label={t('aiAssistant.minimize')}
              >
                <MinimizeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => console.log('Settings clicked')}
                className="w-[2.25rem] h-[2.25rem] flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
                aria-label={t('aiAssistant.settingsButton')}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-[2.25rem] h-[2.25rem] flex items-center justify-center text-gray-500 hover:text-gray-800 bg-black/8 rounded-full transition-colors"
                aria-label={t('aiAssistant.closeButton')}
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {activeResponse ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Response Content - scroll handled by AIResponseView internally */}
                <div className="flex-1 min-h-0 flex overflow-hidden">
                  <AIResponseView onBack={handleBackToHome} responseType={activeResponse} />
                </div>

                {/* Input Bar - fixed at bottom, Figma: width 860px, bottom margin 40px, border #dbdbe0, radius 10px, shadow */}
                <div className="flex justify-center px-8 pt-4 pb-[2.5rem]">
                  <div
                    className="w-[53.75rem] bg-white border border-[#dbdbe0] rounded-[0.625rem] p-4"
                    style={{
                      boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Attach Button - Figma: bg #ebebec, px 12px, py 8px, radius 6px, gap 6px */}
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 rounded-[0.375rem] text-gray-600 hover:text-gray-800 transition-colors">
                        <img src={attachmentIconSvg} alt="" className="w-5 h-5" />
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>

                      {/* Input Field - flex-1 to take remaining space */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={t('aiAssistant.inputPlaceholder')}
                          className="w-full text-[1rem] text-gray-1000 placeholder:text-gray-600 focus:outline-none bg-transparent caret-primary"
                        />
                      </div>

                      {/* Right group */}
                      <div className="flex items-center">
                        {/* Mic Button - Figma: 44x36px, radius 8px */}
                        <button
                          onClick={() => console.log('Voice input clicked')}
                          className="w-[2.75rem] h-[2.25rem] flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
                          aria-label={t('aiAssistant.voiceInput')}
                        >
                          <img src={microphoneIconSvg} alt="" className="w-5 h-5" />
                        </button>

                        {/* Send Button - Figma: 44x36px, bg #93c5fd (disabled), radius 6px */}
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="w-[2.75rem] h-[2.25rem] bg-primary hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-[0.375rem] flex items-center justify-center transition-colors"
                          aria-label={t('aiAssistant.sendButton')}
                        >
                          <ArrowUpIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[53.75rem] flex flex-col items-center gap-8">
                  {/* Welcome Message */}
                  <div className="flex flex-col items-center gap-2">
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

                  {/* Input Area */}
                  <div className="w-full flex flex-col gap-4">
                    {/* Input Container */}
                    <div
                      className="bg-white border border-[#dbdbe0] rounded-[0.625rem] p-4"
                      style={{
                        boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Attach Button - Figma: bg-gray-200, no text, only icon + chevron */}
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 rounded-[0.375rem] text-gray-600 hover:text-gray-800 transition-colors">
                          <AttachmentIcon className="w-5 h-5" />
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        {/* Input Field */}
                        <div className="flex-1">
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
                            onClick={() => console.log('Voice input clicked')}
                            className="w-[2.75rem] h-[2.25rem] flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            aria-label={t('aiAssistant.voiceInput')}
                          >
                            <MicIcon className="w-5 h-5" />
                          </button>
                          {/* Send button - Figma: disabled state uses bg-blue-300 */}
                          <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className="w-[2.75rem] h-[2.25rem] bg-primary hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-[0.375rem] flex items-center justify-center transition-colors"
                            aria-label={t('aiAssistant.sendButton')}
                          >
                            <ArrowUpIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Buttons */}
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => handlePromptClick('logistics-90d')}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <div className="flex-shrink-0 text-gray-1000">
                          <CompassIcon16 className="w-4 h-4" />
                        </div>
                        <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                          {t('aiAssistant.prompt1')}
                        </span>
                      </button>
                      <button
                        onClick={() => handlePromptClick('prompt2')}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <div className="flex-shrink-0 text-gray-1000">
                          <CompassIcon16 className="w-4 h-4" />
                        </div>
                        <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                          {t('aiAssistant.prompt2')}
                        </span>
                      </button>
                      <button
                        onClick={() => handlePromptClick('prompt3')}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <div className="flex-shrink-0 text-gray-1000">
                          <CompassIcon16 className="w-4 h-4" />
                        </div>
                        <span className="text-[0.875rem] text-gray-1000 leading-none whitespace-nowrap">
                          {t('aiAssistant.prompt3')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
