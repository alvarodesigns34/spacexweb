/**
 * Datos de vuelo de SpaceX.
 *
 * Todas las cifras de esta página son reales y verificables. Nada está
 * redondeado "para que quede bien" ni inventado para rellenar una tarjeta.
 * Cada bloque lleva su fecha de corte y su fuente, porque un número sin fecha
 * en un programa que lanza cada tres días es un número falso a los quince días.
 */

/** Fecha de corte de las cifras acumuladas. Se muestra en la página. */
export const CORTE = {
  iso: "2026-09-06",
  texto: "6 de septiembre de 2026",
} as const;

export const FUENTES = [
  {
    id: "wiki-falcon",
    nombre: "Wikipedia — List of Falcon 9 and Falcon Heavy launches",
    url: "https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches",
  },
  {
    id: "wiki-starship",
    nombre: "Wikipedia — SpaceX Starship",
    url: "https://en.wikipedia.org/wiki/SpaceX_Starship",
  },
  {
    id: "keeptrack",
    nombre: "KeepTrack — SpaceX Brief",
    url: "https://keeptrack.space/x-report/spacex-brief-2026-09-02",
  },
  {
    id: "space-com",
    nombre: "Space.com — 100º Falcon 9 de 2026",
    url: "https://www.space.com/space-exploration/launches-spacecraft/spacex-starship-record-37th-booster-flight-100-falcon-9-launches",
  },
] as const;

/* --------------------------------------------------------------------------
   Cifras del contador
   -------------------------------------------------------------------------- */

export interface Cifra {
  valor: number;
  /** Sufijo pegado al número (%, ×). Va sin espacio. */
  sufijo?: string;
  etiqueta: string;
  /** La frase que explica por qué ese número importa. Sin ella es trivia. */
  nota: string;
  fuente: string;
}

export const CIFRAS: Cifra[] = [
  {
    valor: 698,
    etiqueta: "Lanzamientos Falcon",
    nota: "Falcon 9 y Falcon Heavy sumados desde 2010. Ninguna otra familia de cohetes orbitales ha volado tanto.",
    fuente: "wiki-falcon",
  },
  {
    valor: 656,
    etiqueta: "Propulsores recuperados",
    nota: "De 669 intentos de aterrizaje. El primero salió bien en diciembre de 2015; los seis últimos años son rutina.",
    fuente: "wiki-falcon",
  },
  {
    valor: 98.06,
    sufijo: "%",
    etiqueta: "Aterrizajes con éxito",
    nota: "Sobre el total histórico. Restringido al Block 5, el propulsor actual, sube al 99,06 %.",
    fuente: "wiki-falcon",
  },
  {
    valor: 37,
    sufijo: "×",
    etiqueta: "Vuelos del B1067",
    nota: "Un único propulsor. El orbitador del transbordador, el vehículo reutilizable anterior, llegó a 39 en treinta años.",
    fuente: "space-com",
  },
  {
    valor: 11093,
    etiqueta: "Satélites Starlink en órbita",
    nota: "De 12 881 lanzados. La diferencia son unidades ya reentradas: la constelación se renueva en vuelo.",
    fuente: "keeptrack",
  },
  {
    valor: 13,
    etiqueta: "Vuelos de Starship",
    nota: "Ocho con éxito y cinco fallidos desde abril de 2023. El programa aún está aprendiendo en público.",
    fuente: "wiki-starship",
  },
];

/* --------------------------------------------------------------------------
   Flota
   -------------------------------------------------------------------------- */

export interface Vehiculo {
  id: string;
  nombre: string;
  clase: string;
  /** Altura real en metros. Se usa para dibujar las siluetas a escala. */
  alturaM: number;
  /** Anchura real en metros, para la misma escala. */
  anchoM: number;
  estado: string;
  titular: string;
  descripcion: string;
  especificaciones: { clave: string; valor: string }[];
  fuente: string;
}

