"use client";

import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/lib/gsap";
import { RETORNO, formatoNumero } from "@/lib/data";

/* --------------------------------------------------------------------------
   Toda la coreografía de scroll, en un sitio y en orden de página

   ScrollTrigger calcula las posiciones de cada escena al crearla, y el orden
   importa cuando hay pins: una sección fijada cambia la altura del documento
   para todo lo que va debajo. Los efectos de React se ejecutan de hijo a
   padre, así que dejar que cada sección creara la suya las registraría al
   revés. Aquí se crean de arriba abajo, como se leen.

   Las secciones son marcado plano con atributos `data-*`; este módulo es lo
   único que sabe de animación. Si no se ejecuta, la página se lee entera.
   -------------------------------------------------------------------------- */

export function Choreography() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    /* --- Sin movimiento: estado final, nada más -------------------------- */
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-reveal], [data-cifra], [data-hito], [data-flota-txt]", {
        clearProps: "all", opacity: 1, y: 0,
      });
      /* La traza del retorno se dibuja entera, sin propulsor viajando, y las
         seis descripciones quedan a la vista: sin pin hay sitio para todas. */
      const traza = document.querySelector<SVGPathElement>("[data-retorno-traza]");
      if (traza) traza.style.strokeDasharray = "none";
      gsap.set("[data-retorno-movil]", { opacity: 0 });
      gsap.set("[data-cronologia-rail]", { scaleY: 1 });
    });

    /* --- Con movimiento --------------------------------------------------- */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* Marca el documento: es lo que autoriza al CSS a apilar las
         descripciones de fase en un solo hueco. Sin esta marca —JS caído,
         movimiento reducido— se apilan en vertical y se leen todas. */
      document.documentElement.dataset.coreografia = "";
      /* 1 · Manifiesto: el titular sube por palabras desde detrás de una
         máscara. Solo aquí: partir todos los titulares de la página sería el
         mismo efecto repetido siete veces, que es lo que delata la plantilla. */
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        const palabras = splitWords(el);
        gsap.from(palabras, {
          yPercent: 116,
          duration: 1,
          ease: "expo.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });

      /* 2 · Aparición genérica. Un solo lote con un stagger, no un disparador
         por elemento. Recorrido de 22 px: es un fundido, no un desfile. */
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-reveal], [data-cifra], [data-hito]"
      );
      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 22 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              opacity: 1, y: 0, duration: 0.75, ease: "expo.out",
              stagger: 0.07, overwrite: true,
            }),
        });
      }

      /* 3 · Contadores. Se disparan una vez, al entrar la rejilla de cifras. */
      ScrollTrigger.create({
        trigger: "[data-cifras]",
        start: "top 75%",
        once: true,
        onEnter: () => {
          document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
            const fin = Number(el.dataset.count);
            const dec = Number(el.dataset.decimales ?? 0);
            if (!Number.isFinite(fin)) return;
            const obj = { v: 0 };
            gsap.to(obj, {
              v: fin,
              duration: 1.5,
              ease: "power2.out",
              /* Mismo formateador que usa el render del servidor: si el
                 contador escribiera con `toLocaleString`, el número saltaría
                 de «12 881» a «12.881» al empezar a animarse. */
              onUpdate: () => { el.textContent = formatoNumero(obj.v, dec); },
            });
          });
        },
      });

      /* 4 · Cronología: el raíl se dibuja al ritmo del scroll. */
      const rail = document.querySelector<HTMLElement>("[data-cronologia-rail]");
      const lista = document.querySelector<HTMLElement>("[data-cronologia]");
      if (rail && lista) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: lista,
              start: "top 72%",
              end: "bottom 82%",
              scrub: 0.6,
            },
          }
        );
      }
    });

    /* --- 5 · Flota: recorrido horizontal, solo en pantallas anchas -------- */
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      const track = document.querySelector<HTMLElement>("[data-flota-track]");
      const wrap = document.querySelector<HTMLElement>("[data-flota-wrap]");
      const progreso = document.querySelector<HTMLElement>("[data-flota-progreso]");
      if (!track || !wrap) return;

      const pista = track.parentElement;
      if (!pista) return;

      /* El recorrido se mide contra el ancho de la pista, no contra el de la
         ventana: la columna de la escala ocupa casi la mitad y usar
         `innerWidth` dejaría la última ficha a medio entrar. */
      const recorrido = () => Math.max(0, track.scrollWidth - pista.clientWidth);

      const siluetas = gsap.utils.toArray<HTMLElement>("[data-flota-silueta]");
      const nombres = gsap.utils.toArray<HTMLElement>("[data-flota-nombre]");
      const total = Math.max(1, siluetas.length - 1);
      let activo = -1;

      const marcarActivo = (i: number) => {
        if (i === activo) return;
        activo = i;
        siluetas.forEach((el, k) => {
          if (k === i) el.dataset.flotaActivo = "si";
          else delete el.dataset.flotaActivo;
        });
        nombres.forEach((el, k) => {
          if (k === i) el.dataset.flotaActivo = "si";
          else delete el.dataset.flotaActivo;
        });
      };
      marcarActivo(0);

      const horizontal = gsap.to(track, {
        x: () => -recorrido(),
        /* Obligatorio: `containerAnimation` exige un mapeo 1:1 con el scroll. */
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => "+=" + recorrido(),
          refreshPriority: 2,
          /* Encaje por ficha. Sin él, la mayor parte del recorrido se pasa
             entre dos vehículos y casi nunca se ve una ficha entera; con él,
             cada uno tiene su momento quieto. El retardo evita que pelee con
             un desplazamiento aún en curso. */
          snap: { snapTo: 1 / total, duration: 0.35, delay: 0.06, ease: "power2.inOut" },
          onUpdate: (self) => {
            if (progreso) progreso.style.width = (self.progress * 100).toFixed(2) + "%";
            marcarActivo(Math.round(self.progress * total));
          },
        },
      });

      /* La ficha de la primera columna ya está en pantalla cuando arranca el
         pin, así que entra con la sección, no con el recorrido horizontal: un
         disparador de `containerAnimation` cuyo inicio queda antes del origen
         no llega a dispararse nunca. */
      const paneles = gsap.utils.toArray<HTMLElement>("[data-flota-panel]");
      paneles.forEach((panel, i) => {
        const textos = panel.querySelectorAll("[data-flota-txt]");
        if (!textos.length) return;
        gsap.from(textos, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger:
            i === 0
              ? { trigger: wrap, start: "top 65%", once: true }
              : { trigger: panel, containerAnimation: horizontal, start: "left 72%", once: true },
        });
      });
    });

    /* --- 6 · Retorno: el mecanismo ligado al scroll ----------------------- */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const panel = document.querySelector<HTMLElement>("[data-retorno-panel]");
      const traza = document.querySelector<SVGPathElement>("[data-retorno-traza]");
      const movil = document.querySelector<SVGGElement>("[data-retorno-movil]");
      const giro = document.querySelector<SVGGElement>("[data-retorno-giro]");
      const llama = document.querySelector<SVGPathElement>("[data-retorno-llama]");
      const fases = gsap.utils.toArray<HTMLElement>("[data-fase]");
      const textos = gsap.utils.toArray<HTMLElement>("[data-fase-texto]");
      if (!panel || !traza || !movil || !giro) return;

      /* Solo se toca el DOM cuando cambia de fase, no en cada fotograma. */
      let activa = -1;

      const largo = traza.getTotalLength();
      traza.style.strokeDasharray = `${largo}`;
      traza.style.strokeDashoffset = `${largo}`;

      /* Los tramos con motores encendidos: retorno, reentrada y aterrizaje.
         El penacho solo se ve en esos tres, que es cuando existe. */
      const ENCENDIDOS: [number, number][] = [[0.10, 0.26], [0.44, 0.60], [0.86, 0.99]];

      /** Coloca el propulsor en el punto `p` del recorrido y lo orienta. */
      function situar(p: number) {
        const d = Math.max(0, Math.min(1, p)) * largo;
        const pt = traza!.getPointAtLength(d);
        /* La tangente se saca de dos puntos muy próximos: es más estable que
           derivar la curva, y aquí sobra precisión. */
        const eps = Math.max(0.5, largo * 0.002);
        const a = traza!.getPointAtLength(Math.max(0, d - eps));
        const b = traza!.getPointAtLength(Math.min(largo, d + eps));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

        movil!.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        /* El cohete apunta a lo largo de su eje Y. Durante el descenso vuela
           de culo: el morro mira hacia atrás en la trayectoria. */
        giro!.setAttribute("transform", `rotate(${ang - 90})`);

        if (llama) {
          const on = ENCENDIDOS.some(([a2, b2]) => p >= a2 && p <= b2);
          llama.style.opacity = on ? "0.9" : "0";
        }
      }

      const estado = { p: 0 };
      situar(0);
      fases[0].dataset.faseActiva = "si";
      if (textos[0]) textos[0].dataset.faseActiva = "si";
      activa = 0;

      gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      }).to(estado, {
        p: 1,
        ease: "none",
        onUpdate: () => {
          traza!.style.strokeDashoffset = `${largo * (1 - estado.p)}`;
          situar(estado.p);

          /* Fase activa por atributo; el estilo lo pone CSS. */
          const idx = Math.min(RETORNO.length - 1, Math.floor(estado.p * RETORNO.length));
          if (idx === activa) return;
          activa = idx;
          fases.forEach((f, i) => {
            if (i === idx) f.dataset.faseActiva = "si";
            else delete f.dataset.faseActiva;
          });
          textos.forEach((t, i) => {
            if (i === idx) t.dataset.faseActiva = "si";
            else delete t.dataset.faseActiva;
          });
        },
      });
    });

    return () => {
      mm.revert();
      delete document.documentElement.dataset.coreografia;
    };
  }, []);

  return null;
}
