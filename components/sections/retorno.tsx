import { RETORNO } from "@/lib/data";

/* --------------------------------------------------------------------------
   Perfil esquemático de un retorno al punto de lanzamiento

   Las coordenadas están en kilómetros: X es distancia en tierra y Y, altitud,
   escrita en negativo porque en SVG el eje Y crece hacia abajo. Se escribe así
   en vez de voltear el grupo con `scale(1,-1)`, que es lo cómodo: un grupo
   volteado voltea también las etiquetas, y las cotas salen escritas del revés.

   Las altitudes de cada fase son las reales de un Falcon 9. La curva es un
   diagrama —está exagerada en horizontal para que se lea—, no telemetría.
   -------------------------------------------------------------------------- */

const ASCENSO = "M4,0 C9,-26 17,-52 34,-72";

const DESCENSO = [
  "M34,-72",                       // separación
  "C42,-84 50,-92 52,-101",        // el propulsor sigue subiendo mientras frena
  "C53,-107 46,-105 40,-99",       // cima: aquí se invierte la marcha
  "C32,-90 26,-58 21,-30",         // caída, manteniéndose a la derecha del ascenso
  "C19,-19 19,-8 19,0",            // aterrizaje en LZ-1
].join(" ");

const COTAS = [
  { km: 100, nota: "línea de Kármán" },
  { km: 70 },
  { km: 45 },
  { km: 20 },
];

/**
 * La sección se fija y las seis fases del retorno avanzan con el scroll. Es el
 * único sitio de la página donde el scroll no desplaza contenido sino que
 * mueve un mecanismo: por eso se puede permitir el pin.
 */
