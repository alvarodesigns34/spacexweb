"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const ENLACES = [
  { href: "#flota", texto: "Flota" },
  { href: "#retorno", texto: "El retorno" },
  { href: "#starlink", texto: "Starlink" },
  { href: "#cronologia", texto: "Cronología" },
];

/**
 * La cabecera cambia de estado por clase; la transición la hace CSS. Animarla
 * desde JS es más código, más lento y más frágil.
 */
export function SiteHeader() {
  const [compacta, setCompacta] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => setCompacta(self.scroll() > 80),
    });
    return () => st.kill();
  }, []);

  /* El menú móvil se cierra con Escape y bloquea el scroll de fondo mientras
     está abierto. Si no, se desplaza la página por debajo del panel. */
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  return (
    <header
      data-compacta={compacta || undefined}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200
                 border-b border-transparent
                 data-[compacta]:border-hairline data-[compacta]:bg-surface/72 data-[compacta]:backdrop-blur-xl"
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-10
                   focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-hair
                   focus:bg-plume focus:px-5 focus:text-sm focus:font-medium focus:text-surface"
      >
        Saltar al contenido
      </a>

      <div className="shell flex items-center justify-between gap-8 py-5 transition-[padding] duration-200
                      data-[compacta]:py-3">
        <a
          href="#top"
          className="-my-3.5 py-3.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold
                     uppercase leading-none tracking-[0.24em] text-ink"
          style={{ fontVariationSettings: '"wdth" 118' }}
        >
          Space<span className="text-plume">X</span>
        </a>

        <nav aria-label="Secciones" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  /* El relleno da el área tocable de 44 px que el texto por sí
                     solo no alcanza; el margen negativo evita que eso
                     ensanche la barra. */
                  className="group relative -my-3 block py-3 font-[family-name:var(--font-mono)]
                             text-[0.8125rem] uppercase tracking-[0.14em] text-ink-muted
                             transition-colors duration-[120ms] hover:text-ink"
                >
                  {e.texto}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[0.6rem] left-0 h-px w-0 bg-plume transition-[width]
                               duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          className="-mr-2 flex size-11 items-center justify-center md:hidden"
        >
          <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span
              className={`absolute inset-x-0 top-0 h-px bg-ink transition-transform duration-[280ms]
                          ease-[cubic-bezier(0.16,1,0.3,1)] ${abierto ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`absolute inset-x-0 bottom-0 h-px bg-ink transition-transform duration-[280ms]
                          ease-[cubic-bezier(0.16,1,0.3,1)] ${abierto ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      <div
        id="menu-movil"
        hidden={!abierto}
        className="border-t border-hairline bg-surface/95 backdrop-blur-xl md:hidden"
      >
        <ul className="shell flex flex-col py-2">
          {ENLACES.map((e) => (
            <li key={e.href} className="border-b border-hairline last:border-0">
              <a
                href={e.href}
                onClick={() => setAbierto(false)}
                className="flex min-h-[3rem] items-center font-[family-name:var(--font-mono)]
                           text-sm uppercase tracking-[0.14em] text-ink-muted"
              >
                {e.texto}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
