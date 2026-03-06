interface MicIconProps {
  className?: string;
}

export const MicIcon = ({ className }: MicIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 1.66675V10.0001"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 13.3333C11.841 13.3333 13.3333 11.841 13.3333 10V4.99999C13.3333 3.15904 11.841 1.66666 10 1.66666C8.15905 1.66666 6.66667 3.15904 6.66667 4.99999V10C6.66667 11.841 8.15905 13.3333 10 13.3333Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.6667 8.33325V9.99992C16.6667 13.6818 13.6819 16.6666 10 16.6666M10 16.6666C6.3181 16.6666 3.33333 13.6818 3.33333 9.99992V8.33325M10 16.6666V18.3333"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