export const FLOTA: Vehiculo[] = [
  {
    id: "falcon-9",
    nombre: "Falcon 9",
    clase: "Lanzador orbital de dos etapas",
    alturaM: 69.8,
    anchoM: 3.7,
    estado: "En servicio · 685 vuelos",
    titular: "El caballo de tiro",
    descripcion:
      "Nueve motores Merlin en la primera etapa y un solo Merlin de vacío en la segunda. La primera etapa vuelve, se revisa y vuelve a volar: es la razón de que este cohete haya lanzado más veces que ningún otro de la historia.",
    especificaciones: [
      { clave: "Altura", valor: "69,8 m" },
      { clave: "Diámetro", valor: "3,7 m" },
      { clave: "Masa al despegue", valor: "549 000 kg" },
      { clave: "Motores 1.ª etapa", valor: "9 × Merlin 1D" },
      { clave: "Empuje al nivel del mar", valor: "7 607 kN" },
      { clave: "Propelente", valor: "LOX / RP-1" },
      { clave: "Carga a LEO recuperando", valor: "17 500 kg" },
      { clave: "Carga a LEO desechable", valor: "22 800 kg" },
      { clave: "Carga a GTO recuperando", valor: "5 500 kg" },
      { clave: "Precio de lista", valor: "74 M$ (2026)" },
    ],
    fuente: "wiki-falcon",
  },
  {
    id: "falcon-heavy",
    nombre: "Falcon Heavy",
    clase: "Lanzador pesado de núcleos acoplados",
    alturaM: 70,
    anchoM: 12.2,
    estado: "En servicio · 13 vuelos, 13 éxitos",
    titular: "Tres primeras etapas a la vez",
    descripcion:
      "Un Falcon 9 con dos primeras etapas más atornilladas a los lados. Veintisiete motores encendidos al mismo tiempo y, en la mayoría de las misiones, dos propulsores laterales que aterrizan en paralelo sobre las plataformas de Cabo Cañaveral.",
    especificaciones: [
      { clave: "Altura", valor: "70,0 m" },
      { clave: "Anchura", valor: "12,2 m" },
      { clave: "Masa al despegue", valor: "1 420 000 kg" },
      { clave: "Motores 1.ª etapa", valor: "27 × Merlin 1D" },
      { clave: "Empuje al nivel del mar", valor: "22,82 MN" },
      { clave: "Propelente", valor: "LOX / RP-1" },
      { clave: "Carga a LEO desechable", valor: "63 800 kg" },
      { clave: "Carga a GTO desechable", valor: "26 700 kg" },
      { clave: "Carga a Marte", valor: "16 800 kg" },
    ],
    fuente: "wiki-falcon",
  },
  {
    id: "starship",
    nombre: "Starship",
    clase: "Sistema totalmente reutilizable",
    alturaM: 121.3,
    anchoM: 9,
    estado: "En pruebas · 13 vuelos, 8 con éxito",
    titular: "El vehículo más grande jamás volado",
    descripcion:
      "Ciento veintiún metros de acero inoxidable y treinta y nueve motores Raptor entre las dos etapas. En el vuelo 5, en octubre de 2024, la torre de lanzamiento atrapó el propulsor con dos brazos en pleno descenso. En el vuelo 13, en julio de 2026, la nave desplegó por primera vez satélites Starlink V3 operativos.",
    especificaciones: [
      { clave: "Altura del conjunto", valor: "121,3 m" },
      { clave: "Diámetro", valor: "9,0 m" },
      { clave: "Masa al despegue", valor: "≈ 5 300 t" },
      { clave: "Motores Super Heavy", valor: "33 × Raptor" },
      { clave: "Motores de la nave", valor: "6 × Raptor" },
      { clave: "Empuje al despegue", valor: "73,5 MN" },
      { clave: "Propelente", valor: "CH₄ / LOX" },
      { clave: "Carga a LEO", valor: "15 t (Bloque 1)" },
    ],
    fuente: "wiki-starship",
  },
  {
    id: "dragon",
    nombre: "Dragon",
    clase: "Nave de carga y tripulación",
    alturaM: 8.1,
    anchoM: 4,
    estado: "En servicio · 20 vuelos tripulados",
    titular: "La cápsula que se reutiliza",
    descripcion:
      "La única nave estadounidense capaz de llevar tripulación a la Estación Espacial Internacional desde 2020 y la única del mundo que vuelve del espacio y vuelve a volar. Ocho motores SuperDraco forman un sistema de escape que funciona durante todo el ascenso, no solo en la torre.",
    especificaciones: [
      { clave: "Altura con maletero", valor: "8,1 m" },
      { clave: "Altura de la cápsula", valor: "4,5 m" },
      { clave: "Diámetro", valor: "4,0 m" },
      { clave: "Tripulación", valor: "4 · 7 en evacuación" },
      { clave: "Carga a órbita", valor: "6 000 kg" },
      { clave: "Carga a la ISS", valor: "3 307 kg" },
      { clave: "Maniobra", valor: "16 × Draco" },
      { clave: "Escape", valor: "8 × SuperDraco" },
    ],
    fuente: "wiki-falcon",
  },
];

