import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color,
  theme = 'dark',
  className = ''
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const spinnerSize = sizeMap[size];

  return (
    <div 
      className={`loading-spinner ${className}`}
      style={{
        width: spinnerSize,
        height: spinnerSize
      }}
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="spinner-svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color || (theme === 'dark' ? '#d4d4d4' : '#5c6370')}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          className="spinner-circle"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;