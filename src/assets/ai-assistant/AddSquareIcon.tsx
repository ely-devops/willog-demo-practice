interface AddSquareIconProps {
  className?: string;
}

export const AddSquareIcon = ({ className }: AddSquareIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 10H10M10 10H4M10 10V16M10 10L10 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
