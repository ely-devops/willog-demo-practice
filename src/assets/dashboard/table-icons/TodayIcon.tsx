// Today Icon (16x16) - Figma에서 가져온 도착 예정 아이콘
// 색상: gray-400 (#B8B8C0)
const TodayIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 14" fill="none" className={className}>
    <path d="M10.6667 1.33333H10V0H8.66667V1.33333H3.33333V0H2V1.33333H1.33333C0.593333 1.33333 0.00666666 1.93333 0.00666666 2.66667L0 12C0 12.7333 0.593333 13.3333 1.33333 13.3333H10.6667C11.4 13.3333 12 12.7333 12 12V2.66667C12 1.93333 11.4 1.33333 10.6667 1.33333ZM10.6667 12H1.33333V4.66667H10.6667V12ZM2.66667 6H6V9.33333H2.66667V6Z" fill="currentColor"/>
  </svg>
);

export default TodayIcon;
