import { FUENTES, STARLINK, formatoNumero } from "@/lib/data";
import { Constelacion } from "@/components/ui/constelacion";

const fuente = FUENTES.find((f) => f.id === STARLINK.fuente)?.url;

export function Starlink() {
  return (
    <section id="starlink" className="relative border-t border-hairline bg-surface">
      <div className="shell grid items-center gap-x-16 gap-y-14 py-24 lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-5">
          <p className="t-eyebrow">Starlink</p>
          <h2 className="t-h2 mt-5 max-w-[14ch] text-ink">
            Once mil satélites que se renuevan solos
          </h2>

          <p className="mt-7 max-w-[46ch] text-[1rem] leading-[1.7] text-ink-muted">
            La constelación no se construye una vez: se mantiene. Los satélites
            operan a 550&nbsp;km, donde queda atmósfera suficiente para que cualquier
            unidad averiada reentre y se desintegre en pocos años sin dejar basura
            de larga duración. Por eso los números de lanzados y en órbita no
            coinciden, y por eso hace falta seguir lanzando.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-2">
            <Dato valor={formatoNumero(STARLINK.lanzados)} etiqueta="Lanzados en total" />
            <Dato valor={formatoNumero(STARLINK.enOrbita)} etiqueta="Actualmente en órbita" />
            <Dato valor={`${STARLINK.altitudKm} km`} etiqueta="Altitud de la capa principal" />
            <Dato valor={`${STARLINK.inclinacionDeg}°`} etiqueta="Inclinación orbital" />
          </dl>

          <p className="mt-9 max-w-[44ch] text-[0.8125rem] leading-[1.6] text-ink-faint">
            Cifras de {STARLINK.corte}.{" "}
            <a
              href={fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center border-b border-hairline-2 align-middle
                         transition-colors duration-[120ms] hover:border-plume hover:text-plume"
            >
              Fuente ↗<span className="sr-only"> de las cifras de Starlink, se abre en una pestaña nueva</span>
            </a>
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="relative">
            <Constelacion className="aspect-square w-full" />
            <p className="mt-6 max-w-[52ch] text-[0.8125rem] leading-[1.6] text-ink-faint">
              Lo que se dibuja es la capa 1 completa: 72 planos orbitales de 22
              satélites cada uno, 1&nbsp;584 en total, en sus posiciones reales para
              una inclinación de 53°. El hueco sobre los polos no es un recorte del
              dibujo: una órbita inclinada 53° no pasa por encima de ellos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div data-reveal>
      <dt className="sr-only">{etiqueta}</dt>
      <dd>
        <span className="t-figure block text-[1.875rem] font-semibold leading-none text-ink">
          {valor}
        </span>
        <span className="mt-2.5 block max-w-[18ch] text-[0.8125rem] leading-[1.45] text-ink-faint">
          {etiqueta}
        </span>
      </dd>
    </div>
  );
}
