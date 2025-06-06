// ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { lightTheme, darkTheme } from "../style/theme";

type ThemeType = typeof lightTheme; // lấy type từ lightTheme để dùng chung

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: ThemeType;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
