interface MinimizeIconProps {
  className?: string;
}

export const MinimizeIcon = ({ className }: MinimizeIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2.9665 11.2412L8.7596 11.2412M8.7596 11.2412L8.7596 17.0343M8.7596 11.2412L2.00098 17.9998M17.0343 8.75863L11.2412 8.75862M11.2412 8.75862V2.96552M11.2412 8.75862L17.9998 2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
