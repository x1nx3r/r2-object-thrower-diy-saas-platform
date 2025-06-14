// src/components/ui/LogoText.js
import React from "react";
import Logo from "./Logo";

const LogoText = ({ size = "md", showText = true, className = "" }) => {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Logo size={size} />
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}
          >
            R2 Thrower
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            DIY SaaS
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoText;
