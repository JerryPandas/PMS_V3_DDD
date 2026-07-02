import { createTheme } from '@mui/material/styles'

/**
 * Deep navy blue + gold theme, calm style suitable for engineering/manufacturing internal systems.
 * Palette:
 *  - Primary (navy)       #0B1F3A
 *  - Primary light        #14335C
 *  - Accent (gold)        #C9A227
 *  - Background           #F5F6F8
 *  - Text                 #1A1F2B
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0B1F3A', light: '#14335C', dark: '#050F1E', contrastText: '#F5F6F8' },
    secondary: { main: '#C9A227', light: '#DDBE5C', dark: '#9C7C15', contrastText: '#0B1F3A' },
    background: { default: '#F5F6F8', paper: '#FFFFFF' },
    text: { primary: '#1A1F2B', secondary: '#5B6472' },
    success: { main: '#2E7D5B' },
    warning: { main: '#C9A227' },
    error: { main: '#B3432B' },
    divider: 'rgba(11,31,58,0.08)'
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: [
      '"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: '1px solid rgba(11,31,58,0.08)' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } }
    }
  }
})

export default theme
