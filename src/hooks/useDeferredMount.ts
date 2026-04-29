import { useEffect, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type DeferredMountOptions = {
  delay?: number;
  enabled?: boolean;
  mediaQuery?: string;
  events?: Array<keyof WindowEventMap>;
};

export function useDeferredMount({
  delay = 0,
  enabled = true,
  mediaQuery,
  events = [],
}: DeferredMountOptions = {}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled || mounted) return;

    if (mediaQuery && !window.matchMedia(mediaQuery).matches) {
      return;
    }

    const win = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const activate = () => {
      setMounted(true);
    };

    const scheduleActivation = () => {
      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(activate, { timeout: 1500 });
      } else {
        activate();
      }
    };

    for (const eventName of events) {
      window.addEventListener(eventName, activate, { once: true, passive: true });
    }

    timeoutId = window.setTimeout(scheduleActivation, delay);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      for (const eventName of events) {
        window.removeEventListener(eventName, activate);
      }
    };
  }, [delay, enabled, events, mediaQuery, mounted]);

  return mounted;
}
