/** @type {import('next').NextConfig} */

// El repositorio se sirve como "página de proyecto" de GitHub Pages, no como
// página de usuario: la URL final es https://<usuario>.github.io/spacexweb/,
// con el nombre del repo como subcarpeta. Sin basePath/assetPrefix, todos los
// enlaces a /_next/... se resolverían contra la raíz del dominio y la página
// cargaría en blanco (JS y CSS en 404).
const REPO = 'spacexweb';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  basePath: `/${REPO}`,
  assetPrefix: `/${REPO}/`,
};

export default nextConfig;
