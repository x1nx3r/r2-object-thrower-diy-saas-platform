import React from "react";

const Logo = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
    >
      <div className="relative">
        {/* Outer circle representing R2 storage */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full animate-pulse"></div>

        {/* Inner design */}
        <div className="relative bg-gradient-to-br from-purple-600 to-blue-700 rounded-full w-full h-full flex items-center justify-center shadow-lg">
          {/* Arrow/Throw symbol */}
          <svg
            className="w-1/2 h-1/2 text-white transform rotate-45"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z" />
          </svg>
        </div>

        {/* Small accent dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
      </div>
    </div>
  );
};

export default Logo;
