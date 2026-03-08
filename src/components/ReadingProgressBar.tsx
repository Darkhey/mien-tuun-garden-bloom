import React, { useEffect, useState } from "react";

interface ReadingProgressBarProps {
  estimatedTime?: number;
}

const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ estimatedTime }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  const timeLeft = estimatedTime ? Math.max(1, Math.ceil(estimatedTime * (1 - progress / 100))) : null;

  return (
    <div className="fixed top-0 left-0 w-full z-[60] pointer-events-none">
      <div className="w-full h-1 bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {timeLeft !== null && progress < 99 && (
        <div className="absolute right-4 top-2 bg-white/90 backdrop-blur text-earth-700 text-xs font-medium px-2 py-1 rounded-md shadow-sm border border-earth-100">
          Noch ca. {timeLeft} Min
        </div>
      )}
    </div>
  );
};

export default ReadingProgressBar;
