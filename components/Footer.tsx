import React from 'react'
import { Box, Text, Link } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Box as="footer" mt={12} py={6} bg="transparent">
      <Box maxW="6xl" mx="auto" px={4} textAlign="center">
        <Text fontSize="sm" color="muted">Workflow and Design by Daophahut | Data Processed by n8n & Gemini AI<Link href="#"></Link></Text>
      </Box>
    </Box>
  )
}
