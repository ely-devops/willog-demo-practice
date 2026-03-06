// Room Icon (16x16) - Figma에서 가져온 현재 위치 아이콘
// 색상: gray-400 (#B8B8C0)
const RoomIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14" fill="none" className={className}>
    <path d="M4.66667 0C2.08667 0 0 2.08667 0 4.66667C0 8.16667 4.66667 13.3333 4.66667 13.3333C4.66667 13.3333 9.33333 8.16667 9.33333 4.66667C9.33333 2.08667 7.24667 0 4.66667 0ZM4.66667 6.33333C3.74667 6.33333 3 5.58667 3 4.66667C3 3.74667 3.74667 3 4.66667 3C5.58667 3 6.33333 3.74667 6.33333 4.66667C6.33333 5.58667 5.58667 6.33333 4.66667 6.33333Z" fill="currentColor"/>
  </svg>
);

export default RoomIcon;
