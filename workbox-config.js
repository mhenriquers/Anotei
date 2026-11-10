// Gera dist/sw.js depois do `expo export -p web` (veja o script build:web).
// O service worker guarda o app no aparelho para ele abrir mesmo sem internet.
module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{js,html,json,ico,png}",
    // o app só usa Ionicons; as outras fontes do @expo/vector-icons ficam de fora (~5 MB)
    "**/Ionicons.*.ttf",
  ],
  globIgnores: ["sw.js", "workbox-*.js", "metadata.json"],
  swDest: "dist/sw.js",
  // o bundle JS passa do limite padrão de 2 MB
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  // app de uma página só: qualquer navegação abre o index.html guardado
  navigateFallback: "index.html",
  cleanupOutdatedCaches: true,
  // versão nova entra em uso na próxima vez que o app for aberto
  skipWaiting: true,
  clientsClaim: true,
};
