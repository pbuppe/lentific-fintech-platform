import { colors } from "./tokens";

/**
 * Preset Tailwind partagé, importé par apps/web et apps/admin pour que
 * les deux applications restent visuellement identiques (§05.05 : les apps
 * n'assemblent que des écrans, elles ne définissent pas de style propre).
 */
export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        surface: colors.surface,
        "surface-alt": colors.surfaceAlt,
        ink: colors.ink,
        "ink-soft": colors.inkSoft,
        "ink-faint": colors.inkFaint,
        line: colors.line,
        brand: colors.brand,
        "brand-ink": colors.brandInk,
        "brand-soft": colors.brandSoft,
        accent: colors.accent,
        "accent-soft": colors.accentSoft,
        yellow: colors.yellow,
        "yellow-ink": colors.yellowInk,
        "yellow-soft": colors.yellowSoft,
        success: colors.success,
        "success-soft": colors.successSoft,
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
};
