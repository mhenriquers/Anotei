// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "node_modules/*"],
  },
  {
    rules: {
      // Regras do React Compiler (o app não usa o compilador). Elas reclamam de
      // padrões comuns no React Native, como useRef(new Animated.Value()).current,
      // então ficam só como aviso.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      // o TypeScript já confere os imports (esta regra erra com o expo-notifications)
      "import/namespace": "off",
    },
  },
]);
