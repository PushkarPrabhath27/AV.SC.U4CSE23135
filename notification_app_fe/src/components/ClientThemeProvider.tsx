'use client';

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
        },
        primary: { main: '#111827' },
        secondary: { main: '#6B7280' },
        text: {
            primary: '#111827',
            secondary: '#4B5563',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none',
        }
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { 
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    }
                },
            },
        },
    },
});

export default function ClientThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
