import { HITOS } from "@/lib/data";

export function Cronologia() {
  return (
    <section id="cronologia" className="relative border-t border-hairline bg-surface-2">
      <div className="shell py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className="t-eyebrow">Cronología</p>
            <h2 className="t-h2 mt-5 max-w-[15ch] text-ink">Veinticuatro años, trece decisiones</h2>
          </div>
          <p className="max-w-[36ch] text-[0.9375rem] leading-[1.65] text-ink-muted">
            No todos los hitos son lanzamientos. Varios de los que más cambiaron el
            programa fueron fracasos que se convirtieron en el diseño siguiente.
          </p>
        </div>

        {/* La lista se acota: con las reglas cruzando los 1 160 px completos y
            el texto acabando a 660, la sección se lee vacía por la derecha. */}
        <ol data-cronologia className="relative mt-16 max-w-[62rem] md:mt-20">
          {/* Raíl: la línea de fondo está siempre; la de encima la dibuja el
              scroll. Sin JS se ve la de fondo y la lista se lee igual. */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 hidden w-px bg-hairline sm:block sm:left-[7.5rem] md:left-[9.5rem]"
          />
          <span
            data-cronologia-rail
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px origin-top scale-y-0 bg-plume sm:block sm:left-[7.5rem] md:left-[9.5rem]"
          />

          {HITOS.map((h) => (
            <li
              key={h.fecha}
              data-hito
              className="relative grid gap-x-10 gap-y-2 border-b border-hairline py-8 last:border-0
                         sm:grid-cols-[7.5rem_1fr] md:grid-cols-[9.5rem_1fr]"
            >
              <div className="sm:pr-10 sm:text-right">
                <span className="t-figure block text-[1.625rem] font-semibold leading-none text-ink">
                  {h.anio}
                </span>
                <span className="mt-2 block text-[0.75rem] leading-[1.4] text-ink-faint">
                  {h.fecha}
                </span>
              </div>

              <div className="sm:pl-10">
                <span
                  aria-hidden="true"
                  className="absolute left-[-4px] top-[2.3rem] hidden size-[9px] rounded-full border
                             border-ink-faint bg-surface-2 sm:left-[calc(7.5rem-4px)] sm:block
                             md:left-[calc(9.5rem-4px)]"
                />
                <h3 className="t-h3 text-ink">{h.titulo}</h3>
                <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-[1.7] text-ink-muted">
                  {h.texto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
