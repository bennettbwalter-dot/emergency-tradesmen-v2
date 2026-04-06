/**
 * Production-safe logging utility.
 * All console.log/debug calls are stripped in production builds.
 * console.error and console.warn are preserved for error tracking.
 */

export const devLog = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
        console.log(...args);
    }
};

export const devWarn = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
        console.warn(...args);
    }
};

export const devDebug = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
        console.debug(...args);
    }
};
