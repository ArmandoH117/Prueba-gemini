import { useTheme } from '@react-navigation/native';

export const colors = {
  primary: "#09184D",
  accent: "#7D5AF2",
  title: "#2F2D2E",
  info: "#B3B2B7",
  background: "#F6F9FE",
  white: "#FFFFFF",
  danger: "#FF4D4F",
};

export const useColorsTheme = () => {
  const { dark } = useTheme();

  return {
    CARD: dark ? '#18181b' : '#ffffff',
    TEXT: dark ? '#fff' : '#0f172a',
    MUTED: dark ? '#a1a1aa' : '#6b7280',
    BORDER: dark ? '#242426' : '#e5e7eb',
    CHIP: dark ? '#222227' : '#f2f2f2',
    BLUE: '#3b82f6',
    BG: dark ? '#0f0f10' : '#f4f4f5',
  };
};