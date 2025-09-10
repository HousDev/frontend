import { useEffect } from "react";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";

const useDynamicHead = () => {
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        // ✅ Dynamic Title
        if (systemSettings?.company_name) {
            document.title = systemSettings.company_name;
        } else {
            document.title = "Resale Expert"; // fallback
        }

        // ✅ Dynamic Favicon
        if (systemSettings?.company_favicon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.href = `${systemSettings.company_favicon}?t=${Date.now()}`; // cache-busting
        }
    }, [systemSettings]);
};

export default useDynamicHead;
