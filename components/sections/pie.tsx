import { CORTE, FUENTES } from "@/lib/data";

export function Pie() {
  return (
    <footer className="relative border-t border-hairline bg-surface">
      <div className="shell py-20 md:py-24">
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p
              className="font-[family-name:var(--font-display)] text-[1.0625rem] font-bold uppercase
                         leading-none tracking-[0.24em] text-ink"
              style={{ fontVariationSettings: '"wdth" 118' }}
            >
              Space<span className="text-plume">X</span>
            </p>
            <p className="mt-6 max-w-[42ch] text-[0.9375rem] leading-[1.7] text-ink-muted">
              Página informativa independiente sobre el programa de vuelo de SpaceX.
              No está afiliada a Space Exploration Technologies Corp. ni la
              representa. Todas las marcas pertenecen a sus titulares.
            </p>
          </div>

          <div className="md:col-span-4">
            <h2 className="t-eyebrow">Fuentes</h2>
            <ul className="mt-6 space-y-3">
              {FUENTES.map((f) => (
                <li key={f.id}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-[0.875rem] leading-[1.5] text-ink-muted
                               transition-colors duration-[120ms] hover:text-plume"
                  >
                    {f.nombre} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="t-eyebrow">Datos</h2>
            <p className="mt-6 text-[0.875rem] leading-[1.65] text-ink-muted">
              Cifras acumuladas a{" "}
              <time dateTime={CORTE.iso} className="t-num text-ink">
                {CORTE.texto}
              </time>
              . En un programa que lanza cada pocos días, un número sin fecha deja de
              ser cierto en dos semanas.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8">
          <p className="text-[0.8125rem] text-ink-faint">
            Hero e ilustraciones calculados en el navegador: dispersión atmosférica
            y mecánica orbital, sin imágenes de archivo.
          </p>
          <a
            href="#top"
            className="inline-flex min-h-11 items-center font-[family-name:var(--font-mono)] text-[0.75rem]
                       uppercase tracking-[0.14em] text-ink-faint transition-colors duration-[120ms]
                       hover:text-ink"
          >
            Volver arriba ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
