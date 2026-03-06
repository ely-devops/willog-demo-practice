import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { DateRange } from '@/stores/useAppStore';

// 아이콘 컴포넌트
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6667 1.33333V4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.33333 1.33333V4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 6.66667H14"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
}

export const DateRangePicker = ({ value, onChange, className = '', disabled = false }: DateRangePickerProps) => {
  const { t } = useTranslation();
  const weekdays = t('common.datePicker.weekdays', { returnObjects: true }) as string[];
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(dayjs(value.start));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
        setTempStart(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 달력 생성
  const generateCalendarDays = () => {
    const startOfMonth = viewMonth.startOf('month');
    const startDay = startOfMonth.day();
    const daysInMonth = viewMonth.daysInMonth();

    const days: (dayjs.Dayjs | null)[] = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // 현재 달의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(startOfMonth.add(i - 1, 'day'));
    }

    return days;
  };

  // 날짜 선택
  const handleDateClick = (date: dayjs.Dayjs) => {
    if (!selectingEnd) {
      // 시작 날짜 선택
      setTempStart(date.toDate());
      setSelectingEnd(true);
    } else {
      // 종료 날짜 선택
      if (tempStart) {
        const start = dayjs(tempStart);
        if (date.isBefore(start)) {
          onChange({ start: date.toDate(), end: tempStart });
        } else {
          onChange({ start: tempStart, end: date.toDate() });
        }
      }
      setIsOpen(false);
      setSelectingEnd(false);
      setTempStart(null);
    }
  };

  // 날짜가 선택 범위 내에 있는지 확인
  const isInRange = (date: dayjs.Dayjs) => {
    const start = dayjs(tempStart || value.start);
    const end = dayjs(value.end);

    if (selectingEnd && tempStart) {
      return date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'));
    }

    return date.isAfter(dayjs(value.start).subtract(1, 'day')) &&
           date.isBefore(dayjs(value.end).add(1, 'day'));
  };

  // 날짜가 시작/끝 날짜인지 확인
  const isStartDate = (date: dayjs.Dayjs) => {
    const start = tempStart || value.start;
    return date.isSame(dayjs(start), 'day');
  };

  const isEndDate = (date: dayjs.Dayjs) => {
    if (selectingEnd) return false;
    return date.isSame(dayjs(value.end), 'day');
  };

  const formatDateRange = () => {
    return `${dayjs(value.start).format('YYYY/MM/DD')} ~ ${dayjs(value.end).format('YYYY/MM/DD')}`;
  };

  const days = generateCalendarDays();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 rounded text-gray-800 transition-colors ${disabled ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'}`}
      >
        <CalendarIcon className="text-gray-600" />
        <span className="text-sm leading-none font-medium">{formatDateRange()}</span>
      </button>

      {/* 드롭다운 캘린더 */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-[18.75rem]">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm font-medium text-gray-800">
              {t('common.datePicker.yearMonthFormat', { year: viewMonth.year(), month: viewMonth.month() + 1 })}
            </span>
            <button
              onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const inRange = isInRange(day);
              const isStart = isStartDate(day);
              const isEnd = isEndDate(day);
              const isSelected = isStart || isEnd;

              return (
                <button
                  key={day.format('YYYY-MM-DD')}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-8 text-sm rounded transition-colors
                    ${isSelected ? 'bg-primary text-white' : ''}
                    ${inRange && !isSelected ? 'bg-blue-50 text-gray-800' : ''}
                    ${!inRange && !isSelected ? 'text-gray-800 hover:bg-gray-100' : ''}
                  `}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>

          {/* 안내 텍스트 */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {selectingEnd ? t('common.datePicker.selectEndDate') : t('common.datePicker.selectStartDate')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// 연도 선택 드롭다운
interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  className?: string;
  disabled?: boolean;
}

export const YearSelector = ({ value, onChange, className = '', disabled = false }: YearSelectorProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 연도 목록 (현재 연도 기준 ±5년)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 rounded transition-colors ${disabled ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'}`}
      >
        <span className="text-sm leading-none font-medium text-gray-800">{t('common.datePicker.yearFormat', { year: value })}</span>
        <ChevronDownIcon className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[6.25rem] max-h-[12.5rem] overflow-y-auto">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                onChange(year);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors
                ${year === value ? 'bg-blue-50 text-primary font-medium' : 'text-gray-800'}
              `}
            >
              {t('common.datePicker.yearFormat', { year })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
