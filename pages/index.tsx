import Link from 'next/link'
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  chakra,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import React, { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'

const floatKey = keyframes`
  0% { transform: translateY(0px) }
  50% { transform: translateY(-12px) }
  100% { transform: translateY(0px) }
`

const travel = keyframes`
  0% { transform: translateX(0) }
  33% { transform: translateX(80px) }
  66% { transform: translateX(160px) }
  100% { transform: translateX(0) }
`

const pop = keyframes`
  0% { transform: scale(1); opacity: 0.9 }
  50% { transform: scale(1.04); opacity: 1 }
  100% { transform: scale(1); opacity: 0.9 }
`

// small extra animations
const spinKey = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
`

// allow TSX to accept <lottie-player>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any
    }
  }
}

function LottieIcon({ src = '/AI data.json', size = 48, speed = 1, loop = true, autoplay = true, style }: { src?: string; size?: number | string; speed?: number; loop?: boolean; autoplay?: boolean; style?: any }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return
    const win = window as any
    if (!win.__lottie_player_script_injected) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js'
      s.async = true
      document.head.appendChild(s)
      win.__lottie_player_script_injected = true
    }
  }, [])

  if (!mounted) return null

  const props: any = {
    src,
    background: 'transparent',
    speed,
    loop,
    autoplay,
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  }

  // use createElement to avoid TSX intrinsic element typing issues
  return React.createElement('lottie-player', props)
}

export default function Home() {
  const accent = useColorModeValue('linear(to-br, pink.400, orange.300)', 'linear(to-br, purple.700, pink.600)')
  const cardBg = useColorModeValue('bg-surface', 'bg-surface')
  return (
    <Box as="main">
      <Topbar />
      <Box as="section" py={{ base: 12, md: 20 }} bgGradient={useColorModeValue('linear(to-br, purple.50, white)', 'linear(to-br, #071125, #081224)')}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack spacing={6} align="start">
              <chakra.h6 fontWeight="bold" color={useColorModeValue('pink.600', 'pink.300')} letterSpacing="wide">AI Automation</chakra.h6>
              <Heading size="2xl" lineHeight="1.05">
                <chakra.span bgGradient="linear(to-r, teal.300, blue.400, purple.400)" bgClip="text" display="inline-block" animation={`${floatKey} 6s ease-in-out infinite`}>Scrape.</chakra.span>
                {' '}
                <chakra.span color={useColorModeValue('gray.700', 'gray.100')}>Clean.</chakra.span>
                {' '}
                <chakra.span bgGradient="linear(to-r, pink.400, orange.300)" bgClip="text">Alert.</chakra.span>
              </Heading>

              <Text color="muted" fontSize={{ base: 'md', md: 'lg' }} maxW="2xl">
                เลือกไปที่เครื่องมือที่คุณต้องการ: ติดตามประกาศอสังหาฯ, ตรวจ OCR ใบเสร็จเป็น JSON หรือรัน workflow สำหรับการแจ้งเตือนอัตโนมัติ
              </Text>

              <HStack spacing={4} mt={2}>
                <Link href="/dashboard" legacyBehavior passHref>
                  <Button as="a" size="lg" colorScheme="brand" boxShadow="md" _hover={{ transform: 'translateY(-3px) scale(1.02)' }} transition="transform 200ms">
                    Property Scraper
                  </Button>
                </Link>
                <Link href="/ocr2json" legacyBehavior passHref>
                  <Button as="a" size="lg" variant="ghost" _hover={{ bg: useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)') }}>
                    OCR → JSON Validator
                  </Button>
                </Link>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6} w="full">
                <Link href="/ocr2json" legacyBehavior passHref>
                  <Box as="a" p={6} borderRadius="xl" bg={useColorModeValue('white','gray.800')} boxShadow="lg" _hover={{ transform: 'translateY(-6px)', boxShadow: '2xl' }} transition="all 200ms" display="flex" alignItems="center">
                    <Box bg="teal.500" color="white" p={3} borderRadius="md" mr={4} boxSize={{ base: '56px', md: '64px' }} display="flex" alignItems="center" justifyContent="center">
                      <chakra.svg viewBox="0 0 48 48" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="36" height="36" rx="4" fill="currentColor" opacity="0.16" />
                        <path d="M14 16h20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 22h20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4">
                          <animate attributeName="stroke-dashoffset" from="0" to="24" dur="1.6s" repeatCount="indefinite" />
                        </path>
                        <path d="M14 28h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </chakra.svg>
                    </Box>
                    <Box>
                      <Heading size="md" mb={1}>OCR → JSON</Heading>
                      <Text fontSize="sm" color="muted">อัปโหลด PDF/รูป แล้วแปลง OCR → JSON พร้อม validation ของตัวเลขและวันที่</Text>
                    </Box>
                  </Box>
                </Link>

                <Link href="/dashboard" legacyBehavior passHref>
                  <Box as="a" p={6} borderRadius="xl" bg={useColorModeValue('white','gray.800')} boxShadow="lg" _hover={{ transform: 'translateY(-6px)', boxShadow: '2xl' }} transition="all 200ms" display="flex" alignItems="center">
                    <Box bg="purple.500" color="white" p={3} borderRadius="md" mr={4} boxSize={{ base: '56px', md: '64px' }} display="flex" alignItems="center" justifyContent="center">
                      <chakra.svg viewBox="0 0 48 48" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: `${spinKey} 6s linear infinite` }}>
                        <circle cx="24" cy="18" r="6" fill="white" />
                        <path d="M6 34c6-6 30-6 36 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <g transform="translate(24,24)">
                          <path d="M-2 -2 L6 6 M6 -6 L-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </g>
                      </chakra.svg>
                    </Box>
                    <Box>
                      <Heading size="md" mb={1}>Scrape → Clean → Alert</Heading>
                      <Text fontSize="sm" color="muted">ดึงประกาศ โคลีนข้อมูล และแจ้งเตือนเมื่อมีประกาศใหม่</Text>
                    </Box>
                  </Box>
                </Link>
              </SimpleGrid>
            </VStack>

            <Box position="relative" display={{ base: 'none', md: 'block' }}>
              <Box
                w="full"
                h="420px"
                layerStyle="elevated"
                borderRadius="2xl"
                p={10}
                color="white"
                style={{ animation: `${floatKey} 6s ease-in-out infinite` }}
                overflow="hidden"
              >
                {/* decorative blobs */}
                <chakra.svg pos="absolute" right={-40} top={-40} opacity={0.12} width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="80" fill="url(#g1)"></circle>
                </chakra.svg>

                {/* <Heading size="md" zIndex={2} position="relative" bgGradient="linear(to-r, pink.400, orange.300)" bgClip="text">Live demo</Heading>
                <Text mt={2} opacity={0.95} zIndex={2} position="relative" bgGradient="linear(to-r, teal.300, blue.400, purple.400)" bgClip="text">Dashboard & OCR — responsive, secure, and ready to integrate</Text> */}

                {/* Floating Lottie icons */}
                <chakra.div position="absolute" left={6} top={8} zIndex={3} animation={`${floatKey} 5s ease-in-out infinite`}>
                  <LottieIcon src="/AI data.json" size={68} />
                </chakra.div>
{/* 
                <chakra.div position="absolute" right={20} top={16} zIndex={3} animation={`${floatKey} 6s ease-in-out infinite`}>
                  <LottieIcon src="/AI data.json" size={56} />
                </chakra.div> */}

                {/* <chakra.div position="absolute" left={10} bottom={28} zIndex={3} animation={`${floatKey} 4.5s ease-in-out infinite`}>
                  <LottieIcon src="/AI data.json" size={56} />
                </chakra.div> */}

                {/* <chakra.div position="absolute" right={6} bottom={20} zIndex={3} animation={`${floatKey} 5.8s ease-in-out infinite`}>
                  <LottieIcon src="/AI data.json" size={54} />
                </chakra.div> */}

                {/* <chakra.div position="absolute" left={48} bottom={6} zIndex={3} animation={`${floatKey} 7s ease-in-out infinite`}>
                  <LottieIcon src="/AI data.json" size={60} />
                </chakra.div> */}

                <chakra.div position="absolute" right={8} bottom={8} transform="rotate(6deg)" boxShadow="2xl" borderRadius="lg" w={{ base: '260px', md: '420px' }} h={{ base: '140px', md: '220px' }} display="flex" alignItems="center" justifyContent="center" layerStyle="glass">
                  <Box w="full" p={4}>
                    <HStack spacing={3} alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={2} w="250px">
                        {/* <Box bg="#06B6D4" p={3} borderRadius="md" animation={`${pop} 2000ms ease-in-out infinite`}>
                          <Text fontSize="sm" color="white">Upload</Text>
                        </Box>
                        <Box bg="#7C3AED" p={3} borderRadius="md" mt={2}>
                          <Text fontSize="sm" color="white">OCR</Text>
                        </Box>
                        <Box bg="#0D47A1" p={3} borderRadius="md" mt={2}>
                          <Text fontSize="sm" color="white">JSON</Text>
                        </Box> */}
                      </VStack>

                      <Box flex="1" position="relative" h={{ base: '48px', md: '86px' }}>
                        <Box position="absolute" left={4} right={4} top="50%" transform="translateY(-50%)" h={{ base: '3px', md: '6px' }} bg="rgba(255,255,255,0.06)" borderRadius="full" />
                        <chakra.div position="absolute" left={4} top="50%" transform="translateY(-50%)" animation={`${travel} 2400ms cubic-bezier(.4,0,.2,1) infinite`}>
                          <Box w={{ base: '14px', md: '20px' }} h={{ base: '14px', md: '20px' }} bg="white" borderRadius="full" boxShadow="0 6px 18px rgba(0,0,0,0.35)" />
                        </chakra.div>
                      </Box>
                    </HStack>
                    <Text mt={3} fontSize={{ base: 'xs', md: 'sm' }} color="white" opacity={0.95}>Watch data move from Upload → OCR → JSON</Text>
                  </Box>
                </chakra.div>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Footer />
    </Box>
  )
}
