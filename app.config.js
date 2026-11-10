// Estende o app.json. Só serve para a versão web publicada no GitHub Pages:
// lá o site fica em https://<usuario>.github.io/<repositorio>/, então todos os
// arquivos precisam do prefixo "/<repositorio>". O workflow de deploy define
// EXPO_BASE_URL; no Android/iOS e no `expo start` ela não existe e nada muda.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;
  if (!baseUrl) return config;

  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
  };
};
