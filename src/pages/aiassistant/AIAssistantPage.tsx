import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import WillogLogo from '@/assets/willog-logo.svg';

// Close Icon
const CloseIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Stars Icon for AI branding
const StarsIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14.8229 2.4L16.6532 7.34636L21.5994 9.17661L16.6532 11.0069L14.8229 15.9531L12.9927 11.0069L8.04648 9.17661L12.9927 7.34636L14.8229 2.4Z" fill="currentColor"/>
    <path d="M6.35235 13.6943L7.95119 16.0484L10.3053 17.6472L7.95119 19.246L6.35235 21.6002L4.75352 19.246L2.39941 17.6472L4.75352 16.0484L6.35235 13.6943Z" fill="currentColor"/>
  </svg>
);

export const AIAssistantPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCase } = useAppStore();

  // Get the previous path from navigation state, fallback to dashboard based on business case
  const fromPath = (location.state as { from?: string })?.from;

  // Navigate back to previous location or dashboard
  const handleClose = () => {
    if (fromPath) {
      navigate(fromPath);
    } else {
      // Fallback: navigate to dashboard based on current business case
      const dashboardPath = currentCase === 'bio' ? '/lifesciences' : '/hightech';
      navigate(dashboardPath);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <img src={WillogLogo} alt="Willog" className="h-6" />
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-primary">
            <StarsIcon className="w-5 h-5" />
            <span className="text-body-m font-medium">{t('aiAssistant.title', 'AI 어시스턴트')}</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
          aria-label={t('common.close', '닫기')}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          {/* AI Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <StarsIcon className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-h1 text-gray-1000 mb-4">
            {t('aiAssistant.welcome', 'AI 어시스턴트에 오신 것을 환영합니다')}
          </h1>

          {/* Description */}
          <p className="text-body-m text-gray-600 mb-8">
            {t('aiAssistant.description', '물류 데이터를 분석하고 인사이트를 제공하는 AI 어시스턴트입니다. 질문이나 요청을 입력해 주세요.')}
          </p>

          {/* Chat Input Placeholder */}
          <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={t('aiAssistant.inputPlaceholder', '무엇을 도와드릴까요?')}
                className="flex-1 text-body-m text-gray-1000 placeholder:text-gray-500 outline-none"
              />
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-body-m font-medium hover:bg-primary/90 transition-colors">
                {t('aiAssistant.send', '전송')}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              t('aiAssistant.quickActions.recentAlerts', '최근 알림 분석'),
              t('aiAssistant.quickActions.routeOptimization', '경로 최적화 제안'),
              t('aiAssistant.quickActions.deviceStatus', '디바이스 상태 요약'),
            ].map((action, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-body-s text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
