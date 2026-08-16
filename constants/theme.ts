export const Colors = {
  bg:      '#07070f',
  bg2:     '#0d0b22',
  bg3:     '#12102a',
  bg4:     '#1a1740',
  purple:  '#7c3aed',
  purpleL: '#a78bfa',
  green:   '#10b981',
  greenL:  '#34d399',
  yellow:  '#fbbf24',
  orange:  '#f97316',
  blue:    '#3b82f6',
  red:     '#ef4444',
  pink:    '#fda4af',
  text:    '#f0f0ff',
  text2:   '#c4b5fd',
  muted:   '#9090c0',
  border:  'rgba(167,139,250,0.12)',
  border2: 'rgba(167,139,250,0.22)',
  white:   '#ffffff',
};

export const AVATAR_COLORS = [
  { id: 'purple',  bg: '#7c3aed', label: 'Purple'  },
  { id: 'blue',    bg: '#3b82f6', label: 'Blue'    },
  { id: 'green',   bg: '#10b981', label: 'Green'   },
  { id: 'orange',  bg: '#f97316', label: 'Orange'  },
  { id: 'red',     bg: '#ef4444', label: 'Red'     },
  { id: 'pink',    bg: '#ec4899', label: 'Pink'    },
  { id: 'yellow',  bg: '#fbbf24', label: 'Yellow'  },
  { id: 'teal',    bg: '#06b6d4', label: 'Teal'    },
  { id: 'indigo',  bg: '#6366f1', label: 'Indigo'  },
  { id: 'rose',    bg: '#f43f5e', label: 'Rose'    },
];

export const Fonts = {
  regular:   'Inter-Regular',
  medium:    'Inter-Medium',
  semibold:  'Inter-SemiBold',
  bold:      'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
  black:     'Inter-Black',
};

export const Radius = {
  sm:  8,
  md:  14,
  lg:  20,
  xl:  28,
  full: 999,
};

export const GEMINI_API_KEY = 'AQ.Ab8RN6IFI-uMfEaWt97SdmrCYwevL_CQVctOaduI3HpE3Wz9-A';
// The gemini-2.0-flash family returns a hard 0-quota 429 on this account's free
// tier (verified directly against the API), but gemma-4-26b-a4b-it — a Gemma
// model served through the same endpoint/key — works. Gemma is a "thinking"
// model: see the parts-filtering fix in callGemini() in lib/gemini.ts.
export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${GEMINI_API_KEY}`;
