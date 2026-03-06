import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

// Types
export interface RegistrationSummaryData {
  deviceCount: number;
  containerCount: number;
  customerDistribution: Array<{ name: string; count: number }>;
  routeDistribution: Array<{
    from: string;
    to: string;
    estimatedHours: number;
    containerNumber: string;
    additionalCount: number;
    count: number;
  }>;
  warnings: Array<{
    title: string;
    description: string;
    deviceId: string;
  }>;
}

interface RegistrationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: RegistrationSummaryData;
}

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Section Divider Component
const SectionDivider = () => (
  <div className="w-full h-px bg-gray-300" />
);

// Stat Card Component (for 등록 완료, 고객사별 분포)
const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex-1 flex flex-col gap-2 p-4 bg-gray-50 rounded-[0.625rem]">
    <span className="text-label-xs text-gray-600">{label}</span>
    <span className="text-display-m text-gray-1000">{value}</span>
  </div>
);

// Route Card Component
const RouteCard = ({
  from,
  to,
  containerNumber,
  additionalCount,
  count,
  estimatedLabel,
}: {
  from: string;
  to: string;
  containerNumber: string;
  additionalCount: number;
  count: number;
  estimatedLabel: string;
}) => (
  <div className="flex items-start justify-between p-4 border border-gray-300 rounded-lg w-full">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-label-m-strong text-gray-1000">
          {from} - {to}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">
            <ClockIcon />
          </span>
          <span className="text-[0.75rem] font-medium text-gray-600">
            {estimatedLabel}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 h-5 px-1.5 bg-black/8 rounded">
        <span className="font-mono text-[0.75rem] text-gray-1000">{containerNumber}</span>
        <span className="font-mono text-[0.75rem] text-gray-600">+{additionalCount}</span>
      </div>
    </div>
    <span className="text-[1.5rem] font-display text-gray-1000">{count}</span>
  </div>
);

// Warning Card Component
const WarningCard = ({
  title,
  description,
  deviceId,
}: {
  title: string;
  description: string;
  deviceId: string;
}) => (
  <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-lg w-full">
    <div className="flex flex-col gap-1.5">
      <span className="text-label-m-strong text-gray-1000">{title}</span>
      <span className="text-[0.75rem] font-medium text-gray-600">{description}</span>
    </div>
    <div className="flex items-center h-5 px-1.5 bg-black/8 rounded w-fit">
      <span className="font-mono text-[0.75rem] text-gray-1000">{deviceId}</span>
    </div>
  </div>
);

export const RegistrationSummaryModal = ({
  isOpen,
  onClose,
  onConfirm,
  data,
}: RegistrationSummaryModalProps) => {
  const { t } = useTranslation();
  const { isSidebarCollapsed } = useAppStore();
  const sidebarWidth = isSidebarCollapsed ? 72 : 280;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      contentLabel={t('register.modal.title')}
      className="relative bg-white rounded-3xl shadow-[0px_4px_8px_rgba(0,0,0,0.08),0px_10px_100px_rgba(0,0,0,0.24)] w-[37.5rem] max-h-[90vh] overflow-hidden outline-none border border-gray-300 flex flex-col"
      overlayClassName="fixed top-0 right-0 bottom-0 bg-white/70 backdrop-blur-[0.125rem] z-50 flex items-center justify-center"
      overlayElement={(props, contentElement) => (
        <div {...props} style={{ ...props.style, left: `${sidebarWidth}px` }}>
          {contentElement}
        </div>
      )}
      ariaHideApp={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-300 shrink-0">
        <h2 className="text-[1.25rem] font-medium text-gray-1000 leading-[1.3]">{t('register.modal.title')}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 bg-black/8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-6 px-3 py-3">
          {/* 등록 완료 섹션 */}
          <div className="flex flex-col gap-4">
            <span className="text-label-m-strong text-gray-600 leading-[1.3]">{t('register.modal.registrationComplete')}</span>
            <div className="flex gap-2">
              <StatCard label={t('register.modal.deviceRegistration')} value={data.deviceCount} />
              <StatCard label={t('register.modal.containerRegistration')} value={data.containerCount} />
            </div>
          </div>

          <SectionDivider />

          {/* 고객사별 분포 섹션 */}
          <div className="flex flex-col gap-4">
            <span className="text-label-m-strong text-gray-600 leading-[1.3]">{t('register.modal.distributionByClient')}</span>
            <div className="flex gap-2">
              {data.customerDistribution.map((customer, index) => (
                <StatCard key={index} label={customer.name} value={customer.count} />
              ))}
            </div>
          </div>

          <SectionDivider />

          {/* 경로별 분포 및 예상 소요 섹션 */}
          <div className="flex flex-col gap-4">
            <span className="text-label-m-strong text-gray-600 leading-[1.3]">{t('register.modal.routeDistribution')}</span>
            <div className="flex flex-col gap-3">
              {data.routeDistribution.map((route, index) => (
                <RouteCard
                  key={index}
                  from={route.from}
                  to={route.to}
                  containerNumber={route.containerNumber}
                  additionalCount={route.additionalCount}
                  count={route.count}
                  estimatedLabel={t('register.modal.estimatedHours', { hours: route.estimatedHours })}
                />
              ))}
            </div>
          </div>

          {data.warnings.length > 0 && (
            <>
              <SectionDivider />

              {/* 주의사항 섹션 */}
              <div className="flex flex-col gap-4">
                <span className="text-label-m-strong text-gray-600 leading-[1.3]">{t('register.modal.warnings')}</span>
                <div className="flex flex-col gap-3">
                  {data.warnings.map((warning, index) => (
                    <WarningCard
                      key={index}
                      title={warning.title}
                      description={warning.description}
                      deviceId={warning.deviceId}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-6 pt-3 pb-6 bg-white shrink-0">
        <button
          onClick={onClose}
          className="flex-1 h-10 bg-white border border-gray-300 rounded-1.5 text-[1rem] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        >
          {t('register.modal.cancel')}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-10 bg-primary rounded-1.5 text-[1rem] font-medium text-white hover:bg-blue-600 transition-colors"
        >
          {t('register.modal.confirm')}
        </button>
      </div>
    </Modal>
  );
};
