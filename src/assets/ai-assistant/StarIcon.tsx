interface StarIconProps {
  className?: string;
}

export const StarIcon = ({ className }: StarIconProps) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      opacity="0.8"
      d="M14.1517 1.28687C14.7866 -0.428956 17.2134 -0.428959 17.8483 1.28687L21.0085 9.8271C21.2081 10.3666 21.6334 10.7919 22.1729 10.9915L30.7131 14.1517C32.429 14.7866 32.429 17.2134 30.7131 17.8483L22.1729 21.0085C21.6334 21.2081 21.2081 21.6334 21.0085 22.1729L17.8483 30.7131C17.2134 32.429 14.7866 32.429 14.1517 30.7131L10.9915 22.1729C10.7919 21.6334 10.3666 21.2081 9.82711 21.0085L1.28687 17.8483C-0.428956 17.2134 -0.428959 14.7866 1.28687 14.1517L9.8271 10.9915C10.3666 10.7919 10.7919 10.3666 10.9915 9.82711L14.1517 1.28687Z"
      fill="url(#paint0_linear_star)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_star"
        x1="28.0859"
        y1="27.6693"
        x2="6.41927"
        y2="5.16927"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#417DF7" />
        <stop offset="1" stopColor="#7FE0F5" />
      </linearGradient>
    </defs>
  </svg>
);
