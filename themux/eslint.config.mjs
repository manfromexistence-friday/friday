import { FlatCompat } from "@eslint/eslintrc";
import * as reactHooks from "eslint-plugin-react-hooks";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  reactHooks.configs.recommended,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/react-compiler": "error",
    },
  },
];

export default eslintConfig;
