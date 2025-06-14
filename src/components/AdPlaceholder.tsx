
import React from "react";

const AdPlaceholder = ({
  text = "Hier könnte Ihre Werbung stehen",
  className = "",
}: {
  text?: string;
  className?: string;
}) => (
  <div
    className={`flex justify-center items-center border-2 border-dashed border-sage-300 bg-sage-50 text-sage-500 rounded-md min-h-[120px] text-center text-sm font-medium ${className}`}
    aria-label="Werbeplatz"
  >
    {text}
  </div>
);

export default AdPlaceholder;
