
import React, { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";

type Props = {
  minutes: number;
  onClose: () => void;
};

const TimerModal: React.FC<Props> = ({ minutes, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(true);
  const interval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 0) return s - 1;
        return 0;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false);
      toast({
        title: "Zeit abgelaufen!",
        description: "Dein Kochschritt ist fertig.",
      });
    }
  }, [secondsLeft]);

  function format(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-xs flex flex-col items-center">
        <div className="text-xl font-semibold mb-4">Timer läuft</div>
        <div className="text-5xl font-mono mb-2">{format(secondsLeft)}</div>
        <div className="flex gap-4 mt-2">
          <button
            className="bg-sage-600 text-white rounded px-4 py-2 text-sm"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "Pause" : "Weiter"}
          </button>
          <button
            className="bg-sage-200 text-sage-800 rounded px-3 py-2 text-sm"
            onClick={onClose}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
export default TimerModal;
