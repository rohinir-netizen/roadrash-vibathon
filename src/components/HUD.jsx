/**
 * HUD.jsx
 * DOM overlay HUD — reads from `hudDataRef` via setInterval (50 ms)
 * and writes directly to DOM elements. Zero React re-renders per frame.
 *
 * Props:
 *   hudDataRef {React.MutableRefObject<{speed, fuel, distance, nitroActive, cooldown}>}
 */
import { useRef, useEffect } from 'react';

export function HUD({ hudDataRef }) {
  const speedEl      = useRef();
  const nitroFillEl  = useRef();
  const nitroTextEl  = useRef();
  const distEl       = useRef();
  const nitroBgEl    = useRef();

  useEffect(() => {
    const id = setInterval(() => {
      const d = hudDataRef?.current;
      if (!d) return;

      if (speedEl.current)
        speedEl.current.textContent = `${Math.round(d.speed * 12)}`;

      if (distEl.current)
        distEl.current.textContent = `${Math.round(d.distance)} m`;

      const fuelPct = Math.max(0, Math.min(100, (d.fuel ?? 1) * 100));
      if (nitroFillEl.current) {
        nitroFillEl.current.style.width = `${fuelPct}%`;
        // Colour shifts: cyan normal → orange cooldown → red empty
        const clr = d.cooldown
          ? '#ff8800'
          : fuelPct < 20
            ? '#ff2244'
            : '#00ffcc';
        nitroFillEl.current.style.background = clr;
        nitroFillEl.current.style.boxShadow  = `0 0 8px ${clr}`;
      }
      if (nitroTextEl.current) {
        nitroTextEl.current.textContent = d.nitroActive
          ? '⚡ NITRO'
          : d.cooldown
            ? '⏳ RECHARGING'
            : 'NITRO';
        nitroTextEl.current.style.color = d.nitroActive ? '#00ffcc' : 'rgba(180,220,255,0.5)';
      }
      if (nitroBgEl.current) {
        nitroBgEl.current.style.borderColor = d.nitroActive
          ? 'rgba(0,255,200,0.5)'
          : 'rgba(255,255,255,0.1)';
      }
    }, 50);
    return () => clearInterval(id);
  }, [hudDataRef]);

  return (
    <div className="hud">
      {/* ── Speed ── */}
      <div className="hud-speed-block">
        <span ref={speedEl} className="hud-speed-num">0</span>
        <span className="hud-speed-unit">km/h</span>
      </div>

      {/* ── Nitro bar ── */}
      <div ref={nitroBgEl} className="hud-nitro-block">
        <span ref={nitroTextEl} className="hud-nitro-label">NITRO</span>
        <div className="hud-nitro-track">
          <div ref={nitroFillEl} className="hud-nitro-fill" />
        </div>
      </div>

      {/* ── Distance ── */}
      <div className="hud-dist-block">
        <span className="hud-dist-label">DIST</span>
        <span ref={distEl} className="hud-dist-num">0 m</span>
      </div>
    </div>
  );
}
