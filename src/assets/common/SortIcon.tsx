// Sort Icon - Based on sort.svg (16x16)
const SortIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_sort)">
      <path
        d="M2 12H6V10.6667H2V12ZM2 4V5.33333H14V4H2ZM2 8.66667H10V7.33333H2V8.66667Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_sort">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default SortIcon;
