/* global jest */
// Testes (npm test): o AsyncStorage não existe fora do celular/navegador,
// então usa a versão de mentira que guarda tudo em memória.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
