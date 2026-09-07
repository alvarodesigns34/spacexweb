import { CORTE } from "@/lib/data";

/**
 * Una sola idea, dicha en grande. El texto se parte en palabras desde JS
 * (data-split) y sube desde detrás de una máscara; si el JS no llega o el
 * usuario ha pedido menos movimiento, se lee exactamente igual.
 */
export function Manifiesto() {
  return (
    <section id="contenido" className="relative bg-surface">
      <div className="shell grid gap-x-8 gap-y-12 py-28 md:grid-cols-12 md:py-40">
        <div className="md:col-span-4 lg:col-span-3">
          <p className="t-eyebrow">El problema</p>
          <p className="mt-6 max-w-[30ch] text-[0.9375rem] leading-[1.7] text-ink-muted">
            Durante sesenta años, cada lanzamiento orbital terminó con el vehículo
            en el fondo del mar o desintegrado en la atmósfera. El coste de ir al
            espacio era, sobre todo, el coste de tirar la máquina.
          </p>
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          <h2
            data-split
            className="t-h2 max-w-[19ch] text-ink"
          >
            Un cohete que no vuelve es un avión que se tira después de cada vuelo.
          </h2>

          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <p className="t-body text-[1.0625rem] leading-[1.7] text-ink-muted">
              La primera etapa de un Falcon&nbsp;9 concentra los nueve motores, los
              tanques principales y la aviónica: es la parte cara del cohete y la
              única que nunca llegaba a órbita. Recuperarla no exige un vehículo
              nuevo, exige que el que ya existe sepa frenar, orientarse y posarse
              con el combustible que le sobra.
            </p>
            <p className="t-body text-[1.0625rem] leading-[1.7] text-ink-muted">
              Resolverlo cambió la unidad económica del sector. Un lanzamiento dejó
              de costar lo que cuesta fabricar un cohete y pasó a costar lo que
              cuesta revisarlo, repostarlo y volver a encenderlo. Todo lo que hay en
              esta página —la constelación, la cadencia, Starship— se apoya en eso.
            </p>
          </div>
        </div>
      </div>

      <p className="shell pb-4 text-[0.75rem] text-ink-faint">
        Cifras de vuelo actualizadas a {CORTE.texto}.
      </p>
    </section>
  );
}
