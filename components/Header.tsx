import React from 'react'
import Link from 'next/link'
import {
  Box,
  Flex,
  Heading,
  HStack,
  VStack,
  Button,
  Spacer,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VisuallyHidden,
  Collapse,
  useDisclosure,
  chakra,
  Tooltip,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'

type Props = {
  onTestClick?: () => void
}

const RobotLogo = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2" y="6" width="20" height="12" rx="3" fill="currentColor" />
    <circle cx="8" cy="11" r="1.4" fill="#fff" />
    <circle cx="16" cy="11" r="1.4" fill="#fff" />
    <rect x="9.5" y="15" width="5" height="1.6" rx="0.8" fill="#fff" />
    <rect x="11" y="3" width="2" height="3" rx="1" fill="currentColor" />
  </svg>
)

export default function Header({ onTestClick }: Props) {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('rgba(255,255,255,0.6)', 'rgba(12,14,17,0.6)')
  const backdrop = useColorModeValue('saturate(120%) blur(6px)', 'saturate(80%) blur(6px)')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const linkColor = useColorModeValue('gray.800', 'gray.100')
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex={50}
      backdropFilter={backdrop}
      style={{ WebkitBackdropFilter: backdrop }}
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      boxShadow="sm"
    >
      <Flex
        align="center"
        maxW="1200px"
        mx="auto"
        py={3}
        px={{ base: 4, md: 6 }}
        gap={4}
      >
        <Link href="/" aria-label="Go to home">
          <Flex align="center" gap={3} as="a">
            <chakra.span color="teal.400">
              <RobotLogo />
            </chakra.span>
            <VisuallyHidden>🤖AI Automation</VisuallyHidden>
            <Heading size="sm" color={linkColor} letterSpacing="tight">
              <chakra.span bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
                Property
              </chakra.span>{' '}
              <chakra.span color={linkColor} fontWeight="extrabold">
                AI
              </chakra.span>
            </Heading>
          </Flex>
        </Link>

        <Spacer />

        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          <Link href="/dashboard">
            <Button variant="ghost">Scraper</Button>
          </Link>
          <Link href="/ocr2json">
            <Button variant="ghost">OCR → JSON</Button>
          </Link>
          {onTestClick ? (
            <Button colorScheme="teal" onClick={onTestClick} aria-label="Run test now">
              Test Now
            </Button>
          ) : null}

          <Tooltip label={`Toggle ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
          </Tooltip>
        </HStack>

        <Box display={{ base: 'flex', md: 'none' }}>
          <IconButton
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={onToggle}
            variant="ghost"
          />
        </Box>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} px={{ base: 4, md: 6 }} display={{ md: 'none' }}>
          <VStack align="stretch" spacing={3}>
            <Link href="/dashboard">
              <Button variant="ghost" justifyContent="flex-start">
                Scraper
              </Button>
            </Link>
            <Link href="/ocr2json">
              <Button variant="ghost" justifyContent="flex-start">
                OCR → JSON
              </Button>
            </Link>
            {onTestClick ? (
              <Button colorScheme="teal" onClick={onTestClick} justifyContent="flex-start">
                Test Now
              </Button>
            ) : null}
            <Button leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode} variant="ghost" justifyContent="flex-start">
              Toggle theme
            </Button>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}
