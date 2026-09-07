"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

/* --------------------------------------------------------------------------
   Qué dibuja esto

   La Tierra desde una órbita baja, con la atmósfera calculada, no pintada.

   No hay ninguna imagen. Cada píxel lanza un rayo desde la cámara y lo
   integra a través de la envuelta de aire: en cada paso mide cuánta densidad
   queda por encima, cuánta luz llega desde el Sol hasta ese punto, y cuánta de
   esa luz se desvía hacia la cámara. La dispersión Rayleigh (∝ 1/λ⁴) es la que
   deja pasar el rojo y desvía el azul, y por eso el limbo sale azul por arriba
   y naranja donde la luz atraviesa más aire. La dispersión de Mie, con su
   fuerte lóbulo hacia delante, es la que enciende el borde cuando el Sol está
   detrás del planeta.

   Nadie ha colocado ese degradado. Sale de los coeficientes:
     βR = (5.8, 13.5, 33.1) · 10⁻⁶ m⁻¹     alturas de escala 8 km y 1,2 km
     βM = 21 · 10⁻⁶ m⁻¹, g = 0,76

   Las unidades son radios terrestres: r = 1 es el suelo, r = 1,0157 el techo
   de la atmósfera (100 km, la línea de Kármán). Esos números no están
   ajustados a ojo; son los del planeta.
   -------------------------------------------------------------------------- */

/** Objeto mutable que el scroll escribe sin provocar renders de React. */
export interface OrbitDrive {
  /** 0 = altitud de partida, 1 = altitud final. Lo mueve ScrollTrigger. */
  progress: number;
}

export interface OrbitHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Altitud de la cámara en kilómetros con progress = 0. */
  altitudeKm?: number;
  /** Altitud en kilómetros con progress = 1. */
  altitudeEndKm?: number;
  /**
   * Hacia dónde apunta la cámara, en grados por encima del horizonte visible.
   * 0 apunta justo al limbo; positivo levanta la vista hacia el espacio.
   *
   * Se mide contra el horizonte y no contra la vertical a propósito: el
   * horizonte se hunde según sube la cámara —a 620 km está a 65,7° del nadir y
   * a 2 600 km, a 45,3°—, así que una inclinación absoluta que encuadra bien
   * abajo deja el planeta fuera del cuadro arriba. Referida al horizonte, el
   * encuadre se mantiene solo durante toda la subida.
   */
  horizonOffset?: number;
  /** Giro alrededor del eje de visión, en grados. Inclina el limbo. */
  roll?: number;
  /** Longitud del Sol respecto a la dirección de vista, en grados. 180 = a contraluz. */
  sunAzimuth?: number;
  /** Altura del Sol sobre el plano del horizonte local, en grados. Negativa = amanecer orbital. */
  sunElevation?: number;
  /** Campo de visión vertical en grados. */
  fov?: number;
  /** Longitud del planeta bajo la cámara. Gira lentamente. */
  spin?: number;
  /** Grados que gira el planeta por segundo. La cámara no se mueve. */
  spinSpeed?: number;
  /** Muestras a lo largo del rayo de vista. 14 va limpio; por debajo de 8 aparecen bandas. */
  steps?: number;
  /** Muestras hacia el Sol por cada paso de vista. */
  lightSteps?: number;
  /** Irradiancia solar. Normalizada a 1; el nivel se ajusta con `exposure`. */
  sunIntensity?: number;
  /** Brillo del campo de estrellas, 0 a 2. */
  starBrightness?: number;
  /** Bloom, 0 a 2. */
  glow?: number;
  /** Exposición antes de la curva de tono. */
  exposure?: number;
  /** Oscurecimiento de esquinas, 0 a 1. */
  vignette?: number;
  /** Escala de render, 0,5 a 1. Bájala antes que `steps`. */
  resolution?: number;
  /** Tope de densidad de píxeles del dispositivo. */
  maxDpr?: number;
  /** Centro de encuadre en fracciones de ancho y alto, origen arriba a la izquierda. */
  focus?: [number, number];
  /** Vela sobre un borde para que el texto se lea encima. */
  scrim?: "none" | "left" | "right" | "top" | "bottom";
  /** Opacidad de esa vela, 0 a 1. */
  scrimStrength?: number;
  /** Congela el fotograma actual. */
  paused?: boolean;
  /** Referencia que el scroll modifica para conducir la cámara. */
  drive?: React.RefObject<OrbitDrive>;
  children?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                   */
