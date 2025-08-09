import React from "react";

const LoadingSpinner = ({ fullScreen = false, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    : "flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent`}
      />
    </div>
  );
};

export default LoadingSpinner;