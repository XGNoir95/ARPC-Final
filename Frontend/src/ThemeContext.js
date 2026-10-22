import { createContext, useContext } from 'react';

export const ThemeContext = createContext({ preference: 'light', theme: 'light', setPreference: () => {} });
export const useTheme = () => useContext(ThemeContext);
