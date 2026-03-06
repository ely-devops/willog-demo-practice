// Access Time Icon - Based on access_time.svg (16x16)
const AccessTimeIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_time)">
      <path
        d="M7.99594 1.33203C4.31594 1.33203 1.33594 4.3187 1.33594 7.9987C1.33594 11.6787 4.31594 14.6654 7.99594 14.6654C11.6826 14.6654 14.6693 11.6787 14.6693 7.9987C14.6693 4.3187 11.6826 1.33203 7.99594 1.33203ZM8.0026 13.332C5.05594 13.332 2.66927 10.9454 2.66927 7.9987C2.66927 5.05203 5.05594 2.66536 8.0026 2.66536C10.9493 2.66536 13.3359 5.05203 13.3359 7.9987C13.3359 10.9454 10.9493 13.332 8.0026 13.332Z"
        fill="currentColor"
      />
      <path
        d="M8.33594 4.66797H7.33594V8.66797L10.8359 10.768L11.3359 9.94797L8.33594 8.16797V4.66797Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_time">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default AccessTimeIcon;
