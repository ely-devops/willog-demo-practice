import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LNB } from './LNB';
import { Header } from './Header';
import { useAppStore } from '@/stores/useAppStore';
import { AIAssistant } from '@/components/ai-assistant';

export const Layout = () => {
  const { isSidebarCollapsed } = useAppStore();
  const { pathname } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // 페이지 이동 시 스크롤 상단으로 이동
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* 전체 컨테이너: 화면 전체 높이 고정, overflow-hidden으로 페이지 스크롤 방지 */}
      <div className="flex h-screen w-full overflow-hidden">
        {/* LNB Sidebar - 동적 너비 (펼침: 280px, 접힘: 72px), 전체 높이 */}
        <aside
          className={`
            ${isSidebarCollapsed ? 'w-[4.5rem]' : 'w-[17.5rem]'}
            flex-shrink-0 h-full bg-gray-50
            transition-sidebar
          `}
        >
          <LNB />
        </aside>

        {/* Main Content - 나머지 공간 전체 차지, 높이 고정 */}
        <main className="flex-1 flex flex-col h-full min-w-0 bg-gray-50">
          {/* Header - Sticky, 64px 높이 */}
          <Header />

          {/* Content Area - 배경 흰색, 패딩 40px (register 페이지는 상단만), overflow-auto로 페이지별 스크롤 허용 */}
          <div
            ref={contentRef}
            className={`flex-1 bg-white rounded-tl-2 border border-gray-200 overflow-auto ${
              pathname === '/register' ? 'pt-10' : 'p-10'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Assistant - Fixed button on all authenticated pages (독립적으로 렌더링) */}
      <AIAssistant />
    </>
  );
};
