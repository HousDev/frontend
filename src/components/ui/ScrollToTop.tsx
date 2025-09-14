import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll behavior:
 * - On PUSH (link clicks / programmatic navigations) -> scroll to top
 * - On POP (back/forward) -> do nothing (preserve)
 * - If URL has hash (#id) -> try to scroll to that element
 *
 * Customize: remove navigationType check if you always want top on back/forward too.
 */
const ScrollToTop: React.FC<{ smooth?: boolean }> = ({ smooth = true }) => {
  const location = useLocation();
  const navigationType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"

  useEffect(() => {
    // If user pressed back/forward, preserve native behavior (do nothing)
    if (navigationType === "POP") return;

    // If there's a hash in the URL (e.g. /page#section), scroll to that element
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // small timeout to allow DOM to render
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
          // set focus for accessibility
          (el as HTMLElement).focus?.();
        } else {
          window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
        }
      }, 0);
      return;
    }

    // Default: scroll to top
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }, [location.pathname, location.search]); // run on path or query change

  return null;
};

export default ScrollToTop;
