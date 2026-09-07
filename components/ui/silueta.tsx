import * as React from "react";

/* --------------------------------------------------------------------------
   Siluetas dibujadas en metros

   El sistema de coordenadas de estos SVG es el vehículo real: una unidad es un
   metro, el origen está en la base y la altura del viewBox es la altura del
   cohete. Eso es lo que permite ponerlos juntos contra una misma regla sin
   ajustar nada a ojo: Starship sale catorce veces más alto que Dragon porque
   lo es.

   Se dibuja con `transform: scale(1,-1)` para que la Y crezca hacia arriba,
   como en el mundo, en vez de hacia abajo, como en SVG.
   -------------------------------------------------------------------------- */

interface SiluetaProps {
  id: string;
  /** Altura real, en metros. Fija el viewBox. */
  alturaM: number;
  /** Semianchura del viewBox, en metros. */
  medioAnchoM: number;
  className?: string;
}

const cuerpo = "fill-[color-mix(in_oklab,var(--color-ink)_22%,transparent)]";
const borde = "stroke-[color-mix(in_oklab,var(--color-ink)_62%,transparent)]";
const detalle = "fill-[color-mix(in_oklab,var(--color-ink)_40%,transparent)]";

export function Silueta({ id, alturaM, medioAnchoM, className = "" }: SiluetaProps) {
  const w = medioAnchoM * 2;
  return (
    <svg
      viewBox={`${-medioAnchoM} 0 ${w} ${alturaM}`}
      preserveAspectRatio="xMidYMax meet"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={`Silueta a escala del vehículo ${id}`}
    >
      <g transform={`translate(0 ${alturaM}) scale(1 -1)`} strokeWidth={0.22} vectorEffect="non-scaling-stroke">
        {id === "falcon-9" && <Falcon9 />}
        {id === "falcon-heavy" && <FalconHeavy />}
        {id === "starship" && <Starship />}
        {id === "dragon" && <Dragon />}
      </g>
    </svg>
  );
}

/* --- Falcon 9 — 69,8 m · núcleo de 3,7 m · cofia de 5,2 m ------------------ */

function Falcon9() {
  return (
    <g className={`${cuerpo} ${borde}`}>
      {/* Patas desplegadas: cuatro, dos visibles de perfil. */}
      <path d="M-1.85 5.4 L-4.6 0 L-3.5 0 L-1.85 3.6 Z" className={detalle} />
      <path d="M1.85 5.4 L4.6 0 L3.5 0 L1.85 3.6 Z" className={detalle} />
      {/* Primera etapa. */}
      <rect x={-1.85} y={0} width={3.7} height={41.2} />
      {/* Interetapa: la sección compuesta que sujeta la segunda etapa. */}
      <rect x={-1.85} y={41.2} width={3.7} height={5.8} className={detalle} />
      {/* Aletas de rejilla de titanio, en posición de vuelo. */}
      <path d="M-1.85 43.4 L-3.35 44.1 L-3.35 46.6 L-1.85 46.1 Z" className={detalle} />
      <path d="M1.85 43.4 L3.35 44.1 L3.35 46.6 L1.85 46.1 Z" className={detalle} />
      {/* Segunda etapa. */}
      <rect x={-1.85} y={47} width={3.7} height={9.7} />
      {/* Cofia de carga útil. */}
      <path d="M-2.6 56.7 L2.6 56.7 L2.6 62.4 Q2.6 67.6 0 69.8 Q-2.6 67.6 -2.6 62.4 Z" />
      {/* Los nueve Merlin, vistos de canto. */}
      {[-1.5, -0.75, 0, 0.75, 1.5].map((x) => (
        <path key={x} d={`M${x - 0.32} 0 L${x + 0.32} 0 L${x + 0.5} -1.5 L${x - 0.5} -1.5 Z`} className={detalle} />
      ))}
    </g>
  );
}

/* --- Falcon Heavy — 70,0 m · 12,2 m de envergadura ------------------------- */

