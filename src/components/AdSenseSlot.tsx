
import React, { useEffect } from "react";

interface AdSenseSlotProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

// Der publisher (data-ad-client) Wert ist als Platzhalter hinterlegt!
const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXX"; // <-- Bitte ersetzen!

const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slot,
  format = "auto",
  responsive = true,
  className = ""
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      ></ins>
    </div>
  );
};

export default AdSenseSlot;
