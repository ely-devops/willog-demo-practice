import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AIAssistantButton } from './AIAssistantButton';
import { AIChatWindow, type ResponseType } from './AIChatWindow';
import { AIChatWindowFullscreen } from './AIChatWindowFullscreen';

export const AIAssistant = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialResponse, setInitialResponse] = useState<ResponseType>(null);

  // Check if AI is in fullscreen mode from query params
  useEffect(() => {
    const aiParam = searchParams.get('ai');
    if (aiParam === 'fullscreen' && !isFullscreen) {
      setIsFullscreen(true);
      setIsChatOpen(true);
    }
  }, [searchParams, isFullscreen]);

  // Listen for external events to open AI Assistant directly in fullscreen
  useEffect(() => {
    const handleOpenAIAssistant = (e: CustomEvent<{ responseType: ResponseType }>) => {
      // Don't overwrite a specific responseType with null
      // This prevents useUrlStateSync from overwriting the alert response
      if (e.detail.responseType === null && initialResponse !== null && isFullscreen) {
        return;
      }

      setInitialResponse(e.detail.responseType);
      setIsFullscreen(true);
      setIsChatOpen(true);
      // Update URL with query param
      setSearchParams({ ai: 'fullscreen' });
    };

    window.addEventListener('openAIAssistant', handleOpenAIAssistant as EventListener);
    return () => {
      window.removeEventListener('openAIAssistant', handleOpenAIAssistant as EventListener);
    };
  }, [setSearchParams, isFullscreen, initialResponse]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleMaximize = (responseType?: ResponseType) => {
    setInitialResponse(responseType ?? null);
    setIsFullscreen(true);
    // Update URL with query param
    setSearchParams({ ai: 'fullscreen' });
  };

  const handleMinimize = () => {
    setIsFullscreen(false);
    setInitialResponse(null);
    // Remove query param
    searchParams.delete('ai');
    setSearchParams(searchParams);
  };

  const handleFullscreenClose = () => {
    setIsFullscreen(false);
    setIsChatOpen(false);
    setInitialResponse(null);
    // Remove query param
    searchParams.delete('ai');
    setSearchParams(searchParams);
  };

  return (
    <>
      {!isFullscreen && <AIAssistantButton onClick={handleOpenChat} />}
      <AIChatWindow
        isOpen={isChatOpen && !isFullscreen}
        onClose={handleCloseChat}
        onMaximize={handleMaximize}
      />
      {isFullscreen && (
        <AIChatWindowFullscreen
          key={initialResponse ?? 'home'}
          isOpen={isFullscreen}
          onClose={handleFullscreenClose}
          onMinimize={handleMinimize}
          initialResponse={initialResponse}
        />
      )}
    </>
  );
};
