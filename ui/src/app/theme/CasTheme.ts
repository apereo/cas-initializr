import {blue, cyan, grey, teal, yellow} from "@mui/material/colors";
import {alpha, PaletteMode} from '@mui/material';

export type ThemeType = 'light' | 'dark' | 'highContrast' | 'blue' | 'solarizedLight' | 'solarizedDark' | 'vscodeLight' | 'vscodeDark';

export const getDesignTokens = (themeType: ThemeType) => {
    // Common typography settings
    const typography = {
        fontSize: 15,
    };

    // Theme-specific settings
    switch (themeType) {
        case 'light':
            return {
                typography,
                palette: {
                    mode: 'light' as PaletteMode,
                    primary: teal,
                    divider: grey[800],
                    text: {
                        primary: grey[900],
                        secondary: grey[800],
                    },
                    background: {
                        default: '#ffffff',
                        paper: '#f5f5f5',
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: teal[700],
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'dark':
            return {
                typography,
                palette: {
                    mode: 'dark' as PaletteMode,
                    primary: {
                        light: cyan[200],
                        main: cyan[400],
                        dark: "#004c5d",
                        contrastText: "#fff",
                    },
                    divider: grey[800],
                    background: {
                        default: grey[900],
                        paper: grey[900],
                        info: alpha(grey[800], 0.4),
                    },
                    text: {
                        primary: "#fff",
                        secondary: grey[300],
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: "#006d85",
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'highContrast':
            return {
                typography: {
                    ...typography,
                    fontSize: 16, // Slightly larger font for better readability
                },
                palette: {
                    mode: 'dark' as PaletteMode,
                    primary: {
                        light: yellow[300],
                        main: yellow[500],
                        dark: yellow[700],
                        contrastText: "#000",
                    },
                    secondary: {
                        main: "#ffffff",
                    },
                    divider: "#ffffff",
                    background: {
                        default: "#000000",
                        paper: "#000000",
                    },
                    text: {
                        primary: "#ffffff",
                        secondary: yellow[300],
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: yellow[500],
                                        color: "#000000",
                                    }),
                            }),
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                border: '1px solid #ffffff',
                            },
                        },
                    },
                },
            };
        case 'blue':
            return {
                typography,
                palette: {
                    mode: 'light' as PaletteMode,
                    primary: {
                        light: blue[300],
                        main: blue[500],
                        dark: blue[700],
                        contrastText: "#fff",
                    },
                    divider: blue[200],
                    background: {
                        default: '#e3f2fd',
                        paper: '#ffffff',
                    },
                    text: {
                        primary: "#0d47a1",
                        secondary: "#1976d2",
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: blue[700],
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'solarizedLight':
            return {
                typography,
                palette: {
                    mode: 'light' as PaletteMode,
                    primary: {
                        light: '#2aa198', // cyan
                        main: '#268bd2', // blue
                        dark: '#073642', // base02
                        contrastText: '#fdf6e3', // base3
                    },
                    secondary: {
                        main: '#d33682', // magenta
                    },
                    divider: '#93a1a1', // base1
                    background: {
                        default: '#fdf6e3', // base3
                        paper: '#eee8d5', // base2
                    },
                    text: {
                        primary: '#657b83', // base00
                        secondary: '#586e75', // base01
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: '#268bd2', // blue
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'solarizedDark':
            return {
                typography,
                palette: {
                    mode: 'dark' as PaletteMode,
                    primary: {
                        light: '#2aa198', // cyan
                        main: '#268bd2', // blue
                        dark: '#073642', // base02
                        contrastText: '#fdf6e3', // base3
                    },
                    secondary: {
                        main: '#d33682', // magenta
                    },
                    divider: '#586e75', // base01
                    background: {
                        default: '#002b36', // base03
                        paper: '#073642', // base02
                    },
                    text: {
                        primary: '#839496', // base0
                        secondary: '#93a1a1', // base1
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: '#268bd2', // blue
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'vscodeLight':
            return {
                typography,
                palette: {
                    mode: 'light' as PaletteMode,
                    primary: {
                        light: '#0098ff', // lighter blue
                        main: '#007acc', // VS Code blue
                        dark: '#005999', // darker blue
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: '#6c6c6c', // gray
                    },
                    divider: '#d4d4d4', // light gray
                    background: {
                        default: '#ffffff', // white
                        paper: '#f3f3f3', // light gray
                    },
                    text: {
                        primary: '#333333', // dark gray
                        secondary: '#6c6c6c', // gray
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: '#007acc', // VS Code blue
                                    }),
                            }),
                        },
                    },
                },
            };
        case 'vscodeDark':
            return {
                typography,
                palette: {
                    mode: 'dark' as PaletteMode,
                    primary: {
                        light: '#0098ff', // lighter blue
                        main: '#007acc', // VS Code blue
                        dark: '#005999', // darker blue
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: '#cccccc', // light gray
                    },
                    divider: '#444444', // dark gray
                    background: {
                        default: '#1e1e1e', // VS Code dark background
                        paper: '#252526', // VS Code dark sidebar
                    },
                    text: {
                        primary: '#cccccc', // light gray
                        secondary: '#9d9d9d', // medium gray
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: '#007acc', // VS Code blue
                                    }),
                            }),
                        },
                    },
                },
            };
        default:
            return {
                typography,
                palette: {
                    mode: 'dark' as PaletteMode,
                    primary: {
                        light: cyan[200],
                        main: cyan[400],
                        dark: "#004c5d",
                        contrastText: "#fff",
                    },
                    divider: grey[800],
                    background: {
                        default: grey[900],
                        paper: grey[900],
                        info: alpha(grey[800], 0.4),
                    },
                    text: {
                        primary: "#fff",
                        secondary: grey[300],
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }: any) => ({
                                ...(ownerState.variant === "contained" &&
                                    ownerState.color === "primary" && {
                                        backgroundColor: "#006d85",
                                    }),
                            }),
                        },
                    },
                },
            };
    }
};
