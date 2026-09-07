"use client";

import { useEffect, useRef } from "react";
import { STARLINK } from "@/lib/data";

/* --------------------------------------------------------------------------
   La capa 1 de Starlink, dibujada como está

   No es un adorno con puntos al azar. La primera capa de la constelación son
   72 planos orbitales repartidos por igual en ascensión recta, con 22
   satélites cada uno, a 550 km y 53° de inclinación: 1 584 satélites, que es
   lo que se dibuja aquí. Cada punto está donde le toca por su plano y su
   posición dentro del plano; lo único que se ha elegido es desde dónde se mira.

   Ese trenzado que aparece —las bandas más densas cerca de ±53° de latitud,
   el hueco sobre los polos— no está dibujado: sale de la inclinación. Una
   constelación de órbitas inclinadas 53° no puede cubrir los polos.
   -------------------------------------------------------------------------- */

const PLANOS = 72;
const POR_PLANO = 22;
const INCLINACION = (STARLINK.inclinacionDeg * Math.PI) / 180;
const R_ORBITA = (6371 + STARLINK.altitudKm) / 6371;

export function Constelacion({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Las posiciones dentro del plano no cambian; solo cambia la fase. Se
       precalculan los senos y cosenos de cada plano una vez, en vez de
       llamarlos 1 584 veces por fotograma. */
    const planos = Array.from({ length: PLANOS }, (_, j) => {
      const raan = (j / PLANOS) * Math.PI * 2;
      return { cosR: Math.cos(raan), sinR: Math.sin(raan), j };
    });
    const cosI = Math.cos(INCLINACION);
    const sinI = Math.sin(INCLINACION);

    let w = 0, h = 0, cx = 0, cy = 0, R = 0;
    let raf = 0;
    let visible = true;
    let t0 = 0;
    let fase = 0;

    function resize() {
      const rect = host!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      /* El radio se ajusta a la órbita, no a la Tierra: si no, la capa se sale. */
      R = Math.min(w, h) / 2 / R_ORBITA * 0.86;
    }

    /* Vista ligeramente por encima del plano ecuatorial: de canto la capa se
       ve como una raya, y de frente pierde el trenzado. */
    const tilt = (26 * Math.PI) / 180;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    function dibujar() {
      ctx!.clearRect(0, 0, w, h);

      const rt = R;                 // radio de la Tierra en píxeles
      const ro = R * R_ORBITA;      // radio de la órbita en píxeles

      /* La Tierra: disco opaco, para que los satélites de detrás queden
         tapados de verdad y no flotando por encima.

         Con un relleno plano el disco se confunde con el fondo y la
         constelación se lee como un anillo flotando en el vacío. Un gradiente
         desplazado hacia la misma dirección de la que viene la luz basta para
         que se vea una esfera: no hace falta iluminarla de verdad. */
      const cara = ctx!.createRadialGradient(
        cx - rt * 0.38, cy - rt * 0.34, rt * 0.05,
        cx, cy, rt
      );
      cara.addColorStop(0, "#16243c");
      cara.addColorStop(0.55, "#0c1220");
      cara.addColorStop(1, "#06080d");
      ctx!.beginPath();
      ctx!.arc(cx, cy, rt, 0, Math.PI * 2);
      ctx!.fillStyle = cara;
      ctx!.fill();
      ctx!.strokeStyle = "rgba(111,168,255,0.38)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      /* Halo atmosférico, como anillo y no como disco. Un gradiente radial
         extrapola su primera parada hacia dentro, así que arrancarlo en el
         borde tiñe de azul todo el planeta: hay que declarar explícitamente
         que el interior es transparente. */
      const halo = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rt * 1.07);
      halo.addColorStop(0, "rgba(111,168,255,0)");
      halo.addColorStop(0.9, "rgba(111,168,255,0)");
      halo.addColorStop(0.945, "rgba(111,168,255,0.26)");
      halo.addColorStop(1, "rgba(111,168,255,0)");
      ctx!.beginPath();
      ctx!.arc(cx, cy, rt * 1.07, 0, Math.PI * 2);
      ctx!.fillStyle = halo;
      ctx!.fill();

      for (const p of planos) {
        /* Un desfase por plano (celosía de Walker): sin él los satélites se
           alinean en filas y la malla se ve como una rejilla, no como esto. */
        const offset = (p.j * 9) / (PLANOS * POR_PLANO) * Math.PI * 2;

        for (let k = 0; k < POR_PLANO; k++) {
          const u = (k / POR_PLANO) * Math.PI * 2 + offset + fase;

          /* En el plano orbital. */
          const px = Math.cos(u);
          const py = Math.sin(u);

          /* Inclinación sobre el eje X, luego ascensión recta sobre el eje Z. */
          const ix = px;
          const iy = py * cosI;
          const iz = py * sinI;

          const ex = ix * p.cosR - iy * p.sinR;
          const ey = ix * p.sinR + iy * p.cosR;
          const ez = iz;

          /* Cámara: inclinada, proyección ortográfica. */
          const sx = ex;
          const sy = ey * cosT - ez * sinT;
          const sz = ey * sinT + ez * cosT;

          const X = cx + sx * ro;
          const Y = cy - sy * ro;

          /* ¿Está detrás de la Tierra? Solo si además cae dentro del disco. */
          const dentroDelDisco = Math.hypot(X - cx, Y - cy) < rt;
          if (sz < 0 && dentroDelDisco) continue;

          /* Los de delante, más brillantes y algo mayores. */
          const prof = (sz + 1) / 2;
          const alfa = 0.18 + prof * 0.62;
          const r = 0.7 + prof * 0.85;

          ctx!.beginPath();
          ctx!.arc(X, Y, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(174,205,255,${alfa.toFixed(3)})`;
          ctx!.fill();
        }
      }
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (!visible) { t0 = now; return; }
      const dt = t0 ? Math.min(0.05, (now - t0) / 1000) : 0;
      t0 = now;
      /* Un periodo orbital a 550 km son 95,6 minutos. Aquí la constelación gira
         mucho más deprisa: a velocidad real no se movería nada en pantalla. */
      fase += dt * 0.075;
      dibujar();
    }

    resize();
    dibujar();
    if (!reduced) raf = requestAnimationFrame(tick);

    const ro2 = new ResizeObserver(() => { resize(); dibujar(); });
    ro2.observe(host);
    const io = new IntersectionObserver(
      (e) => { visible = e[0]?.isIntersecting ?? true; },
      { threshold: 0 }
    );
    io.observe(host);
    const onVis = () => { visible = !document.hidden; t0 = 0; };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro2.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
