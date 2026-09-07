import { Choreography } from "@/components/choreography";
import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { Manifiesto } from "@/components/sections/manifiesto";
import { Cifras } from "@/components/sections/cifras";
import { Flota } from "@/components/sections/flota";
import { Retorno } from "@/components/sections/retorno";
import { Starlink } from "@/components/sections/starlink";
import { Cronologia } from "@/components/sections/cronologia";
import { Pie } from "@/components/sections/pie";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Manifiesto />
        <Cifras />
        <Flota />
        <Retorno />
        <Starlink />
        <Cronologia />
      </main>
      <Pie />
      {/* Se monta al final: sus escenas se registran cuando el resto del árbol
          ya está en el DOM, y así se crean en orden de página. */}
      <Choreography />
    </>
  );
}
