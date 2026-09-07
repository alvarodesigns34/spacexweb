import { CIFRAS, CORTE, FUENTES, formatoNumero } from "@/lib/data";

function urlFuente(id: string) {
  return FUENTES.find((f) => f.id === id)?.url;
}

/**
 * Seis cifras con pesos distintos. La primera ocupa el doble de ancho y lleva
 * el número al tamaño mayor de la página: es la que resume el resto. Seis
 * tarjetas idénticas en una rejilla perfecta dirían que las seis pesan lo
 * mismo, y no es verdad.
 *
 * La celda que sobra al hacer la primera doble no se rellena con una séptima
 * cifra de adorno: lleva la fecha de corte, que es lo que da validez a las
 * otras seis.
 */
export function Cifras() {
  const [principal, ...resto] = CIFRAS;

  return (
    <section aria-labelledby="cifras-titulo" className="relative border-t border-hairline bg-surface-2">
      <div className="shell py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h2 id="cifras-titulo" className="t-h2 max-w-[14ch] text-ink">
            Lo que dice el registro de vuelo
          </h2>
          <p className="max-w-[34ch] text-[0.9375rem] leading-[1.65] text-ink-muted">
            Todas las cifras enlazan a su fuente. Ninguna está redondeada para que
            quede mejor en la tarjeta.
          </p>
        </div>

        <dl
          data-cifras
          className="mt-16 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3"
        >
          <Tarjeta cifra={principal} destacada />
          {resto.map((c) => (
            <Tarjeta key={c.etiqueta} cifra={c} />
          ))}

          <div
            data-cifra
            className="flex flex-col justify-end bg-surface-2 p-7 lg:p-9"
          >
            <p className="t-eyebrow">Fecha de corte</p>
            <p className="t-figure mt-4 text-[1.5rem] font-semibold leading-none text-ink">
              <time dateTime={CORTE.iso}>{CORTE.texto}</time>
            </p>
            <p className="mt-4 max-w-[30ch] text-[0.875rem] leading-[1.6] text-ink-muted">
              SpaceX lanza cada pocos días. Una cifra acumulada sin fecha deja de
              ser cierta en dos semanas.
            </p>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Tarjeta({
  cifra: c,
  destacada = false,
}: {
  cifra: (typeof CIFRAS)[number];
  destacada?: boolean;
}) {
  const decimales = c.valor % 1 !== 0 ? 2 : 0;

  return (
    <div
      data-cifra
      className={`flex flex-col bg-surface-2 p-7 transition-colors duration-[180ms] hover:bg-surface-3
                  lg:p-9 ${destacada ? "sm:col-span-2" : ""}`}
    >
      <dt>
        <span
          className={`t-figure block font-bold leading-[0.9] text-ink ${
            destacada
              ? "text-[clamp(3.5rem,9vw,7rem)]"
              : "text-[clamp(2.5rem,5vw,3.75rem)]"
          }`}
        >
          <span data-count={c.valor} data-decimales={decimales}>
            {formatoNumero(c.valor, decimales)}
          </span>
          {c.sufijo ? <span className="text-plume">{c.sufijo}</span> : null}
        </span>
        <span
          className={`mt-3 block font-medium text-ink ${
            destacada ? "text-[1.125rem]" : "text-[0.9375rem]"
          }`}
        >
          {c.etiqueta}
        </span>
      </dt>

      {/* `mt-auto` alinea las notas al pie de todas las tarjetas: si no, cada
          una arranca a la altura que le deje su etiqueta y la fila se desmonta. */}
      <dd className="mt-auto pt-6">
        <p className={`text-[0.875rem] leading-[1.6] text-ink-muted ${destacada ? "max-w-[52ch]" : "max-w-[34ch]"}`}>
          {c.nota}
        </p>
        <a
          href={urlFuente(c.fuente)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-9 items-center font-[family-name:var(--font-mono)]
                     text-[0.6875rem] uppercase tracking-[0.12em] text-ink-faint
                     transition-colors duration-[120ms] hover:text-plume"
        >
          Fuente ↗<span className="sr-only"> de «{c.etiqueta}», se abre en una pestaña nueva</span>
        </a>
      </dd>
    </div>
  );
}
