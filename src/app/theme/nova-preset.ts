import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Preset de PrimeNG "Nova Cuisine".
 * Basado en Aura, pero con la paleta corporativa negro/dorado
 * ya usada en el resto de la app (--nova-black, --nova-gold, etc.)
 * en vez del azul por defecto. Así los componentes de PrimeNG
 * (dialogs, tablas, botones, inputs) se ven consistentes con
 * la identidad visual de Nova Cuisine.
 */
export const NovaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf6ec',
      100: '#f0e4c4',
      200: '#e6d29c',
      300: '#dcc074',
      400: '#d2ae54',
      500: '#b8860b', // nova-gold
      600: '#a3760a',
      700: '#8a6408',
      800: '#715207',
      900: '#584005',
      950: '#3f2e04',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#b8860b',
          contrastColor: '#ffffff',
          hoverColor: '#a3760a',
          activeColor: '#8a6408',
        },
        surface: {
          0: '#ffffff',
          50: '#f6f5f7',
          100: '#eeecee',
          200: '#dedcde',
          300: '#c8c6c8',
          400: '#a8a6a8',
          500: '#87868a',
          600: '#5f5d61',
          700: '#464448',
          800: '#2c2b2d',
          900: '#1a1a1a', // nova-black
          950: '#0f0f0f',
        },
        content: {
          background: '#ffffff',
          hoverBackground: '#f6f5f7',
          borderColor: '#e6e4e6',
          color: '#1a1a1a',
          hoverColor: '#1a1a1a',
        },
      },
    },
  },
  components: {
    table: {
      headerCell: {
        background: '#1a1a1a',
        color: '#f6f5f7',
      },
      row: {
        hoverBackground: '#faf6ec',
      },
    },
    dialog: {
      root: {
        borderRadius: '14px',
      },
    },
    button: {
      root: {
        borderRadius: '10px',
      },
    },
    card: {
      root: {
        borderRadius: '14px',
      },
    },
    tag: {
      root: {
        borderRadius: '999px',
      },
    },
  },
});
