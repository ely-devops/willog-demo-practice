import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore, BizCase } from '@/stores/useAppStore';
import { DOMAIN_LIST } from '@/utils/mockData';
import WillogLogo from '@/assets/willog-logo.svg';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// LNB Icon imports
import layoutLeftIcon from '@/assets/lnb/layout-left.svg';

// Menu Icons
import menuIcon1 from '@/assets/menu-icons/menu-icon-1.svg';
import menuIcon1Selected from '@/assets/menu-icons/menu-icon-1-selected.svg';
import menuIcon2 from '@/assets/menu-icons/menu-icon-2.svg';
import menuIcon2Selected from '@/assets/menu-icons/menu-icon-2-selected.svg';
import menuIcon3 from '@/assets/menu-icons/menu-icon-3.svg';
import menuIcon3Selected from '@/assets/menu-icons/menu-icon-3-selected.svg';
import menuIcon4 from '@/assets/menu-icons/menu-icon-4.svg';
import menuIcon4Selected from '@/assets/menu-icons/menu-icon-4-selected.svg';
import menuIcon5 from '@/assets/menu-icons/menu-icon-5.svg';
import menuIcon5Selected from '@/assets/menu-icons/menu-icon-5-selected.svg';

// Domain Icons
import domainIcon1 from '@/assets/domain-icons/domain-icon-1.svg';
import domainIcon1Selected from '@/assets/domain-icons/domain-icon-1-selected.svg';
import domainIcon2 from '@/assets/domain-icons/domain-icon-2.svg';
import domainIcon2Selected from '@/assets/domain-icons/domain-icon-2-selected.svg';
import domainIcon3 from '@/assets/domain-icons/domain-icon-3.svg';
import domainIcon3Selected from '@/assets/domain-icons/domain-icon-3-selected.svg';
import domainIcon4 from '@/assets/domain-icons/domain-icon-4.svg';
import domainIcon4Selected from '@/assets/domain-icons/domain-icon-4-selected.svg';

// Unfold More Icon (20x20)
const UnfoldMoreIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6.66666 12.5L10 15.8333L13.3333 12.5" stroke="var(--color-gray-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66666 7.5L10 4.16667L13.3333 7.5" stroke="var(--color-gray-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Check Icon (16x16)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="var(--color-blue-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface MenuItemProps {
  path: string;
  label: string;
  icon: string;
  iconSelected: string;
  isActive: boolean;
  disabled?: boolean;
  collapsed?: boolean;
}

const MenuItem = ({ path, label, icon, iconSelected, isActive, disabled = false, collapsed = false }: MenuItemProps) => {
  const className = `
    group flex items-center h-10 px-3 rounded w-full transition-all overflow-hidden
    ${isActive
      ? 'bg-primary-transparent text-primary'
      : 'text-gray-700 hover:bg-gray-100'
    }
    ${disabled ? 'cursor-default' : ''}
    ${collapsed ? 'justify-center' : 'gap-2'}
  `;

  const iconElement = isActive ? (
    <img src={iconSelected} alt="" className="w-5 h-5" />
  ) : (
    <>
      <img src={icon} alt="" className="w-5 h-5 group-hover:hidden" />
      <img src={iconSelected} alt="" className="w-5 h-5 hidden group-hover:block" />
    </>
  );

  // 텍스트는 항상 렌더링하되, collapsed 상태에서는 opacity-0으로 숨김
  // 펼쳐질 때 delay를 주어 너비 애니메이션이 진행된 후 페이드인
  const content = (
    <>
      <div className="flex-shrink-0">{iconElement}</div>
      <span className={`text-sm leading-none font-normal whitespace-nowrap transition-sidebar-content ${
        collapsed ? 'opacity-0 w-0' : 'opacity-100 delay-300'
      }`}>
        {label}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div className={className} title={collapsed ? label : undefined}>
        {content}
      </div>
    );
  }

  return (
    <Link to={path} className={className} title={collapsed ? label : undefined}>
      {content}
    </Link>
  );
};

// 도메인별 대시보드 URL 매핑
const DOMAIN_DASHBOARD_URL: Record<BizCase, string> = {
  semicon: '/dashboard/hightech',
  bio: '/dashboard/lifesciences',
  fnb: '/dashboard/hightech', // fnb/general은 hightech로 fallback
  general: '/dashboard/hightech',
};

// 도메인별 경로 세그먼트
const DOMAIN_PATH: Record<BizCase, string> = {
  semicon: 'hightech',
  bio: 'lifesciences',
  fnb: 'hightech',
  general: 'hightech',
};

