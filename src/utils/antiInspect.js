/**
 * Anti-Inspect & DevTools Protection Layer
 * Protects frontend code, prevents viewing source and right-click inspection
 */

export function initAntiInspect() {
  if (typeof window === "undefined") return;

  // 1. Disable Right-Click Context Menu globally
  document.addEventListener(
    "contextmenu",
    (e) => {
      const target = e.target;
      // Allow right-click inside inputs and textareas for copy/paste convenience
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      e.preventDefault();
    },
    { capture: true }
  );

  // 2. Disable DevTools Keyboard Shortcuts (Windows, Linux, macOS)
  document.addEventListener(
    "keydown",
    (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      // Ctrl+Shift+K (Firefox console)
      if (
        cmdOrCtrl &&
        (e.shiftKey || (isMac && e.altKey)) &&
        ["I", "i", "J", "j", "C", "c", "K", "k"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      // Ctrl+S / Cmd+S (Save Webpage)
      if (cmdOrCtrl && ["U", "u", "S", "s"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. In Production: Disable Console Logs & Debugger Trap
  if (import.meta.env.PROD) {
    try {
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
    } catch (err) {
      // ignore
    }

    // Infinite Debugger Trap (freezes execution if DevTools is opened)
    setInterval(() => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      // If time difference is greater than 100ms, DevTools is actively open and paused
      if (endTime - startTime > 100) {
        window.location.reload();
      }
    }, 1000);
  }
}
