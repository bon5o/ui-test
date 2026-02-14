type IconProps = {
  className?: string;
};

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 3V5.5M12 18.5V21M4.22 4.22L5.99 5.99M18.01 18.01L19.78 19.78M3 12H5.5M18.5 12H21M4.22 19.78L5.99 18.01M18.01 5.99L19.78 4.22"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.5 14.5C19.6 14.8 18.66 15 17.68 15C12.71 15 8.68 10.97 8.68 6C8.68 5.02 8.88 4.08 9.18 3.18C6.23 4.11 4.18 6.84 4.18 10C4.18 14.42 7.76 18 12.18 18C15.34 18 18.07 15.95 19 13C19.05 13.5 19.05 14 20.5 14.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

