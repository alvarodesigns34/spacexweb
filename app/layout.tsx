import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/* Archivo (variable, con eje de anchura) para display: la grotesca americana
   ancha tiene la presencia de una placa de identificación de vehículo.
   IBM Plex Sans para cuerpo: humanista, distinta temperatura, contraste real.
   IBM Plex Mono para telemetría: es el idioma en el que se publican los datos
   de vuelo, no un adorno "tecnológico". Sans y Mono comparten esqueleto. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const description =
  "Falcon, Starship, Dragon y Starlink explicados con las cifras reales de vuelo: " +
  "698 lanzamientos Falcon, 656 propulsores recuperados y un cohete que ha volado 37 veces.";

export const metadata: Metadata = {
  metadataBase: new URL("https://alvarodesigns34.github.io/spacexweb"),
  title: {
    default: "SpaceX — El cohete que vuelve",
    template: "%s · SpaceX",
  },
  description,
  keywords: [
    "SpaceX", "Falcon 9", "Falcon Heavy", "Starship", "Dragon",
    "Starlink", "reutilización", "cohetes",
  ],
  authors: [{ name: "alvarodesigns34" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: "SpaceX — El cohete que vuelve",
    description,
    siteName: "SpaceX",
  },
  twitter: { card: "summary_large_image", title: "SpaceX — El cohete que vuelve", description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06080c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
