import { FLOTA } from "@/lib/data";
import { Silueta } from "@/components/ui/silueta";

/** Altura del encuadre común, en metros. Fija la escala de todas las siluetas. */
const ESCALA_M = 132;
const MARCAS = [0, 25, 50, 75, 100, 125];

/**
 * Los cuatro vehículos contra una misma regla.
 *
 * La escala no se desplaza: las cuatro siluetas están siempre a la vista, a la
 * misma cantidad de píxeles por metro, y lo único que corre en horizontal son
 * las fichas. Ese es el argumento de la sección —Starship es quince veces
 * Dragon— y se pierde en cuanto hay que recordar de memoria lo alto que era el
 * anterior.
 *
 * En pantallas estrechas no hay pin ni recorrido horizontal: es donde peor
 * funcionan. Ahí cada vehículo lleva su propia silueta, todas a la misma
 * escala entre sí.
 */
export function Flota() {
  return (
    <section id="flota" className="relative border-t border-hairline bg-surface">
      <div className="shell pt-24 md:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <h2 className="t-h2 max-w-[16ch] text-ink">Cuatro vehículos, una misma regla</h2>
          <p className="max-w-[38ch] text-[0.9375rem] leading-[1.65] text-ink-muted">
            Las siluetas están dibujadas en metros y compartidas contra la misma
            escala vertical. Starship no parece más alto que Dragon: lo es quince
            veces.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Escritorio: escala fija + fichas en horizontal                    */}
      {/* ---------------------------------------------------------------- */}
      <div data-flota-wrap className="relative mt-16 hidden md:block">
        <div className="flex h-[100svh] min-h-[42rem] items-stretch">
          {/* Columna de escala. No se mueve. */}
          <div className="relative w-[42vw] shrink-0 pl-[clamp(1.5rem,4vw,4rem)]">
            <div className="relative flex h-full flex-col pb-16 pt-10">
              <div className="relative flex-1">
                {/* Cotas en metros */}
                {MARCAS.map((m) => (
                  <div
                    key={m}
                    aria-hidden="true"
                    className="absolute inset-x-0 flex items-center gap-3"
                    style={{ bottom: `${(m / ESCALA_M) * 100}%` }}
                  >
                    <span className="t-num w-7 shrink-0 text-right text-[0.625rem] text-ink-faint">
                      {m}
                    </span>
                    <span className="h-px flex-1 bg-[color-mix(in_oklab,var(--color-ink)_7%,transparent)]" />
                  </div>
                ))}

                {/* Las cuatro siluetas, apoyadas en la cota 0 */}
                <div className="absolute inset-y-0 left-10 right-0 flex items-end gap-[clamp(0.5rem,1.6vw,2rem)]">
                  {FLOTA.map((v, i) => (
                    <div
                      key={v.id}
                      data-flota-silueta
                      data-flota-indice={i}
                      className="flex-1"
                      style={{ height: `${(v.alturaM / ESCALA_M) * 100}%` }}
                    >
                      <Silueta
                        id={v.id}
                        alturaM={v.alturaM}
                        medioAnchoM={Math.max(v.anchoM, 9) / 1.5}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Nombres bajo la línea de cota 0 */}
              <div className="mt-4 flex gap-[clamp(0.5rem,1.6vw,2rem)] pl-10">
                {FLOTA.map((v, i) => (
                  <p
                    key={v.id}
                    data-flota-nombre
                    data-flota-indice={i}
                    className="flex-1 text-center font-[family-name:var(--font-mono)] text-[0.625rem]
                               uppercase leading-[1.3] tracking-[0.1em] text-ink-faint
                               transition-colors duration-[280ms]"
                  >
                    {v.nombre}
                    <span className="mt-1 block text-ink-faint/70">{v.alturaM} m</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Pista de fichas. Es lo único que se desplaza. */}
          <div className="relative min-w-0 flex-1 overflow-hidden border-l border-hairline">
            <div data-flota-track className="flex h-full w-max">
              {FLOTA.map((v) => (
                <article
                  key={v.id}
                  data-flota-panel
                  className="flex h-full w-[58vw] shrink-0 flex-col justify-center
                             px-[clamp(2.5rem,4vw,4.5rem)] py-16"
                >
                  <p data-flota-txt className="t-eyebrow">{v.clase}</p>

                  <h3
                    data-flota-txt
                    className="t-h2 mt-4 text-[clamp(2.25rem,4vw,3.5rem)] text-ink"
                  >
                    {v.nombre}
                  </h3>

                  <p data-flota-txt className="t-num mt-3 text-[0.8125rem] text-plume">
                    {v.estado}
                  </p>

                  <p data-flota-txt className="mt-6 max-w-[52ch] text-[1rem] leading-[1.7] text-ink-muted">
                    {v.descripcion}
                  </p>

                  <dl data-flota-txt className="mt-8 grid grid-cols-2 gap-x-10">
                    {v.especificaciones.map((e) => (
                      <div
                        key={e.clave}
                        className="flex items-baseline justify-between gap-4 border-b border-hairline py-2"
                      >
                        <dt className="shrink-0 text-[0.8125rem] text-ink-faint">{e.clave}</dt>
                        <dd className="t-num text-right text-[0.8125rem] text-ink">{e.valor}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>

            {/* Progreso del recorrido */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-hairline">
              <span data-flota-progreso className="block h-px w-0 bg-plume" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Móvil: apilado, sin pin                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="shell mt-14 space-y-16 md:hidden">
        {FLOTA.map((v) => (
          <article key={v.id} data-reveal className="border-t border-hairline pt-8">
            <div className="flex items-end gap-6">
              {/* Regla compartida también aquí: el alto del hueco es fijo y la
                  silueta ocupa la fracción que le corresponde. */}
              <div className="relative h-[13rem] w-24 shrink-0">
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{ height: `${(v.alturaM / ESCALA_M) * 100}%` }}
                >
                  <Silueta
                    id={v.id}
                    alturaM={v.alturaM}
                    medioAnchoM={Math.max(v.anchoM, 9) / 1.5}
                  />
                </div>
                <span className="absolute inset-x-0 bottom-0 h-px bg-hairline-2" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="t-eyebrow">{v.clase}</p>
                <h3 className="t-h2 mt-3 text-[2rem] text-ink">{v.nombre}</h3>
                <p className="t-num mt-2 text-[0.75rem] text-plume">{v.estado}</p>
              </div>
            </div>

            <p className="mt-6 text-[0.9375rem] leading-[1.7] text-ink-muted">{v.descripcion}</p>

            <dl className="mt-6">
              {v.especificaciones.map((e) => (
                <div
                  key={e.clave}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-2"
                >
                  <dt className="shrink-0 text-[0.8125rem] text-ink-faint">{e.clave}</dt>
                  <dd className="t-num text-right text-[0.8125rem] text-ink">{e.valor}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
