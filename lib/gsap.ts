"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* GSAP es gratuito al 100 % desde 2025, plugins incluidos. Se registra una
   sola vez, y solo en el navegador: en el render del servidor no hay window. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
}

export { gsap, ScrollTrigger };

/**
 * Efecto de layout que se limpia solo. Todo lo creado dentro del callback
 * queda dentro de un `gsap.context`, de modo que al desmontar se revierten
 * tweens y ScrollTriggers sin llevar la cuenta a mano.
 *
 * Se usa `useLayoutEffect` a propósito: los estados iniciales tienen que
 * quedar puestos antes de que el navegador pinte, o se ve un fotograma con
 * todo ya colocado y luego el salto.
 */
export function useChoreography(
  setup: (ctx: { scope: HTMLElement }) => void,
  scopeRef: React.RefObject<HTMLElement | null>
) {
  const done = useRef(false);
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || done.current) return;
    done.current = true;

    const ctx = gsap.context(() => setup({ scope }), scope);

    /* Si no se recalcula al terminar de cargar las fuentes, los disparadores
       quedan desplazados: el texto cambia de altura al cambiar la métrica. */
    const onFonts = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFonts);

    return () => {
      done.current = false;
      ctx.revert();
    };
  }, [scopeRef, setup]);
}

/** true si podemos animar de verdad. Si no, se pinta el estado final y ya. */
export function canAnimate(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Parte un elemento en palabras envueltas en una máscara, para que suban desde
 * debajo de una línea invisible. Devuelve los elementos interiores.
 *
 * No usa SplitText a propósito: aquí solo hacen falta palabras, el texto
 * original se conserva en `aria-label` para los lectores de pantalla, y no
 * depende de que un plugin extra haya cargado.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === "done") {
    return Array.from(el.querySelectorAll<HTMLElement>(".word-inner"));
  }
  const text = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", text);
  el.innerHTML = text
    .split(/\s+/)
    .map(
      (w) =>
        `<span class="word" aria-hidden="true"><span class="word-inner">${w}</span></span>`
    )
    .join(" ");
  el.dataset.split = "done";
  return Array.from(el.querySelectorAll<HTMLElement>(".word-inner"));
}
