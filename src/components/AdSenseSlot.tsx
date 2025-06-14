
import React, { useEffect } from "react";
import { siteConfig } from "@/config/site.config";

// Beziehe Publisher-ID aus siteConfig (falls gepflegt)
const ADSENSE_CLIENT_ID =
  siteConfig.monetization.adsenseClientId || "ca-pub-XXXXXXXXXXXXXXX";

interface AdSenseSlotProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slot,
  format = "auto",
  responsive = true,
  className = "",
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
