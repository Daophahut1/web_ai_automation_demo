import React from 'react'
import Link from 'next/link'
import {
  Box,
  Flex,
  IconButton,
  HStack,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  Heading,
  useColorMode,
  useColorModeValue,
  Tooltip,
  chakra,
} from '@chakra-ui/react'
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'
const GitHubIcon = ({ boxSize = 18 }: { boxSize?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={boxSize}
    height={boxSize}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.087-.744.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.096.81 2.22 0 1.604-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

type Props = {
  onTestClick?: () => void
}

export default function Topbar({ onTestClick }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="header" w="100%" bg="transparent" py={3} px={{ base: 4, md: 8 }} className="fade-in">
      <Flex align="center" maxW="1200px" mx="auto">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Heading size="md" color="brand.800">🤖AI Automation</Heading>
        </Link>

        <Flex display={{ base: 'none', md: 'flex' }} ml={8} align="center">
          <HStack spacing={3}>
            <Link href="/dashboard"><Button variant="ghost">Scraper</Button></Link>
            <Link href="/ocr2json"><Button variant="ghost">OCR → JSON</Button></Link>
          </HStack>
        </Flex>

        <Flex ml="auto" align="center">
          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            <IconButton
              aria-label="Open GitHub repository"
              as="a"
              href="https://github.com/Daophahut1/web_ai_automation_demo.git"
              target="_blank"
              rel="noopener noreferrer"
              icon={<GitHubIcon />}
              color={useColorModeValue('gray.800', 'gray.100')}
              variant="ghost"
            />
            {/* <IconButton
              aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            /> */}
            {/* <Button colorScheme="brand" mr={3} onClick={onTestClick}>Test Now</Button> */}
          </HStack>

          <IconButton aria-label="Open menu" icon={<HamburgerIcon />} display={{ base: 'inline-flex', md: 'none' }} onClick={onOpen} />
        </Flex>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack spacing={4} mt={10} align="stretch">
              <Link href="/dashboard"><Button variant="ghost">Scraper</Button></Link>
              <Link href="/ocr2json"><Button variant="ghost">OCR → JSON</Button></Link>
              {onTestClick ? <Button colorScheme="brand" onClick={() => { onTestClick(); onClose(); }}>Test Now</Button> : null}
              <HStack spacing={2} mt={2}>
                <IconButton
                  aria-label="Open GitHub repository"
                  as="a"
                  href="https://github.com/Daophahut1/web_ai_automation_demo.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<GitHubIcon />}
                  color={useColorModeValue('gray.800', 'gray.100')}
                  variant="ghost"
                />
                {/* <IconButton
                  aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={() => { toggleColorMode(); onClose(); }}
                  variant="ghost"
                /> */}
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
