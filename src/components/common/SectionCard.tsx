import type { ReactNode } from 'react';

export interface SectionCardProps {
  /** 섹션 타이틀 */
  title: string;
  /** 섹션 서브타이틀 (선택) */
  subtitle?: string;
  /** 우측 액션 영역 - 탭, 버튼, 검색창 등 (선택) */
  actions?: ReactNode;
  /** 섹션 콘텐츠 */
  children: ReactNode;
  /** 헤더 표시 여부 (기본값: true) */
  showHeader?: boolean;
}

/**
 * 재사용 가능한 섹션 카드 컴포넌트
 *
 * 헤더 (bg-gray-50) + 콘텐츠 영역으로 구성
 *
 * 적용 예시:
 * - 진행 중인 여정
 * - 경로 및 현재 위치
 * - 환경 데이터 모니터링
 * - 디바이스 사용 목록
 */
export const SectionCard = ({
  title,
  subtitle,
  actions,
  children,
  showHeader = true,
}: SectionCardProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-300 px-7 py-5 flex items-center justify-between">
          {/* 좌측: 타이틀 + 서브타이틀 */}
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-gray-1000">{title}</h2>
            {subtitle && (
              <p className="text-body-s text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* 우측: 액션 영역 */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {children}
    </div>
  );
};

export default SectionCard;
