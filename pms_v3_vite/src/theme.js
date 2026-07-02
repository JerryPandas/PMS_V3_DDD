import { createTheme } from '@mui/material/styles'

/**
 * 深藏青 + 金色主题，风格沉稳、适合工程/制造类内部系统。
 * 色板：
 *  - 主色（藏青）  #0B1F3A
 *  - 主色浅  #14335C
 *  - 强调色（金）  #C9A227
 *  - 背景  #F5F6F8
 *  - 文字  #1A1F2B
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