/* --------------------------------------------------------------------------
   Fases del retorno del propulsor
   La secuencia real que ejecuta una primera etapa de Falcon 9 desde que se
   separa hasta que se apaga sobre la plataforma.
   -------------------------------------------------------------------------- */

export interface FaseRetorno {
  indice: string;
  nombre: string;
  altitud: string;
  descripcion: string;
}

export const RETORNO: FaseRetorno[] = [
  {
    indice: "01",
    nombre: "Separación de etapas",
    altitud: "≈ 70 km",
    descripcion:
      "La segunda etapa sigue hacia la órbita. El propulsor, ya vacío, gira ciento ochenta grados con los propulsores de nitrógeno frío para volar de culo.",
  },
  {
    indice: "02",
    nombre: "Encendido de retorno",
    altitud: "≈ 75 km",
    descripcion:
      "Tres motores frenan la velocidad horizontal y, en las misiones que vuelven a tierra, la invierten. A partir de aquí el propulsor cae hacia el punto de aterrizaje, no hacia el mar.",
  },
  {
    indice: "03",
    nombre: "Encendido de reentrada",
    altitud: "≈ 45 km",
    descripcion:
      "Tres motores se encienden contra la corriente de aire. No frenan tanto como abren una burbuja de gas que aparta el plasma de la estructura: el escudo térmico es el propio escape.",
  },
  {
    indice: "04",
    nombre: "Guiado con aletas",
    altitud: "≈ 20 km",
    descripcion:
      "Cuatro aletas de rejilla de titanio se mueven de forma independiente y pilotan el cuerpo como un ala. Corrigen kilómetros de desviación mientras el vehículo cae a velocidad supersónica.",
  },
  {
    indice: "05",
    nombre: "Encendido de aterrizaje",
    altitud: "≈ 1 km",
    descripcion:
      "Un solo motor central. El empuje mínimo del Merlin supera el peso del propulsor vacío, así que no puede quedarse suspendido: tiene que llegar a velocidad cero exactamente al tocar el suelo.",
  },
  {
    indice: "06",
    nombre: "Contacto",
    altitud: "0 m",
    descripcion:
      "Cuatro patas de fibra de carbono y aluminio desplegadas en los últimos segundos. El propulsor se apaga sobre la plataforma y, semanas después, vuelve a volar.",
  },
];

/* --------------------------------------------------------------------------
   Cronología
   -------------------------------------------------------------------------- */

export interface Hito {
  fecha: string;
  anio: string;
  titulo: string;
  texto: string;
}

