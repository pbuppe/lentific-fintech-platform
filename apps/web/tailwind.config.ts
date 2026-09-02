import type { Config } from "tailwindcss";
import { tailwindPreset } from "@fintech/ui/src/tailwind-preset";

const config: Config = {
  presets: [tailwindPreset as Partial<Config>],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
