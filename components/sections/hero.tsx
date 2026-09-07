"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { OrbitHero, type OrbitDrive } from "@/components/ui/orbit-hero";
import { canAnimate, gsap } from "@/lib/gsap";

/** Parámetro gravitacional estándar de la Tierra, en km³/s². */
const MU_TIERRA = 398600.4418;
const R_TIERRA = 6371;

const ALT_INICIO = 620;
const ALT_FIN = 2600;

/** Velocidad de una órbita circular a esa altitud. v = √(µ/r). */
function velocidadOrbital(altitudKm: number) {
  return Math.sqrt(MU_TIERRA / (R_TIERRA + altitudKm));
}

/** Periodo de esa misma órbita, en minutos. T = 2πr/v. */
function periodoOrbital(altitudKm: number) {
  const r = R_TIERRA + altitudKm;
  return (2 * Math.PI * r) / velocidadOrbital(altitudKm) / 60;
}

/** true mientras la ventana sea estrecha. Cambia el encuadre del hero. */
function useEstrecho(consulta = "(max-width: 767px)") {
  const [estrecho, setEstrecho] = useState(false);
  useLayoutEffect(() => {
    const m = window.matchMedia(consulta);
    const sync = () => setEstrecho(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [consulta]);
  return estrecho;
}

export function Hero() {
  const estrecho = useEstrecho();
  const drive = useRef<OrbitDrive>({ progress: 0 });
  const seccion = useRef<HTMLElement | null>(null);
  const [altitud, setAltitud] = useState(ALT_INICIO);

  useLayoutEffect(() => {
    const el = seccion.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      /* El scroll no desplaza el hero: sube la cámara. El objeto `drive` se
         escribe directamente, sin pasar por el estado de React, porque esto
         ocurre en cada fotograma. La altitud que se muestra en la telemetría
         sí es estado, pero solo se actualiza cuando cambia el kilómetro. */
      let ultimoKm = -1;

      gsap.to(drive.current, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const km = Math.round(ALT_INICIO + (ALT_FIN - ALT_INICIO) * self.progress);
            if (km !== ultimoKm) { ultimoKm = km; setAltitud(km); }
          },
        },
      });

      if (!canAnimate()) return;

      /* Entrada: el titular sube por líneas desde detrás de una máscara, y la
         telemetría entra después. No hay reveal por scroll aquí — esto es lo
         primero que se ve, y ya está en pantalla. */
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from("[data-hero-linea] > span", {
        yPercent: 118,
        duration: 1.05,
        stagger: 0.08,
        ease: "expo.out",
      })
        .from("[data-hero-entra]", {
          opacity: 0,
          y: 18,
          duration: 0.7,
          stagger: 0.08,
          ease: "expo.out",
        }, 0.42);
    }, el);

    return () => ctx.revert();
  }, []);

  const v = velocidadOrbital(altitud);
  const t = periodoOrbital(altitud);

  return (
    <section
      ref={seccion}
      id="top"
      className="relative h-[168svh] w-full"
    >
      <div className="sticky top-0 h-[100svh] min-h-[34rem] w-full">
        <OrbitHero
          drive={drive}
          altitudeKm={ALT_INICIO}
          altitudeEndKm={ALT_FIN}
          scrim="left"
          scrimStrength={0.88}
          focus={[0.66, 0.4]}
          className="h-full w-full"
        >
          <div className="shell flex h-full flex-col justify-start pb-14 pt-24 sm:justify-center sm:pb-0 sm:pt-0">
            <div className="max-w-[46rem]">
              <p data-hero-entra className="t-eyebrow mb-7 text-ink-muted">
                Reutilización orbital · 2010 — hoy
              </p>

              <h1 className="t-display text-ink">
                {["Sube 70 km,", "da la vuelta", "y aterriza."].map((linea) => (
                  <span
                    key={linea}
                    data-hero-linea
                    className="block overflow-hidden pb-[0.06em]"
                  >
                    <span className="block">{linea}</span>
                  </span>
                ))}
              </h1>

              {/* Sobre imagen, `ink-muted` no aguanta: basta una nube brillante
                  detrás para que baje de 4,5:1. La vela hace el resto. */}
              {/* La medida es más corta que en el resto de la página a
                  propósito: el texto tiene que caber dentro de la zona que la
                  vela oscurece. Fuera de ahí compite con una nube iluminada. */}
              <p data-hero-entra className="t-lead mt-8 max-w-[36ch] text-ink/90">
                Falcon&nbsp;9 ha completado ese viaje 656 veces. Un solo propulsor, el
                B1067, lo ha hecho 37. Así se desmontó el supuesto de que un cohete
                es de un solo uso.
              </p>

              <div data-hero-entra className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href="#retorno"
                  className="group inline-flex min-h-11 items-center gap-3 rounded-hair bg-plume px-6
                             text-[0.9375rem] font-medium text-surface transition-transform
                             duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                             hover:-translate-y-px active:translate-y-0 active:scale-[0.985]"
                >
                  Ver la secuencia de retorno
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-[180ms] group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#flota"
                  className="inline-flex min-h-11 items-center border-b border-hairline-2 text-[0.9375rem]
                             text-ink/85 transition-colors duration-[120ms] hover:border-ink hover:text-ink"
                >
                  Los cuatro vehículos
                </a>
              </div>
            </div>
          </div>

          {/* Telemetría. No es un adorno con números al azar: la altitud la
              conduce el scroll y la velocidad y el periodo salen de v = √(µ/r)
              para una órbita circular a esa altura. */}
          <div
            data-hero-entra
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden lg:block"
          >
            <div className="shell">
              <dl className="flex items-end gap-10 border-t border-hairline py-5">
                <Lectura etiqueta="Altitud de cámara" valor={altitud.toLocaleString("es-ES")} unidad="km" />
                <Lectura etiqueta="Velocidad orbital" valor={v.toFixed(2)} unidad="km/s" />
                <Lectura etiqueta="Periodo" valor={t.toFixed(1)} unidad="min" />
                <p className="ml-auto max-w-[24ch] text-right font-[family-name:var(--font-mono)]
                              text-[0.6875rem] leading-[1.5] tracking-[0.06em] text-ink-muted">
                  Órbita circular calculada · µ = 398 600,44 km³/s²
                </p>
              </dl>
            </div>
          </div>
        </OrbitHero>
      </div>
    </section>
  );
}

function Lectura({ etiqueta, valor, unidad }: { etiqueta: string; valor: string; unidad: string }) {
  return (
    <div>
      <dt className="t-eyebrow mb-1.5 text-[0.625rem]">{etiqueta}</dt>
      <dd className="t-num text-[1.375rem] leading-none text-ink">
        {valor}
        <span className="ml-1.5 text-[0.75rem] text-ink-faint">{unidad}</span>
      </dd>
    </div>
  );
}
