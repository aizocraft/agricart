const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 border-green-500`}></div>
  );
};

export default LoadingSpinner;