/* -------------------------------------------------------------------------- */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const SCENE_FRAG = `
precision highp float;

#define MAX_VIEW  24
#define MAX_LIGHT 10

/* Radios en unidades de radio terrestre. */
#define Rg 1.0
#define Ra 1.0157          /* 100 km: la línea de Kármán */

/* Alturas de escala, en radios terrestres (8 km y 1,2 km). */
#define Hr 0.0012557
#define Hm 0.0001884

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uCamPos;
uniform vec3  uRight;
uniform vec3  uUp;
uniform vec3  uFwd;
uniform float uTanHalf;
uniform vec2  uFocus;
uniform vec3  uSun;
uniform float uSunI;
uniform float uSpin;
uniform float uViewSteps;
uniform float uLightSteps;
uniform float uStars;
uniform float uEncode;
uniform vec2  uJitter;
uniform float uSeed;

/* Coeficientes de dispersión por radio terrestre (los de m⁻¹ × 6 371 000). */
const vec3  BETA_R = vec3(36.95, 86.01, 210.88);
const float BETA_M = 133.79;
const float G_MIE  = 0.76;

/* --- ruido ---------------------------------------------------------------- */

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x),
        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p, int oct) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    s += a * vnoise(p);
    p = p * 2.07 + vec3(19.1, 7.3, 3.7);
    a *= 0.5;
  }
  return s;
}

/* --- geometría ------------------------------------------------------------ */

/**
 * Corte de un rayo con una esfera centrada en el origen. Devuelve las dos
 * raíces; si no corta, x > y. Se resuelve con la forma estable de la
 * cuadrática: con radios de 1 y una cámara a 1,06 los dos términos casi se
 * cancelan, y la fórmula de libro pierde los dígitos que importan.
 */
vec2 raySphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float d = b * b - c;
  if (d < 0.0) return vec2(1.0, -1.0);
  float sq = sqrt(d);
  float q = b > 0.0 ? -b - sq : -b + sq;
  float t0 = q, t1 = c / q;
  return vec2(min(t0, t1), max(t0, t1));
}

/* --- superficie ----------------------------------------------------------- */

/**
 * Máscara de continentes, en un marco que gira con el planeta.
 *
 * Las frecuencias están puestas para lo que se ve, no para un globo entero.
 * Desde 600 km el encuadre abarca unos veinte grados de esfera: a frecuencia
 * 2 —la que correspondería a continentes en un planisferio— ese trozo cabe
 * dentro de una sola celda de ruido y sale liso. Aquí hace falta que las
 * costas midan cientos de kilómetros, no miles.
 */
float landMask(vec3 n) {
  float c = cos(uSpin), s = sin(uSpin);
  vec3 q = vec3(c * n.x - s * n.z, n.y, s * n.x + c * n.z);
  float f = fbm(q * 3.3, 6) + 0.40 * fbm(q * 9.5 + 31.0, 4);
  /* Los polos siempre por encima del umbral: hielo en los dos casquetes. */
  return smoothstep(0.745, 0.815, f + 0.30 * pow(abs(q.y), 3.0));
}

/** Nubes: otra capa de ruido, girando algo más deprisa que el suelo. */
float cloudMask(vec3 n) {
  float a = uSpin * 1.06 + uTime * 0.004;
  float c = cos(a), s = sin(a);
  vec3 q = vec3(c * n.x - s * n.z, n.y, s * n.x + c * n.z);
  /* Estirado en longitud: las bandas de circulación corren este-oeste, así que
     los sistemas salen alargados en esa dirección y comprimidos en latitud. */
  float f = fbm(vec3(q.x * 9.5, q.y * 21.0, q.z * 9.5), 5)
          + 0.16 * fbm(vec3(q.x * 44.0, q.y * 62.0, q.z * 44.0), 3) - 0.075;
  /* La cobertura nubosa real ronda dos tercios, pero en parches con hueco
     entre ellos. Un umbral bajo la convierte en una manta continua. */
  return smoothstep(0.50, 0.70, f);
}

/** Color del suelo antes de atravesar la atmósfera. */
vec3 groundColor(vec3 p, vec3 rd) {
  vec3 n = normalize(p);
  float land = landMask(n);
  float cloud = cloudMask(n);
  float ndl = dot(n, uSun);
  float lit = max(0.0, ndl);

  /* Esto son albedos, no colores elegidos: la fracción de luz que devuelve
     cada superficie. El océano ronda 0,03 y absorbe el rojo, de ahí que salga
     azul y oscuro; el suelo desnudo ronda 0,15; la nieve pasa de 0,6. Con
     estos valores y la normalización de abajo, el brillo relativo entre agua,
     tierra y nube sale solo. */
  vec3 ocean = vec3(0.013, 0.034, 0.072);

  /* La tierra no es un tono: es un mosaico. Dos ruidos de frecuencias muy
     distintas reparten árido, vegetación y roca, y sin ese moteado el
     continente sale como una mancha plana de barro. */
  float mosaico = fbm(n * 26.0, 4);
  float arido = fbm(n * 7.0 + 61.0, 3);
  vec3 soil = mix(
    mix(vec3(0.042, 0.055, 0.038), vec3(0.115, 0.104, 0.066), mosaico),
    mix(vec3(0.152, 0.118, 0.074), vec3(0.256, 0.212, 0.142), mosaico),
    smoothstep(0.40, 0.64, arido)
  );
  vec3 ice = vec3(0.66, 0.69, 0.74);

  vec3 base = mix(ocean, soil, land);

  /* Plataforma continental: el agua somera del borde devuelve mucha más luz
     que el océano profundo, y es lo que dibuja las costas desde órbita. */
  float somero = smoothstep(0.02, 0.30, land) * (1.0 - smoothstep(0.30, 0.62, land));
  base = mix(base, vec3(0.035, 0.098, 0.132), somero * 0.85);

  base = mix(base, ice, smoothstep(0.80, 0.94, abs(n.y)) * land);

  /* Reflejo especular del Sol en el agua: el punto brillante que delata que
     eso es un océano y no una mancha azul. */
  vec3 h = normalize(uSun - rd);
  float spec = pow(max(0.0, dot(n, h)), 220.0) * (1.0 - land) * 0.9;

  vec3 col = base * lit + vec3(0.85, 0.90, 1.0) * spec * lit;

  /* Nubes: dispersan casi todo lo que reciben, y algo de luz rasante. */
  col = mix(col, vec3(0.63, 0.65, 0.69) * (lit * 0.95 + 0.05), cloud * 0.92);

  /* Cara nocturna: las ciudades. Solo sobre tierra, y muy por debajo del
     brillo del día, que es como se ven de verdad. */
  float night = smoothstep(0.06, -0.14, ndl);
  float cities = smoothstep(0.66, 0.99, fbm(n * 165.0, 3)) * land;
  col += vec3(1.0, 0.70, 0.36) * cities * night * 0.34 * (1.0 - cloud * 0.85);

  return col;
}

/* --- estrellas ------------------------------------------------------------ */

/**
 * Puntos sobre las seis caras de un cubo. Una rejilla en el espacio no vale:
 * la esfera de direcciones la corta en cuñas y cada estrella sale rayada.
 */
vec3 starField(vec3 d) {
  vec3 a = abs(d);
  vec2 uv; float face;
  if (a.x >= a.y && a.x >= a.z)      { uv = d.yz / a.x; face = d.x > 0.0 ? 0.0 : 1.0; }
  else if (a.y >= a.z)               { uv = d.xz / a.y; face = d.y > 0.0 ? 2.0 : 3.0; }
  else                               { uv = d.xy / a.z; face = d.z > 0.0 ? 4.0 : 5.0; }

  vec3 col = vec3(0.0);
  for (int k = 0; k < 3; k++) {
    float sc = 82.0 * pow(2.3, float(k));
    vec2 p = uv * sc;
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    float h = hash13(vec3(id, face * 23.0));
    if (h > 0.972) {
      vec2 off = vec2(hash13(vec3(id, face + 7.0)), hash13(vec3(id, face + 29.0)));
      float dd = length(f - (off - 0.5) * 0.7);
      float s = smoothstep(0.05, 0.0, dd);
      float warm = hash13(vec3(id, face + 53.0));
      col += s * (0.5 + 3.6 * fract(h * 91.0))
           * mix(vec3(0.74, 0.83, 1.0), vec3(1.0, 0.87, 0.71), warm)
           / pow(2.3, float(k));
    }
  }
  return col;
}

/* --- densidad y transmitancia --------------------------------------------- */

/** Densidades relativas Rayleigh y Mie a una altura dada sobre el suelo. */
vec2 densities(float h) {
  return vec2(exp(-h / Hr), exp(-h / Hm));
}

/**
 * Profundidad óptica desde un punto hasta salir de la atmósfera en dirección
 * al Sol. Devuelve (Rayleigh, Mie), o un valor enorme si el rayo entra en el
 * planeta — ese punto está en sombra geométrica.
 */
vec2 sunOpticalDepth(vec3 p) {
  /* Si el rayo al Sol corta el suelo por delante, hay planeta de por medio. */
  vec2 g = raySphere(p, uSun, Rg);
  if (g.x <= g.y && g.y > 0.0) return vec2(1e5);

  vec2 a = raySphere(p, uSun, Ra);
  float len = a.y;
  if (len <= 0.0) return vec2(0.0);

  float n = uLightSteps;
  float ds = len / n;
  vec2 od = vec2(0.0);
  for (int i = 0; i < MAX_LIGHT; i++) {
    if (float(i) >= n) break;
    vec3 s = p + uSun * ((float(i) + 0.5) * ds);
    od += densities(length(s) - Rg) * ds;
  }
  return od;
}

/* --- integración ---------------------------------------------------------- */

void main() {
  vec2 uv = (gl_FragCoord.xy + uJitter - uFocus * uRes) / uRes.y;
  vec3 dir = normalize(uFwd + (uv.x * uRight + uv.y * uUp) * 2.0 * uTanHalf);
  vec3 ro = uCamPos;

  vec3 col = vec3(0.0);

  /* Fondo: estrellas y el disco solar. Se ven solo si el rayo escapa. */
  vec3 backdrop = starField(dir) * uStars;
  float sunDisc = smoothstep(0.99965, 0.99992, dot(dir, uSun));
  backdrop += vec3(1.0, 0.96, 0.90) * sunDisc * uSunI * 40.0;

  vec2 atm = raySphere(ro, dir, Ra);
  if (atm.x > atm.y) {                       /* ni roza la atmósfera */
    col = backdrop;
  } else {
    float tStart = max(atm.x, 0.0);
    float tEnd = atm.y;

    /* ¿Choca antes con el suelo? */
    vec2 gnd = raySphere(ro, dir, Rg);
    bool hitGround = (gnd.x <= gnd.y) && (gnd.y > 0.0);
    float tGround = hitGround ? max(gnd.x, 0.0) : -1.0;
    if (hitGround) tEnd = min(tEnd, tGround);

    float len = max(0.0, tEnd - tStart);
    float n = uViewSteps;
    float ds = len / n;

    /* Fases. Rayleigh es simétrica; Mie tiene un lóbulo hacia delante muy
       marcado, y es lo que enciende el limbo con el Sol detrás. */
    float mu = dot(dir, uSun);
    float phaseR = 3.0 / (16.0 * 3.14159265) * (1.0 + mu * mu);
    float g2 = G_MIE * G_MIE;
    float phaseM = 3.0 / (8.0 * 3.14159265)
                 * ((1.0 - g2) * (1.0 + mu * mu))
                 / ((2.0 + g2) * pow(1.0 + g2 - 2.0 * G_MIE * mu, 1.5));

    vec2 odView = vec2(0.0);
    vec3 sumR = vec3(0.0);
    vec3 sumM = vec3(0.0);

    /* Cada píxel empieza a leer en un punto distinto de su paso, y avanza esa
       lectura con la razón áurea. Leer siempre el centro bate el patrón de
       pasos contra el limbo y lo convierte en anillos. */
    float jit = fract(sin(dot(gl_FragCoord.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453);

    for (int i = 0; i < MAX_VIEW; i++) {
      if (float(i) >= n) break;
      jit = fract(jit + 0.6180339887);
      vec3 p = ro + dir * (tStart + (float(i) + jit) * ds);
      float h = length(p) - Rg;
      vec2 dens = densities(h) * ds;
      odView += dens;

      vec2 odSun = sunOpticalDepth(p);
      /* Transmitancia total: del Sol al punto, y del punto a la cámara. */
      vec3 tau = BETA_R * (odSun.x + odView.x) + BETA_M * 1.1 * (odSun.y + odView.y);
      vec3 tr = exp(-tau);

      sumR += tr * dens.x;
      sumM += tr * dens.y;
    }

    vec3 inscatter = (sumR * BETA_R * phaseR + sumM * BETA_M * phaseM) * uSunI;

    /* Lo que hay detrás de la atmósfera, atenuado por ella. */
    vec3 behind = hitGround
      ? groundColor(ro + dir * tGround, dir) * uSunI * 0.3183
      : backdrop;
    vec3 trView = exp(-(BETA_R * odView.x + BETA_M * 1.1 * odView.y));

    col = behind * trView + inscatter;
  }

  if (uEncode > 0.5) col = col / (1.0 + col);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Mezcla el fotograma nuevo en la media acumulada. La cámara está quieta. */
const BLEND_FRAG = `
precision highp float;
uniform sampler2D uCur;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform float uAlpha;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 c = texture2D(uCur, uv).rgb;
  vec3 p = texture2D(uPrev, uv).rgb;
  gl_FragColor = vec4(mix(p, c, uAlpha), 1.0);
}
`;

const BRIGHT_FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uTexel;
uniform float uDecode;
uniform float uPack;
uniform float uThreshold;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 s = texture2D(uTex, uv + uTexel * vec2(-1.0, -1.0)).rgb
         + texture2D(uTex, uv + uTexel * vec2( 1.0, -1.0)).rgb
         + texture2D(uTex, uv + uTexel * vec2(-1.0,  1.0)).rgb
         + texture2D(uTex, uv + uTexel * vec2( 1.0,  1.0)).rgb;
  s *= 0.25;
  if (uDecode > 0.5) s = s / max(vec3(0.002), 1.0 - s);
  float l = max(s.r, max(s.g, s.b));
  s *= max(0.0, l - uThreshold) / max(0.0001, l);
  gl_FragColor = vec4(s * uPack, 1.0);
}
`;

