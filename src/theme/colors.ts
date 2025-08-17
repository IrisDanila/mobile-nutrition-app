// Design tokens (initial pass). Keeping legacy keys for backward compatibility.
// Primary Goals: accessible contrast, warm minimalism, nutritional science vibe.
export const colors = {
  // Legacy / existing usage
  bg: '#0F1115',
  bgAlt: '#1C1F26',
  primary: '#4B8BFF', // updated to new Primary/500
  primaryAlt: '#82B4FF',
  accent: '#41C983',
  danger: '#FF4D61',
  success: '#41C983',
  warning: '#FFB347',
  text: '#F3F7FB',
  textDim: '#9FB3C8',
  border: '#243344',

  // Extended scale
  primary50: '#E5F0FF',
  primary100: '#CCE2FF',
  primary200: '#99C5FF',
  primary300: '#66A9FF',
  primary400: '#338CFF',
  primary500: '#4B8BFF',
  primary600: '#2E6BDB',
  primary700: '#1F53AF',
  primary800: '#173D80',
  primary900: '#112A57',

  success500: '#41C983',
  warning500: '#FFB347',
  error500: '#FF4D61',

  glassLight: 'rgba(255,255,255,0.55)',
  glassDark: 'rgba(17,25,38,0.55)',
  shadowAmbient: 'rgba(0,0,0,0.35)'
};

export const darkMode = {
  gradientTop: '#0E1726',
  gradientBottom: '#132235'
};

export const lightMode = {
  gradientTop: '#F4F8FF',
  gradientBottom: '#FFFFFF'
};
