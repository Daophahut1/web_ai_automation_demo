// TypeScript may complain about importing CSS as a side-effect in some editors/tooling.
// The project includes `global.d.ts` with CSS module declarations; ignore any local false-positive here.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
