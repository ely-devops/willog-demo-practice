import { useTranslation } from 'react-i18next';

interface SuccessToastProps {
  isVisible: boolean;
  onClose: () => void;
  deviceCount: number;
}

// File/Document Icon (파란색 문서 아이콘)
const FileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="24" height="28" rx="3" fill="#417DF7"/>
    <rect x="8" y="8" width="12" height="2" rx="1" fill="white"/>
    <rect x="8" y="13" width="16" height="2" rx="1" fill="white"/>
    <rect x="8" y="18" width="14" height="2" rx="1" fill="white"/>
    <rect x="8" y="23" width="10" height="2" rx="1" fill="white"/>
  </svg>
);

export const SuccessToast = ({
  isVisible,
  onClose,
  deviceCount,
}: SuccessToastProps) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className="fixed left-[20rem] bottom-10 z-50">
      <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-[0px_8px_16px_rgba(0,0,0,0.12)] w-[26.75rem]">
        {/* 파일 아이콘 */}
        <div className="shrink-0">
          <FileIcon />
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col gap-4">
          {/* 제목 + 설명 */}
          <div className="flex flex-col gap-2">
            <p className="text-label-m-strong text-gray-1000">
              {t('register.toast.title', { count: deviceCount })}
            </p>
            <p className="text-body-s text-gray-600 leading-[1.48]">
              {t('register.toast.message')}
            </p>
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className="h-8 px-3 bg-white border border-gray-300 rounded text-[0.8125rem] font-medium text-gray-800 hover:bg-gray-50 transition-colors w-fit"
          >
            {t('common.ok')}
          </button>
        </div>
      </div>
    </div>
  );
};
