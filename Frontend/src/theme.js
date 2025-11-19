// src/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1', // Our Deep Blue
    },
    secondary: {
      main: '#00796B', // Our Academic Teal
    },
    background: {
      default: '#F5F7FA', // Our Light Grey
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Our border radius
          textTransform: 'none', // More readable buttons
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Our border radius
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // A subtle shadow
        },
      },
    },
  },
});