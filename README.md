# SpaceX — El cohete que vuelve

Página informativa de una sola pieza sobre el programa de vuelo de SpaceX,
construida alrededor de una idea: lo que distingue a estos cohetes no es que
suban, es que vuelven.

No está afiliada a Space Exploration Technologies Corp.

## Qué hay dentro

- **Hero calculado, no ilustrado.** `components/ui/orbit-hero.tsx` traza la
  Tierra desde órbita baja integrando la dispersión atmosférica en el
  fragment shader: Rayleigh (βR = 5,8 / 13,5 / 33,1 · 10⁻⁶ m⁻¹, altura de
  escala 8 km) y Mie (βM = 21 · 10⁻⁶ m⁻¹, g = 0,76). El azul del limbo, la
  banda naranja del terminador y el veo de las costas salen de esos
  coeficientes, no de un degradado. El scroll no desplaza el hero: sube la
  cámara de 620 a 2 600 km, y el encuadre se referencia al horizonte para que
  se sostenga durante toda la subida.
- **Constelación real.** `components/ui/constelacion.tsx` dibuja la capa 1 de
  Starlink completa —72 planos orbitales de 22 satélites, 1 584 en total, a
  550 km y 53°— en sus posiciones geométricas. El hueco sobre los polos es
  consecuencia de la inclinación, no un recorte.
- **Siluetas en metros.** `components/ui/silueta.tsx` dibuja cada vehículo con
  una unidad SVG por metro, de modo que las cuatro comparten regla sin ajuste
  manual.
- **Coreografía en un solo sitio.** `components/choreography.tsx` crea todas
  las escenas de GSAP/ScrollTrigger en orden de página: apariciones por lote,
  titular partido en palabras, contadores, recorrido horizontal con
  `containerAnimation` y encaje por vehículo, secuencia de retorno fijada y
  ligada al scroll, y raíl de cronología. Las secciones son marcado plano con
  atributos `data-*`.

## Datos

Todas las cifras están en `lib/data.ts` con su fecha de corte y su fuente
enlazada. Ninguna está inventada ni redondeada. La fecha de corte se muestra en
la página porque en un programa que lanza cada pocos días un acumulado sin
fecha deja de ser cierto en dos semanas.

## Accesibilidad y degradación

- El estado visible es el del CSS; JavaScript solo aplica el estado inicial
  oculto cuando va a animarlo. Sin JS la página se lee entera.
- `prefers-reduced-motion` está atendido con `gsap.matchMedia()`: sin pins, sin
  recorrido horizontal y con los estados finales pintados directamente.
- Sin WebGL el lienzo se retira y queda el fondo con el texto encima. Un
  contexto muerto pinta blanco, y eso es peor que no enseñar nada.
- Objetivos táctiles de 44 px, foco visible en todo lo enfocable y contraste
  comprobado sobre la superficie base.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # exportación estática en ./out
npm run typecheck
```

Next.js 15 (App Router, `output: "export"`), TypeScript, Tailwind CSS 4 y
GSAP 3.15 con ScrollTrigger. Estructura de componentes al estilo shadcn:
primitivas en `components/ui/`, secciones en `components/sections/`.
