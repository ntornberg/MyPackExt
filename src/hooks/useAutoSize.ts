import { useRef, useState, useLayoutEffect } from 'react';

export function useAutoSize(min = 180, aspect = 0.75) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({w: 0, h: 0});

    useLayoutEffect(() => {
        if (!ref.current) return;
        const obs = new ResizeObserver(([entry]) => {
            const w = Math.max(entry.contentRect.width, min);
            setSize({w, h: w * aspect});      // keep a 4 × 3 feel
        });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return [ref, size] as const;
}