function FalconHeavy() {
  const lateral = (dx: number) => (
    <g key={dx} transform={`translate(${dx} 0)`}>
      <rect x={-1.85} y={0} width={3.7} height={41} />
      {/* Cono de morro: los laterales no llevan cofia. */}
      <path d="M-1.85 41 L1.85 41 Q1.85 43.6 0 44.6 Q-1.85 43.6 -1.85 41 Z" />
      <path d="M-1.85 36.6 L-3.3 37.3 L-3.3 39.6 L-1.85 39.1 Z" className={detalle} />
      <path d="M1.85 36.6 L3.3 37.3 L3.3 39.6 L1.85 39.1 Z" className={detalle} />
      <path d={`M-1.85 5.2 L-4.4 0 L-3.4 0 L-1.85 3.5 Z`} className={detalle} />
      <path d={`M1.85 5.2 L4.4 0 L3.4 0 L1.85 3.5 Z`} className={detalle} />
      {[-1.5, -0.75, 0, 0.75, 1.5].map((x) => (
        <path key={x} d={`M${x - 0.32} 0 L${x + 0.32} 0 L${x + 0.5} -1.4 L${x - 0.5} -1.4 Z`} className={detalle} />
      ))}
    </g>
  );

  return (
    <g className={`${cuerpo} ${borde}`}>
      {lateral(-3.9)}
      {lateral(3.9)}
      {/* Núcleo central: idéntico a un Falcon 9. */}
      <rect x={-1.85} y={0} width={3.7} height={41.2} />
      <rect x={-1.85} y={41.2} width={3.7} height={5.8} className={detalle} />
      <rect x={-1.85} y={47} width={3.7} height={9.7} />
      <path d="M-2.6 56.7 L2.6 56.7 L2.6 62.6 Q2.6 67.8 0 70 Q-2.6 67.8 -2.6 62.6 Z" />
      {[-1.5, -0.75, 0, 0.75, 1.5].map((x) => (
        <path key={x} d={`M${x - 0.32} 0 L${x + 0.32} 0 L${x + 0.5} -1.5 L${x - 0.5} -1.5 Z`} className={detalle} />
      ))}
    </g>
  );
}

/* --- Starship — 121,3 m · 9 m de diámetro ---------------------------------- */

function Starship() {
  return (
    <g className={`${cuerpo} ${borde}`}>
      {/* Super Heavy: 33 Raptor, sin patas — lo agarra la torre. */}
      <rect x={-4.5} y={0} width={9} height={71} />
      {/* Aletas de rejilla, cuatro arriba del propulsor. */}
      <path d="M-4.5 63.5 L-6.9 64.6 L-6.9 69.4 L-4.5 68.4 Z" className={detalle} />
      <path d="M4.5 63.5 L6.9 64.6 L6.9 69.4 L4.5 68.4 Z" className={detalle} />
      {/* Anillo de separación en caliente: la nave enciende antes de soltarse. */}
      <rect x={-4.5} y={71} width={9} height={2.3} className={detalle} />
      {/* La nave. */}
      <rect x={-4.5} y={73.3} width={9} height={30.4} />
      {/* Aletas traseras. */}
      <path d="M-4.5 76 L-7.6 76 L-7.6 86.5 L-4.5 88 Z" className={detalle} />
      <path d="M4.5 76 L7.6 76 L7.6 86.5 L4.5 88 Z" className={detalle} />
      {/* Aletas delanteras. */}
      <path d="M-4.5 99 L-6.8 100.4 L-6.8 107.4 L-4.5 106.6 Z" className={detalle} />
      <path d="M4.5 99 L6.8 100.4 L6.8 107.4 L4.5 106.6 Z" className={detalle} />
      {/* Ojiva. */}
      <path d="M-4.5 103.7 L4.5 103.7 Q4.5 114.6 0 121.3 Q-4.5 114.6 -4.5 103.7 Z" />
      {/* Los 33 motores del propulsor, de canto. */}
      {[-3.4, -2.55, -1.7, -0.85, 0, 0.85, 1.7, 2.55, 3.4].map((x) => (
        <path key={x} d={`M${x - 0.34} 0 L${x + 0.34} 0 L${x + 0.52} -1.9 L${x - 0.52} -1.9 Z`} className={detalle} />
      ))}
    </g>
  );
}

/* --- Dragon — 8,1 m con maletero · 4 m de diámetro ------------------------- */

function Dragon() {
  return (
    <g className={`${cuerpo} ${borde}`}>
      {/* Maletero: carga no pressurizada y el panel solar pegado al casco. */}
      <rect x={-2} y={0} width={4} height={3.6} />
      <rect x={2} y={0.4} width={0.34} height={2.8} className={detalle} />
      {/* Cápsula: tronco de cono. */}
      <path d="M-2 3.6 L2 3.6 L1.05 7.4 L-1.05 7.4 Z" />
      {/* Cono de morro abatible, con el puerto de atraque debajo. */}
      <path d="M-1.05 7.4 L1.05 7.4 Q1.05 7.95 0 8.1 Q-1.05 7.95 -1.05 7.4 Z" className={detalle} />
      {/* Cuatro cápsulas de dos SuperDraco cada una: el escape de la tripulación. */}
      <rect x={-2.05} y={4.5} width={0.42} height={1.1} className={detalle} />
      <rect x={1.63} y={4.5} width={0.42} height={1.1} className={detalle} />
    </g>
  );
}