// 도메인별 기본 여정 ID
const DOMAIN_DEFAULT_JOURNEY: Record<BizCase, string> = {
  semicon: 'ID-SC01',
  bio: 'ID-SC05',
  fnb: 'ID-SC01',
  general: 'ID-SC01',
};

export const LNB = () => {
  const { t } = useTranslation();
  const { currentCase, setCase, isSidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 열림 의도 (외부 클릭/ESC 감지용)
  const [isAnimating, setIsAnimating] = useState(false); // 실제 보임 상태 (애니메이션 제어)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // 드롭다운 위치 계산 (동기적으로 위치를 반환하는 함수)
  const calculateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (isSidebarCollapsed) {
        return {
          top: rect.top,
          left: rect.right + 8,
        };
      } else {
        return {
          top: rect.bottom + 8,
          left: rect.left,
        };
      }
    }
    return { top: 0, left: 0 };
  }, [isSidebarCollapsed]);

  // 스크롤/리사이즈 시 위치 업데이트
  const updateDropdownPosition = useCallback(() => {
    setDropdownPosition(calculateDropdownPosition());
  }, [calculateDropdownPosition]);

  // 드롭다운 열기/닫기 애니메이션 처리
  useEffect(() => {
    if (isDropdownOpen) {
      // Step 1: 먼저 정확한 위치 계산 (드롭다운은 아직 숨김 상태)
      setDropdownPosition(calculateDropdownPosition());

      // Step 2: 다음 프레임에서 애니메이션 시작 (위치가 올바르게 설정된 후)
      const rafId = requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    } else {
      // 닫을 때는 바로 애니메이션 시작 (fade out)
      setIsAnimating(false);
    }
  }, [isDropdownOpen, calculateDropdownPosition, updateDropdownPosition]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Portal 드롭다운과 트리거 버튼 모두 체크
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // ESC 키 감지
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  // 도메인 선택 핸들러
  const handleCaseSelect = (caseId: BizCase) => {
    setCase(caseId);
    setIsDropdownOpen(false);

    // If on a journey page, navigate to the new domain's default journey
    if (location.pathname.startsWith('/journey/')) {
      const defaultJourneyId = DOMAIN_DEFAULT_JOURNEY[caseId];
      navigate(`/journey/${DOMAIN_PATH[caseId]}/${defaultJourneyId}`);
    } else if (location.pathname.startsWith('/dashboard/')) {
      // If on dashboard, navigate to the selected domain's dashboard
      navigate(DOMAIN_DASHBOARD_URL[caseId]);
    } else {
      // Otherwise, navigate to the selected domain's default dashboard
      navigate(DOMAIN_DASHBOARD_URL[caseId]);
    }
  };

  // 도메인별 아이콘 매핑
  const domainIconMap: Record<BizCase, { normal: string; selected: string }> = {
    semicon: { normal: domainIcon1, selected: domainIcon1Selected },
    bio: { normal: domainIcon2, selected: domainIcon2Selected },
    fnb: { normal: domainIcon3, selected: domainIcon3Selected },
    general: { normal: domainIcon4, selected: domainIcon4Selected },
  };

  const getDomainIcon = (domainId: BizCase, isSelected: boolean = false) => {
    const icons = domainIconMap[domainId] || domainIconMap.semicon;
    return <img src={isSelected ? icons.selected : icons.normal} alt="" className="w-5 h-5" />;
  };

  // 드롭다운 아이템용 - hover/selected 상태에 따라 아이콘 변경
  const getDomainIconWithHover = (domainId: BizCase, isSelected: boolean) => {
    const icons = domainIconMap[domainId] || domainIconMap.semicon;

    if (isSelected) {
      // 선택된 상태: 항상 selected 아이콘
      return <img src={icons.selected} alt="" className="w-5 h-5" />;
    }

    // 비선택 상태: hover시 selected 아이콘으로 전환
    return (
      <>
        <img src={icons.normal} alt="" className="w-5 h-5 group-hover:hidden" />
        <img src={icons.selected} alt="" className="w-5 h-5 hidden group-hover:block" />
      </>
    );
  };

  // DOMAIN_LIST에서 cases 생성
  const cases = DOMAIN_LIST.map(d => ({
    ...d,
  }));

  // 대시보드 메뉴는 /dashboard/ 경로에서 활성화
  const isDashboardActive = location.pathname.startsWith('/dashboard/');

  // 현재 도메인에 따른 대시보드 URL
  const dashboardUrl = DOMAIN_DASHBOARD_URL[currentCase];

  const menuItems = [
    {
      path: dashboardUrl,
      label: t('nav.dashboard', '대시보드'),
      icon: menuIcon1,
      iconSelected: menuIcon1Selected,
      disabled: false
    },
    {
      path: '/register',
      label: t('nav.register', '등록'),
      icon: menuIcon2,
      iconSelected: menuIcon2Selected,
      disabled: false
    },
    {
      path: '/management',
      label: t('nav.management', '관리'),
      icon: menuIcon3,
      iconSelected: menuIcon3Selected,
      disabled: true
    },
    {
      path: '/intelligence',
      label: t('nav.intelligence', '데이터 인텔리전스'),
      icon: menuIcon4,
      iconSelected: menuIcon4Selected,
      disabled: true
    },
    {
      path: '/history',
      label: t('nav.history', '이력 추적'),
      icon: menuIcon5,
      iconSelected: menuIcon5Selected,
      disabled: true
    },
  ];

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col gap-6 px-3 py-5">
      {/* Logo & Toggle */}
      <div className={`flex items-center px-1 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link
          to={dashboardUrl}
          className={`transition-sidebar-content ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-300'}`}
        >
          <img src={WillogLogo} alt="Willog" className="w-[5.5rem] h-[1.375rem] cursor-pointer" />
        </Link>
        <button
          onClick={toggleSidebar}
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors cursor-pointer flex-shrink-0"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
        >
          <img src={layoutLeftIcon} alt="" className="w-5 h-5" />
        </button>
      </div>

      {/* Domain Selector */}
      <div className="flex flex-col gap-7">
        <div className="relative">
          {/* Trigger Button */}
          <button
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              flex items-center justify-between bg-white border border-gray-300 rounded
              shadow-sm w-full overflow-hidden
              ${isSidebarCollapsed ? 'px-3 py-3' : 'px-4 py-3'}
              hover:bg-gray-50 transition-colors
            `}
            aria-expanded={isDropdownOpen}
            aria-label="Select domain"
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-2'}`}>
              <span className="flex items-center flex-shrink-0">
                {getDomainIcon(currentCase)}
              </span>
              <span className={`text-sm leading-none text-gray-1000 whitespace-nowrap transition-sidebar-content ${
                isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 delay-300'
              }`}>
                {t(`bizCase.${currentCase}`)}
              </span>
            </div>
            <UnfoldMoreIcon
              className={`flex-shrink-0 transition-sidebar-content ${
                isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 delay-300'
              }`}
            />
          </button>

          {/* Dropdown Menu - Portal로 body에 렌더링하여 stacking context 문제 해결 */}
          {createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: isSidebarCollapsed ? 'auto' : (triggerRef.current?.offsetWidth || 'auto'),
                minWidth: isSidebarCollapsed ? '15rem' : undefined,
              }}
              className={`
                bg-white rounded shadow-[0px_10px_40px_0px_rgba(0,0,0,0.16)]
                flex flex-col gap-[0.125rem] p-2 z-[9999]
                transform origin-top
                transition-[opacity,transform] duration-500 ease-out
                ${isAnimating
                  ? 'opacity-100 scale-y-100 pointer-events-auto'
                  : 'opacity-0 scale-y-95 pointer-events-none'
                }
              `}
            >
              {cases.map((caseItem) => {
                const isSelected = currentCase === caseItem.id;
                return (
                  <button
                    key={caseItem.id}
                    onClick={() => handleCaseSelect(caseItem.id)}
                    className={`
                      group flex items-center justify-between px-3 py-3 rounded w-full
                      transition-colors text-left
                      ${isSelected
                        ? 'bg-primary-transparent text-gray-1000'
                        : 'hover:bg-gray-100 text-gray-1000'
                      }
                    `}
                  >
                    <div className="flex items-center gap-[0.375rem]">
                      <span className="flex items-center">
                        {getDomainIconWithHover(caseItem.id, isSelected)}
                      </span>
                      <span className="text-sm leading-none">{t(`bizCase.${caseItem.id}`)}</span>
                    </div>
                    {isSelected && <CheckIcon />}
                  </button>
                );
              })}
            </div>,
            document.body
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              iconSelected={item.iconSelected}
              isActive={
                item.path === dashboardUrl
                  ? isDashboardActive
                  : location.pathname.startsWith(item.path)
              }
              disabled={item.disabled}
              collapsed={isSidebarCollapsed}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