export const HITOS: Hito[] = [
  {
    fecha: "Marzo de 2002",
    anio: "2002",
    titulo: "Se funda SpaceX",
    texto:
      "El objetivo declarado desde el primer día es abaratar el acceso al espacio lo suficiente como para que Marte deje de ser una hipótesis presupuestaria.",
  },
  {
    fecha: "28 de septiembre de 2008",
    anio: "2008",
    titulo: "Falcon 1 alcanza la órbita",
    texto:
      "Al cuarto intento, y con la empresa casi sin dinero. Primer cohete de propelente líquido financiado con capital privado que llega a órbita.",
  },
  {
    fecha: "25 de mayo de 2012",
    anio: "2012",
    titulo: "Dragon atraca en la ISS",
    texto:
      "Primera nave comercial que llega a la Estación Espacial Internacional. Hasta entonces solo lo habían hecho vehículos de agencias estatales.",
  },
  {
    fecha: "21 de diciembre de 2015",
    anio: "2015",
    titulo: "Primer aterrizaje del propulsor",
    texto:
      "La primera etapa de un Falcon 9 vuelve a Cabo Cañaveral y se posa de pie en la Zona de Aterrizaje 1. Es el punto en que la reutilización deja de ser una presentación.",
  },
  {
    fecha: "8 de abril de 2016",
    anio: "2016",
    titulo: "Aterrizaje en el mar",
    texto:
      "Un propulsor se posa sobre la barcaza autónoma «Of Course I Still Love You». Sin esta maniobra, las órbitas de mucha energía obligarían a desechar la etapa.",
  },
  {
    fecha: "30 de marzo de 2017",
    anio: "2017",
    titulo: "El primer segundo vuelo",
    texto:
      "La misión SES-10 despega con un propulsor ya usado. El coste marginal de un lanzamiento empieza a separarse del coste de fabricar un cohete.",
  },
  {
    fecha: "6 de febrero de 2018",
    anio: "2018",
    titulo: "Falcon Heavy debuta",
    texto:
      "Veintisiete motores encendidos a la vez y dos propulsores laterales que aterrizan casi en sincronía en dos plataformas contiguas.",
  },
  {
    fecha: "24 de mayo de 2019",
    anio: "2019",
    titulo: "Los primeros 60 Starlink",
    texto:
      "Empieza el despliegue de la constelación. Siete años después es, con diferencia, el mayor conjunto de satélites activos jamás puesto en órbita.",
  },
  {
    fecha: "30 de mayo de 2020",
    anio: "2020",
    titulo: "Demo-2: vuelve el vuelo tripulado",
    texto:
      "Robert Behnken y Douglas Hurley despegan desde la plataforma 39A. Es el primer lanzamiento de astronautas desde suelo estadounidense en nueve años, y el primero de una empresa privada.",
  },
  {
    fecha: "15 de septiembre de 2021",
    anio: "2021",
    titulo: "Inspiration4",
    texto:
      "Cuatro personas sin formación de astronauta profesional pasan tres días en órbita. Ninguna agencia espacial participa en la tripulación.",
  },
  {
    fecha: "20 de abril de 2023",
    anio: "2023",
    titulo: "Primer vuelo de Starship",
    texto:
      "El vehículo más grande jamás construido despega de Boca Chica y se pierde a los cuatro minutos. Los doce vuelos siguientes se construyen sobre ese fallo.",
  },
  {
    fecha: "13 de octubre de 2024",
    anio: "2024",
    titulo: "La torre atrapa el propulsor",
    texto:
      "En el vuelo 5, dos brazos mecánicos sujetan un Super Heavy de setenta metros en pleno descenso. El propulsor no lleva patas: la infraestructura hace de tren de aterrizaje.",
  },
  {
    fecha: "24 de julio de 2026",
    anio: "2026",
    titulo: "Starship despliega carga real",
    texto:
      "En el vuelo 13, la nave suelta veinte satélites Starlink V3 operativos y ambas etapas ejecutan descensos controlados. El programa pasa de demostrar a trabajar.",
  },
];

/* --------------------------------------------------------------------------
   Starlink
   -------------------------------------------------------------------------- */

export const STARLINK = {
  lanzados: 12881,
  enOrbita: 11093,
  operativos: 11078,
  /** Altitud nominal de la capa principal de la constelación. */
  altitudKm: 550,
  /** Inclinación de la capa principal, en grados. */
  inclinacionDeg: 53,
  corte: "principios de septiembre de 2026",
  fuente: "keeptrack",
} as const;

/* --------------------------------------------------------------------------
   Formato de número
   -------------------------------------------------------------------------- */

/**
 * Número con separador de millares en espacio fino, como recomienda la RAE y
 * como se escribe en la prosa de esta página. `toLocaleString("es-ES")` usa
 * punto, y entonces «11.093» en un contador no cuadra con «12 881» dos líneas
 * más abajo. Las cifras de cuatro dígitos no se agrupan: 2026 es un año, no
 * una cantidad.
 */
export function formatoNumero(valor: number, decimales = 0): string {
  const [entera, fraccion] = Math.abs(valor).toFixed(decimales).split(".");
  const agrupada =
    entera.length > 4 ? entera.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : entera;
  const signo = valor < 0 ? "−" : "";
  return fraccion ? `${signo}${agrupada},${fraccion}` : `${signo}${agrupada}`;
}
