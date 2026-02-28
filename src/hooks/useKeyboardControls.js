/**
 * useKeyboardControls
 * Tracks which arrow keys + Space are currently held down.
 * Returns a ref (not state) so reads inside useFrame don't trigger re-renders.
 */
import { useEffect, useRef } from 'react';

const TRACKED = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

export function useKeyboardControls() {
    const keys = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,
    });

    useEffect(() => {
        const onDown = (e) => { if (TRACKED.has(e.code)) { e.preventDefault(); keys.current[e.code] = true; } };
        const onUp = (e) => { if (TRACKED.has(e.code)) keys.current[e.code] = false; };

        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, []);

    return keys;
}
