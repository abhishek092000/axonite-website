import React from "react";

const BrandMark = ({ 
  className = "", 
  compact = false, // When true, renders just the icon
  height = 45 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Compact Icon for Mobile Header */}
      {compact ? (
        <img
          src="/logomb.png"
          alt="Axonite"
          style={{ height: `${height}px`, width: "auto" }}
          className="block shrink-0 object-contain"
        />
      ) : (
        /* Full Logo for Desktop / Sidebar */
        <img
          src="/logombnav.png"
          alt="Axonite"
          style={{ 
            height: `${height}px`, 
            minHeight: `${height}px`,
            width: "auto" 
          }}
          className="block shrink-0 object-contain"
        />
      )}
    </div>
  );
};

export default BrandMark;