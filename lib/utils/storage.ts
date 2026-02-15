/**
 * Safe Storage Utilities
 * Provides SSR-safe wrappers for localStorage and sessionStorage
 */

/**
 * Safely get item from localStorage
 * Returns null during SSR or if key doesn't exist
 */
export function getLocalStorage(key: string): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return null;
    }
}

/**
 * Safely set item in localStorage
 * No-op during SSR
 */
export function setLocalStorage(key: string, value: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
    }
}

/**
 * Safely remove item from localStorage
 * No-op during SSR
 */
export function removeLocalStorage(key: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
    }
}

/**
 * Safely clear localStorage
 * No-op during SSR
 */
export function clearLocalStorage(): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage', error);
    }
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}