const BLUR_FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uStep;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 s = texture2D(uTex, uv).rgb * 0.2270270;
  s += (texture2D(uTex, uv + uStep * 1.3846154).rgb
      + texture2D(uTex, uv - uStep * 1.3846154).rgb) * 0.3162162;
  s += (texture2D(uTex, uv + uStep * 3.2307692).rgb
      + texture2D(uTex, uv - uStep * 3.2307692).rgb) * 0.0702702;
  gl_FragColor = vec4(s, 1.0);
}
`;

const COMPOSITE_FRAG = `
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2  uRes;
uniform float uDecode;
uniform float uPack;
uniform float uGlow;
uniform float uExposure;
uniform float uVignette;
uniform float uScrimDir;
uniform float uScrimAmt;
uniform float uSeed;

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 scene = texture2D(uScene, uv).rgb;
  if (uDecode > 0.5) scene = scene / max(vec3(0.002), 1.0 - scene);
  vec3 bloom = texture2D(uBloom, uv).rgb / uPack;

  vec3 c = aces((scene + bloom * uGlow) * uExposure);
  c = pow(max(c, 0.0), vec3(0.4545));

  vec2 d = uv - 0.5;
  c *= 1.0 - uVignette * dot(d, d) * 1.9;

  /* La vela cae rápido desde el borde: el centro del encuadre conserva su
     contraste en vez de volverse gris. */
  if (uScrimDir > 0.5) {
    float x = uScrimDir < 1.5 ? uv.x
            : uScrimDir < 2.5 ? 1.0 - uv.x
            : uScrimDir < 3.5 ? 1.0 - uv.y
            : uv.y;
    /* El exponente decide hasta dónde llega la vela. Con 2,2 caía tan rápido
       que a media anchura ya solo quitaba un cuarto de luz, y el texto se
       perdía sobre una nube. Con 1,35 mantiene una tercera parte de sombra
       hasta la mitad del cuadro, que es lo que ocupa la columna de texto. */
    c *= 1.0 - uScrimAmt * pow(1.0 - clamp(x, 0.0, 1.0), 1.35);
  }

  /* Una pizca de tramado. Sin ella, estas rampas oscuras y largas se
     escalonan en anillos visibles. */
  float nz = fract(sin(dot(gl_FragCoord.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453);
  c += (nz - 0.5) / 255.0;

  gl_FragColor = vec4(c, 1.0);
}
`;

/* -------------------------------------------------------------------------- */
/*  Utilidades                                                                */
/* -------------------------------------------------------------------------- */

const RAD = Math.PI / 180;
const R_EARTH_KM = 6371;

type Prog = { program: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

/* -------------------------------------------------------------------------- */
/*  Componente                                                                */
/* -------------------------------------------------------------------------- */

export function OrbitHero({
  altitudeKm = 620,
  altitudeEndKm = 2600,
  horizonOffset = 2.4,
  roll = -16,
  sunAzimuth = 52,
  sunElevation = 28,
  fov = 46,
  spin = 2.1,
  spinSpeed = 0.35,
  steps = 16,
  lightSteps = 6,
  sunIntensity = 1,
  starBrightness = 0.05,
  glow = 1,
  exposure = 4.4,
  vignette = 0.3,
  resolution = 0.72,
  maxDpr = 1.75,
  focus = [0.66, 0.46],
  scrim = "left",
  scrimStrength = 0.86,
  paused = false,
  drive,
  className = "",
  children,
  ...rest
}: OrbitHeroProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* Los ajustes viajan por ref: el bucle de render los lee cada fotograma sin
     que un cambio de prop tenga que reconstruir el contexto WebGL. */
  const cfg = useRef({
    altitudeKm, altitudeEndKm, horizonOffset, roll, sunAzimuth, sunElevation,
    fov, spin, spinSpeed, steps, lightSteps, sunIntensity, starBrightness, glow,
    exposure, vignette, resolution, maxDpr, focus, scrim, scrimStrength, paused,
    drive,
  });
  cfg.current = {
    altitudeKm, altitudeEndKm, horizonOffset, roll, sunAzimuth, sunElevation,
    fov, spin, spinSpeed, steps, lightSteps, sunIntensity, starBrightness, glow,
    exposure, vignette, resolution, maxDpr, focus, scrim, scrimStrength, paused,
    drive,
  };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const opts: WebGLContextAttributes = {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: "high-performance", preserveDrawingBuffer: false,
    };
    const gl = (canvas.getContext("webgl2", opts) ||
      canvas.getContext("webgl", opts)) as WebGL2RenderingContext | WebGLRenderingContext | null;

    /**
     * Retira el lienzo y deja el fondo y el texto que va encima. Un canvas con
     * el contexto muerto no se calla: pinta blanco, o el icono de imagen rota,
     * justo encima del fondo. Peor que no enseñar nada.
     */
    function giveUp(why: string) {
      host!.dataset.webgl = why;
      canvas!.style.display = "none";
    }

    if (!gl) { giveUp("unsupported"); return; }

    /* Un renderizador por software —una máquina sin GPU, un escritorio
       virtual— tarda segundos por fotograma y el navegador acaba matando el
       contexto por colgado. Detectarlo y bajar la calidad es la diferencia
       entre una imagen y un lienzo muerto. */
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg
      ? String(gl.getParameter((dbg as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL) || "")
      : "";
    const software = /swiftshader|llvmpipe|softpipe|software|microsoft basic/i.test(renderer);
    const isGL2 =
      typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;

    /* --- compilación ------------------------------------------------------ */

    function compile(type: number, src: string): WebGLShader | null {
      const sh = gl!.createShader(type);
      if (!sh) return null;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        console.error("orbit-hero: shader —", gl!.getShaderInfoLog(sh) || "sin registro (¿contexto perdido?)");
        gl!.deleteShader(sh);
        return null;
      }
      return sh;
    }

    function link(fragSrc: string): Prog | null {
      const vs = compile(gl!.VERTEX_SHADER, VERT);
      const fs = compile(gl!.FRAGMENT_SHADER, fragSrc);
      if (!vs || !fs) return null;
      const program = gl!.createProgram();
      if (!program) return null;
      gl!.attachShader(program, vs);
      gl!.attachShader(program, fs);
      gl!.bindAttribLocation(program, 0, "aPos");
      gl!.linkProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        console.error("orbit-hero:", gl!.getProgramInfoLog(program));
        return null;
      }
      const u: Record<string, WebGLUniformLocation | null> = {};
      const n = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl!.getActiveUniform(program, i);
        if (info) u[info.name] = gl!.getUniformLocation(program, info.name);
      }
      return { program, u };
    }

    /* --- destinos de render ----------------------------------------------- */

    /* Los medios flotantes mantienen el limbo lo bastante brillante como para
       que el bloom tenga de dónde salir. Donde no existan, la escena se empaqueta
       con Reinhard en 8 bits y se desempaqueta al componer: más basto, pero
       conserva las altas luces en vez de recortarlas. */
    let hdr = true;
    let texType: number = gl.UNSIGNED_BYTE;
    let internal: number = gl.RGBA;
    if (isGL2) {
      const g2 = gl as WebGL2RenderingContext;
      const ok = g2.getExtension("EXT_color_buffer_half_float") || g2.getExtension("EXT_color_buffer_float");
      if (ok) { texType = g2.HALF_FLOAT; internal = g2.RGBA16F; } else hdr = false;
    } else {
      const hf = gl.getExtension("OES_texture_half_float");
      const cb = gl.getExtension("EXT_color_buffer_half_float");
      if (hf && cb) texType = (hf as { HALF_FLOAT_OES: number }).HALF_FLOAT_OES;
      else hdr = false;
    }
    if (!hdr) { texType = gl.UNSIGNED_BYTE; internal = gl.RGBA; }

    const linearOK = isGL2 || !!gl.getExtension("OES_texture_half_float_linear") || !hdr;
    const filter = linearOK ? gl.LINEAR : gl.NEAREST;
    /** El bloom se escala antes de entrar en 8 bits y se devuelve al componer. */
    const pack = hdr ? 1 : 0.1;

    function makeTarget(w: number, h: number): Target | null {
      const tex = gl!.createTexture();
      const fb = gl!.createFramebuffer();
      if (!tex || !fb) return null;
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internal, w, h, 0, gl!.RGBA, texType, null);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      const status = gl!.checkFramebufferStatus(gl!.FRAMEBUFFER);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      if (status !== gl!.FRAMEBUFFER_COMPLETE) {
        gl!.deleteTexture(tex); gl!.deleteFramebuffer(fb); return null;
      }
      return { fb, tex, w, h };
    }

    /* --- recursos --------------------------------------------------------- */

    let sceneProg: Prog | null = null, blendProg: Prog | null = null;
    let brightProg: Prog | null = null, blurProg: Prog | null = null, compProg: Prog | null = null;
    let vbo: WebGLBuffer | null = null;
    let scene: Target | null = null, histA: Target | null = null, histB: Target | null = null;
    let bloomA: Target | null = null, bloomB: Target | null = null;

    /** Fotogramas ya fundidos en la media desde el último descarte. */
    let settled = 0;
    /** Estado de cámara del fotograma anterior: si cambia, la media no vale. */
    let lastKey = "";

    let width = 0, height = 0, sceneW = 0, sceneH = 0;

    function build(): boolean {
      sceneProg = link(SCENE_FRAG);
      blendProg = link(BLEND_FRAG);
      brightProg = link(BRIGHT_FRAG);
      blurProg = link(BLUR_FRAG);
      compProg = link(COMPOSITE_FRAG);
      if (!sceneProg || !blendProg || !brightProg || !blurProg || !compProg) return false;

      /* Un triángulo que tapa el cuadro. Más barato que dos, y sin costura. */
      vbo = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, vbo);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
      gl!.disable(gl!.DEPTH_TEST);
      gl!.disable(gl!.BLEND);
      return true;
    }

    function dropTargets() {
      for (const t of [scene, histA, histB, bloomA, bloomB]) {
        if (!t) continue;
        gl!.deleteTexture(t.tex);
        gl!.deleteFramebuffer(t.fb);
      }
      scene = histA = histB = bloomA = bloomB = null;
      settled = 0;
    }

    function resize() {
      const rect = host!.getBoundingClientRect();
      const dpr = software ? 1 : Math.min(window.devicePixelRatio || 1, Math.max(1, cfg.current.maxDpr));
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      const scale = software ? 0.34 : Math.min(1, Math.max(0.4, cfg.current.resolution));
      const w = Math.max(2, Math.round(cssW * dpr));
      const h = Math.max(2, Math.round(cssH * dpr));
      const sw = Math.max(2, Math.round(w * scale));
      const sh = Math.max(2, Math.round(h * scale));
      if (w === width && h === height && sw === sceneW && sh === sceneH) return;
      width = w; height = h; sceneW = sw; sceneH = sh;
      canvas!.width = w; canvas!.height = h;
      canvas!.style.width = cssW + "px";
      canvas!.style.height = cssH + "px";
      dropTargets();
      scene = makeTarget(sw, sh);
      histA = makeTarget(sw, sh);
      histB = makeTarget(sw, sh);
      const bw = Math.max(2, sw >> 2), bh = Math.max(2, sh >> 2);
      bloomA = makeTarget(bw, bh);
      bloomB = makeTarget(bw, bh);
    }

    /* --- bucle ------------------------------------------------------------ */

    let clock = reduced ? 4 : 0;
    let lastFrame = 0;
    let running = true;
    let visible = true;
    let raf = 0;

    function pass(prog: Prog, target: Target | null) {
      gl!.useProgram(prog.program);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, target ? target.fb : null);
      gl!.viewport(0, 0, target ? target.w : width, target ? target.h : height);
    }
    const draw = () => gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    function bind(tex: WebGLTexture, unit: number) {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
    }

    /**
     * Ocho puntos de mira dentro del píxel, de la sucesión de Halton 2,3. Se
     * reparten por el píxel mucho mejor que ocho sorteos al azar, que es justo
     * el trabajo: la media tiene que cubrir el píxel, no amontonarse en una
     * esquina.
     */
    const HALTON: Array<[number, number]> = [
      [0.5, 0.333], [0.25, 0.667], [0.75, 0.111], [0.125, 0.444],
      [0.625, 0.778], [0.375, 0.222], [0.875, 0.556], [0.0625, 0.889],
    ];

    function render(t: number) {
      if (!sceneProg || !blendProg || !brightProg || !blurProg || !compProg) return;
      if (!scene || !histA || !histB || !bloomA || !bloomB) return;
      const C = cfg.current;

      /* El scroll conduce la altitud. La cámara no orbita: sube. */
      const p = Math.max(0, Math.min(1, C.drive?.current?.progress ?? 0));
      const altKm = C.altitudeKm + (C.altitudeEndKm - C.altitudeKm) * p;
      const d = 1 + altKm / R_EARTH_KM;

      /* El horizonte visible desde esa altura: el ángulo desde el nadir al que
         el rayo sale tangente al planeta. Es lo que ancla el encuadre. */
      const horizonDeg = Math.asin(1 / d) / RAD;
      const pitchDeg = Math.max(4, Math.min(178, horizonDeg + C.horizonOffset));
      const fovDeg = C.fov;

      /* Cámara sobre el eje +Z, inclinada `pitchDeg` grados desde la vertical. */
      const pr = pitchDeg * RAD;
      const camX = 0, camY = 0, camZ = d;
      const fx = 0, fy = Math.sin(pr), fz = -Math.cos(pr);

      /* Base ortonormal, y luego giro alrededor de la línea de visión: no
         cambia nada en el espacio, solo cómo se tumba el limbo en el cuadro. */
      let rx = 1, ry = 0, rz = 0;
      let ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
      const cr = Math.cos(C.roll * RAD), sr = Math.sin(C.roll * RAD);
      const RX = rx * cr + ux * sr, RY = ry * cr + uy * sr, RZ = rz * cr + uz * sr;
      const UX = -rx * sr + ux * cr, UY = -ry * sr + uy * cr, UZ = -rz * sr + uz * cr;

      /* Sol: acimut medido desde la dirección de vista, elevación sobre el
         horizonte local. Con acimut cerca de 180 queda detrás del planeta y el
         limbo se enciende por dispersión de Mie hacia delante. */
      const sa = C.sunAzimuth * RAD, se = C.sunElevation * RAD;
      const ce = Math.cos(se);
      const sunX = ce * Math.sin(sa);
      const sunY = Math.sin(se);
      const sunZ = ce * Math.cos(sa);
      const sl = Math.hypot(sunX, sunY, sunZ) || 1;

      const spinNow = C.spin + (C.paused || reduced ? 0 : t * C.spinSpeed * RAD);

      /* Si la cámara se ha movido, la media acumulada ya no describe esta
         imagen: se descarta y se vuelve a empezar. */
      const key = `${d.toFixed(5)}|${pitchDeg.toFixed(3)}|${sceneW}x${sceneH}`;
      if (key !== lastKey) { settled = 0; lastKey = key; }

      /* --- escena --------------------------------------------------------- */
      pass(sceneProg, scene);
      const u = sceneProg.u;
      gl!.uniform2f(u.uRes!, scene.w, scene.h);
      gl!.uniform1f(u.uTime!, t);
      gl!.uniform3f(u.uCamPos!, camX, camY, camZ);
      gl!.uniform3f(u.uRight!, RX, RY, RZ);
      gl!.uniform3f(u.uUp!, UX, UY, UZ);
      gl!.uniform3f(u.uFwd!, fx, fy, fz);
      gl!.uniform1f(u.uTanHalf!, Math.tan(Math.max(10, Math.min(100, fovDeg)) * 0.5 * RAD));
      /* gl_FragCoord cuenta desde abajo; la prop se lee desde arriba. */
      gl!.uniform2f(u.uFocus!, C.focus[0], 1 - C.focus[1]);
      gl!.uniform3f(u.uSun!, sunX / sl, sunY / sl, sunZ / sl);
      gl!.uniform1f(u.uSunI!, Math.max(0, C.sunIntensity));
      gl!.uniform1f(u.uSpin!, spinNow);
      gl!.uniform1f(u.uViewSteps!, software ? 8 : Math.max(6, Math.min(24, Math.round(C.steps))));
      gl!.uniform1f(u.uLightSteps!, software ? 3 : Math.max(2, Math.min(10, Math.round(C.lightSteps))));
      gl!.uniform1f(u.uStars!, Math.max(0, C.starBrightness));
      gl!.uniform1f(u.uEncode!, hdr ? 0 : 1);
      const hs = HALTON[settled % HALTON.length];
      gl!.uniform2f(u.uJitter!, hs[0] - 0.5, hs[1] - 0.5);
      gl!.uniform1f(u.uSeed!, (settled % 64) * 17.13);
      draw();

      /* --- media acumulada ------------------------------------------------ */
      const alpha = settled === 0 ? 1 : 0.2;
      pass(blendProg, histB);
      bind(scene.tex, 0);
      bind(histA.tex, 1);
      gl!.uniform1i(blendProg.u.uCur!, 0);
      gl!.uniform1i(blendProg.u.uPrev!, 1);
      gl!.uniform2f(blendProg.u.uRes!, histB.w, histB.h);
      gl!.uniform1f(blendProg.u.uAlpha!, alpha);
      draw();
      const shown = histB;
      const tmp = histA; histA = histB; histB = tmp;
      settled++;

      /* --- extracción de altas luces -------------------------------------- */
      pass(brightProg, bloomA);
      bind(shown.tex, 0);
      gl!.uniform1i(brightProg.u.uTex!, 0);
      gl!.uniform2f(brightProg.u.uRes!, bloomA.w, bloomA.h);
      gl!.uniform2f(brightProg.u.uTexel!, 1 / shown.w, 1 / shown.h);
      gl!.uniform1f(brightProg.u.uDecode!, hdr ? 0 : 1);
      gl!.uniform1f(brightProg.u.uPack!, pack);
      gl!.uniform1f(brightProg.u.uThreshold!, 0.7);
      draw();

      /* --- dos pasadas de desenfoque, la segunda más ancha ---------------- */
      const blurStep = (src: Target, dst: Target, dx: number, dy: number) => {
        pass(blurProg!, dst);
        bind(src.tex, 0);
        gl!.uniform1i(blurProg!.u.uTex!, 0);
        gl!.uniform2f(blurProg!.u.uRes!, dst.w, dst.h);
        gl!.uniform2f(blurProg!.u.uStep!, dx / dst.w, dy / dst.h);
        draw();
      };
      blurStep(bloomA, bloomB, 1, 0);
      blurStep(bloomB, bloomA, 0, 1);
      blurStep(bloomA, bloomB, 2.8, 0);
      blurStep(bloomB, bloomA, 0, 2.8);

      /* --- composición ---------------------------------------------------- */
      pass(compProg, null);
      bind(shown.tex, 0);
      bind(bloomA.tex, 1);
      gl!.uniform1i(compProg.u.uScene!, 0);
      gl!.uniform1i(compProg.u.uBloom!, 1);
      gl!.uniform2f(compProg.u.uRes!, width, height);
      gl!.uniform1f(compProg.u.uDecode!, hdr ? 0 : 1);
      gl!.uniform1f(compProg.u.uPack!, pack);
      gl!.uniform1f(compProg.u.uGlow!, Math.max(0, C.glow) * 0.3);
      gl!.uniform1f(compProg.u.uExposure!, Math.max(0.05, C.exposure));
      gl!.uniform1f(compProg.u.uVignette!, Math.max(0, Math.min(1, C.vignette)));
      gl!.uniform1f(
        compProg.u.uScrimDir!,
        C.scrim === "left" ? 1 : C.scrim === "right" ? 2 : C.scrim === "top" ? 3 : C.scrim === "bottom" ? 4 : 0
      );
      gl!.uniform1f(compProg.u.uScrimAmt!, Math.max(0, Math.min(1, C.scrimStrength)));
      gl!.uniform1f(compProg.u.uSeed!, (t * 60) % 1000);
      draw();
    }

    /**
     * Dibuja un fotograma quieto, bien. En estos casos no hay nada animándose
     * —un redimensionado en pausa, o alguien que ha pedido menos movimiento—,
     * así que los fotogramas que la media recibiría con el tiempo se toman de
     * golpe. Cada pasada apunta a un punto distinto del píxel.
     */
    function settle(passes: number) {
      for (let i = 0; i < passes; i++) render(clock);
    }

    function tick(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible) { lastFrame = now; return; }
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      if (!cfg.current.paused && !reduced) clock += dt;
      render(clock);
    }

    if (!build()) { giveUp("build-failed"); return; }
    resize();
    settle(reduced ? 8 : 1);
    if (!reduced) raf = requestAnimationFrame(tick);

    /* --- el mundo exterior ------------------------------------------------ */

    const ro2 = new ResizeObserver(() => {
      resize();
      if (reduced || cfg.current.paused) settle(8);
    });
    ro2.observe(host);

    const io = new IntersectionObserver(
      (entries) => { visible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => { visible = !document.hidden; lastFrame = 0; };
    const onLost = (e: Event) => {
      /* Pedir el contexto de vuelta solo compensa si vuelve funcionando.
         Hasta entonces el lienzo se esconde, porque uno muerto pinta blanco. */
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      canvas.style.display = "none";
    };
    const onRestored = () => {
      width = height = sceneW = sceneH = 0;
      lastKey = "";
      if (!build()) { giveUp("lost"); return; }
      canvas.style.display = "";
      host.dataset.webgl = "";
      resize();
      running = true;
      lastFrame = 0;
      settle(reduced ? 8 : 1);
      if (!reduced) raf = requestAnimationFrame(tick);
    };

    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro2.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      dropTargets();
      if (vbo) gl.deleteBuffer(vbo);
      for (const pg of [sceneProg, blendProg, brightProg, blurProg, compProg]) {
        if (pg) gl.deleteProgram(pg.program);
      }
      /* El contexto se deja vivo a propósito. Matarlo aquí con
         WEBGL_lose_context parece limpio y es una trampa: el modo estricto de
         React ejecuta cada efecto dos veces sobre el mismo DOM —montaje,
         limpieza, montaje— y un lienzo cuyo contexto se ha perdido devuelve
         ese mismo contexto muerto a la siguiente llamada a getContext. A partir
         de ahí todos los shaders fallan con el registro vacío. Con liberar lo
         reservado basta; el contexto se va cuando se va el lienzo. */
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`relative isolate h-full w-full overflow-hidden bg-surface ${className}`}
      {...rest}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}

export default OrbitHero;
