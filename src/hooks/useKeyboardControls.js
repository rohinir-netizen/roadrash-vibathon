/**
 * useKeyboardControls
 * Tracks which arrow keys are currently held down.
 * Returns a ref (not state) so reads inside useFrame don't trigger re-renders.
 */
import { useEffect, useRef } from 'react';

export function useKeyboardControls() {
    // keys.current mirrors the real-time held state of each arrow key
    const keys = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    });

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code in keys.current) keys.current[e.code] = true;
        };
        const onKeyUp = (e) => {
            if (e.code in keys.current) keys.current[e.code] = false;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    return keys;
}
