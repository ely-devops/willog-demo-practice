interface LightningIconProps {
  className?: string;
}

export const LightningIcon = ({ className }: LightningIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M13.2799 2.40039L3.67993 13.9204H11.9999L11.3599 21.6004L20.3199 10.0804H11.9999L13.2799 3.04039"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
