
import React from "react";

type DebugTerminalProps = {
  logs: string[];
  className?: string;
};

/**
 * Zeigt ein Terminal-Panel zur Live-Anzeige von Debug-Logs an.
 * Scrollt automatisch ans Ende, sobald neue Logs ankommen.
 */
const DebugTerminal: React.FC<DebugTerminalProps> = ({ logs, className }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <div
      ref={ref}
      className={
        `bg-black/90 text-green-200 text-xs font-mono rounded mt-6 p-2 max-h-52 overflow-y-auto ${
          className ?? ""
        }`
      }
      style={{ fontSize: "12px" }}
      aria-live="polite"
    >
      <div className="mb-1 font-bold text-green-400">Debug Terminal:</div>
      {logs.map((log, i) => (
        <div key={i} className="whitespace-pre-line">{log}</div>
      ))}
    </div>
  );
};

export default DebugTerminal;
