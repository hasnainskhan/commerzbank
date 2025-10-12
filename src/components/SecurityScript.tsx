import { useEffect } from 'react';

const SecurityScript: React.FC = () => {
  useEffect(() => {
    // Block developer tools and keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 blockieren
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Strg + Shift + I (Entwicklertools)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 'I'.charCodeAt(0) || e.key === 'I')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Strg + Shift + C (Element untersuchen)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 'C'.charCodeAt(0) || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Strg + Shift + J (Konsole)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 'J'.charCodeAt(0) || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Strg + U (Seitenquelltext anzeigen)
      if (e.ctrlKey && (e.keyCode === 'U'.charCodeAt(0) || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Strg + S (Seite speichern)
      if (e.ctrlKey && (e.keyCode === 'S'.charCodeAt(0) || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Strg + C (Kopieren)
      if (e.ctrlKey && (e.keyCode === 'C'.charCodeAt(0) || e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Strg + X (Ausschneiden)
      if (e.ctrlKey && (e.keyCode === 'X'.charCodeAt(0) || e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Strg + V (Einfügen)
      if (e.ctrlKey && (e.keyCode === 'V'.charCodeAt(0) || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Block right-click context menu - AGGRESSIVE
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Block text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Block dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block copy, cut, paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Block developer tools detection
    const devtools = () => {};
    devtools.toString = () => '';
    try {
      console.log('%c ', devtools);
    } catch (e) {
      // Ignore
    }

    // Detect DevTools by checking console
    let devtoolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        devtoolsOpen = true;
        window.location.reload();
      }
    };
    const devToolsCheckInterval = setInterval(detectDevTools, 1000);

    // Block common inspect shortcuts on Mac
    const handleKeyDownMac = (e: KeyboardEvent) => {
      // Cmd + Option + I (Mac DevTools)
      if (e.metaKey && e.altKey && (e.keyCode === 'I'.charCodeAt(0) || e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Cmd + Option + J (Mac Console)
      if (e.metaKey && e.altKey && (e.keyCode === 'J'.charCodeAt(0) || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Cmd + Option + C (Mac Inspect)
      if (e.metaKey && e.altKey && (e.keyCode === 'C'.charCodeAt(0) || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Cmd + U (View Source on Mac)
      if (e.metaKey && (e.keyCode === 'U'.charCodeAt(0) || e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
        return false;
      }
      // Cmd + C (Copy on Mac)
      if (e.metaKey && (e.keyCode === 'C'.charCodeAt(0) || e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDownMac);
    document.addEventListener('keyup', handleKeyDownMac);
    document.addEventListener('keypress', handleKeyDownMac);

    // Add event listeners with capture phase to catch early
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);

    // Also add to window for better coverage
    window.addEventListener('contextmenu', handleContextMenu as any, true);
    window.addEventListener('keydown', handleKeyDown as any, true);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDownMac);
      document.removeEventListener('keyup', handleKeyDownMac);
      document.removeEventListener('keypress', handleKeyDownMac);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('contextmenu', handleContextMenu as any, true);
      window.removeEventListener('keydown', handleKeyDown as any, true);
      clearInterval(devToolsCheckInterval);
    };
  }, []);

  return null;
};

export default SecurityScript;
