import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  fonts: {
    heading: `Kanit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
    body: `Kanit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
  },
  colors: {
    brand: {
      50: '#eef6ff',
      100: '#d7e9ff',
      200: '#bcdcff',
      300: '#92c7ff',
      400: '#5aa9ff',
      500: '#2b8aff',
      600: '#206ad6',
      700: '#154fa0',
      800: '#0d2a63',
      900: '#071534'
    }
  },
  styles: {
    global: (props: any) => ({
      'html, body, #__next': {
        height: '100%'
      },
      body: {
        bg: props.colorMode === 'dark' ? '#0b1220' : '#f7fafc',
        color: props.colorMode === 'dark' ? '#e6eef8' : '#1a202c',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      },
      a: {
        color: props.colorMode === 'dark' ? '#63b3ed' : '#2b8aff'
      },
      code: {
        bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        padding: '0.15rem 0.4rem',
        borderRadius: '6px',
        fontSize: '0.9em'
      },
      '.card': {
        bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'gray.200',
        boxShadow: props.colorMode === 'dark' ? 'none' : 'sm'
      }
    })
  },
  semanticTokens: {
    colors: {
      'bg-primary': {
        default: '#f7fafc',
        _dark: '#071125'
      },
      'bg-surface': {
        default: 'white',
        _dark: 'rgba(255,255,255,0.03)'
      },
      'text-primary': {
        default: '#1a202c',
        _dark: '#e6eef8'
      },
      'muted': {
        default: 'gray.600',
        _dark: 'rgba(230,238,248,0.7)'
      },
      'accent': {
        default: '#2b8aff',
        _dark: '#63b3ed'
      }
    }
  },
  layerStyles: {
    glass: (props: any) => ({
      bg: props.colorMode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : 'rgba(255,255,255,0.6)',
      backdropFilter: 'saturate(140%) blur(6px)',
      border: '1px solid',
      borderColor: props.colorMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'
    }),
    card: (props: any) => ({
      bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white',
      borderRadius: '12px',
      padding: 4,
      border: '1px solid',
      borderColor: props.colorMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'gray.200'
    }),
    elevated: (props: any) => ({
      bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.025)' : 'white',
      boxShadow: props.colorMode === 'dark' ? '0 6px 18px rgba(2,6,23,0.6)' : '0 6px 18px rgba(2,6,23,0.06)'
    })
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'md',
        _focus: { boxShadow: '0 0 0 3px rgba(59,130,246,0.24)' }
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'linear-gradient(90deg,#2b8aff,#5eead4)' : undefined,
          color: props.colorMode === 'dark' ? 'gray.900' : undefined
        })
      },
      defaultProps: {
        colorScheme: 'brand'
      }
    },
    Link: {
      baseStyle: (props: any) => ({
        color: props.colorMode === 'dark' ? 'accent._dark' : 'accent.default',
        _hover: { textDecoration: 'underline' }
      })
    }
  }
  
})

export default theme