export function Retorno() {
  return (
    <section id="retorno" data-retorno className="relative border-t border-hairline bg-surface-2">
      <div data-retorno-panel className="relative min-h-[100svh] overflow-hidden py-24 md:py-0">
        <div className="shell flex min-h-[100svh] flex-col justify-center gap-12 py-24 lg:flex-row lg:items-center lg:gap-20">
          {/* Texto de la fase activa */}
          <div className="lg:w-[38%] lg:shrink-0">
            <p className="t-eyebrow">Perfil de retorno · Falcon 9</p>
            <h2 className="t-h2 mt-5 max-w-[13ch] text-ink">
              Ocho minutos de vuelta a casa
            </h2>
            <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-[1.7] text-ink-muted">
              Desde la separación hasta el apagado sobre la plataforma pasan poco
              más de ocho minutos. En ese tramo el vehículo se da la vuelta, frena
              contra la atmósfera y se pilota con cuatro aletas y un solo motor.
            </p>

            {/* Lista compacta: solo nombre y cota. Las descripciones viven en
                el hueco de abajo, de altura fija, para que cambiar de fase
                dentro de una sección fijada no mueva nada de sitio. */}
            <ol className="mt-9 border-t border-hairline">
              {RETORNO.map((f, i) => (
                <li
                  key={f.indice}
                  data-fase
                  data-fase-indice={i}
                  className="flex items-baseline gap-4 border-b border-hairline py-2.5"
                >
                  <span data-fase-num className="t-num w-6 shrink-0 text-[0.75rem] text-ink-faint">
                    {f.indice}
                  </span>
                  <span data-fase-nombre className="flex-1 text-[0.9375rem] text-ink-muted">
                    {f.nombre}
                  </span>
                  <span className="t-num shrink-0 text-[0.75rem] text-ink-faint">{f.altitud}</span>
                </li>
              ))}
            </ol>

            <div data-fase-textos className="relative mt-7 min-h-[7.5rem]">
              {RETORNO.map((f, i) => (
                <p
                  key={f.indice}
                  data-fase-texto
                  data-fase-indice={i}
                  className="max-w-[46ch] text-[0.9375rem] leading-[1.7] text-ink-muted"
                >
                  {f.descripcion}
                </p>
              ))}
            </div>
          </div>

          {/* Diagrama */}
          <div className="relative min-h-[24rem] flex-1 self-stretch lg:min-h-0">
            <svg
              viewBox="-14 -116 118 130"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Diagrama del perfil de retorno de una primera etapa de Falcon 9: se separa a unos 70 km, invierte su trayectoria con un encendido de retorno, alcanza la cima por encima de los 100 km, reentra y aterriza junto al punto de lanzamiento."
            >
              {/* Cotas de altitud */}
              {COTAS.map((c) => (
                <g key={c.km}>
                  <line
                    x1={-2} y1={-c.km} x2={100} y2={-c.km}
                    stroke="color-mix(in oklab, var(--color-ink) 9%, transparent)"
                    strokeWidth={0.35}
                  />
                  <text
                    x={-4} y={-c.km} dy={1.3} textAnchor="end"
                    fill="var(--color-ink-faint)" fontSize={3.4}
                    fontFamily="var(--font-mono)"
                  >
                    {c.km}
                  </text>
                  {c.nota ? (
                    <text
                      x={2} y={-c.km} dy={-1.6}
                      fill="var(--color-ink-faint)" fontSize={2.7}
                      fontFamily="var(--font-mono)" letterSpacing={0.2}
                    >
                      {c.nota}
                    </text>
                  ) : null}
                </g>
              ))}
              <text
                x={-4} y={-110} textAnchor="end"
                fill="var(--color-ink-faint)" fontSize={2.7}
                fontFamily="var(--font-mono)" letterSpacing={0.2}
              >
                km
              </text>

              {/* Suelo */}
              <line x1={-2} y1={0} x2={100} y2={0} stroke="var(--color-hairline-2)" strokeWidth={0.6} />

              {/* Ascenso: contexto. No se anima, porque no es parte del retorno. */}
              <path
                d={ASCENSO}
                fill="none"
                stroke="color-mix(in oklab, var(--color-ink) 24%, transparent)"
                strokeWidth={0.65}
                strokeDasharray="1.8 2.4"
              />
              <text
                x={13} y={-46} fill="var(--color-ink-faint)" fontSize={2.9}
                fontFamily="var(--font-mono)" letterSpacing={0.18}
                transform="rotate(-62 13 -46)"
              >
                ASCENSO
              </text>

              {/* Trayectoria de retorno: la dibuja el scroll. */}
              <path
                d={DESCENSO} fill="none"
                stroke="color-mix(in oklab, var(--color-ink) 13%, transparent)"
                strokeWidth={0.65}
              />
              <path
                data-retorno-traza
                d={DESCENSO} fill="none"
                stroke="var(--color-plume)"
                strokeWidth={1.15}
                strokeLinecap="round"
              />

              {/* Plataformas */}
              <rect x={1} y={-2.4} width={6} height={2.4} fill="var(--color-ink-faint)" />
              <rect x={16} y={-2.4} width={6} height={2.4} fill="var(--color-plume)" />
              <text
                x={1} y={5.6} fill="var(--color-ink-faint)" fontSize={3}
                fontFamily="var(--font-mono)" letterSpacing={0.2}
              >
                LC-39A
              </text>
              <text
                x={16} y={5.6} fill="var(--color-plume)" fontSize={3}
                fontFamily="var(--font-mono)" letterSpacing={0.2}
              >
                LZ-1
              </text>
              <text
                x={100} y={11.5} textAnchor="end"
                fill="var(--color-ink-faint)" fontSize={2.8}
                fontFamily="var(--font-mono)" letterSpacing={0.24}
              >
                DISTANCIA EN TIERRA →
              </text>

              {/* El propulsor. `data-retorno-giro` lo alinea con la tangente de
                  la curva; el eje del cohete es su Y, así que en reposo apunta
                  hacia arriba. */}
              <g data-retorno-movil>
                <g data-retorno-giro>
                  {/* El penacho solo existe cuando hay un encendido. */}
                  <path
                    data-retorno-llama
                    d="M-1.9 4 L1.9 4 L0 16.5 Z"
                    fill="var(--color-plume)"
                    opacity={0}
                  />
                  <rect x={-1.1} y={-5} width={2.2} height={9} fill="var(--color-ink)" />
                  <path d="M-1.1 -5 L1.1 -5 L0 -7.6 Z" fill="var(--color-ink)" />
                  <path d="M-1.1 -3 L-2.9 -2.2 L-2.9 -0.4 L-1.1 -1.2 Z" fill="var(--color-ink)" />
                  <path d="M1.1 -3 L2.9 -2.2 L2.9 -0.4 L1.1 -1.2 Z" fill="var(--color-ink)" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
