import { useEffect } from "react";
import { useSiteContent } from "./useSiteContent";

export function useAdSense() {
  const { data: sc = {} } = useSiteContent();
  const publisherId = sc["adsense_publisher_id"] ?? "";
  const enabled = sc["adsense_enabled"] === "true";

  useEffect(() => {
    if (!enabled || !publisherId || !publisherId.startsWith("pub-")) return;

    const existingScript = document.getElementById("google-adsense-script");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "google-adsense-script";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById("google-adsense-script");
      if (s) s.remove();
    };
  }, [enabled, publisherId]);
}
